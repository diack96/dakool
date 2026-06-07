import { NextRequest } from 'next/server';
import { isUUID } from '@/lib/utils/slug';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import { successResponse, ApiErrors } from '@/lib/api/response';

// GET - Récupérer un cours par ID
export async function GET (
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const supabase = await createServerSupabaseClient();

    // Détecter si c'est un UUID ou un slug
    const isIdUUID = isUUID(id);

    // Fonction helper pour chercher un cours avec relations (incluant profil instructeur)
    const fetchCourseWithRelations = async (searchBy: 'id' | 'slug', searchValue: string) => {
      let query = supabase
        .from('courses')
        .select(`
          *,
          categories (
            id,
            name,
            description,
            slug
          ),
          profiles:instructor_id (
            id,
            first_name,
            last_name,
            avatar_url,
            bio,
            email
          )
        `);

      if (searchBy === 'id') {
        query = query.eq('id', searchValue);
      } else {
        query = query.eq('slug', searchValue);
      }

      return await query.single();
    };

    // Fonction helper pour chercher un cours sans relations
    const fetchCourseSimple = async (searchBy: 'id' | 'slug', searchValue: string) => {
      let query = supabase
        .from('courses')
        .select('*');
      
      if (searchBy === 'id') {
        query = query.eq('id', searchValue);
      } else {
        query = query.eq('slug', searchValue);
      }
      
      const result = await query.single();
      return result as { data: any; error: any };
    };

    // Essayer d'abord avec les relations en utilisant la méthode appropriée
    let { data: course, error } = await fetchCourseWithRelations(
      isIdUUID ? 'id' : 'slug',
      id
    );


    // Si erreur avec les relations (par exemple colonne slug manquante), réessayer sans relations mais avec la même méthode
    if (error && (error.message?.includes('slug') || error.code === '42703' || error.code === 'PGRST116')) {
      const result = await fetchCourseSimple(
        isIdUUID ? 'id' : 'slug',
        id
      );

      course = result.data;
      error = result.error;
    }

    // Si toujours erreur, essayer avec l'autre méthode (UUID si on avait essayé slug, slug si on avait essayé UUID)
    if (error && !course) {
      const alternateMethod = isIdUUID ? 'slug' : 'id';
      
      const result = await fetchCourseSimple(alternateMethod, id);
      
      // Si ça fonctionne avec l'autre méthode, utiliser ce résultat
      if (result.data && !result.error) {
        course = result.data;
        error = null;
      } else {
        // Sinon, garder l'erreur originale ou la nouvelle
        error = result.error || error;
      }
    }

    if (error) {
      // Log détaillé pour debugging
      console.error('[API] Erreur lors de la récupération du cours:', {
        courseId: id,
        isUUID: isIdUUID,
        errorCode: error.code,
        errorMessage: error.message,
        errorDetails: error.details,
        errorHint: error.hint,
      });
      
      // Vérifier si c'est une erreur RLS (accès refusé)
      if (error.code === 'PGRST301' || error.message?.includes('permission denied') || error.message?.includes('RLS')) {
        return ApiErrors.forbidden(
          `Cours avec l'ID "${id}" non accessible. Le cours peut être en brouillon ou nécessiter une authentification.`,
        );
      }
      
      // Vérifier si c'est une erreur de colonne manquante (slug n'existe pas encore)
      if (error.code === '42703' || error.message?.includes('column') || error.message?.includes('does not exist')) {
        console.warn('[API] Colonne slug peut-être manquante, tentative avec ID uniquement');
        // Réessayer uniquement avec ID (si c'était un UUID)
        if (isIdUUID) {
          const result = await fetchCourseSimple('id', id);
          if (result.data && !result.error) {
            return successResponse(
              { course: result.data as any },
              undefined,
              200,
              {
                'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
                'Pragma': 'no-cache',
                'Expires': '0',
              },
            );
          }
        }
      }
      
      // Message d'erreur amélioré
      const errorMsg = isIdUUID 
        ? `Cours avec l'ID "${id}" non trouvé`
        : `Cours avec le slug "${id}" non trouvé. Vérifiez que le slug existe dans la base de données.`;
      
      return ApiErrors.notFound('Cours', errorMsg);
    }

    if (!course) {
      return ApiErrors.notFound('Cours', id);
    }
    
    // Vérifier si le cours est publié (pour les utilisateurs non authentifiés)
    // Note: Les admins peuvent toujours voir les cours en brouillon
    const { data: { session: _sess } } = await supabase.auth.getSession();
    const user = _sess?.user;
    const isAdmin = user?.user_metadata?.role === 'admin';
    
    // Si le cours n'est pas publié ou est archivé, et que l'utilisateur n'est pas admin, retourner une erreur
    const courseStatus = ((course as any).status as string)?.toUpperCase();
    const isPublished = (course as any).is_published === true;
    const isArchived = courseStatus === 'ARCHIVED';
    
    if (!isAdmin && (!isPublished || isArchived)) {
      return ApiErrors.courseNotPublished(id);
    }

    // Les profils et catégories sont maintenant chargés via la jointure initiale
    // Fallback seulement si la jointure n'a pas fonctionné
    if ((course as any).instructor_id && !(course as any).profiles) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, avatar_url, bio, email')
        .eq('id', (course as any).instructor_id)
        .maybeSingle();

      (course as any).profiles = profile || null;
    }

    // Fallback catégorie si non chargée
    if ((course as any).category_id && !(course as any).categories) {
      const { data: category } = await supabase
        .from('categories')
        .select('id, name, description')
        .eq('id', (course as any).category_id)
        .maybeSingle();

      (course as any).categories = category || {
        id: (course as any).category_id,
        name: 'Non catégorisé',
        description: '',
        slug: 'non-categorise',
      };
    }

    // Gérer le cas où categories n'a pas de slug
    if ((course as any).categories && !(course as any).categories.slug) {
      (course as any).categories.slug = (course as any).categories.name
        ? (course as any).categories.name.toLowerCase().replace(/\s+/g, '-')
        : 'non-categorise';
    }

    // Sécuriser les URLs d'images
    const sanitizeImageUrl = (url: string | null | undefined): string | null => {
      if (!url || typeof url !== 'string') return null;
      if (url === 'undefined' || url === 'null' || url.trim() === '') return null;
      // Vérifier que c'est une URL valide
      try {
        const urlObj = new URL(url, 'https://example.com');
        if (urlObj.protocol === 'http:' || urlObj.protocol === 'https:') {
          return url;
        }
        // Si c'est un chemin relatif valide
        if (url.startsWith('/')) {
          return url;
        }
      } catch {
        // Si ce n'est pas une URL valide, retourner null
        return null;
      }
      return null;
    };

    // Nettoyer les URLs d'images du cours
    const courseData = course as any;
    if (courseData.image_url) {
      courseData.image_url = sanitizeImageUrl(courseData.image_url);
    }
    if (courseData.image) {
      courseData.image = sanitizeImageUrl(courseData.image);
    }
    if (courseData.thumbnail) {
      courseData.thumbnail = sanitizeImageUrl(courseData.thumbnail);
    }

    // Récupérer modules+leçons+count inscrits en parallèle
    const [{ data: dbModules }, { data: unassignedLessons }, { count: enrollmentCount }] = await Promise.all([
      supabase
        .from('modules')
        .select(`
          id, title, description, "order",
          lessons (
            id, title, description, content, video_url, duration, lesson_order, is_free, module_id
          )
        `)
        .eq('course_id', courseData.id)
        .order('order', { ascending: true }),
      supabase
        .from('lessons')
        .select('id, title, description, content, video_url, duration, lesson_order, is_free')
        .eq('course_id', courseData.id)
        .is('module_id', null)
        .order('lesson_order', { ascending: true }),
      supabase
        .from('enrollments')
        .select('*', { count: 'exact', head: true })
        .eq('course_id', courseData.id)
        .in('status', ['active', 'completed']),
    ]);

    // Nombre d'étudiants : override manuel si défini, sinon count en direct
    courseData.total_students = courseData.display_students_count ?? (enrollmentCount ?? 0);

    const mapLesson = (l: any) => ({
      id: l.id,
      title: l.title,
      description: l.description || '',
      content: l.content || '',
      videoUrl: l.video_url || undefined,
      duration: l.duration || 0,
      order: l.lesson_order || 0,
      isFree: l.is_free || false,
      type: l.video_url ? 'VIDEO' : 'TEXT',
    });

    const hasModules = dbModules && dbModules.length > 0;
    const hasUnassigned = unassignedLessons && unassignedLessons.length > 0;

    if (hasModules || hasUnassigned) {
      const builtModules: any[] = [];

      if (hasModules) {
        dbModules.forEach((mod: any) => {
          const sortedLessons = (mod.lessons || [])
            .sort((a: any, b: any) => (a.lesson_order ?? 0) - (b.lesson_order ?? 0));
          builtModules.push({
            id: mod.id,
            title: mod.title,
            description: mod.description || '',
            order: mod.order,
            lessons: sortedLessons.map(mapLesson),
          });
        });
      }

      if (hasUnassigned) {
        builtModules.push({
          id: 'unassigned',
          title: 'Leçons sans module',
          description: '',
          order: (dbModules?.length || 0) + 1,
          lessons: unassignedLessons.map(mapLesson),
        });
      }

      const allLessons = builtModules.flatMap((m: any) => m.lessons);
      courseData.modules = builtModules;
      courseData.total_lessons = allLessons.length;
      courseData.total_duration = allLessons.reduce((sum: number, l: any) => sum + (l.duration || 0), 0);
    } else {
      // Fallback: compter depuis le syllabus JSON
      try {
        const syllabus = typeof courseData.syllabus === 'string'
          ? JSON.parse(courseData.syllabus)
          : courseData.syllabus;
        const modules = Array.isArray(syllabus) ? syllabus : (syllabus?.modules || []);
        let lessonCount = 0;
        let durationSum = 0;
        for (const mod of modules) {
          const lessons = mod.lessons || mod.lessonList || [];
          lessonCount += lessons.length;
          durationSum += lessons.reduce((s: number, l: any) => s + (l.duration || 0), 0);
        }
        courseData.total_lessons = lessonCount;
        courseData.total_duration = durationSum;
      } catch {
        courseData.total_lessons = 0;
        courseData.total_duration = 0;
      }
    }

    // Cache court pour les cours publiés (5 min CDN, 1 min client, 1h stale-while-revalidate)
    // Les brouillons restent non mis en cache
    const cacheHeaders: Record<string, string> = isPublished && !isAdmin
      ? { 'Cache-Control': 'public, max-age=60, s-maxage=300, stale-while-revalidate=3600' }
      : { 'Cache-Control': 'no-store, no-cache, must-revalidate', 'Pragma': 'no-cache' };

    return successResponse(
      { course: courseData },
      undefined,
      200,
      cacheHeaders,
    );
  } catch (error: any) {
    return ApiErrors.internalError('Erreur interne du serveur', error.message);
  }
}


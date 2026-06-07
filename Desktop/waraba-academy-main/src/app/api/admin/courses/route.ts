import { NextRequest, NextResponse } from 'next/server';
import { withAdminAuth, logAdminAction } from '@/middleware/adminAuth';
import { getAdminSupabaseClient } from '@/lib/supabase-server';
import { handleApiError, createValidationError, createInternalError } from '@/lib/errors';
// Note: apiLogger (winston) désactivé pour compatibilité Edge Runtime
// Utiliser console.log/error/warn à la place
// import { apiLogger } from '@/lib/logger';
import { z } from 'zod';

// Schéma de validation pour la pagination
const paginationSchema = z.object({
  page: z.preprocess(
    (val) => (val === null || val === undefined || val === '' ? 1 : Number(val)),
    z.number().int().min(1).default(1),
  ),
  limit: z.preprocess(
    (val) => (val === null || val === undefined || val === '' ? 20 : Number(val)),
    z.number().int().min(1).max(100).default(20),
  ),
  search: z.preprocess(
    (val) => (val === null || val === undefined ? undefined : String(val)),
    z.string().optional(),
  ),
  status: z.preprocess(
    (val) => (val === null || val === undefined || val === '' ? 'all' : val),
    z.enum(['all', 'published', 'draft', 'archived']).default('all'),
  ),
  level: z.preprocess(
    (val) => (val === null || val === undefined || val === '' ? 'all' : val),
    z.enum(['all', 'beginner', 'intermediate', 'advanced']).default('all'),
  ),
  category_id: z.preprocess(
    (val) => (val === null || val === undefined || val === '' ? undefined : val),
    z.string().uuid().optional(),
  ),
});

// Schéma de validation pour créer un cours
const createCourseSchema = z.object({
  title: z.string().min(1, 'Le titre est requis'),
  description: z.string().min(1, 'La description est requise'),
  category_id: z.string().uuid('ID de catégorie invalide'),
  instructor_id: z.string().uuid('ID d\'instructeur invalide'),
  // Accepter number ou string et convertir en number
  price: z.union([z.number(), z.string()]).transform(val => {
    const num = typeof val === 'string' ? parseFloat(val) : val;
    return isNaN(num) ? 0 : Math.max(0, num);
  }),
  image_url: z.union([
    z.string().url('URL d\'image invalide'),
    z.string().length(0), // Accepter les chaînes vides
    z.null(),
  ]).optional().nullable(),
  duration: z.union([z.number(), z.string(), z.null()]).transform(val => {
    if (val === null || val === undefined || val === '') return null;
    const num = typeof val === 'string' ? parseInt(val, 10) : val;
    return isNaN(num as number) ? null : num;
  }).optional().nullable(),
  level: z.enum(['beginner', 'intermediate', 'advanced', 'DÉBUTANT', 'INTERMÉDIAIRE', 'AVANCÉ']).optional(),
  is_published: z.union([z.boolean(), z.string()]).transform(val => val === true || val === 'true').default(false),
  is_starter_course: z.union([z.boolean(), z.string()]).transform(val => val === true || val === 'true').optional(),
  is_coming_soon: z.union([z.boolean(), z.string()]).transform(val => val === true || val === 'true').optional(),
  // Champs supplémentaires pour les cours starter
  short_description: z.string().optional(),
  instructor_name: z.string().optional(),
  instructor_bio: z.string().optional(),
  requirements: z.union([z.array(z.string()), z.string()]).optional(),
  objectives: z.union([z.array(z.string()), z.string()]).optional(),
  features: z.union([z.array(z.string()), z.string()]).optional(),
  language: z.string().optional(),
  certificate: z.union([z.boolean(), z.string()]).transform(val => val === true || val === 'true').optional(),
});

// GET /api/admin/courses - Liste des cours avec pagination et filtres
async function GET (request: NextRequest) {
  try {
    // Utiliser le client admin pour contourner RLS et accéder à tous les cours
    const supabase = getAdminSupabaseClient();

    const { searchParams } = new URL(request.url);

    // Validation avec Zod
    const validation = paginationSchema.safeParse({
      page: searchParams.get('page'),
      limit: searchParams.get('limit'),
      search: searchParams.get('search'),
      status: searchParams.get('status'),
      level: searchParams.get('level'),
      category_id: searchParams.get('category_id'),
    });

    if (!validation.success) {
      throw createValidationError('Paramètres de pagination invalides', validation.error.issues);
    }

    const { page, limit, search, status, level, category_id } = validation.data;
    const offset = (page - 1) * limit;

    // Construction de la requête avec eager loading des relations
    let query = supabase
      .from('courses')
      .select(`
        *,
        categories:category_id (id, name, description),
        instructor:instructor_id (id, first_name, last_name, avatar_url, email)
      `, { count: 'exact' });

    // Filtres
    // Note: La colonne is_published pourrait ne pas exister dans toutes les bases
    // Pour l'instant, on ignore le filtre de statut si la colonne n'existe pas
    if (status !== 'all') {
      const statusMap: Record<string, string> = {
        'published': 'PUBLISHED',
        'draft': 'DRAFT',
        'archived': 'ARCHIVED',
      };
      const dbStatus = statusMap[status];
      if (dbStatus) {
        query = query.eq('status', dbStatus);
      }
    }

    // Filtre par niveau (si la colonne existe)
    if (level !== 'all') {
      try {
        query = query.eq('level', level);
      } catch (e) {
        // Si la colonne n'existe pas, on ignore le filtre
        console.warn('Colonne level non disponible, filtre ignoré');
      }
    }

    if (category_id) {
      query = query.eq('category_id', category_id);
    }

    if (search) {
      // Sanitize search: escape special PostgREST/SQL characters and limit length
      const sanitized = search
        .substring(0, 100)
        .replace(/[%_\\]/g, (c) => `\\${c}`)
        .replace(/[,().]/g, '');
      query = query.or(`title.ilike.%${sanitized}%,description.ilike.%${sanitized}%`);
    }

    // Pagination et tri
    const { data: courses, error, count } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Erreur lors de la récupération des cours', error);
      
      // Si erreur RLS, donner plus de détails
      if (error.code === '42501' || error.message?.includes('permission denied')) {
        console.error('Erreur RLS détectée - Vérifiez les politiques RLS pour la table courses');
      }
      
      throw createInternalError('Erreur lors de la récupération des cours');
    }

    // Si aucun cours trouvé, vérifier s'il y en a dans la base
    if (!courses || courses.length === 0) {
      const { data: allCoursesCheck, error: checkError } = await supabase
        .from('courses')
        .select('id, title, is_published')
        .limit(10);
      
      console.warn('Aucun cours retourné par la requête admin', {
        totalInDB: allCoursesCheck?.length || 0,
        checkError: checkError?.message,
        coursesInDB: allCoursesCheck?.map((c: any) => ({
          id: c.id,
          title: c.title,
          is_published: c.is_published,
        })) || [],
      });
    }

    // Récupérer les comptes d'inscription pour tous les cours en une seule requête (batch)
    const courseIds = courses?.map((c: any) => c.id) || [];
    let enrollmentCountMap: Record<string, number> = {};
    if (courseIds.length > 0) {
      const { data: enrollmentData } = await supabase
        .from('enrollments')
        .select('course_id')
        .in('course_id', courseIds)
        .in('status', ['active', 'completed'])
        .limit(10000);
      enrollmentCountMap = (enrollmentData || []).reduce((acc: Record<string, number>, e: any) => {
        acc[e.course_id] = (acc[e.course_id] || 0) + 1;
        return acc;
      }, {});
    }

    // Transformer les données pour correspondre au format AdminCourse
    // Les relations sont déjà chargées via eager loading (plus de N+1)
    const transformedCourses = courses?.map((course: any) => {
      const category = course.categories || null;
      const profile = course.instructor || null;
      
      return {
        id: course.id,
        title: course.title || 'Sans titre',
        description: course.description || '',
        shortDescription: (course.description || '').substring(0, 150) + ((course.description || '').length > 150 ? '...' : ''),
        categoryId: course.category_id,
        instructorId: course.instructor_id,
        price: course.price || 0,
        duration: course.duration ? `${course.duration} min` : 'N/A',
        level: (course.level || 'beginner') as 'beginner' | 'intermediate' | 'advanced',
        // Utiliser le champ status de la base de données si disponible, sinon déduire de is_published
        status: (() => {
          const dbStatus = (course as any).status?.toLowerCase();
          if (dbStatus === 'published' || dbStatus === 'draft' || dbStatus === 'archived') {
            return dbStatus as 'published' | 'draft' | 'archived';
          }
          // Fallback sur is_published si status n'existe pas
          return (course.is_published !== undefined && course.is_published) ? 'published' as const : 'draft' as const;
        })(),
        thumbnail: course.image_url || undefined,
        enrollmentCount: enrollmentCountMap[course.id] || 0,
        rating: 0,
        reviewCount: 0,
        isFeatured: course.is_featured || false,
        isPopular: course.is_popular || false,
        isStarterCourse: (course as any).is_starter_course || false,
        isComingSoon: (course as any).is_coming_soon || false,
        displayOrder: course.display_order || 0,
        createdAt: new Date(course.created_at),
        updatedAt: new Date(course.updated_at),
        category: category ? {
          id: category.id,
          name: category.name,
        } : undefined,
        instructor: profile ? {
          id: profile.id,
          firstName: profile.first_name || '',
          lastName: profile.last_name || '',
          fullName: `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || 'Expert',
          avatarUrl: profile.avatar_url,
        } : undefined,
      };
    }) || [];

    // Log de l'action (ne pas bloquer si ça échoue)
    try {
      await logAdminAction({
        user_id: (request as any).adminUser?.id || 'unknown',
        action: 'courses.list',
        resource: '/api/admin/courses',
        ip_address: request.headers.get('x-forwarded-for')?.split(',')[0] || request.headers.get('x-real-ip') || 'unknown',
        user_agent: request.headers.get('user-agent') || 'unknown',
        timestamp: new Date().toISOString(),
        success: true,
        details: { page, limit, total: count },
      });
    } catch (logError) {
      // Ne pas bloquer la réponse si le log échoue
      console.warn('Erreur lors du log admin:', logError);
    }

    return NextResponse.json({
      success: true,
      courses: transformedCourses,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    });
  } catch (error: any) {
    console.error('Erreur lors de la récupération des cours', error);
    return handleApiError(error);
  }
}

// POST /api/admin/courses - Créer un nouveau cours
async function POST (request: NextRequest) {
  try {
    // Utiliser le client admin pour contourner RLS et accéder à tous les cours
    const supabase = getAdminSupabaseClient();

    let body;
    try {
      body = await request.json();
    } catch (parseError) {
      console.error('❌ Erreur lors du parsing du body:', parseError);
      return NextResponse.json({
        success: false,
        error: 'Format JSON invalide',
      }, { status: 400 });
    }

    // Validation avec Zod
    const validation = createCourseSchema.safeParse(body);
    if (!validation.success) {
      console.error('❌ Erreur de validation:', {
        issues: validation.error.issues,
        receivedData: {
          title: body.title,
          description: body.description,
          category_id: body.category_id,
          instructor_id: body.instructor_id,
          price: body.price,
          level: body.level,
        },
      });
      return NextResponse.json({
        success: false,
        error: 'Données invalides',
        details: validation.error.issues.map(issue => ({
          field: issue.path.join('.'),
          message: issue.message,
        })),
      }, { status: 400 });
    }

    const courseData = validation.data;

    // Préparer les données d'insertion
    const insertData: any = {
      title: courseData.title,
      description: courseData.description,
      category_id: courseData.category_id,
      instructor_id: courseData.instructor_id,
      price: courseData.price,
      image_url: courseData.image_url || null,
      duration: courseData.duration || null,
      level: (() => {
        // Normaliser le niveau
        const level = courseData.level || 'beginner';
        if (level === 'DÉBUTANT') return 'beginner';
        if (level === 'INTERMÉDIAIRE') return 'intermediate';
        if (level === 'AVANCÉ') return 'advanced';
        return level;
      })(),
      is_published: courseData.is_published || false,
      // Définir status en fonction de is_published pour respecter la contrainte DB
      status: courseData.is_published ? 'PUBLISHED' : 'DRAFT',
    };

    // Ajouter is_starter_course si fourni
    if (courseData.is_starter_course !== undefined) {
      insertData.is_starter_course = courseData.is_starter_course;
      // Si starter course, s'assurer que le prix est 0
      if (courseData.is_starter_course && insertData.price > 0) {
        insertData.price = 0;
      }
    }

    // Ajouter is_coming_soon si fourni
    if (courseData.is_coming_soon !== undefined) {
      insertData.is_coming_soon = courseData.is_coming_soon;
    }

    // Ajouter les champs supplémentaires pour les cours starter
    if (courseData.short_description) {
      insertData.short_description = courseData.short_description;
    }
    if (courseData.instructor_name) {
      insertData.instructor_name = courseData.instructor_name;
    }
    if (courseData.instructor_bio) {
      insertData.instructor_bio = courseData.instructor_bio;
    }
    if (courseData.requirements !== undefined) {
      insertData.requirements = Array.isArray(courseData.requirements) 
        ? JSON.stringify(courseData.requirements) 
        : courseData.requirements;
    }
    if (courseData.objectives !== undefined) {
      insertData.objectives = Array.isArray(courseData.objectives) 
        ? JSON.stringify(courseData.objectives) 
        : courseData.objectives;
    }
    if (courseData.features !== undefined) {
      insertData.features = Array.isArray(courseData.features) 
        ? JSON.stringify(courseData.features) 
        : courseData.features;
    }
    if (courseData.language) {
      insertData.language = courseData.language;
    }
    if (courseData.certificate !== undefined) {
      insertData.certificate = courseData.certificate;
    }

    // Créer le cours
    const { data: course, error } = await supabase
      .from('courses')
      .insert([insertData])
      .select()
      .single();

    if (error) {
      console.error('❌ Erreur lors de la création du cours', {
        error: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
        insertData: {
          ...insertData,
          // Masquer les données sensibles dans les logs
          image_url: insertData.image_url ? '[présent]' : '[absent]',
        },
      });
      
      return NextResponse.json({
        success: false,
        error: 'Erreur lors de la création du cours',
      }, { status: 500 });
    }

    // Log de l'action (ne pas bloquer si ça échoue)
    try {
      await logAdminAction({
        user_id: (request as any).adminUser?.id || 'unknown',
        action: 'courses.create',
        resource: '/api/admin/courses',
        ip_address: request.headers.get('x-forwarded-for')?.split(',')[0] || request.headers.get('x-real-ip') || 'unknown',
        user_agent: request.headers.get('user-agent') || 'unknown',
        timestamp: new Date().toISOString(),
        success: true,
        details: { course_id: course.id, title: course.title },
      });
    } catch (logError) {
      // Ne pas bloquer la réponse si le log échoue
      console.warn('Erreur lors du log admin:', logError);
    }

    return NextResponse.json({
      success: true,
      message: 'Cours créé avec succès',
      course,
    }, { status: 201 });
  } catch (error: any) {
    console.error('Erreur lors de la création du cours', error);
    return handleApiError(error);
  }
}

// Wrapper avec authentification admin
const GET_handler = withAdminAuth(GET);
const POST_handler = withAdminAuth(POST);

export { GET_handler as GET, POST_handler as POST };



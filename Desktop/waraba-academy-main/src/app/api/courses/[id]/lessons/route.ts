import { NextRequest } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import { successResponse, ApiErrors, errorResponse } from '@/lib/api/response';
import { createLessonSchema } from '@/lib/validation/courses';
import { isUUID } from '@/lib/utils/slug';
import { apiRateLimiter } from '@/lib/rateLimit';

// Résout un slug ou UUID en UUID de cours
async function resolveCourseId(supabase: any, courseIdentifier: string): Promise<string | null> {
  const field = isUUID(courseIdentifier) ? 'id' : 'slug';
  const { data, error } = await supabase
    .from('courses')
    .select('id')
    .eq(field, courseIdentifier)
    .maybeSingle();

  if (error || !data) return null;
  return data.id;
}

// GET - Récupérer les leçons d'un cours avec progression
async function GETHandler(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id: courseIdentifier } = await params;
    const supabase = await createServerSupabaseClient();

    // 1. Résoudre l'ID réel du cours
    const courseId = await resolveCourseId(supabase, courseIdentifier);
    if (!courseId) {
      return ApiErrors.notFound('Cours', courseIdentifier);
    }

    // 2. Vérifier l'authentification
    const { data: { session }, error: authError } = await supabase.auth.getSession();
    const user = session?.user;
    if (authError || !user) {
      return ApiErrors.unauthorized();
    }

    // 3. Vérifier le rôle admin
    const { checkUserRoleFromDB } = await import('@/lib/security/roleCheck');
    const { isAdmin } = await checkUserRoleFromDB(user.id);

    // 4. Vérifier l'accès (admin / instructeur / inscrit)
    if (!isAdmin) {
      // Récupérer instructor_id + price + is_free en une seule requête
      const { data: courseInfo, error: courseInfoError } = await supabase
        .from('courses')
        .select('instructor_id, price, is_free')
        .eq('id', courseId)
        .single();

      if (courseInfoError || !courseInfo) {
        return ApiErrors.notFound('Cours', courseIdentifier);
      }

      const isInstructor = (courseInfo as any).instructor_id === user.id;

      if (!isInstructor) {
        // Chercher l'inscription existante (requête unique, sans retry)
        const { data: enrollment } = await supabase
          .from('enrollments')
          .select('id, status')
          .eq('user_id', user.id)
          .eq('course_id', courseId)
          .maybeSingle();

        const validStatuses = ['active', 'completed', 'pending'];
        const hasValidEnrollment = enrollment && validStatuses.includes((enrollment as any).status);

        if (!hasValidEnrollment) {
          const isFree = (courseInfo as any).is_free || (courseInfo as any).price === 0 || (courseInfo as any).price === null;

          if (isFree) {
            // Cours gratuit → inscrire automatiquement (upsert pour éviter les doublons)
            const { error: upsertError } = await supabase
              .from('enrollments')
              .upsert(
                { user_id: user.id, course_id: courseId, status: 'active', enrolled_at: new Date().toISOString(), progress: 0 } as any,
                { onConflict: 'user_id,course_id', ignoreDuplicates: false },
              );

            if (upsertError) {
              return ApiErrors.enrollmentRequired(courseIdentifier);
            }
          } else {
            // Cours payant → vérifier paiement complété
            const { data: payment } = await supabase
              .from('payments')
              .select('id')
              .eq('user_id', user.id)
              .eq('course_id', courseId)
              .eq('status', 'completed')
              .maybeSingle();

            if (!payment) {
              return ApiErrors.enrollmentRequired(courseIdentifier);
            }

            // Paiement OK → inscrire automatiquement
            await supabase
              .from('enrollments')
              .upsert(
                { user_id: user.id, course_id: courseId, status: 'active', enrolled_at: new Date().toISOString(), progress: 0 } as any,
                { onConflict: 'user_id,course_id', ignoreDuplicates: false },
              );
          }
        }
      }
    }

    // 5. Récupérer le cours
    const { data: course, error: courseError } = await supabase
      .from('courses')
      .select('id, title, description, syllabus, instructor_id, categories(id, name, description, slug)')
      .eq('id', courseId)
      .single();

    if (courseError || !course) {
      return ApiErrors.notFound('Cours', courseIdentifier);
    }

    // 6. Récupérer modules + leçons + progression en parallèle
    const [modulesResult, unassignedResult, progressResult] = await Promise.all([
      supabase
        .from('modules')
        .select('id, title, description, "order", lessons(id, title, description, content, video_url, duration, lesson_order, is_free, module_id)')
        .eq('course_id', courseId)
        .order('order', { ascending: true }),
      supabase
        .from('lessons')
        .select('id, title, description, content, video_url, duration, lesson_order, is_free')
        .eq('course_id', courseId)
        .is('module_id', null)
        .order('lesson_order', { ascending: true }),
      supabase
        .from('user_progress')
        .select('lesson_id, is_completed, completed_at')
        .eq('user_id', user.id)
        .eq('course_id', courseId),
    ]);

    // 7. Construire la liste plate des leçons
    const allLessons: any[] = [];

    for (const mod of (modulesResult.data || [])) {
      const sorted = ((mod as any).lessons || [])
        .slice()
        .sort((a: any, b: any) => (a.lesson_order ?? 0) - (b.lesson_order ?? 0));
      for (const lesson of sorted) {
        allLessons.push({ ...lesson, moduleId: (mod as any).id, moduleTitle: (mod as any).title });
      }
    }

    for (const lesson of (unassignedResult.data || [])) {
      allLessons.push({ ...(lesson as any), moduleId: null, moduleTitle: null });
    }

    // Fallback syllabus JSON pour cours hérités
    if (allLessons.length === 0 && (course as any).syllabus) {
      try {
        const syllabus = typeof (course as any).syllabus === 'string'
          ? JSON.parse((course as any).syllabus)
          : (course as any).syllabus;
        const syllabusModules: any[] = Array.isArray(syllabus) ? syllabus : (syllabus?.modules || []);
        for (const mod of syllabusModules) {
          for (const lesson of (mod.lessonList || mod.lessons || [])) {
            allLessons.push({ ...lesson, moduleId: mod.id, moduleTitle: mod.title });
          }
        }
      } catch {
        // Syllabus invalide
      }
    }

    if (allLessons.length === 0) {
      return errorResponse(
        'Ce cours n\'a pas encore de contenu. Veuillez contacter l\'administrateur pour ajouter des modules et des leçons.',
        404,
        'NO_LESSONS',
        { courseId: courseIdentifier, courseTitle: (course as any)?.title },
      );
    }

    // 8. Formater les leçons avec progression
    const progressMap = new Map(
      ((progressResult.data || []) as any[]).map((p: any) => [p.lesson_id, p]),
    );

    const lessonsWithProgress = allLessons.map((lesson: any) => {
      const progress = progressMap.get(lesson.id);
      return {
        id: lesson.id,
        title: lesson.title,
        description: lesson.description,
        content: lesson.content,
        videoUrl: lesson.videoUrl || lesson.video_url,
        duration: lesson.duration,
        order: lesson.order || 0,
        moduleId: lesson.moduleId,
        moduleTitle: lesson.moduleTitle,
        isCompleted: progress ? progress.is_completed : false,
        completedAt: progress ? progress.completed_at : null,
      };
    });

    const totalLessons = lessonsWithProgress.length;
    const completedLessons = lessonsWithProgress.filter((l: any) => l.isCompleted).length;
    const progressPct = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

    return successResponse(
      {
        course: {
          id: (course as any).id,
          title: (course as any).title,
          description: (course as any).description,
          category: (course as any).categories,
          lessons: lessonsWithProgress,
          progress: {
            total: totalLessons,
            completed: completedLessons,
            percentage: progressPct,
          },
        },
      },
      undefined,
      200,
      // Données personnalisées (progression user) → private.
      // 60s navigateur, 120s CDN edge avec revalidation silencieuse.
      { 'Cache-Control': 'private, max-age=60, stale-while-revalidate=120' },
    );
  } catch (error: any) {
    return ApiErrors.internalError(
      'Erreur interne du serveur lors de la récupération des leçons',
      process.env.NODE_ENV === 'development' ? error?.message : undefined,
    );
  }
}

// Wrapper avec rate limiting
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const rateLimitResponse = await apiRateLimiter(request);
  if (rateLimitResponse) return rateLimitResponse;
  return GETHandler(request, context);
}

// POST - Créer une nouvelle leçon (instructeurs et admins uniquement)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id: courseIdentifier } = await params;
    const supabase = await createServerSupabaseClient();

    const courseId = await resolveCourseId(supabase, courseIdentifier);
    if (!courseId) {
      return ApiErrors.notFound('Cours', courseIdentifier);
    }

    const { data: { session }, error: authError } = await supabase.auth.getSession();
    const user = session?.user;
    if (authError || !user) {
      return ApiErrors.unauthorized();
    }

    const { data: course, error: courseError } = await supabase
      .from('courses')
      .select('instructor_id')
      .eq('id', courseId)
      .single();

    if (courseError || !course) {
      return ApiErrors.notFound('Cours', courseIdentifier);
    }

    const { checkUserRoleFromDB } = await import('@/lib/security/roleCheck');
    const { isAdmin } = await checkUserRoleFromDB(user.id);
    const isInstructor = (course as any).instructor_id === user.id;

    if (!isInstructor && !isAdmin) {
      return ApiErrors.forbidden('Vous devez être l\'instructeur de ce cours ou administrateur');
    }

    const body = await request.json();
    const validationResult = createLessonSchema.safeParse(body);
    if (!validationResult.success) {
      return ApiErrors.validationError('Données invalides', validationResult.error.errors);
    }

    const { title, description, content, videoUrl, duration, order } = validationResult.data;

    const { data: lesson, error } = await supabase
      .from('lessons')
      .insert({
        course_id: courseId,
        title: title.trim(),
        description: description.trim(),
        content: content.trim(),
        video_url: videoUrl || null,
        duration: duration || null,
        order: order || 0,
      } as any)
      .select()
      .single();

    if (error) {
      return ApiErrors.databaseError('Erreur lors de la création de la leçon', error.message);
    }

    return successResponse({ lesson }, 'Leçon créée avec succès');
  } catch (error: any) {
    return ApiErrors.internalError('Erreur interne du serveur', error.message);
  }
}

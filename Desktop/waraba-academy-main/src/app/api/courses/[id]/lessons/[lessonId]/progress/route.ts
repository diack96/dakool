import { NextRequest } from 'next/server';
import { createServerSupabaseClient, getAdminSupabaseClient } from '@/lib/supabase-server';
import { successResponse, ApiErrors } from '@/lib/api/response';
import { updateProgressSchema } from '@/lib/validation/courses';
import { isUUID } from '@/lib/utils/slug';
import { issueCertificate } from '@/lib/certificates/issueCertificate';
import { resolveStudentName } from '@/lib/certificates/nameUtils';
import { apiLogger } from '@/lib/logger';
import { trackLessonComplete } from '@/lib/gamification';

// Helper pour résoudre l'ID réel du cours (UUID) et récupérer le syllabus
async function resolveCourse(supabase: any, courseIdentifier: string): Promise<{ id: string; syllabus: any } | null> {
  const column = isUUID(courseIdentifier) ? 'id' : 'slug';
  const { data, error } = await supabase
    .from('courses')
    .select('id, syllabus')
    .eq(column, courseIdentifier)
    .single();

  if (!error && data) {
    return { id: data.id, syllabus: data.syllabus };
  }
  return null;
}

// Helper pour extraire tous les IDs de leçons depuis le syllabus JSON
function getLessonIdsFromSyllabus(syllabus: any): string[] {
  if (!syllabus) return [];
  try {
    const parsed = typeof syllabus === 'string' ? JSON.parse(syllabus) : syllabus;
    const modules = Array.isArray(parsed) ? parsed : parsed?.modules || [];
    const ids: string[] = [];
    for (const mod of modules) {
      const lessons = mod.lessonList || mod.lessons || [];
      for (const l of lessons) {
        if (l.id) ids.push(l.id);
      }
    }
    return ids;
  } catch {
    return [];
  }
}

// Helper pour vérifier qu'un lessonId existe dans le syllabus JSON du cours
function lessonExistsInSyllabus(syllabus: any, lessonId: string): boolean {
  return getLessonIdsFromSyllabus(syllabus).includes(lessonId);
}

// Helper pour vérifier qu'une leçon appartient au cours via la table lessons (DB)
async function lessonExistsInDB(supabase: any, courseId: string, lessonId: string): Promise<boolean> {
  if (!isUUID(lessonId)) return false;
  const { data } = await supabase
    .from('lessons')
    .select('id')
    .eq('id', lessonId)
    .eq('course_id', courseId)
    .single();
  return !!data;
}

// Helper pour récupérer les IDs de leçons depuis la table lessons (DB)
async function getLessonIdsFromDB(supabase: any, courseId: string): Promise<string[]> {
  const { data } = await supabase
    .from('lessons')
    .select('id')
    .eq('course_id', courseId);
  return data?.map((l: any) => l.id) || [];
}

// GET - Récupérer la progression d'une leçon
export async function GET (
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; lessonId: string }> },
) {
  try {
    const { id: courseIdentifier, lessonId } = await params;
    const supabase = await createServerSupabaseClient();

    // 1. Résoudre le cours (UUID + syllabus)
    const course = await resolveCourse(supabase, courseIdentifier);
    if (!course) {
      return ApiErrors.notFound('Cours', courseIdentifier);
    }
    const courseId = course.id;

    // 2. Vérifier l'authentification (getSession = JWT local, zéro appel réseau Auth)
    const { data: { session }, error: authError } = await supabase.auth.getSession();
    const user = session?.user;

    if (authError || !user) {
      return ApiErrors.unauthorized();
    }

    // 3. Vérifier que la leçon appartient au cours (syllabus JSON OU table lessons)
    const inSyllabus = lessonExistsInSyllabus(course.syllabus, lessonId);
    if (!inSyllabus) {
      const inDB = await lessonExistsInDB(supabase, courseId, lessonId);
      if (!inDB) {
        return ApiErrors.notFound('Leçon', lessonId);
      }
    }

    // 4. Vérifier que l'utilisateur est inscrit au cours (SÉCURITÉ CRITIQUE)
    const { data: enrollment, error: enrollmentError } = await supabase
      .from('enrollments')
      .select('id, status')
      .eq('user_id', user.id)
      .eq('course_id', courseId)
      .in('status', ['active', 'completed'])
      .single();

    if (enrollmentError || !enrollment) {
      return ApiErrors.enrollmentRequired(courseIdentifier);
    }

    // 4. Récupérer la progression
    const { data: progress, error } = await supabase
      .from('user_progress')
      .select('*')
      .eq('user_id', user.id)
      .eq('course_id', courseId)
      .eq('lesson_id', lessonId)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      return ApiErrors.databaseError('Erreur lors de la récupération de la progression', error.message);
    }

    return successResponse({
      progress: progress || {
        is_completed: false,
        progress_percentage: 0,
        time_spent: 0,
      },
      // Calculer lastPlayedTime depuis time_spent (en secondes)
      lastPlayedTime: (progress as any)?.time_spent || 0,
    });
  } catch (error: unknown) {
    return ApiErrors.internalError('Erreur lors de la récupération de la progression', error instanceof Error ? error.message : String(error));
  }
}

// POST - Sauvegarder la progression d'une leçon
export async function POST (
  request: NextRequest,
  { params }: { params: Promise<{ id: string; lessonId: string }> },
) {
  try {
    const supabase = await createServerSupabaseClient();

    // Vérifier l'authentification (getSession = JWT local, zéro appel réseau Auth)
    const { data: { session }, error: authError } = await supabase.auth.getSession();
    const user = session?.user;

    if (authError || !user) {
      return ApiErrors.unauthorized();
    }

    const { id: courseIdentifier, lessonId } = await params;

    // Résoudre le cours (UUID + syllabus)
    const course = await resolveCourse(supabase, courseIdentifier);
    if (!course) {
      return ApiErrors.notFound('Cours', courseIdentifier);
    }
    const courseId = course.id;

    // Vérifier que la leçon appartient au cours (syllabus JSON OU table lessons)
    const inSyllabusPost = lessonExistsInSyllabus(course.syllabus, lessonId);
    if (!inSyllabusPost) {
      const inDB = await lessonExistsInDB(supabase, courseId, lessonId);
      if (!inDB) {
        return ApiErrors.notFound('Leçon', lessonId);
      }
    }

    const body = await request.json();
    
    // Validation des données avec Zod
    const validationResult = updateProgressSchema.safeParse(body);
    if (!validationResult.success) {
      return ApiErrors.validationError(
        'Données invalides',
        validationResult.error.errors,
      );
    }

    const { progress, lastPlayedTime, isCompleted } = validationResult.data;

    // Calculer le pourcentage de progression (progress optionnel, défaut 100% si isCompleted)
    const progressPercentage = progress !== undefined ? Math.round(progress * 100) : (isCompleted ? 100 : 0);
    const timeSpent = Math.round(lastPlayedTime || 0);

    // Vérifier si la leçon était déjà complétée (pour éviter les doublons XP)
    let wasAlreadyCompleted = false;
    if (isCompleted) {
      const { data: prevProgress } = await supabase
        .from('user_progress')
        .select('is_completed')
        .eq('user_id', user.id)
        .eq('lesson_id', lessonId)
        .maybeSingle();
      wasAlreadyCompleted = (prevProgress as any)?.is_completed === true;
    }

    // 6. Sauvegarder ou mettre à jour la progression (user_id vient de la session, pas du client)
    const { data: savedProgress, error } = await supabase
      .from('user_progress')
      .upsert({
        user_id: user.id, // TOUJOURS depuis la session, JAMAIS depuis le client
        course_id: courseId,
        lesson_id: lessonId,
        is_completed: isCompleted || false,
        completed_at: isCompleted ? new Date().toISOString() : null,
        progress_percentage: progressPercentage,
        time_spent: timeSpent,
        updated_at: new Date().toISOString(),
      } as any, {
        onConflict: 'user_id,lesson_id',
      })
      .select()
      .single();

    if (error) {
      return ApiErrors.databaseError('Erreur lors de la sauvegarde de la progression', error.message);
    }

    // Si la leçon est complétée, mettre à jour la progression globale dans enrollments
    // Les variables ci-dessous sont réutilisées dans la réponse (pas de second calcul)
    let _totalLessons = 0;
    let _validCompletedCount = 0;
    let _globalProgress = 0;

    if (isCompleted) {
      // Récupérer les IDs depuis le syllabus ET la table lessons (union dédupliquée)
      const syllabusIds = getLessonIdsFromSyllabus(course.syllabus);
      const dbIds = await getLessonIdsFromDB(supabase, courseId);
      const allLessonIds = [...new Set([...syllabusIds, ...dbIds])];
      _totalLessons = allLessonIds.length;

      if (_totalLessons > 0) {
        // Récupérer toutes les leçons complétées par l'utilisateur
        const { data: completedLessons, error: completedError } = await supabase
          .from('user_progress')
          .select('lesson_id')
          .eq('user_id', user.id)
          .eq('course_id', courseId)
          .eq('is_completed', true);

        if (!completedError && completedLessons) {
          // Only count lessons that still belong to the current course (intersection)
          // Stale records from deleted/restructured lessons must not inflate the count
          const completedSet = new Set(completedLessons.map((l: any) => l.lesson_id));
          _validCompletedCount = allLessonIds.filter(id => completedSet.has(id)).length;
          const globalProgress = Math.round((_validCompletedCount / _totalLessons) * 100);
          _globalProgress = globalProgress;

          // Mettre à jour la progression dans enrollments
          const enrollmentUpdate: any = {
            progress: Math.min(100, globalProgress),
            updated_at: new Date().toISOString(),
          };

          // Si le cours est terminé (100%), marquer comme completed
          if (globalProgress >= 100) {
            enrollmentUpdate.status = 'completed';
            enrollmentUpdate.completed_at = new Date().toISOString();
          }

          await (supabase
            .from('enrollments') as any)
            .update(enrollmentUpdate)
            .eq('user_id', user.id)
            .eq('course_id', courseId);

          // Gamification — fire-and-forget, ne bloque pas la réponse
          if (!wasAlreadyCompleted) {
            const isCourseDone = _totalLessons > 0 && _validCompletedCount >= _totalLessons;
            trackLessonComplete(user.id, isCourseDone);
          }

          // Auto-issue certificate on course completion
          if (globalProgress >= 100) {
            try {
              const adminSupabase = getAdminSupabaseClient();

              // Check if course has certificate enabled
              const { data: courseData } = await adminSupabase
                .from('courses')
                .select('title, certificate')
                .eq('id', courseId)
                .single();

              // certificate = true or null (default) means enabled
              if (courseData && courseData.certificate !== false) {
                // Résoudre le vrai nom — jamais d'email, jamais de placeholder
                const { data: profile } = await adminSupabase
                  .from('profiles')
                  .select('full_name, first_name, last_name')
                  .eq('id', user.id)
                  .single();

                const oauthMeta = user.user_metadata ?? null;
                const studentName = resolveStudentName(profile, oauthMeta);

                if (!studentName) {
                  // Profil incomplet : le certificat sera généré quand l'utilisateur
                  // aura renseigné son vrai nom dans son profil.
                  apiLogger.warn('Auto-issue certificate skipped: incomplete profile (no real name)', {
                    userId: user.id,
                    courseId,
                  });
                  // Ne pas bloquer la progression — l'utilisateur peut compléter son profil plus tard
                  // et l'admin peut émettre manuellement via /api/admin/certificates
                  throw new Error('PROFILE_INCOMPLETE');
                }

                // Get enrollment id
                const { data: enr } = await adminSupabase
                  .from('enrollments')
                  .select('id')
                  .eq('user_id', user.id)
                  .eq('course_id', courseId)
                  .single();

                await issueCertificate({
                  userId: user.id,
                  courseId,
                  enrollmentId: enr?.id,
                  studentName,
                  courseTitle: courseData.title,
                  grade: globalProgress,
                });
              }
            } catch (certError) {
              // Certificate issuance failure should not block progress save
              apiLogger.error('Auto-issue certificate failed:', certError);
            }
          }
        }
      }
    }

    // Retourner la progression globale calculée plus haut — pas de second calcul DB
    const response: any = { progress: savedProgress };
    if (isCompleted) {
      response.globalProgress  = _globalProgress;
      response.completedCount  = _validCompletedCount;
      response.totalLessons    = _totalLessons;
      response.courseCompleted = _totalLessons > 0 && _validCompletedCount >= _totalLessons;
    }

    return successResponse(response);
  } catch (error: unknown) {
    return ApiErrors.internalError('Erreur lors de la sauvegarde de la progression', error instanceof Error ? error.message : String(error));
  }
}


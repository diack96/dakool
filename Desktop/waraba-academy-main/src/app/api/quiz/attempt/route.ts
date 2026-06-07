import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { apiLogger } from '@/lib/logger';
import { z } from 'zod';
import { dbRateLimit } from '@/lib/dbRateLimit';
import { resolveStudentName } from '@/lib/certificates/nameUtils';
import { getAdminSupabaseClient } from '@/lib/supabase-admin';

// POST - Passer un quiz
export async function POST (request: NextRequest) {
  let body: any;

  try {
    // Rate limiting strict DB-based — 10 tentatives/min par IP (fonctionne sur Vercel serverless)
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
      ?? request.headers.get('x-real-ip')
      ?? 'unknown';
    const blocked = await dbRateLimit(`quiz:${ip}`, 10, 60_000);
    if (blocked) {
      return NextResponse.json(
        { error: 'Trop de tentatives. Réessayez dans une minute.' },
        { status: 429 },
      );
    }

    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll () {
            return cookieStore.getAll();
          },
          setAll (cookiesToSet: Array<{ name: string; value: string; options?: any }>) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options),
              );
            } catch {
              // Ignorer les erreurs de cookies côté serveur
            }
          },
        },
      },
    );

    // Vérifier l'authentification
    const { data: { session }, error: authError } = await supabase.auth.getSession();
    const user = session?.user;

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 },
      );
    }

    body = await request.json();

    // Schéma de validation pour soumettre un quiz
    const submitQuizSchema = z.object({
      quizId: z.string().uuid('ID de quiz invalide'),
      answers: z.array(z.object({
        questionId: z.string().uuid('ID de question invalide'),
        answerId: z.string().uuid('ID de réponse invalide'),
      })).min(1, 'Au moins une réponse est requise'),
      timeTaken: z.number().int().min(0).optional().nullable(),
    });

    // Validation avec Zod
    const validation = submitQuizSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        {
          error: 'Données invalides',
          details: validation.error.issues.map(e => ({
            field: e.path.join('.'),
            message: e.message,
          })),
        },
        { status: 400 },
      );
    }

    const { quizId, answers, timeTaken } = validation.data;

    // Récupérer le quiz avec ses questions et réponses via le client admin
    // (bypass RLS quiz_answers — nécessaire pour le scoring côté serveur)
    const adminSupabase = getAdminSupabaseClient();
    const { data: quiz, error: quizError } = await adminSupabase
      .from('quizzes')
      .select(`
        *,
        quiz_questions (
          id,
          points,
          quiz_answers (
            id,
            is_correct
          )
        )
      `)
      .eq('id', quizId)
      .eq('is_active', true)
      .single();

    if (quizError || !quiz) {
      return NextResponse.json(
        { error: 'Quiz non trouvé ou inactif' },
        { status: 404 },
      );
    }

    // Vérifier que l'utilisateur est inscrit au cours
    const { data: enrollment, error: enrollmentError } = await supabase
      .from('enrollments')
      .select('id')
      .eq('user_id', user.id)
      .eq('course_id', quiz.course_id)
      .in('status', ['active', 'completed'])
      .single();

    if (enrollmentError || !enrollment) {
      return NextResponse.json(
        { error: 'Vous devez être inscrit à ce cours' },
        { status: 403 },
      );
    }

    // SECURITY: Enforce time limit — reject submissions that exceed the allowed duration
    if (quiz.time_limit && timeTaken && timeTaken > quiz.time_limit * 60 + 30) {
      // Allow 30s grace period for network latency
      return NextResponse.json(
        { error: 'Temps écoulé. La durée de soumission dépasse la limite du quiz.' },
        { status: 400 },
      );
    }

    // Build a lookup of valid answer IDs per question for validation
    const validAnswersByQuestion = new Map<string, Set<string>>();
    for (const question of quiz.quiz_questions) {
      const answerIds = new Set<string>(question.quiz_answers.map((a: any) => a.id as string));
      validAnswersByQuestion.set(question.id as string, answerIds);
    }

    // SECURITY: Validate all submitted answerIds belong to their respective questions
    for (const answer of answers) {
      const validIds = validAnswersByQuestion.get(answer.questionId);
      if (!validIds) {
        return NextResponse.json(
          { error: `Question inconnue: ${answer.questionId}` },
          { status: 400 },
        );
      }
      if (!validIds.has(answer.answerId)) {
        return NextResponse.json(
          { error: 'Réponse invalide: l\'ID de réponse n\'appartient pas à cette question' },
          { status: 400 },
        );
      }
    }

    // Calculer le score
    let totalScore = 0;
    let earnedScore = 0;
    const userResponses = [];

    for (const question of quiz.quiz_questions) {
      totalScore += question.points;

      const userAnswer = answers.find((a: any) => a.questionId === question.id);
      if (userAnswer) {
        const correctAnswer = question.quiz_answers.find((a: any) => a.is_correct);
        const isCorrect = correctAnswer && userAnswer.answerId === correctAnswer.id;

        if (isCorrect) {
          earnedScore += question.points;
        }

        userResponses.push({
          question_id: question.id,
          selected_answer_id: userAnswer.answerId,
          is_correct: isCorrect,
          points_earned: isCorrect ? question.points : 0,
        });
      }
    }

    const percentage = totalScore > 0 ? Math.round((earnedScore / totalScore) * 100) : 0;
    const passed = percentage >= quiz.passing_score;

    // Créer la tentative de quiz via le client admin
    // (la politique quiz_attempts_insert_own n'autorise que score=0/passed=false/completed_at IS NULL
    //  depuis le client anon — le serveur doit passer par le service_role pour insérer les vraies valeurs)
    const { data: attempt, error: attemptError } = await adminSupabase
      .from('quiz_attempts')
      .insert({
        user_id: user.id,
        quiz_id: quizId,
        score: earnedScore,
        max_score: totalScore,
        passed,
        time_taken: timeTaken || null,
        completed_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (attemptError) {
      apiLogger.error('Erreur lors de la création de la tentative de quiz', attemptError, {
        userId: user.id,
        quizId,
        score: earnedScore,
        maxScore: totalScore,
      });
      return NextResponse.json(
        { error: 'Erreur lors de l\'enregistrement de la tentative' },
        { status: 500 },
      );
    }

    // Enregistrer les réponses de l'utilisateur en un seul insert batch (évite N requêtes séquentielles)
    if (userResponses.length > 0) {
      const { error: responsesError } = await adminSupabase
        .from('user_quiz_responses')
        .insert(userResponses.map(r => ({
          attempt_id: attempt.id,
          question_id: r.question_id,
          selected_answer_id: r.selected_answer_id,
          is_correct: r.is_correct,
          points_earned: r.points_earned,
        })));

      if (responsesError) {
        apiLogger.error('Erreur lors de l\'enregistrement des réponses quiz', responsesError, {
          userId: user.id,
          attemptId: attempt.id,
        });
        // Ne pas bloquer la réponse — la tentative est déjà enregistrée
      }
    }

    // ─── Post-quiz actions (quiz réussi) ──────────────────────────────────────
    let certificateId: string | null = null;
    let profileIncomplete = false;

    if (passed) {
      // 1. Mettre à jour la progression leçon/quiz
      const { error: progressError } = await supabase
        .from('user_progress')
        .upsert({
          user_id: user.id,
          course_id: quiz.course_id,
          lesson_id: quizId,
          is_completed: true,
          completed_at: new Date().toISOString(),
          progress_percentage: 100,
        }, {
          onConflict: 'user_id,lesson_id',
        });

      if (progressError) {
        apiLogger.error('Erreur mise à jour progression post-quiz', progressError, {
          userId: user.id,
          courseId: quiz.course_id,
          quizId,
          attemptId: attempt.id,
        });
      }

      // 2. Marquer l'inscription comme terminée (adminSupabase bypass RLS)
      const { error: enrollmentUpdateError } = await adminSupabase
        .from('enrollments')
        .update({
          status: 'completed',
          progress: 100,
          completed_at: new Date().toISOString(),
        })
        .eq('id', enrollment.id)
        .eq('user_id', user.id);

      if (enrollmentUpdateError) {
        apiLogger.error('Erreur mise à jour statut enrollment post-quiz', enrollmentUpdateError, {
          userId: user.id,
          enrollmentId: enrollment.id,
          courseId: quiz.course_id,
        });
      }

      // 3. Vérifier si le cours délivre un certificat
      const { data: course } = await supabase
        .from('courses')
        .select('title, certificate')
        .eq('id', quiz.course_id)
        .single();

      if (course?.certificate) {
        // 3. Récupérer le vrai nom depuis la table profiles (source de vérité)
        //    + fallback sur les métadonnées OAuth (Google, GitHub…)
        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name, first_name, last_name')
          .eq('id', user.id)
          .single();

        const oauthMeta = user.user_metadata ?? null;
        const studentName = resolveStudentName(profile, oauthMeta);

        if (!studentName) {
          // Profil incomplet — signaler au frontend sans bloquer la réussite du quiz
          profileIncomplete = true;
          apiLogger.error('Certificat non généré : profil incomplet (nom manquant)', null, {
            userId: user.id,
            courseId: quiz.course_id,
          });
        } else {
          // 4. Émettre le certificat
          try {
            const { issueCertificate } = await import('@/lib/certificates/issueCertificate');
            const { certificate } = await issueCertificate({
              userId: user.id,
              courseId: quiz.course_id,
              enrollmentId: enrollment.id,
              studentName,
              courseTitle: course.title,
              grade: percentage,
            });
            certificateId = certificate.id;
          } catch (certErr) {
            apiLogger.error('Erreur génération certificat post-quiz', certErr, {
              userId: user.id,
              courseId: quiz.course_id,
              studentName,
            });
          }
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: passed ? 'Quiz réussi !' : 'Quiz échoué',
      result: {
        score: earnedScore,
        maxScore: totalScore,
        percentage,
        passed,
        timeTaken,
        attemptId: attempt.id,
        // Certificate info — null if not applicable or generation failed
        certificateId,
        profileIncomplete: profileIncomplete || undefined,
      },
    });
  } catch (error: unknown) {
    apiLogger.error('Erreur serveur lors de la soumission du quiz', error, {
      quizId: body?.quizId,
    });
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 },
    );
  }
}

// GET - Récupérer les tentatives d'un utilisateur pour un quiz
export async function GET (request: NextRequest) {
  const { searchParams } = new URL(request.url);
  
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll () {
            return cookieStore.getAll();
          },
          setAll (cookiesToSet: Array<{ name: string; value: string; options?: any }>) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options),
              );
            } catch {
              // Ignorer les erreurs de cookies côté serveur
            }
          },
        },
      },
    );

    // Vérifier l'authentification
    const { data: { session }, error: authError } = await supabase.auth.getSession();
    const user = session?.user;

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 },
      );
    }

    const quizId = searchParams.get('quizId');

    if (!quizId) {
      return NextResponse.json(
        { error: 'ID du quiz requis' },
        { status: 400 },
      );
    }

    // Récupérer les tentatives de l'utilisateur pour ce quiz
    const { data: attempts, error } = await supabase
      .from('quiz_attempts')
      .select(`
        *,
        user_quiz_responses (
          question_id,
          is_correct,
          points_earned
        )
      `)
      .eq('user_id', user.id)
      .eq('quiz_id', quizId)
      .order('created_at', { ascending: false });

    if (error) {
      apiLogger.error('Erreur lors de la récupération des tentatives de quiz', error, {
        userId: user.id,
        quizId,
      });
      return NextResponse.json(
        { error: 'Erreur lors de la récupération des tentatives' },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      attempts: attempts || [],
    });
  } catch (error: unknown) {
    apiLogger.error('Erreur serveur lors de la récupération des tentatives', error, {
      quizId: searchParams.get('quizId'),
    });
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 },
    );
  }
}


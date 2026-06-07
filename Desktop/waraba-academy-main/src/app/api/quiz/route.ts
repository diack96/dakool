import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { apiLogger } from '@/lib/logger';

// GET - Récupérer les quiz d'un cours
export async function GET (request: NextRequest) {
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

    const { searchParams } = new URL(request.url);
    const courseId = searchParams.get('courseId');
    const moduleId = searchParams.get('moduleId');
    // allModules=true → return all quizzes with their module_id (course + module quizzes)
    const allModules = searchParams.get('allModules') === 'true';

    if (!courseId) {
      return NextResponse.json(
        { error: 'ID du cours requis' },
        { status: 400 },
      );
    }

    // Vérifier que l'utilisateur est inscrit au cours
    const { data: enrollment, error: enrollmentError } = await supabase
      .from('enrollments')
      .select('id')
      .eq('user_id', user.id)
      .eq('course_id', courseId)
      .in('status', ['active', 'completed'])
      .single();

    if (enrollmentError || !enrollment) {
      return NextResponse.json(
        { error: 'Vous devez être inscrit à ce cours' },
        { status: 403 },
      );
    }

    // Récupérer les quiz : par module si moduleId fourni, sinon les quiz de cours (module_id IS NULL)
    let query = supabase
      .from('quizzes')
      .select(`
        *,
        quiz_questions (
          id,
          question_text,
          question_type,
          points,
          order_index
        )
      `)
      .eq('course_id', courseId)
      .eq('is_active', true)
      .order('created_at', { ascending: true });

    if (moduleId) {
      query = query.eq('module_id', moduleId);
    } else if (!allModules) {
      // Default: only course-level quizzes (no module)
      query = query.is('module_id', null);
    }
    // allModules=true → no extra filter, return everything

    const { data: quizzes, error } = await query;

    if (error) {
      apiLogger.error('Erreur lors de la récupération des quiz', error, {
        courseId,
        userId: user.id,
      });
      return NextResponse.json(
        { error: 'Erreur lors de la récupération des quiz' },
        { status: 500 },
      );
    }

    // Formater les quiz sans révéler les bonnes réponses
    const formattedQuizzes = quizzes?.map(quiz => ({
      id: quiz.id,
      title: quiz.title,
      description: quiz.description,
      passing_score: quiz.passing_score,
      time_limit: quiz.time_limit,
      module_id: (quiz as any).module_id ?? null,
      questions_count: quiz.quiz_questions?.length || 0,
      total_points: quiz.quiz_questions?.reduce((sum: number, q: any) => sum + q.points, 0) || 0,
    })) || [];

    return NextResponse.json(
      { success: true, quizzes: formattedQuizzes },
      { headers: { 'Cache-Control': 'private, max-age=900, stale-while-revalidate=300' } },
    );
  } catch (error: unknown) {
    apiLogger.error('Erreur serveur lors de la récupération des quiz', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 },
    );
  }
}

// POST - Créer un nouveau quiz (instructeurs et admins uniquement)
export async function POST (request: NextRequest) {
  let body: { courseId?: string; title?: string; description?: string; passingScore?: number; timeLimit?: number; questions?: any[]; [key: string]: any } = {};
  
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

    const requestBody = await request.json();
    body = (requestBody || {}) as { courseId?: string; title?: string; description?: string; passingScore?: number; timeLimit?: number; questions?: any[]; [key: string]: any };
    
    // S'assurer que body n'est jamais null pour TypeScript
    if (!body) {
      body = {};
    }
    
    // Destructuration avec valeurs par défaut pour satisfaire TypeScript strict
    // Type assertion pour garantir que body a la structure attendue
    const typedBody = body as {
      courseId?: string;
      title?: string;
      description?: string;
      passingScore?: number;
      timeLimit?: number;
      questions?: any[];
    };
    
    const courseId = typedBody.courseId;
    const title = typedBody.title;
    const description = typedBody.description;
    const passingScore = typedBody.passingScore;
    const timeLimit = typedBody.timeLimit;
    const questions = typedBody.questions;

    // Validation des données
    if (!courseId || !title || !questions || !Array.isArray(questions)) {
      return NextResponse.json(
        { error: 'Données invalides' },
        { status: 400 },
      );
    }

    // Vérifier les permissions (instructeur du cours ou admin)
    const { data: course, error: courseError } = await supabase
      .from('courses')
      .select('instructor_id')
      .eq('id', courseId)
      .single();

    if (courseError || !course) {
      return NextResponse.json(
        { error: 'Cours non trouvé' },
        { status: 404 },
      );
    }

    // SÉCURITÉ: Vérifier les permissions depuis la DB
    const { checkUserRoleFromDB } = await import('@/lib/security/roleCheck');
    const roleCheck = await checkUserRoleFromDB(user.id);

    const isInstructor = course.instructor_id === user.id;
    const { isAdmin } = roleCheck;

    if (!isInstructor && !isAdmin) {
      return NextResponse.json(
        { error: 'Accès refusé - Vous devez être l\'instructeur de ce cours ou administrateur' },
        { status: 403 },
      );
    }

    // Créer le quiz
    const { data: quiz, error: quizError } = await supabase
      .from('quizzes')
      .insert({
        course_id: courseId,
        title: title.trim(),
        description: description?.trim() || null,
        passing_score: passingScore || 70,
        time_limit: timeLimit || null,
      })
      .select()
      .single();

    if (quizError) {
      apiLogger.error('Erreur lors de la création du quiz', quizError, {
        courseId,
        userId: user.id,
        title,
      });
      return NextResponse.json(
        { error: 'Erreur lors de la création du quiz' },
        { status: 500 },
      );
    }

    // Créer les questions et réponses
    for (const questionData of questions) {
      const { questionText, questionType, points, answers } = questionData;

      // Créer la question
      const { data: question, error: questionError } = await supabase
        .from('quiz_questions')
        .insert({
          quiz_id: quiz.id,
          question_text: questionText,
          question_type: questionType,
          points: points || 1,
          order_index: questionData.orderIndex || 0,
        })
        .select()
        .single();

      if (questionError) {
        apiLogger.error('Erreur lors de la création de la question', questionError, {
          quizId: quiz.id,
          questionText: questionText?.substring(0, 50),
        });
        continue;
      }

      // Créer les réponses
      if (answers && Array.isArray(answers)) {
        for (const answerData of answers) {
          await supabase
            .from('quiz_answers')
            .insert({
              question_id: question.id,
              answer_text: answerData.text,
              is_correct: answerData.isCorrect || false,
              order_index: answerData.orderIndex || 0,
            });
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Quiz créé avec succès',
      quiz: {
        id: quiz.id,
        title: quiz.title,
        questions_count: questions.length,
      },
    });
  } catch (error: unknown) {
    apiLogger.error('Erreur serveur lors de la création du quiz', error, {
      courseId: body?.courseId,
    });
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 },
    );
  }
}


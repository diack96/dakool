import { NextRequest, NextResponse } from 'next/server';
import { withAdminAuth, logAdminAction } from '@/middleware/adminAuth';
import { getAdminSupabaseClient } from '@/lib/supabase-server';
import { handleApiError, createValidationError, createInternalError } from '@/lib/errors';
import { z } from 'zod';

const createQuizSchema = z.object({
  course_id: z.string().uuid('ID de cours invalide'),
  title: z.string().min(1, 'Le titre est requis'),
  description: z.string().optional().default(''),
  passing_score: z.number().min(0).max(100).default(70),
  time_limit: z.number().int().min(1).optional().nullable(),
  questions: z.array(z.object({
    questionText: z.string().min(1, 'Le texte de la question est requis'),
    questionType: z.enum(['multiple_choice', 'true_false', 'text']),
    points: z.number().int().min(1).default(1),
    orderIndex: z.number().int().min(0),
    answers: z.array(z.object({
      text: z.string().min(1, 'Le texte de la réponse est requis'),
      isCorrect: z.boolean(),
      orderIndex: z.number().int().min(0),
    })),
  })).min(1, 'Au moins une question est requise'),
});

// GET /api/admin/quizzes - List quizzes (optionally filtered by course_id)
async function GET(request: NextRequest) {
  try {
    const supabase = getAdminSupabaseClient();
    const { searchParams } = new URL(request.url);
    const courseId = searchParams.get('course_id');

    let query = supabase
      .from('quizzes')
      .select('id, course_id, title, description, passing_score, time_limit, is_active, created_at, updated_at, courses(title)')
      .order('created_at', { ascending: false });

    if (courseId) {
      query = query.eq('course_id', courseId);
    }

    const { data: quizzes, error } = await query;

    if (error) {
      console.error('Erreur lors de la récupération des quizzes:', error);
      throw createInternalError('Erreur lors de la récupération des quizzes', { error: error.message });
    }

    // Count questions for each quiz
    const quizIds = (quizzes || []).map((q: any) => q.id);
    let questionCounts: Record<string, number> = {};

    if (quizIds.length > 0) {
      const { data: questions } = await supabase
        .from('quiz_questions')
        .select('quiz_id')
        .in('quiz_id', quizIds);

      if (questions) {
        for (const q of questions) {
          questionCounts[q.quiz_id] = (questionCounts[q.quiz_id] || 0) + 1;
        }
      }
    }

    const result = (quizzes || []).map((quiz: any) => ({
      id: quiz.id,
      courseId: quiz.course_id,
      title: quiz.title,
      description: quiz.description,
      passingScore: quiz.passing_score,
      timeLimit: quiz.time_limit,
      courseTitle: (quiz as any).courses?.title || '',
      questionCount: questionCounts[quiz.id] || 0,
      status: quiz.is_active === false ? 'draft' : 'published',
      createdAt: quiz.created_at,
      updatedAt: quiz.updated_at,
    }));

    return NextResponse.json({ success: true, quizzes: result });
  } catch (error: any) {
    console.error('Erreur quizzes GET:', error);
    return handleApiError(error);
  }
}

// POST /api/admin/quizzes - Create a quiz with questions and answers
async function POST(request: NextRequest) {
  try {
    const supabase = getAdminSupabaseClient();
    const body = await request.json();

    const validation = createQuizSchema.safeParse(body);
    if (!validation.success) {
      throw createValidationError('Données invalides', validation.error.issues);
    }

    const data = validation.data;

    // Verify course exists
    const { data: course, error: courseError } = await supabase
      .from('courses')
      .select('id')
      .eq('id', data.course_id)
      .single();

    if (courseError || !course) {
      throw createValidationError('Cours non trouvé');
    }

    // Create quiz
    const { data: quiz, error: quizError } = await supabase
      .from('quizzes')
      .insert({
        course_id: data.course_id,
        title: data.title,
        description: data.description,
        passing_score: data.passing_score,
        time_limit: data.time_limit || null,
      })
      .select()
      .single();

    if (quizError || !quiz) {
      console.error('Erreur création quiz:', quizError);
      throw createInternalError('Erreur lors de la création du quiz', { error: quizError?.message });
    }

    // Create questions and answers
    for (const question of data.questions) {
      const { data: dbQuestion, error: qError } = await supabase
        .from('quiz_questions')
        .insert({
          quiz_id: quiz.id,
          question_text: question.questionText,
          question_type: question.questionType,
          points: question.points,
          order_index: question.orderIndex,
        })
        .select()
        .single();

      if (qError || !dbQuestion) {
        console.error('Erreur création question:', qError);
        // Clean up: delete the quiz we just created
        await supabase.from('quizzes').delete().eq('id', quiz.id);
        throw createInternalError('Erreur lors de la création des questions', { error: qError?.message });
      }

      // Insert answers
      if (question.answers.length > 0) {
        const answersToInsert = question.answers.map(a => ({
          question_id: dbQuestion.id,
          answer_text: a.text,
          is_correct: a.isCorrect,
          order_index: a.orderIndex,
        }));

        const { error: aError } = await supabase
          .from('quiz_answers')
          .insert(answersToInsert);

        if (aError) {
          console.error('Erreur création réponses:', aError);
          await supabase.from('quizzes').delete().eq('id', quiz.id);
          throw createInternalError('Erreur lors de la création des réponses', { error: aError.message });
        }
      }
    }

    // Log action
    try {
      await logAdminAction({
        user_id: (request as any).adminUser?.id || 'unknown',
        action: 'quizzes.create',
        resource: `/api/admin/quizzes`,
        ip_address: request.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown',
        user_agent: request.headers.get('user-agent') || 'unknown',
        timestamp: new Date().toISOString(),
        success: true,
        details: { quiz_id: quiz.id, course_id: data.course_id },
      });
    } catch {
      // Don't block on log failure
    }

    return NextResponse.json({ success: true, quiz: { id: quiz.id, title: quiz.title } }, { status: 201 });
  } catch (error: any) {
    console.error('Erreur quizzes POST:', error);
    return handleApiError(error);
  }
}

const GET_handler = withAdminAuth(GET);
const POST_handler = withAdminAuth(POST);

export { GET_handler as GET, POST_handler as POST };

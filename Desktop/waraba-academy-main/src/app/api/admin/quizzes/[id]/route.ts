import { NextRequest, NextResponse } from 'next/server';
import { withAdminAuth, logAdminAction } from '@/middleware/adminAuth';
import { getAdminSupabaseClient } from '@/lib/supabase-server';
import { handleApiError, createValidationError, createInternalError } from '@/lib/errors';
import { z } from 'zod';

const updateQuizSchema = z.object({
  title: z.string().min(1, 'Le titre est requis').optional(),
  description: z.string().optional(),
  passing_score: z.number().min(0).max(100).optional(),
  time_limit: z.number().int().min(1).optional().nullable(),
  questions: z.array(z.object({
    questionText: z.string().min(1),
    questionType: z.enum(['multiple_choice', 'true_false', 'text']),
    points: z.number().int().min(1).default(1),
    orderIndex: z.number().int().min(0),
    answers: z.array(z.object({
      text: z.string().min(1),
      isCorrect: z.boolean(),
      orderIndex: z.number().int().min(0),
    })),
  })).optional(),
});

// GET /api/admin/quizzes/[id] - Get quiz with questions and answers
async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const supabase = getAdminSupabaseClient();
    const { id } = await params;

    const { data: quiz, error } = await supabase
      .from('quizzes')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !quiz) {
      throw createValidationError('Quiz non trouvé');
    }

    // Get questions
    const { data: questions } = await supabase
      .from('quiz_questions')
      .select('*')
      .eq('quiz_id', id)
      .order('order_index', { ascending: true });

    // Get answers for all questions
    const questionIds = (questions || []).map((q: any) => q.id);
    let answersMap: Record<string, any[]> = {};

    if (questionIds.length > 0) {
      const { data: answers } = await supabase
        .from('quiz_answers')
        .select('*')
        .in('question_id', questionIds)
        .order('order_index', { ascending: true });

      if (answers) {
        for (const a of answers) {
          if (!answersMap[a.question_id]) answersMap[a.question_id] = [];
          answersMap[a.question_id]!.push({
            id: a.id,
            text: a.answer_text,
            isCorrect: a.is_correct,
            orderIndex: a.order_index,
          });
        }
      }
    }

    const result = {
      id: quiz.id,
      courseId: quiz.course_id,
      moduleId: quiz.module_id,
      title: quiz.title,
      description: quiz.description || '',
      passingScore: quiz.passing_score,
      timeLimit: quiz.time_limit,
      questions: (questions || []).map((q: any) => ({
        id: q.id,
        questionText: q.question_text,
        questionType: q.question_type,
        points: q.points,
        orderIndex: q.order_index,
        answers: answersMap[q.id] || [],
      })),
      createdAt: quiz.created_at,
      updatedAt: quiz.updated_at,
    };

    return NextResponse.json({ success: true, quiz: result });
  } catch (error: any) {
    console.error('Erreur quiz GET:', error);
    return handleApiError(error);
  }
}

// PATCH /api/admin/quizzes/[id] - Update quiz (replace questions/answers)
async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const supabase = getAdminSupabaseClient();
    const { id } = await params;
    const body = await request.json();

    const validation = updateQuizSchema.safeParse(body);
    if (!validation.success) {
      throw createValidationError('Données invalides', validation.error.issues);
    }

    const data = validation.data;

    // Verify quiz exists
    const { data: existing, error: fetchError } = await supabase
      .from('quizzes')
      .select('id')
      .eq('id', id)
      .single();

    if (fetchError || !existing) {
      throw createValidationError('Quiz non trouvé');
    }

    // Update quiz metadata
    const updatePayload: any = {};
    if (data.title !== undefined) updatePayload.title = data.title;
    if (data.description !== undefined) updatePayload.description = data.description;
    if (data.passing_score !== undefined) updatePayload.passing_score = data.passing_score;
    if (data.time_limit !== undefined) updatePayload.time_limit = data.time_limit;

    if (Object.keys(updatePayload).length > 0) {
      const { error: updateError } = await supabase
        .from('quizzes')
        .update(updatePayload)
        .eq('id', id);

      if (updateError) {
        console.error('Erreur mise à jour quiz:', updateError);
        throw createInternalError('Erreur lors de la mise à jour du quiz', { error: updateError.message });
      }
    }

    // If questions are provided, replace all questions and answers
    if (data.questions) {
      // Get existing question IDs to delete their answers
      const { data: existingQuestions } = await supabase
        .from('quiz_questions')
        .select('id')
        .eq('quiz_id', id);

      if (existingQuestions && existingQuestions.length > 0) {
        const existingQIds = existingQuestions.map((q: any) => q.id);

        // Delete existing answers
        await supabase
          .from('quiz_answers')
          .delete()
          .in('question_id', existingQIds);

        // Delete existing questions
        await supabase
          .from('quiz_questions')
          .delete()
          .eq('quiz_id', id);
      }

      // Insert new questions and answers
      for (const question of data.questions) {
        const { data: dbQuestion, error: qError } = await supabase
          .from('quiz_questions')
          .insert({
            quiz_id: id,
            question_text: question.questionText,
            question_type: question.questionType,
            points: question.points,
            order_index: question.orderIndex,
          })
          .select()
          .single();

        if (qError || !dbQuestion) {
          console.error('Erreur création question:', qError);
          throw createInternalError('Erreur lors de la mise à jour des questions', { error: qError?.message });
        }

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
            throw createInternalError('Erreur lors de la mise à jour des réponses', { error: aError.message });
          }
        }
      }
    }

    // Log action
    try {
      await logAdminAction({
        user_id: (request as any).adminUser?.id || 'unknown',
        action: 'quizzes.update',
        resource: `/api/admin/quizzes/${id}`,
        ip_address: request.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown',
        user_agent: request.headers.get('user-agent') || 'unknown',
        timestamp: new Date().toISOString(),
        success: true,
        details: { quiz_id: id },
      });
    } catch {
      // Don't block on log failure
    }

    return NextResponse.json({ success: true, message: 'Quiz mis à jour avec succès' });
  } catch (error: any) {
    console.error('Erreur quiz PATCH:', error);
    return handleApiError(error);
  }
}

// DELETE /api/admin/quizzes/[id] - Delete a quiz (CASCADE deletes questions/answers)
async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const supabase = getAdminSupabaseClient();
    const { id } = await params;

    // Verify quiz exists
    const { data: existing, error: fetchError } = await supabase
      .from('quizzes')
      .select('id, title')
      .eq('id', id)
      .single();

    if (fetchError || !existing) {
      throw createValidationError('Quiz non trouvé');
    }

    // Delete questions and answers first (in case no CASCADE)
    const { data: questions } = await supabase
      .from('quiz_questions')
      .select('id')
      .eq('quiz_id', id);

    if (questions && questions.length > 0) {
      const qIds = questions.map((q: any) => q.id);
      await supabase.from('quiz_answers').delete().in('question_id', qIds);
      await supabase.from('quiz_questions').delete().eq('quiz_id', id);
    }

    // Delete quiz
    const { error: deleteError } = await supabase
      .from('quizzes')
      .delete()
      .eq('id', id);

    if (deleteError) {
      console.error('Erreur suppression quiz:', deleteError);
      throw createInternalError('Erreur lors de la suppression du quiz', { error: deleteError.message });
    }

    // Log action
    try {
      await logAdminAction({
        user_id: (request as any).adminUser?.id || 'unknown',
        action: 'quizzes.delete',
        resource: `/api/admin/quizzes/${id}`,
        ip_address: request.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown',
        user_agent: request.headers.get('user-agent') || 'unknown',
        timestamp: new Date().toISOString(),
        success: true,
        details: { quiz_id: id, quiz_title: existing.title },
      });
    } catch {
      // Don't block on log failure
    }

    return NextResponse.json({ success: true, message: 'Quiz supprimé avec succès' });
  } catch (error: any) {
    console.error('Erreur quiz DELETE:', error);
    return handleApiError(error);
  }
}

const GET_handler = withAdminAuth(GET);
const PATCH_handler = withAdminAuth(PATCH);
const DELETE_handler = withAdminAuth(DELETE);

export { GET_handler as GET, PATCH_handler as PATCH, DELETE_handler as DELETE };

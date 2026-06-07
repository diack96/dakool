import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import { getAdminSupabaseClient } from '@/lib/supabase-admin';
import { isUUID } from '@/lib/utils/slug';

// GET - Récupérer un quiz avec ses questions pour la page quiz
export async function GET (
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; quizId: string }> },
) {
  try {
    const supabase = await createServerSupabaseClient();

    const { data: { session }, error: authError } = await supabase.auth.getSession();
    const user = session?.user;
    if (authError || !user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const { id: courseIdentifier, quizId } = await params;

    // Résoudre le cours (UUID ou slug)
    const column = isUUID(courseIdentifier) ? 'id' : 'slug';
    const { data: courseData } = await supabase
      .from('courses')
      .select('id')
      .eq(column, courseIdentifier)
      .single();

    const course = courseData as { id: string } | null;

    if (!course) {
      return NextResponse.json({ error: 'Cours non trouvé' }, { status: 404 });
    }

    // Vérifier l'inscription
    const { data: enrollment } = await supabase
      .from('enrollments')
      .select('id')
      .eq('user_id', user.id)
      .eq('course_id', course.id)
      .in('status', ['active', 'completed'])
      .single();

    if (!enrollment) {
      return NextResponse.json({ error: 'Vous devez être inscrit à ce cours' }, { status: 403 });
    }

    // Récupérer le quiz avec questions et réponses via le client admin
    // (bypass RLS quiz_answers_select_after_completed_attempt — nécessaire pour
    //  les nouveaux utilisateurs qui n'ont pas encore de tentative complétée)
    const adminSupabase = getAdminSupabaseClient();
    const { data: quizData, error } = await adminSupabase
      .from('quizzes')
      .select(`
        id, title, description, passing_score, time_limit,
        quiz_questions (
          id, question_text, question_type, points, order_index,
          quiz_answers (
            id, answer_text, is_correct, order_index
          )
        )
      `)
      .eq('id', quizId)
      .eq('course_id', course.id)
      .single();

    const quiz = quizData as any;

    if (error || !quiz) {
      return NextResponse.json({ error: 'Quiz non trouvé' }, { status: 404 });
    }

    // Formater pour le QuizPlayer (les options sont des strings, correctAnswer est le texte)
    const formattedQuiz = {
      id: quiz.id,
      title: quiz.title,
      description: quiz.description,
      passingScore: quiz.passing_score,   // camelCase requis par l'interface QuizPlayer
      time_limit: quiz.time_limit,
      questions: (quiz.quiz_questions as any[])
        ?.sort((a: any, b: any) => (a.order_index || 0) - (b.order_index || 0))
        .map((q: any, idx: number) => {
          const answers = (q.quiz_answers as any[])?.sort(
            (a: any, b: any) => (a.order_index || 0) - (b.order_index || 0),
          ) || [];
          const correctAnswer = answers.find((a: any) => a.is_correct);
          return {
            id: q.id,
            question: q.question_text,
            type: q.question_type as 'multiple_choice' | 'true_false' | 'text',
            points: q.points || 1,
            order: idx + 1,
            options: answers.map((a: any) => a.answer_text),
            answers: answers.map((a: any) => ({ id: a.id, text: a.answer_text })),
            correctAnswer: correctAnswer?.answer_text || '',
          };
        }) || [],
    };

    return NextResponse.json({ success: true, quiz: formattedQuiz });
  } catch (error: unknown) {
    console.error('Erreur quiz endpoint:', error);
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 });
  }
}

-- ============================================================================
-- Migration 025: Restrict quiz_answers RLS
-- SECURITY FIX: Students could query quiz_answers directly to see is_correct
-- Now only admins and the quiz API (service role) can see all answers.
-- Students can only see answers for quizzes they have already submitted.
-- ============================================================================

-- Drop the overly permissive policy
DROP POLICY IF EXISTS "quiz_answers_select_authenticated" ON public.quiz_answers;
DROP POLICY IF EXISTS "quiz_answers_select_public" ON public.quiz_answers;

-- Students can only see answers for quizzes they have already attempted
CREATE POLICY "quiz_answers_select_after_attempt" ON public.quiz_answers
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.quiz_attempts qa
      JOIN public.quiz_questions qq ON qq.quiz_id = qa.quiz_id
      WHERE qq.id = quiz_answers.question_id
        AND qa.user_id = auth.uid()
    )
  );

-- Admins (service role) bypass RLS automatically, no extra policy needed

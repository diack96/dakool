-- Migration 020: RLS reinforcement for quiz tables + security fixes
-- Safe to run on existing databases (idempotent)
-- For NEW databases: schema-complet.sql v5.0 already includes all of this

-- ============================================================================
-- quiz_attempts : Enable RLS + policies (skip if already exists)
-- ============================================================================
ALTER TABLE public.quiz_attempts ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "quiz_attempts_select_own" ON public.quiz_attempts
    FOR SELECT TO authenticated USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "quiz_attempts_insert_own" ON public.quiz_attempts
    FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "quiz_attempts_select_admin" ON public.quiz_attempts
    FOR SELECT TO authenticated USING (public.is_admin());
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ============================================================================
-- user_quiz_responses : Enable RLS + policies
-- ============================================================================
ALTER TABLE public.user_quiz_responses ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "quiz_responses_all_own" ON public.user_quiz_responses
    FOR ALL TO authenticated
    USING (EXISTS (SELECT 1 FROM public.quiz_attempts WHERE id = attempt_id AND user_id = auth.uid()))
    WITH CHECK (EXISTS (SELECT 1 FROM public.quiz_attempts WHERE id = attempt_id AND user_id = auth.uid()));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ============================================================================
-- Security fix: quiz_answers should NOT be public (exposes is_correct)
-- Change from public to authenticated only
-- ============================================================================
DO $$ BEGIN
  DROP POLICY IF EXISTS "quiz_answers_select_public" ON public.quiz_answers;
  CREATE POLICY "quiz_answers_select_authenticated" ON public.quiz_answers
    FOR SELECT TO authenticated USING (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Same for quiz_questions
DO $$ BEGIN
  DROP POLICY IF EXISTS "quiz_questions_select_public" ON public.quiz_questions;
  CREATE POLICY "quiz_questions_select_authenticated" ON public.quiz_questions
    FOR SELECT TO authenticated USING (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ============================================================================
-- Performance indexes for analytics queries
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_completed_at
  ON public.quiz_attempts(completed_at);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_user_quiz
  ON public.quiz_attempts(user_id, quiz_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_user_completed
  ON public.user_progress(user_id, is_completed);
CREATE INDEX IF NOT EXISTS idx_enrollments_user_id
  ON public.enrollments(user_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_status
  ON public.enrollments(status);

-- ============================================================================
-- Add is_coming_soon column to courses if missing
-- ============================================================================
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS is_coming_soon BOOLEAN DEFAULT false;

-- ============================================================================
-- Storage policies (add if missing)
-- ============================================================================
DO $$ BEGIN
  CREATE POLICY "avatars_select_public" ON storage.objects
    FOR SELECT TO public USING (bucket_id = 'avatars');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "avatars_insert_authenticated" ON storage.objects
    FOR INSERT TO authenticated WITH CHECK (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::TEXT);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "course_images_select_public" ON storage.objects
    FOR SELECT TO public USING (bucket_id = 'course-images');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "course_images_insert_admin" ON storage.objects
    FOR INSERT TO authenticated WITH CHECK (bucket_id = 'course-images' AND public.is_admin());
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "course_videos_select_authenticated" ON storage.objects
    FOR SELECT TO authenticated USING (bucket_id = 'course-videos');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "course_videos_insert_admin" ON storage.objects
    FOR INSERT TO authenticated WITH CHECK (bucket_id = 'course-videos' AND public.is_admin());
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Migration 024: Change user_progress.lesson_id from UUID to TEXT
-- Reason: Lessons are stored in the course syllabus JSON with custom IDs
-- (e.g. 'les-intro-web-01'), not as UUID rows in the lessons table.
-- The FK constraint prevents saving progress for syllabus-based lessons.

-- 1. Drop the FK constraint on lesson_id
ALTER TABLE public.user_progress
  DROP CONSTRAINT IF EXISTS user_progress_lesson_id_fkey;

-- 2. Change column type from UUID to TEXT
ALTER TABLE public.user_progress
  ALTER COLUMN lesson_id TYPE TEXT USING lesson_id::TEXT;

-- 3. Re-create the unique constraint (it stays the same, just with TEXT now)
-- The existing UNIQUE(user_id, lesson_id) constraint should survive the type change,
-- but recreate it to be safe
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'user_progress_user_id_lesson_id_key'
  ) THEN
    ALTER TABLE public.user_progress
      ADD CONSTRAINT user_progress_user_id_lesson_id_key UNIQUE (user_id, lesson_id);
  END IF;
END $$;

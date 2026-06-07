-- =============================================================================
-- Migration 041 — Fix progress save errors
-- =============================================================================
-- Problems fixed:
-- 1. user_progress_lesson_id_uuid_format CHECK constraint (added in migration 040)
--    blocks inserts for lessons with custom IDs (e.g. 'les-intro-web-01').
--    Migration 024 explicitly changed lesson_id to TEXT to support custom IDs,
--    so this UUID format check directly contradicts that design decision.
--
-- 2. lessons_select_authenticated RLS (migration 030) requires status = 'active',
--    which blocks completed students (status = 'completed') from being counted
--    in getLessonIdsFromDB when calculating global course progress.
--
-- 3. enrollments UPDATE policy is missing from migrations (only exists in
--    schema-complet.sql) — the enrollment progress/status update on lesson
--    completion silently fails without it.
-- =============================================================================


-- ─── 1. Drop the UUID format check on user_progress.lesson_id ────────────────
-- Lesson IDs are TEXT and can be custom strings (e.g. 'les-intro-web-01')
-- as well as UUIDs. This constraint incorrectly blocks custom-ID lessons.

ALTER TABLE public.user_progress
  DROP CONSTRAINT IF EXISTS user_progress_lesson_id_uuid_format;


-- ─── 2. Fix lessons_select_authenticated to allow completed students ──────────
-- Students with enrollment status = 'completed' also need to read their lessons
-- (e.g. when calculating total lessons for global progress percentage).

DROP POLICY IF EXISTS "lessons_select_authenticated" ON public.lessons;

CREATE POLICY "lessons_select_authenticated" ON public.lessons
    FOR SELECT TO authenticated
    USING (
        -- Leçon gratuite (toujours accessible)
        is_free = true
        OR
        -- Admin : accès total
        public.is_admin()
        OR
        -- Instructeur du cours : accès à ses propres leçons
        EXISTS (
            SELECT 1 FROM public.courses c
            WHERE c.id = lessons.course_id
              AND c.instructor_id = auth.uid()
        )
        OR
        -- Étudiant inscrit (actif OU cours terminé)
        EXISTS (
            SELECT 1 FROM public.enrollments e
            WHERE e.course_id = lessons.course_id
              AND e.user_id = auth.uid()
              AND e.status IN ('active', 'completed')
        )
    );


-- ─── 3. Add missing enrollments UPDATE policy ─────────────────────────────────
-- Allows students to update their own enrollment progress/status.
-- Without this, the progress% and status='completed' updates on lesson
-- completion silently fail (RLS blocks the UPDATE).

DROP POLICY IF EXISTS "enrollments_update_own" ON public.enrollments;

CREATE POLICY "enrollments_update_own" ON public.enrollments
    FOR UPDATE TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);


-- ─── Verification ─────────────────────────────────────────────────────────────
DO $$
BEGIN
    -- Check constraint is gone
    IF EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'user_progress_lesson_id_uuid_format'
          AND conrelid = 'public.user_progress'::regclass
    ) THEN
        RAISE EXCEPTION '❌ Migration 041: UUID constraint still exists on user_progress.lesson_id';
    END IF;

    -- lessons policy updated
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE tablename = 'lessons'
          AND policyname = 'lessons_select_authenticated'
    ) THEN
        RAISE EXCEPTION '❌ Migration 041: lessons_select_authenticated policy missing';
    END IF;

    -- enrollments update policy
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE tablename = 'enrollments'
          AND policyname = 'enrollments_update_own'
    ) THEN
        RAISE EXCEPTION '❌ Migration 041: enrollments_update_own policy missing';
    END IF;

    RAISE NOTICE '✅ Migration 041: All fixes applied successfully';
END $$;

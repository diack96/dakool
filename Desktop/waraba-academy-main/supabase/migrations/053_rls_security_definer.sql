-- Migration 053 : RLS helper functions with SECURITY DEFINER
-- These functions bypass RLS when called by trusted server code, eliminating
-- expensive per-row subqueries in hot RLS policies.
-- Apply in Supabase SQL Editor.

-- 1. Vérifie si l'utilisateur courant est admin (mis en cache par session)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
      AND role = 'admin'
  );
$$;

-- 2. Vérifie si l'utilisateur courant est inscrit à un cours donné
CREATE OR REPLACE FUNCTION public.is_enrolled(p_course_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.enrollments
    WHERE user_id = auth.uid()
      AND course_id = p_course_id
      AND status IN ('active', 'completed')
  );
$$;

-- 3. Vérifie si l'utilisateur courant est l'instructeur d'un cours
CREATE OR REPLACE FUNCTION public.is_instructor_of(p_course_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.courses
    WHERE id = p_course_id
      AND instructor_id = auth.uid()
  );
$$;

-- 4. Revoke public execute, grant only to authenticated
REVOKE EXECUTE ON FUNCTION public.is_admin()            FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.is_enrolled(uuid)     FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.is_instructor_of(uuid) FROM PUBLIC;

GRANT  EXECUTE ON FUNCTION public.is_admin()            TO authenticated;
GRANT  EXECUTE ON FUNCTION public.is_enrolled(uuid)     TO authenticated;
GRANT  EXECUTE ON FUNCTION public.is_instructor_of(uuid) TO authenticated;

-- 5. Example: update quiz RLS to use helpers (replaces correlated subquery)
-- DROP POLICY IF EXISTS "Users can view quizzes if enrolled" ON public.quizzes;
-- CREATE POLICY "Users can view quizzes if enrolled" ON public.quizzes
--   FOR SELECT TO authenticated
--   USING (is_enrolled(course_id) OR is_admin() OR is_instructor_of(course_id));

-- NOTE: Uncomment the block above and adapt to your existing policy names
-- after verifying the functions work correctly with: SELECT is_admin();

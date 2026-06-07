-- =============================================================================
-- Migration 040 — Fix remaining schema integrity issues
-- =============================================================================
-- 1. user_progress.lesson_id : validation format UUID (pas de FK car stocke
--    aussi des quiz IDs)
-- 2. courses : trigger de synchronisation status ↔ is_published
-- 3. payments.course_id : ON DELETE SET NULL → ON DELETE RESTRICT
--    (l'historique financier ne doit jamais perdre sa référence de cours)
-- 4. modules : ENABLE ROW LEVEL SECURITY + politiques de base
-- =============================================================================


-- ─── 1. user_progress.lesson_id — validation UUID ────────────────────────────
-- lesson_id est TEXT (pas FK) car il stocke à la fois des IDs de leçons et
-- de quizzes. On ajoute au moins une validation de format.
-- NOT VALID = appliqué aux nouvelles lignes seulement, sans bloquer si des
-- anciennes valeurs ne respectent pas le format.

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'user_progress_lesson_id_uuid_format'
      AND conrelid = 'public.user_progress'::regclass
  ) THEN
    ALTER TABLE public.user_progress
      ADD CONSTRAINT user_progress_lesson_id_uuid_format
      CHECK (lesson_id ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$')
      NOT VALID;
  END IF;
END;
$$;


-- ─── 2. courses : sync trigger status ↔ is_published ─────────────────────────
-- Empêche les états incohérents : status='PUBLISHED' + is_published=false
-- ou status='DRAFT' + is_published=true.

CREATE OR REPLACE FUNCTION public.sync_course_status_published()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- is_published modifié → ajuster status
  IF NEW.is_published IS DISTINCT FROM OLD.is_published THEN
    IF NEW.is_published = true AND NEW.status <> 'PUBLISHED' THEN
      NEW.status := 'PUBLISHED';
    ELSIF NEW.is_published = false AND NEW.status = 'PUBLISHED' THEN
      NEW.status := 'DRAFT';
    END IF;
  END IF;

  -- status modifié → ajuster is_published
  IF NEW.status IS DISTINCT FROM OLD.status THEN
    IF NEW.status = 'PUBLISHED' AND NEW.is_published = false THEN
      NEW.is_published := true;
    ELSIF NEW.status IN ('DRAFT', 'ARCHIVED') AND NEW.is_published = true THEN
      NEW.is_published := false;
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_sync_course_status_published ON public.courses;
CREATE TRIGGER trg_sync_course_status_published
  BEFORE UPDATE OF status, is_published ON public.courses
  FOR EACH ROW EXECUTE FUNCTION public.sync_course_status_published();

-- Corriger les lignes existantes incohérentes
UPDATE public.courses
SET is_published = CASE WHEN status = 'PUBLISHED' THEN true ELSE false END
WHERE (status = 'PUBLISHED' AND is_published = false)
   OR (status <> 'PUBLISHED' AND is_published = true);


-- ─── 3. payments.course_id : SET NULL → RESTRICT ─────────────────────────────
-- Un cours qui a des paiements ne peut plus être hard-deleted.
-- Utiliser soft_delete_course() (migration 037) à la place.

ALTER TABLE public.payments
  DROP CONSTRAINT IF EXISTS payments_course_id_fkey;

ALTER TABLE public.payments
  ADD CONSTRAINT payments_course_id_fkey
  FOREIGN KEY (course_id)
  REFERENCES public.courses(id)
  ON DELETE RESTRICT;


-- ─── 4. modules : ENABLE RLS + politiques ────────────────────────────────────
-- La politique RESTRICTIVE "modules_hide_deleted" existe déjà (migration 037).
-- On active RLS et on ajoute les politiques PERMISSIVE manquantes.

ALTER TABLE public.modules ENABLE ROW LEVEL SECURITY;

-- Lecture publique : modules des cours publiés uniquement
DROP POLICY IF EXISTS "modules_select_public" ON public.modules;
CREATE POLICY "modules_select_public" ON public.modules
  FOR SELECT TO public
  USING (
    EXISTS (
      SELECT 1 FROM public.courses c
      WHERE c.id = modules.course_id
        AND c.is_published = true
        AND c.deleted_at IS NULL
    )
  );

-- Instructeurs : gestion complète sur leurs propres cours
DROP POLICY IF EXISTS "modules_all_instructor" ON public.modules;
CREATE POLICY "modules_all_instructor" ON public.modules
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.courses c
      WHERE c.id = modules.course_id
        AND c.instructor_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.courses c
      WHERE c.id = modules.course_id
        AND c.instructor_id = auth.uid()
    )
  );

-- Admins : accès total
DROP POLICY IF EXISTS "modules_all_admin" ON public.modules;
CREATE POLICY "modules_all_admin" ON public.modules
  FOR ALL TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());
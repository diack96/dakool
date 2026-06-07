-- =============================================================================
-- Migration 042 — Fix sync_enrollment_progress trigger overflow
-- =============================================================================
-- Problem: sync_enrollment_progress() (migration 037) computes:
--   v_progress := ROUND((v_done / v_total) * 100, 2)
-- When v_done > v_total (e.g. user has progress records from old/deleted lessons
-- that are no longer in the lessons table), v_progress exceeds 100, violating
-- the CHECK constraint on enrollments.progress (INTEGER, 0-100).
-- The trigger fires on user_progress INSERT/UPDATE, so this error surfaces as
-- a foreign-table constraint violation on the user_progress upsert.
--
-- Fix: cap v_progress at 100 with LEAST(100, ...).
-- =============================================================================

CREATE OR REPLACE FUNCTION public.sync_enrollment_progress()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_user_id   UUID;
    v_course_id UUID;
    v_total     INTEGER;
    v_done      INTEGER;
    v_progress  NUMERIC(5,2);
BEGIN
    -- Récupérer user_id et course_id selon le type d'opération
    IF TG_OP = 'DELETE' THEN
        v_user_id   := OLD.user_id;
        v_course_id := OLD.course_id;
    ELSE
        v_user_id   := NEW.user_id;
        v_course_id := NEW.course_id;
    END IF;

    -- Ne traiter que si les deux clés sont présentes
    IF v_user_id IS NULL OR v_course_id IS NULL THEN
        RETURN COALESCE(NEW, OLD);
    END IF;

    -- Compter le total des leçons actives du cours
    SELECT COUNT(*) INTO v_total
      FROM public.lessons
     WHERE course_id = v_course_id
       AND (deleted_at IS NULL);

    -- Éviter la division par zéro
    IF v_total = 0 THEN
        RETURN COALESCE(NEW, OLD);
    END IF;

    -- Compter les leçons complétées par l'utilisateur
    SELECT COUNT(*) INTO v_done
      FROM public.user_progress
     WHERE user_id    = v_user_id
       AND course_id  = v_course_id
       AND is_completed = TRUE;

    -- Cap at 100 to avoid CHECK constraint violation when v_done > v_total
    -- (happens after course restructuring with stale user_progress records)
    v_progress := LEAST(100, ROUND((v_done::NUMERIC / v_total) * 100, 2));

    -- Mettre à jour l'enrollment
    UPDATE public.enrollments
       SET progress     = v_progress,
           status       = CASE
                              WHEN v_progress = 100 AND status = 'active'
                              THEN 'completed'
                              ELSE status
                          END,
           completed_at = CASE
                              WHEN v_progress = 100 AND completed_at IS NULL
                              THEN NOW()
                              ELSE completed_at
                          END,
           updated_at   = NOW()
     WHERE user_id   = v_user_id
       AND course_id = v_course_id;

    RETURN COALESCE(NEW, OLD);
END;
$$;


-- =============================================================================
-- Vérification
-- =============================================================================

DO $$
DECLARE
    v_func_exists    BOOLEAN;
    v_trigger_exists BOOLEAN;
    v_has_least_cap  BOOLEAN;
BEGIN
    -- La fonction existe
    SELECT EXISTS (
        SELECT 1 FROM pg_proc p
          JOIN pg_namespace n ON n.oid = p.pronamespace
         WHERE n.nspname = 'public'
           AND p.proname = 'sync_enrollment_progress'
    ) INTO v_func_exists;

    -- Le trigger est bien attaché à user_progress
    SELECT EXISTS (
        SELECT 1 FROM pg_trigger t
          JOIN pg_class c ON c.oid = t.tgrelid
         WHERE t.tgname = 'trg_sync_enrollment_progress'
           AND c.relname = 'user_progress'
    ) INTO v_trigger_exists;

    -- Le corps de la fonction contient bien LEAST (cap à 100)
    SELECT EXISTS (
        SELECT 1 FROM pg_proc p
          JOIN pg_namespace n ON n.oid = p.pronamespace
         WHERE n.nspname = 'public'
           AND p.proname = 'sync_enrollment_progress'
           AND pg_get_functiondef(p.oid) ILIKE '%LEAST(100%'
    ) INTO v_has_least_cap;

    IF NOT v_func_exists THEN
        RAISE EXCEPTION '❌ Migration 042: sync_enrollment_progress function missing';
    END IF;

    IF NOT v_trigger_exists THEN
        RAISE EXCEPTION '❌ Migration 042: trg_sync_enrollment_progress trigger missing on user_progress';
    END IF;

    IF NOT v_has_least_cap THEN
        RAISE EXCEPTION '❌ Migration 042: LEAST(100, ...) cap not found in sync_enrollment_progress — overflow fix not applied';
    END IF;

    RAISE NOTICE '✅ Migration 042: sync_enrollment_progress function updated with overflow cap';
    RAISE NOTICE '✅ Migration 042: trg_sync_enrollment_progress trigger active on user_progress';
    RAISE NOTICE '✅ Migration 042: LEAST(100, ...) cap confirmed — progress cannot exceed 100';
    RAISE NOTICE '';
    RAISE NOTICE '🎉 Migration 042 appliquée avec succès';
END $$;

-- ============================================================================
-- Migration 037 : Optimisations post-audit technique
-- ============================================================================
--
-- Suite à l'audit de l'architecture Waraba Academy, cette migration applique
-- les corrections et optimisations prioritaires identifiées.
--
-- PARTIE 1  — Soft delete (courses, modules, lessons)
--   Problème : la suppression physique d'un cours orphélinise les enrollments,
--   user_progress et certificats, et provoque des erreurs côté client.
--   Correction : colonne deleted_at + politique RESTRICTIVE RLS + helper function.
--
-- PARTIE 2  — Devise par défaut XOF
--   Problème : currency DEFAULT 'EUR' incohérent pour une plateforme africaine.
--
-- PARTIE 3  — Normalisation coupons : table coupon_courses
--   Problème : applicable_courses UUID[] empêche les jointures et les index
--   sélectifs efficaces.
--   Correction : table de jointure coupon_courses + migration des données.
--
-- PARTIE 4  — Trigger de synchronisation de la progression
--   Problème : enrollments.progress est une donnée dérivée mise à jour
--   manuellement, risquant la désynchronisation avec user_progress.
--   Correction : trigger AFTER INSERT/UPDATE/DELETE sur user_progress.
--
-- PARTIE 5  — Index manquants complémentaires
--   Index non couverts par la migration 034, identifiés par l'audit.
--
-- PARTIE 6  — JWT custom claims hook pour is_admin()
--   Problème : is_admin() interroge profiles à chaque évaluation RLS.
--   Correction : injecter le rôle dans le JWT via un Auth Hook Supabase.
--   ⚠️  NÉCESSITE une activation manuelle dans le dashboard Supabase :
--       Authentication → Hooks → Custom Access Token Hook
--       → sélectionner public.custom_access_token_hook
--
-- PARTIE 7  — Vérification RLS sur toutes les tables publiques
-- ============================================================================


-- ============================================================================
-- PARTIE 1 : Soft delete sur courses, modules, lessons
-- ============================================================================

-- ─── 1.1  Ajout de la colonne deleted_at ─────────────────────────────────────
ALTER TABLE public.courses  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ DEFAULT NULL;
ALTER TABLE public.modules  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ DEFAULT NULL;
ALTER TABLE public.lessons  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ DEFAULT NULL;

-- ─── 1.2  Politiques RESTRICTIVE : masquer les enregistrements supprimés ─────
--  Une politique RESTRICTIVE s'applique EN PLUS de toutes les politiques
--  PERMISSIVE existantes. Inutile de modifier chaque politique SELECT.

-- courses : les non-admins ne voient jamais un cours soft-deleted
DROP POLICY IF EXISTS "courses_hide_deleted"  ON public.courses;
CREATE POLICY "courses_hide_deleted" ON public.courses
    AS RESTRICTIVE
    FOR SELECT
    USING (deleted_at IS NULL OR public.is_admin());

-- modules
DROP POLICY IF EXISTS "modules_hide_deleted" ON public.modules;
CREATE POLICY "modules_hide_deleted" ON public.modules
    AS RESTRICTIVE
    FOR SELECT
    USING (deleted_at IS NULL OR public.is_admin());

-- lessons
DROP POLICY IF EXISTS "lessons_hide_deleted" ON public.lessons;
CREATE POLICY "lessons_hide_deleted" ON public.lessons
    AS RESTRICTIVE
    FOR SELECT
    USING (deleted_at IS NULL OR public.is_admin());

-- ─── 1.3  Index partiels : exclure les soft-deleted des scans courants ────────
CREATE INDEX IF NOT EXISTS idx_courses_active
    ON public.courses(category_id, level, created_at DESC)
    WHERE deleted_at IS NULL AND is_published = TRUE;

CREATE INDEX IF NOT EXISTS idx_modules_active
    ON public.modules(course_id, "order")
    WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_lessons_active
    ON public.lessons(course_id, lesson_order)
    WHERE deleted_at IS NULL;

-- ─── 1.4  Fonction helper : soft delete d'un cours en cascade ────────────────
CREATE OR REPLACE FUNCTION public.soft_delete_course(p_course_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- Vérifier que l'appelant est admin
    IF NOT public.is_admin() THEN
        RAISE EXCEPTION 'Accès refusé : rôle admin requis';
    END IF;

    -- Soft delete en cascade : leçons → modules → cours
    UPDATE public.lessons
       SET deleted_at = NOW()
     WHERE course_id = p_course_id
       AND deleted_at IS NULL;

    UPDATE public.modules
       SET deleted_at = NOW()
     WHERE course_id = p_course_id
       AND deleted_at IS NULL;

    UPDATE public.courses
       SET deleted_at = NOW()
     WHERE id = p_course_id
       AND deleted_at IS NULL;

    RAISE NOTICE '✅ Cours % soft-deleted (leçons + modules inclus)', p_course_id;
END;
$$;

-- ─── 1.5  Fonction helper : restauration d'un cours ──────────────────────────
CREATE OR REPLACE FUNCTION public.restore_course(p_course_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    IF NOT public.is_admin() THEN
        RAISE EXCEPTION 'Accès refusé : rôle admin requis';
    END IF;

    UPDATE public.lessons SET deleted_at = NULL WHERE course_id = p_course_id;
    UPDATE public.modules  SET deleted_at = NULL WHERE course_id = p_course_id;
    UPDATE public.courses  SET deleted_at = NULL WHERE id = p_course_id;

    RAISE NOTICE '✅ Cours % restauré', p_course_id;
END;
$$;


-- ============================================================================
-- PARTIE 2 : Devise par défaut XOF (Franc CFA Afrique de l'Ouest)
-- ============================================================================

ALTER TABLE public.payments
    ALTER COLUMN currency SET DEFAULT 'XOF';

-- Mise à jour des paiements en EUR sans montant réel (status pending uniquement)
-- pour éviter les incohérences sur les nouvelles inscriptions
UPDATE public.payments
   SET currency = 'XOF'
 WHERE currency = 'EUR'
   AND status   = 'pending';


-- ============================================================================
-- PARTIE 3 : Normalisation coupons → table coupon_courses
-- ============================================================================

-- ─── 3.1  Création de la table de jointure ───────────────────────────────────
CREATE TABLE IF NOT EXISTS public.coupon_courses (
    coupon_id  UUID NOT NULL REFERENCES public.coupons(id)  ON DELETE CASCADE,
    course_id  UUID NOT NULL REFERENCES public.courses(id)  ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (coupon_id, course_id)
);

-- ─── 3.2  Index pour les requêtes inverses (quel coupon s'applique à ce cours)
CREATE INDEX IF NOT EXISTS idx_coupon_courses_course_id
    ON public.coupon_courses(course_id);

-- ─── 3.3  RLS
ALTER TABLE public.coupon_courses ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "coupon_courses_all_admin"   ON public.coupon_courses;
DROP POLICY IF EXISTS "coupon_courses_select_auth" ON public.coupon_courses;

CREATE POLICY "coupon_courses_all_admin" ON public.coupon_courses
    FOR ALL TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

CREATE POLICY "coupon_courses_select_auth" ON public.coupon_courses
    FOR SELECT TO authenticated
    USING (true);

-- ─── 3.4  Migration des données depuis applicable_courses UUID[] ──────────────
INSERT INTO public.coupon_courses (coupon_id, course_id)
SELECT c.id, unnest(c.applicable_courses)
  FROM public.coupons c
 WHERE c.applicable_courses IS NOT NULL
   AND array_length(c.applicable_courses, 1) > 0
ON CONFLICT DO NOTHING;

-- ─── 3.5  Dépréciée mais conservée pour rétrocompatibilité ───────────────────
--  La colonne applicable_courses est gardée 30 jours puis sera supprimée
--  dans une migration ultérieure (038_drop_applicable_courses.sql)
COMMENT ON COLUMN public.coupons.applicable_courses
    IS 'DEPRECATED — remplacé par la table coupon_courses (migration 037). '
       'À supprimer dans la migration 038.';


-- ============================================================================
-- PARTIE 4 : Trigger de synchronisation automatique de la progression
-- ============================================================================
--
--  Lors de chaque modification de user_progress (INSERT, UPDATE, DELETE),
--  le trigger recalcule enrollments.progress et passe le statut à 'completed'
--  automatiquement quand toutes les leçons sont terminées.
--
--  IMPORTANT : Ce trigger remplace la mise à jour manuelle de progress dans
--  le code applicatif. Le code Next.js peut continuer à envoyer PATCH sur
--  enrollments sans effet de bord (idempotent).
-- ============================================================================

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

    v_progress := ROUND((v_done::NUMERIC / v_total) * 100, 2);

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

-- Supprimer les éventuels triggers précédents sur user_progress
DROP TRIGGER IF EXISTS trg_sync_enrollment_progress ON public.user_progress;

CREATE TRIGGER trg_sync_enrollment_progress
    AFTER INSERT OR UPDATE OF is_completed OR DELETE
    ON public.user_progress
    FOR EACH ROW
    EXECUTE FUNCTION public.sync_enrollment_progress();


-- ============================================================================
-- PARTIE 5 : Index manquants complémentaires (complète la migration 034)
-- ============================================================================

-- user_progress par course_id (jointures dashboard admin)
CREATE INDEX IF NOT EXISTS idx_user_progress_course_id
    ON public.user_progress(course_id);

-- Catalogue cours actifs (requête la plus fréquente du site)
CREATE INDEX IF NOT EXISTS idx_courses_catalog_active
    ON public.courses(category_id, created_at DESC)
    WHERE is_published = TRUE
      AND status = 'published'
      AND deleted_at IS NULL;

-- Notifications non lues (badge header — requête très fréquente)
CREATE INDEX IF NOT EXISTS idx_notifications_unread
    ON public.notifications(user_id, created_at DESC)
    WHERE is_read = FALSE;

-- Enrollment (user_id, course_id) composite — utilisé par le trigger + RLS
CREATE INDEX IF NOT EXISTS idx_enrollments_user_course
    ON public.enrollments(user_id, course_id);

-- Quiz attempts : score DESC pour classement et stats (filtre: terminées)
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_quiz_score
    ON public.quiz_attempts(quiz_id, score DESC)
    WHERE completed_at IS NOT NULL;

-- Paiements (user_id, course_id, status) — vérification paiement dans RLS 031
CREATE INDEX IF NOT EXISTS idx_payments_user_course_status
    ON public.payments(user_id, course_id, status)
    WHERE status = 'completed';


-- ============================================================================
-- PARTIE 6 : JWT Custom Claims Hook pour is_admin() sans requête DB
-- ============================================================================
--
--  Cette fonction injecte le rôle de l'utilisateur dans le JWT Supabase.
--  Après activation, les politiques RLS peuvent utiliser :
--      (auth.jwt() ->> 'user_role') = 'admin'
--  au lieu de public.is_admin() → zéro requête DB supplémentaire par request.
--
--  ⚠️  ACTIVATION OBLIGATOIRE dans le dashboard Supabase :
--      Authentication → Hooks → Custom Access Token Hook
--      → Sélectionner : public.custom_access_token_hook
--
--  NOTE : Ne pas remplacer is_admin() dans les politiques existantes avant
--  d'avoir activé le hook. Les deux mécanismes coexistent sans conflit.
-- ============================================================================

CREATE OR REPLACE FUNCTION public.custom_access_token_hook(event JSONB)
RETURNS JSONB
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_user_id UUID;
    v_role    TEXT;
    v_claims  JSONB;
BEGIN
    v_user_id := (event ->> 'user_id')::UUID;

    -- Récupérer le rôle depuis profiles
    SELECT role INTO v_role
      FROM public.profiles
     WHERE id = v_user_id;

    -- Construire les claims enrichis
    v_claims := event -> 'claims';
    IF v_role IS NOT NULL THEN
        v_claims := jsonb_set(v_claims, '{user_role}', to_jsonb(v_role));
    ELSE
        v_claims := jsonb_set(v_claims, '{user_role}', '"student"');
    END IF;

    RETURN jsonb_set(event, '{claims}', v_claims);
END;
$$;

-- Droits requis par Supabase Auth pour appeler le hook
GRANT EXECUTE ON FUNCTION public.custom_access_token_hook TO supabase_auth_admin;
REVOKE EXECUTE ON FUNCTION public.custom_access_token_hook FROM authenticated, anon;


-- ============================================================================
-- PARTIE 7 : Vérification RLS sur toutes les tables publiques
-- ============================================================================

DO $$
DECLARE
    r RECORD;
    tables_without_rls TEXT := '';
BEGIN
    FOR r IN
        SELECT relname
          FROM pg_class
         WHERE relnamespace = 'public'::regnamespace
           AND relkind      = 'r'
           AND relrowsecurity = FALSE
         ORDER BY relname
    LOOP
        tables_without_rls := tables_without_rls || r.relname || ', ';
    END LOOP;

    IF tables_without_rls <> '' THEN
        RAISE WARNING '⚠️  Tables sans RLS : %', rtrim(tables_without_rls, ', ');
    ELSE
        RAISE NOTICE '✅ Toutes les tables publiques ont RLS activé';
    END IF;
END $$;


-- ============================================================================
-- Vérification finale
-- ============================================================================

DO $$
DECLARE
    v_col_courses  BOOLEAN;
    v_col_modules  BOOLEAN;
    v_col_lessons  BOOLEAN;
    v_trigger      BOOLEAN;
    v_coupon_table BOOLEAN;
BEGIN
    -- Vérifier colonnes soft delete
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns
         WHERE table_schema = 'public' AND table_name = 'courses' AND column_name = 'deleted_at'
    ) INTO v_col_courses;

    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns
         WHERE table_schema = 'public' AND table_name = 'modules' AND column_name = 'deleted_at'
    ) INTO v_col_modules;

    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns
         WHERE table_schema = 'public' AND table_name = 'lessons' AND column_name = 'deleted_at'
    ) INTO v_col_lessons;

    -- Vérifier trigger
    SELECT EXISTS (
        SELECT 1 FROM pg_trigger
         WHERE tgname = 'trg_sync_enrollment_progress'
    ) INTO v_trigger;

    -- Vérifier table coupon_courses
    SELECT EXISTS (
        SELECT 1 FROM information_schema.tables
         WHERE table_schema = 'public' AND table_name = 'coupon_courses'
    ) INTO v_coupon_table;

    -- Rapport
    IF v_col_courses AND v_col_modules AND v_col_lessons THEN
        RAISE NOTICE '✅ Migration 037 : Soft delete activé sur courses, modules, lessons';
    ELSE
        RAISE EXCEPTION '❌ Migration 037 : Colonnes deleted_at manquantes';
    END IF;

    IF v_trigger THEN
        RAISE NOTICE '✅ Migration 037 : Trigger sync_enrollment_progress créé';
    ELSE
        RAISE EXCEPTION '❌ Migration 037 : Trigger manquant';
    END IF;

    IF v_coupon_table THEN
        RAISE NOTICE '✅ Migration 037 : Table coupon_courses créée';
    ELSE
        RAISE EXCEPTION '❌ Migration 037 : Table coupon_courses manquante';
    END IF;

    RAISE NOTICE '✅ Migration 037 : Devise XOF définie par défaut sur payments';
    RAISE NOTICE '✅ Migration 037 : Index complémentaires créés';
    RAISE NOTICE '✅ Migration 037 : JWT custom claims hook créé';
    RAISE NOTICE '';
    RAISE NOTICE '🎉 Migration 037 appliquée avec succès';
    RAISE NOTICE '';
    RAISE NOTICE '⚠️  ACTION REQUISE : Activer le JWT Hook dans le dashboard Supabase';
    RAISE NOTICE '   Authentication → Hooks → Custom Access Token Hook';
    RAISE NOTICE '   → Sélectionner : public.custom_access_token_hook';
END $$;

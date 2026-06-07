-- ============================================================================
-- Migration 038 : Suppression applicable_courses + RLS via JWT claims
-- ============================================================================
--
-- Prérequis : Migration 037 appliquée ET hook JWT activé dans le dashboard
--   Supabase → Authentication → Hooks → Custom Access Token Hook
--   → public.custom_access_token_hook
--
-- PARTIE 1  — Suppression de la colonne dépréciée applicable_courses
--   La migration 037 a migré les données vers coupon_courses.
--   La colonne peut maintenant être supprimée proprement.
--
-- PARTIE 2  — Optimisation is_admin() et is_instructor() via JWT claims
--   Maintenant que le hook est actif, auth.jwt() ->> 'user_role' contient
--   le rôle sans requête DB supplémentaire.
--   Pour check_user_id IS NOT NULL (usage admin), on garde la requête profiles.
-- ============================================================================


-- ============================================================================
-- PARTIE 1 : Suppression de applicable_courses (dépréciée depuis migration 037)
-- ============================================================================

ALTER TABLE public.coupons
    DROP COLUMN IF EXISTS applicable_courses;


-- ============================================================================
-- PARTIE 2 : is_admin() sans requête DB via JWT claims
-- ============================================================================
--
--  Stratégie :
--    - Utilisateur courant  → auth.jwt() ->> 'user_role' (0 requête DB)
--    - Autre utilisateur    → SELECT profiles (cas admin uniquement)
-- ============================================================================

CREATE OR REPLACE FUNCTION public.is_admin(check_user_id UUID DEFAULT NULL)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT CASE
        WHEN check_user_id IS NOT NULL THEN
            -- Vérification d'un autre utilisateur (usage admin) → requête profiles
            EXISTS (
                SELECT 1 FROM public.profiles
                 WHERE id = check_user_id
                   AND role = 'admin'
            )
        ELSE
            -- Vérification de l'utilisateur courant → JWT claim (0 requête DB)
            COALESCE(auth.jwt() ->> 'user_role', '') = 'admin'
    END;
$$;


-- ============================================================================
-- PARTIE 3 : is_instructor() sans requête DB via JWT claims
-- ============================================================================

CREATE OR REPLACE FUNCTION public.is_instructor(check_user_id UUID DEFAULT NULL)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT CASE
        WHEN check_user_id IS NOT NULL THEN
            EXISTS (
                SELECT 1 FROM public.profiles
                 WHERE id = check_user_id
                   AND role IN ('instructor', 'admin')
            )
        ELSE
            COALESCE(auth.jwt() ->> 'user_role', '') IN ('instructor', 'admin')
    END;
$$;


-- ============================================================================
-- Vérification finale
-- ============================================================================

DO $$
DECLARE
    v_col_gone  BOOLEAN;
    v_fn_admin  BOOLEAN;
    v_fn_instr  BOOLEAN;
BEGIN
    -- Vérifier que applicable_courses a bien été supprimée
    SELECT NOT EXISTS (
        SELECT 1 FROM information_schema.columns
         WHERE table_schema = 'public'
           AND table_name   = 'coupons'
           AND column_name  = 'applicable_courses'
    ) INTO v_col_gone;

    -- Vérifier que les fonctions existent toujours
    SELECT EXISTS (
        SELECT 1 FROM pg_proc
         WHERE proname = 'is_admin'
           AND pronamespace = 'public'::regnamespace
    ) INTO v_fn_admin;

    SELECT EXISTS (
        SELECT 1 FROM pg_proc
         WHERE proname = 'is_instructor'
           AND pronamespace = 'public'::regnamespace
    ) INTO v_fn_instr;

    IF v_col_gone THEN
        RAISE NOTICE '✅ Migration 038 : Colonne applicable_courses supprimée de coupons';
    ELSE
        RAISE EXCEPTION '❌ Migration 038 : applicable_courses toujours présente';
    END IF;

    IF v_fn_admin THEN
        RAISE NOTICE '✅ Migration 038 : is_admin() mis à jour (JWT claims)';
    ELSE
        RAISE EXCEPTION '❌ Migration 038 : is_admin() introuvable';
    END IF;

    IF v_fn_instr THEN
        RAISE NOTICE '✅ Migration 038 : is_instructor() mis à jour (JWT claims)';
    ELSE
        RAISE EXCEPTION '❌ Migration 038 : is_instructor() introuvable';
    END IF;

    RAISE NOTICE '';
    RAISE NOTICE '🎉 Migration 038 appliquée avec succès';
    RAISE NOTICE '   RLS admin/instructor : 0 requête DB grâce au JWT hook';
END $$;

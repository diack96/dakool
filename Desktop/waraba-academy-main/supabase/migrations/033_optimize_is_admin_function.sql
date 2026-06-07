-- ============================================================================
-- Migration 033: Optimisation de la fonction is_admin()
-- ============================================================================
-- PROBLÈME : La fonction is_admin() est appelée à chaque évaluation RLS sur
-- toutes les tables protégées. Sans STABLE et sans search_path fixé, PostgreSQL
-- ne peut pas mettre en cache le résultat dans la transaction, générant un
-- SELECT supplémentaire vers profiles à chaque requête.
--
-- CORRECTION :
--   - STABLE  → PostgreSQL peut mettre le résultat en cache dans la transaction
--   - SET search_path = public → évite les attaques de search_path injection
--   - Paramètre optionnel check_user_id → permet de tester d'autres users
-- ============================================================================

CREATE OR REPLACE FUNCTION public.is_admin(check_user_id UUID DEFAULT NULL)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1
        FROM public.profiles
        WHERE id = COALESCE(check_user_id, auth.uid())
          AND role = 'admin'
    );
$$;

-- Fonction is_instructor() : nouvelle fonction utilitaire pour les RLS instructeurs
-- Évite de réécrire EXISTS(SELECT 1 FROM profiles ...) partout
CREATE OR REPLACE FUNCTION public.is_instructor(check_user_id UUID DEFAULT NULL)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1
        FROM public.profiles
        WHERE id = COALESCE(check_user_id, auth.uid())
          AND role IN ('instructor', 'admin')
    );
$$;

-- Fonction is_enrolled() : vérifie si l'utilisateur courant est inscrit à un cours
CREATE OR REPLACE FUNCTION public.is_enrolled_in_course(p_course_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1
        FROM public.enrollments
        WHERE user_id = auth.uid()
          AND course_id = p_course_id
          AND status = 'active'
    );
$$;

-- Vérification
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_proc
        WHERE proname = 'is_admin'
          AND pronamespace = 'public'::regnamespace
    ) THEN
        RAISE NOTICE '✅ Migration 033 : Fonctions is_admin(), is_instructor(), is_enrolled_in_course() optimisées';
    ELSE
        RAISE EXCEPTION '❌ Migration 033 : Erreur lors de la recréation des fonctions';
    END IF;
END $$;

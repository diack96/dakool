-- ============================================================================
-- Migration 030: Correction critique — RLS sur la table lessons
-- ============================================================================
-- PROBLÈME : La politique "lessons_select_public" autorise n'importe qui
-- (même non connecté) à lire le contenu de TOUTES les leçons, y compris
-- celles des cours payants. Un utilisateur non inscrit peut accéder au
-- contenu complet sans payer.
--
-- CORRECTION :
--   - Leçons marquées is_free=true → accessibles à tous (aperçu)
--   - Leçons payantes → uniquement aux inscrits actifs + instructeurs + admins
-- ============================================================================

-- 1. Supprimer la politique trop permissive
DROP POLICY IF EXISTS "lessons_select_public" ON public.lessons;

-- 2. Leçons gratuites : accessibles à tous (y compris visiteurs non connectés)
CREATE POLICY "lessons_select_free_public" ON public.lessons
    FOR SELECT TO public
    USING (is_free = true);

-- 3. Leçons payantes : accessibles aux inscrits actifs, instructeurs, admins
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
        -- Étudiant inscrit et actif au cours
        EXISTS (
            SELECT 1 FROM public.enrollments e
            WHERE e.course_id = lessons.course_id
              AND e.user_id = auth.uid()
              AND e.status = 'active'
        )
    );

-- Vérification
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_policies
        WHERE tablename = 'lessons'
          AND policyname = 'lessons_select_free_public'
    ) THEN
        RAISE NOTICE '✅ Migration 030 : RLS lessons corrigée avec succès';
    ELSE
        RAISE EXCEPTION '❌ Migration 030 : Erreur lors de la création des politiques';
    END IF;
END $$;

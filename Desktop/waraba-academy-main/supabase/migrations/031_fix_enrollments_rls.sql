-- ============================================================================
-- Migration 031: Correction critique — RLS sur la table enrollments
-- ============================================================================
-- PROBLÈME : La politique "Users can insert their own enrollments" autorise
-- un utilisateur à s'inscrire à n'importe quel cours payant en appelant
-- directement l'API Supabase, sans passer par la vérification de paiement
-- du code applicatif Next.js.
--
-- CORRECTION :
--   - Cours gratuit (price = 0 ou is_starter_course = true) → inscription libre
--   - Cours payant → exige un enregistrement de paiement complété en base
--
-- NOTE : Les admins et le service_role peuvent toujours inscrire manuellement
--        via la politique admin existante.
-- ============================================================================

-- 1. Supprimer la politique trop permissive
DROP POLICY IF EXISTS "Users can insert their own enrollments" ON public.enrollments;
DROP POLICY IF EXISTS "users_insert_enrollments" ON public.enrollments;

-- 2. Nouvelle politique avec vérification de paiement
CREATE POLICY "users_enroll_with_payment_check" ON public.enrollments
    FOR INSERT TO authenticated
    WITH CHECK (
        -- L'utilisateur ne peut s'inscrire que pour lui-même
        auth.uid() = user_id
        AND (
            -- CAS 1 : Cours gratuit (prix nul ou cours starter)
            EXISTS (
                SELECT 1 FROM public.courses c
                WHERE c.id = course_id
                  AND (
                      c.price = 0
                      OR c.price IS NULL
                      OR c.is_starter_course = true
                  )
            )
            OR
            -- CAS 2 : Paiement complété enregistré en base pour ce cours
            EXISTS (
                SELECT 1 FROM public.payments p
                WHERE p.user_id = auth.uid()
                  AND p.course_id = enrollments.course_id
                  AND p.status = 'completed'
            )
        )
    );

-- Vérification
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_policies
        WHERE tablename = 'enrollments'
          AND policyname = 'users_enroll_with_payment_check'
    ) THEN
        RAISE NOTICE '✅ Migration 031 : RLS enrollments corrigée avec succès';
    ELSE
        RAISE EXCEPTION '❌ Migration 031 : Erreur lors de la création de la politique';
    END IF;
END $$;

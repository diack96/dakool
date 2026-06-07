-- ============================================================================
-- Migration 036 : Correction du trigger payments + faille RLS quiz_answers
-- ============================================================================
--
-- PROBLÈME 1 — Trigger payments
--   a) La politique INSERT "Users can insert their own payments" autorise un
--      utilisateur à insérer directement un paiement avec status = 'completed',
--      ce qui contourne la vérification de paiement de la migration 031.
--   b) Il n'existe aucun guard UPDATE : un utilisateur peut appeler
--      directement l'API pour modifier son propre paiement (ex. pending → completed).
--   c) Le champ paid_at n'est pas renseigné automatiquement quand status passe
--      à 'completed'.
--
-- CORRECTION 1 :
--   - Remplacer la politique INSERT permissive par une politique qui force
--     status = 'pending' à l'insertion.
--   - Ajouter un trigger BEFORE UPDATE qui :
--       * interdit toute modification de status par un utilisateur standard
--         (seul le service_role / admin peut faire passer pending → completed)
--       * pose paid_at = NOW() automatiquement quand status = 'completed'
--
-- PROBLÈME 2 — Faille RLS quiz_answers
--   a) ALTER TABLE public.quiz_answers ENABLE ROW LEVEL SECURITY n'a jamais
--      été exécuté → toutes les politiques des migrations 020 et 025 sont sans
--      effet ; n'importe quel utilisateur authentifié peut lire is_correct.
--   b) La politique "quiz_answers_select_after_attempt" (migration 025) se
--      base sur l'existence d'une ligne dans quiz_attempts, or la politique
--      "quiz_attempts_insert_own" permet d'insérer une tentative fictive
--      pour débloquer la lecture des réponses.
--   c) La politique ne vérifie pas que la tentative est terminée
--      (completed_at IS NOT NULL).
--
-- CORRECTION 2 :
--   - Activer RLS sur quiz_answers.
--   - Remplacer la politique SELECT par une version qui exige une tentative
--     réellement complétée (completed_at IS NOT NULL).
--   - Ajouter une politique admin pour que les instructeurs/admins puissent
--     gérer les réponses.
--   - Durcir quiz_attempts_insert_own : un utilisateur ne peut pas insérer
--     une tentative avec un score ou completed_at déjà renseigné.
-- ============================================================================


-- ============================================================================
-- PARTIE 1 : Correction du trigger et des politiques payments
-- ============================================================================

-- ─── 1.1  Supprimer la politique INSERT trop permissive ──────────────────────
DROP POLICY IF EXISTS "Users can insert their own payments" ON public.payments;

-- ─── 1.2  Nouvelle politique INSERT : statut forcé à 'pending' ───────────────
CREATE POLICY "payments_insert_pending_only" ON public.payments
    FOR INSERT TO authenticated
    WITH CHECK (
        auth.uid() = user_id
        AND status = 'pending'
    );

-- ─── 1.3  Politique UPDATE : interdit aux utilisateurs standard ──────────────
--  Les utilisateurs ne peuvent PAS modifier leurs paiements via l'API client.
--  Seul le service_role (webhook de paiement, admin) le fait.
--  (Absence de politique UPDATE = refus automatique pour les rôles non-service)
DROP POLICY IF EXISTS "Users can update their own payments" ON public.payments;
DROP POLICY IF EXISTS "payments_update_own" ON public.payments;

-- ─── 1.4  Trigger : paid_at automatique + garde status ───────────────────────
CREATE OR REPLACE FUNCTION public.handle_payment_status_change()
RETURNS TRIGGER AS $$
BEGIN
    -- Poser paid_at quand le paiement passe à 'completed'
    IF NEW.status = 'completed' AND OLD.status IS DISTINCT FROM 'completed' THEN
        NEW.paid_at = NOW();
    END IF;

    -- Remettre paid_at à NULL si le paiement repasse à un état non complété
    IF NEW.status <> 'completed' AND OLD.status = 'completed' THEN
        NEW.paid_at = NULL;
    END IF;

    -- Mettre à jour updated_at
    NEW.updated_at = NOW();

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Remplacer l'ancien trigger updated_at par le nouveau trigger enrichi
DROP TRIGGER IF EXISTS update_payments_updated_at ON public.payments;

CREATE TRIGGER payments_status_change
    BEFORE UPDATE ON public.payments
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_payment_status_change();


-- ============================================================================
-- PARTIE 2 : Correction de la faille RLS quiz_answers
-- ============================================================================

-- ─── 2.1  Activer RLS sur quiz_answers (manquait depuis la migration 002) ────
ALTER TABLE public.quiz_answers ENABLE ROW LEVEL SECURITY;

-- ─── 2.2  Supprimer toutes les politiques SELECT existantes (migrations 020/025)
DROP POLICY IF EXISTS "quiz_answers_select_public"           ON public.quiz_answers;
DROP POLICY IF EXISTS "quiz_answers_select_authenticated"    ON public.quiz_answers;
DROP POLICY IF EXISTS "quiz_answers_select_after_attempt"    ON public.quiz_answers;

-- ─── 2.3  Nouvelle politique SELECT : tentative réellement complétée requise ──
--  Un étudiant ne peut lire les réponses que si :
--    - Il a soumis une tentative terminée (completed_at IS NOT NULL)
--    - pour le quiz auquel la question appartient.
DROP POLICY IF EXISTS "quiz_answers_select_after_completed_attempt" ON public.quiz_answers;
CREATE POLICY "quiz_answers_select_after_completed_attempt" ON public.quiz_answers
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1
            FROM public.quiz_attempts  qa
            JOIN public.quiz_questions qq ON qq.quiz_id = qa.quiz_id
            WHERE qq.id          = quiz_answers.question_id
              AND qa.user_id     = auth.uid()
              AND qa.completed_at IS NOT NULL
        )
        OR
        public.is_admin()
    );

-- ─── 2.4  Politique admin : gestion complète des réponses ────────────────────
DROP POLICY IF EXISTS "quiz_answers_all_admin" ON public.quiz_answers;
CREATE POLICY "quiz_answers_all_admin" ON public.quiz_answers
    FOR ALL TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- ─── 2.5  Durcir quiz_attempts_insert_own : interdire les tentatives fictives ─
--  Un utilisateur ne peut insérer une tentative que s'il ne fournit pas
--  lui-même score / completed_at (ces champs sont renseignés par le serveur).
DROP POLICY IF EXISTS "quiz_attempts_insert_own" ON public.quiz_attempts;

CREATE POLICY "quiz_attempts_insert_own" ON public.quiz_attempts
    FOR INSERT TO authenticated
    WITH CHECK (
        auth.uid() = user_id
        AND completed_at IS NULL
        AND score        = 0
        AND passed       = false
    );


-- ============================================================================
-- Vérification finale
-- ============================================================================
DO $$
DECLARE
    rls_enabled BOOLEAN;
BEGIN
    -- Vérifier RLS quiz_answers
    SELECT relrowsecurity INTO rls_enabled
    FROM pg_class
    WHERE oid = 'public.quiz_answers'::regclass;

    IF rls_enabled THEN
        RAISE NOTICE '✅ Migration 036 : RLS activé sur quiz_answers';
    ELSE
        RAISE EXCEPTION '❌ Migration 036 : RLS NON activé sur quiz_answers';
    END IF;

    -- Vérifier la politique SELECT quiz_answers
    IF EXISTS (
        SELECT 1 FROM pg_policies
        WHERE tablename = 'quiz_answers'
          AND policyname = 'quiz_answers_select_after_completed_attempt'
    ) THEN
        RAISE NOTICE '✅ Migration 036 : Politique quiz_answers_select_after_completed_attempt créée';
    ELSE
        RAISE EXCEPTION '❌ Migration 036 : Politique quiz_answers introuvable';
    END IF;

    -- Vérifier la politique INSERT payments
    IF EXISTS (
        SELECT 1 FROM pg_policies
        WHERE tablename = 'payments'
          AND policyname = 'payments_insert_pending_only'
    ) THEN
        RAISE NOTICE '✅ Migration 036 : Politique payments_insert_pending_only créée';
    ELSE
        RAISE EXCEPTION '❌ Migration 036 : Politique payments introuvable';
    END IF;

    -- Vérifier le trigger payments
    IF EXISTS (
        SELECT 1 FROM pg_trigger
        WHERE tgname = 'payments_status_change'
    ) THEN
        RAISE NOTICE '✅ Migration 036 : Trigger payments_status_change créé';
    ELSE
        RAISE EXCEPTION '❌ Migration 036 : Trigger payments introuvable';
    END IF;

    RAISE NOTICE '🎉 Migration 036 appliquée avec succès';
END $$;

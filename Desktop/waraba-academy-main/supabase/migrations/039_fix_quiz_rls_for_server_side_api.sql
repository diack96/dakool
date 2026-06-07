-- ============================================================================
-- Migration 039 : Correction de la RLS quiz pour les API serveur
-- ============================================================================
--
-- PROBLÈME — Migration 036 a renforcé la RLS sur quiz_answers et quiz_attempts
--   mais n'a pas pris en compte les routes API Next.js qui utilisent le
--   anon key avec la session de l'utilisateur (rôle "authenticated").
--
-- Conséquences pour les nouveaux utilisateurs :
--
--   1) quiz_answers_select_after_completed_attempt (migration 036)
--      → Bloque la lecture des options de réponse lors du chargement du quiz
--        si l'utilisateur n'a jamais complété une tentative.
--      → Les API routes /api/courses/[id]/quizzes/[quizId] retournaient
--        une liste vide : quiz affiché sans aucune option de réponse.
--
--   2) quiz_attempts_insert_own (migration 036)
--      → Exige score=0, passed=false, completed_at IS NULL à l'insertion.
--      → L'API /api/quiz/attempt insère avec le vrai score, passed, et
--        completed_at=NOW() → erreur 500 à chaque soumission de quiz.
--
-- SOLUTION APPLIQUÉE CÔTÉ APPLICATION (sans migration SQL) :
--   Les API routes utilisent désormais createAdminSupabaseClient()
--   (service_role) pour :
--     - Fetcher les questions+réponses (bypass quiz_answers RLS)
--     - Insérer quiz_attempts et user_quiz_responses (bypass INSERT RLS)
--   Les vérifications d'auth et d'enrollment continuent via le client anon.
--
-- CETTE MIGRATION documente le comportement attendu et ajoute un index
-- manquant pour optimiser la politique quiz_answers_select_after_completed_attempt.
-- ============================================================================

-- Index sur quiz_attempts(quiz_id, user_id, completed_at) pour la politique
-- quiz_answers_select_after_completed_attempt (évite un seq scan sur la join)
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_quiz_user_completed
    ON public.quiz_attempts (quiz_id, user_id, completed_at)
    WHERE completed_at IS NOT NULL;

-- Index sur quiz_questions(quiz_id) pour la join dans la politique RLS
CREATE INDEX IF NOT EXISTS idx_quiz_questions_quiz_id
    ON public.quiz_questions (quiz_id);

-- Vérification
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_indexes
        WHERE tablename = 'quiz_attempts'
          AND indexname = 'idx_quiz_attempts_quiz_user_completed'
    ) THEN
        RAISE NOTICE '✅ Migration 039 : Index idx_quiz_attempts_quiz_user_completed créé';
    END IF;

    RAISE NOTICE '🎉 Migration 039 appliquée avec succès';
    RAISE NOTICE 'ℹ️  Les corrections RLS quiz sont appliquées côté application';
    RAISE NOTICE 'ℹ️  (service_role utilisé dans les API routes quiz)';
END $$;

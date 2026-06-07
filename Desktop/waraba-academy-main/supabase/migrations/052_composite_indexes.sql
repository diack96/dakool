-- ============================================================================
-- Migration 052 : Index composites pour les requêtes critiques
-- ============================================================================
-- CONTEXTE :
--   Audit perf 2026-03-18 a identifié des requêtes fréquentes sur
--   enrollments et payments filtrant sur (user_id, course_id, status)
--   qui font un merge de 2-3 index séparés au lieu d'un seul index seek.
--
-- IMPACT ATTENDU :
--   - Vérification inscription (GET /courses/[id]/lessons) : -30-50ms
--   - Vérification paiement (POST /enrollments, DELETE /enrollments) : -30ms
--   - Tous les CREATE INDEX sont idempotents (IF NOT EXISTS)
-- ============================================================================

-- ─── 1. TABLE enrollments ────────────────────────────────────────────────────

-- (user_id, course_id) : lookup principal "est-ce que cet user est inscrit à ce cours"
-- Couvre la plupart des requêtes d'accès aux leçons et de vérification d'inscription.
CREATE UNIQUE INDEX IF NOT EXISTS idx_enrollments_user_course
  ON public.enrollments(user_id, course_id);

-- (user_id, course_id, status) : même lookup avec filtre statut (active/completed/pending)
-- Utilisé dans GET /enrollments (filtre .in('status', ['active', 'completed', 'pending']))
CREATE INDEX IF NOT EXISTS idx_enrollments_user_course_status
  ON public.enrollments(user_id, course_id, status);

-- (user_id, status) : dashboard étudiant "mes cours actifs"
CREATE INDEX IF NOT EXISTS idx_enrollments_user_status
  ON public.enrollments(user_id, status);

-- ─── 2. TABLE payments ───────────────────────────────────────────────────────

-- (user_id, course_id, status) : vérification paiement complété avant inscription
-- Utilisé dans POST /enrollments et DELETE /enrollments
CREATE INDEX IF NOT EXISTS idx_payments_user_course_status
  ON public.payments(user_id, course_id, status);

-- (user_id, course_id) : lookup général paiement par user+cours
CREATE INDEX IF NOT EXISTS idx_payments_user_course
  ON public.payments(user_id, course_id);

-- ─── Vérification ─────────────────────────────────────────────────────────────
DO $$
DECLARE
  idx_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO idx_count
  FROM pg_indexes
  WHERE schemaname = 'public'
    AND indexname IN (
      'idx_enrollments_user_course',
      'idx_enrollments_user_course_status',
      'idx_enrollments_user_status',
      'idx_payments_user_course_status',
      'idx_payments_user_course'
    );

  RAISE NOTICE '✅ Migration 052 : % index composites vérifiés/créés', idx_count;
END $$;

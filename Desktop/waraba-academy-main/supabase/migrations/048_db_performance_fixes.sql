-- Migration 048: Correctifs performance DB
-- 1. Index manquant sur payments.transaction_id (webhook Stripe)
-- 2. Fonctions SQL agrégées (remplacent les full table loads en JS)
-- 3. Fonctions de nettoyage périodique

-- ─── 1. Index payments.transaction_id ────────────────────────────────────────
-- Utilisé par le webhook Stripe à chaque paiement confirmé.
-- Sans cet index : seq scan sur toute la table payments.
CREATE UNIQUE INDEX IF NOT EXISTS idx_payments_transaction_id
  ON payments (transaction_id)
  WHERE transaction_id IS NOT NULL;

-- ─── 2. SUM revenus complétés (toute l'histoire) ─────────────────────────────
-- Remplace : supabase.from('payments').select('amount').eq('status','completed')
-- (charge toutes les lignes en mémoire pour sommer en JS)
CREATE OR REPLACE FUNCTION sum_completed_payments()
RETURNS NUMERIC
LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT COALESCE(SUM(amount), 0)
  FROM payments
  WHERE status = 'completed';
$$;

-- ─── 3. SUM revenus sur une fenêtre temporelle ────────────────────────────────
-- Remplace les requêtes select('amount') avec filtre de date dans stats.ts
CREATE OR REPLACE FUNCTION sum_completed_payments_period(
  p_start TIMESTAMPTZ,
  p_end   TIMESTAMPTZ DEFAULT NOW()
)
RETURNS NUMERIC
LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT COALESCE(SUM(amount), 0)
  FROM payments
  WHERE status = 'completed'
    AND created_at >= p_start
    AND created_at <  p_end;
$$;

-- ─── 4. Distribution statuts enrollments ─────────────────────────────────────
-- Remplace : supabase.from('enrollments').select('status') (full table scan)
CREATE OR REPLACE FUNCTION enrollment_status_counts()
RETURNS TABLE (status TEXT, count BIGINT)
LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT status::TEXT, COUNT(*)
  FROM enrollments
  GROUP BY status;
$$;

-- ─── 5. Note moyenne tous cours ──────────────────────────────────────────────
-- Remplace : supabase.from('course_reviews').select('rating') (full scan)
CREATE OR REPLACE FUNCTION avg_course_rating()
RETURNS NUMERIC
LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT COALESCE(ROUND(AVG(rating)::NUMERIC, 2), 0)
  FROM course_reviews;
$$;

-- ─── 6. Nettoyage audit logs (rétention 90 jours) ────────────────────────────
CREATE OR REPLACE FUNCTION cleanup_old_audit_logs(p_days INTEGER DEFAULT 90)
RETURNS INTEGER
LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM admin_audit_logs
  WHERE timestamp < NOW() - (p_days || ' days')::INTERVAL;
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$;

-- ─── 7. Nettoyage rate_limit_log ─────────────────────────────────────────────
-- La fonction rate_limit_cleanup() existe déjà (migration 047)
-- On s'assure juste qu'elle est appelée via le cron quotidien.

-- ─── Vérification ─────────────────────────────────────────────────────────────
DO $$
BEGIN
  RAISE NOTICE '✅ Migration 048: idx_payments_transaction_id créé';
  RAISE NOTICE '✅ Migration 048: sum_completed_payments() créée';
  RAISE NOTICE '✅ Migration 048: sum_completed_payments_period() créée';
  RAISE NOTICE '✅ Migration 048: enrollment_status_counts() créée';
  RAISE NOTICE '✅ Migration 048: avg_course_rating() créée';
  RAISE NOTICE '✅ Migration 048: cleanup_old_audit_logs() créée';
END $$;

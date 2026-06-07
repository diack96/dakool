-- Migration 047: Rate limit log (DB-based, survives serverless restarts)
-- Remplace les MemoryStore in-process qui ne fonctionnent pas sur Vercel serverless.
-- Utilisé pour les endpoints email exposés : newsletter, contact.

CREATE TABLE IF NOT EXISTS rate_limit_log (
  key        TEXT        PRIMARY KEY,
  count      INTEGER     NOT NULL DEFAULT 1,
  reset_at   TIMESTAMPTZ NOT NULL
);

-- Index pour le nettoyage périodique
CREATE INDEX IF NOT EXISTS idx_rate_limit_reset ON rate_limit_log (reset_at);

-- Fonction atomique : increment + reset de fenêtre si expirée
-- Retourne le compteur APRÈS incrément.
-- Utiliser: si retour > p_max → requête bloquée.
CREATE OR REPLACE FUNCTION rate_limit_check(
  p_key      TEXT,
  p_max      INTEGER,
  p_reset_at TIMESTAMPTZ
) RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_count INTEGER;
BEGIN
  INSERT INTO rate_limit_log (key, count, reset_at)
  VALUES (p_key, 1, p_reset_at)
  ON CONFLICT (key) DO UPDATE
    SET
      count    = CASE
                   WHEN rate_limit_log.reset_at < NOW() THEN 1
                   ELSE rate_limit_log.count + 1
                 END,
      reset_at = CASE
                   WHEN rate_limit_log.reset_at < NOW() THEN p_reset_at
                   ELSE rate_limit_log.reset_at
                 END
  RETURNING count INTO v_count;

  RETURN v_count;
END;
$$;

-- Nettoyage automatique des entrées expirées (appelable manuellement ou via cron)
CREATE OR REPLACE FUNCTION rate_limit_cleanup()
RETURNS void
LANGUAGE sql
SECURITY DEFINER
AS $$
  DELETE FROM rate_limit_log WHERE reset_at < NOW();
$$;

-- RLS : la table n'est accessible qu'au service role (SECURITY DEFINER sur les fonctions)
ALTER TABLE rate_limit_log ENABLE ROW LEVEL SECURITY;
-- Aucune policy user — accès uniquement via les fonctions SECURITY DEFINER

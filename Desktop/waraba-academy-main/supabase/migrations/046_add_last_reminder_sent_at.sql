-- Migration 046: Ajout last_reminder_sent_at sur enrollments
-- Permet de tracer quand le dernier email de rappel a été envoyé
-- et d'éviter de respammer les utilisateurs.

ALTER TABLE enrollments
  ADD COLUMN IF NOT EXISTS last_reminder_sent_at timestamptz;

-- Index partiel pour accélérer la requête de détection des rappels à envoyer
CREATE INDEX IF NOT EXISTS idx_enrollments_reminder
  ON enrollments (last_reminder_sent_at, updated_at)
  WHERE status = 'active';

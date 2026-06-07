-- Migration 055: Notifications de lancement de cours
-- Stocke les demandes de notification pour les cours en "coming soon".
-- Lors du lancement (is_coming_soon → false), un email est envoyé à chaque entrée
-- puis les lignes sont supprimées.

CREATE TABLE IF NOT EXISTS course_launch_notifications (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id  UUID        NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  user_id    UUID        REFERENCES auth.users(id) ON DELETE CASCADE,
  email      TEXT        NOT NULL,
  first_name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (course_id, email)
);

CREATE INDEX IF NOT EXISTS idx_course_launch_notif_course
  ON course_launch_notifications(course_id);

-- RLS : lecture/écriture par l'utilisateur lui-même ; lecture admin via service role
ALTER TABLE course_launch_notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "user insert own notification"
  ON course_launch_notifications FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "user select own notifications"
  ON course_launch_notifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "user delete own notification"
  ON course_launch_notifications FOR DELETE
  USING (auth.uid() = user_id);

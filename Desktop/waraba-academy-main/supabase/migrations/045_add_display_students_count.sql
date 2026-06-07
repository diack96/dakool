-- Migration 045: Ajouter display_students_count sur la table courses
-- Permet à l'admin de définir manuellement le nombre d'étudiants affiché publiquement.
-- Si NULL, l'API retombe sur le vrai count depuis la table enrollments.

ALTER TABLE courses
  ADD COLUMN IF NOT EXISTS display_students_count INTEGER DEFAULT NULL;

COMMENT ON COLUMN courses.display_students_count IS
  'Nombre d''étudiants affiché publiquement (override manuel). NULL = utiliser le vrai count depuis enrollments.';

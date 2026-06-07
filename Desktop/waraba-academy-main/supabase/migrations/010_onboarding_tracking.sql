-- Migration: Onboarding Tracking
-- Description: Ajoute les colonnes pour suivre l'onboarding des utilisateurs

-- Ajouter les colonnes d'onboarding à la table profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS first_course_id UUID REFERENCES courses(id) ON DELETE SET NULL;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS welcome_email_sent BOOLEAN DEFAULT false;

-- Index pour optimiser les requêtes sur les utilisateurs n'ayant pas complété l'onboarding
CREATE INDEX IF NOT EXISTS idx_profiles_onboarding_completed ON profiles(onboarding_completed) WHERE onboarding_completed = false;

-- Commentaires pour documentation
COMMENT ON COLUMN profiles.onboarding_completed IS 'Indique si l''utilisateur a complété toutes les étapes d''onboarding';
COMMENT ON COLUMN profiles.first_course_id IS 'ID du premier cours sélectionné lors de l''onboarding';
COMMENT ON COLUMN profiles.welcome_email_sent IS 'Indique si l''email de bienvenue avec le cours a été envoyé';

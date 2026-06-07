-- Migration 028: Trigger de création automatique de profil lors d'une inscription
-- Chaque nouveau utilisateur dans auth.users déclenche la création d'une ligne dans profiles.

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (
    id,
    email,
    first_name,
    last_name,
    full_name,
    role,
    welcome_email_sent,
    onboarding_completed,
    created_at,
    updated_at
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
    COALESCE(
      NEW.raw_user_meta_data->>'full_name',
      COALESCE(NEW.raw_user_meta_data->>'first_name', '') || ' ' || COALESCE(NEW.raw_user_meta_data->>'last_name', '')
    ),
    COALESCE(NEW.raw_user_meta_data->>'role', 'student'),
    false,
    false,
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Supprimer le trigger s'il existe déjà (idempotent)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Créer le trigger sur auth.users
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ─── Backfill : créer les profils manquants pour les utilisateurs déjà inscrits ───
-- Cette partie ne peut pas s'exécuter directement car auth.users n'est pas accessible
-- depuis les migrations SQL standard. Utilisez la route /api/admin/sync-profiles
-- depuis le dashboard admin pour synchroniser les utilisateurs existants.

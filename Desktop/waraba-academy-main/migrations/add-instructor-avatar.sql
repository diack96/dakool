-- Migration: Ajouter la colonne instructor_avatar_url à la table courses
-- Date: 2024

-- Vérifier si la colonne existe déjà avant de l'ajouter
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public' 
        AND table_name = 'courses' 
        AND column_name = 'instructor_avatar_url'
    ) THEN
        ALTER TABLE public.courses 
        ADD COLUMN instructor_avatar_url TEXT;
        
        COMMENT ON COLUMN public.courses.instructor_avatar_url IS 'URL de la photo de profil de l''instructeur';
    END IF;
END $$;


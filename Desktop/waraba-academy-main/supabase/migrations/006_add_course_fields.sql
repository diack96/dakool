-- Migration 006: Ajout des colonnes manquantes à la table courses

-- Ajouter la colonne is_published si elle n'existe pas
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'courses' 
        AND column_name = 'is_published'
    ) THEN
        ALTER TABLE public.courses 
        ADD COLUMN is_published BOOLEAN DEFAULT false;
        
        -- Mettre tous les cours existants comme publiés par défaut
        UPDATE public.courses SET is_published = true WHERE is_published IS NULL;
    END IF;
END $$;

-- Ajouter la colonne level si elle n'existe pas
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'courses' 
        AND column_name = 'level'
    ) THEN
        ALTER TABLE public.courses 
        ADD COLUMN level VARCHAR(20) DEFAULT 'beginner';
    END IF;
END $$;

-- Ajouter la colonne duration si elle n'existe pas
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'courses' 
        AND column_name = 'duration'
    ) THEN
        ALTER TABLE public.courses 
        ADD COLUMN duration INTEGER;
    END IF;
END $$;

-- Ajouter des commentaires pour documenter les colonnes
COMMENT ON COLUMN public.courses.is_published IS 'Indique si le cours est publié et visible publiquement';
COMMENT ON COLUMN public.courses.level IS 'Niveau du cours: beginner, intermediate, advanced';
COMMENT ON COLUMN public.courses.duration IS 'Durée du cours en minutes';


-- Migration 008: Ajout du champ is_starter_course pour les cours gratuits de démarrage

-- Ajouter la colonne is_starter_course si elle n'existe pas
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'courses' 
        AND column_name = 'is_starter_course'
    ) THEN
        ALTER TABLE public.courses 
        ADD COLUMN is_starter_course BOOLEAN DEFAULT false;
        
        COMMENT ON COLUMN public.courses.is_starter_course IS 'Indique si le cours est un cours gratuit de démarrage (courte durée, gratuit, pour attirer les nouveaux utilisateurs)';
        
        -- Créer un index pour améliorer les performances des requêtes
        CREATE INDEX IF NOT EXISTS idx_courses_is_starter_course ON public.courses(is_starter_course) WHERE is_starter_course = true;
    END IF;
END $$;

-- Ajouter une contrainte logique : un cours starter doit être gratuit
-- Note: On ne peut pas faire une contrainte CHECK avec une sous-requête, donc on fait juste un commentaire
COMMENT ON COLUMN public.courses.is_starter_course IS 'Cours gratuit de démarrage (courte durée). Doit avoir price = 0 et duration < 300 minutes (5h) pour être efficace.';


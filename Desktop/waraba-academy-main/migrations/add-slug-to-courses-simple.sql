-- Migration simplifiée: Ajouter la colonne slug à la table courses
-- Exécutez ce script dans Supabase Dashboard > SQL Editor

-- 1. Ajouter la colonne slug (nullable pour l'instant)
ALTER TABLE public.courses 
ADD COLUMN IF NOT EXISTS slug VARCHAR(255);

-- 2. Créer un index pour améliorer les performances de recherche par slug
CREATE INDEX IF NOT EXISTS idx_courses_slug ON public.courses(slug);

-- 3. Générer des slugs pour les cours existants à partir de leur titre
-- Note: Cette version simplifiée génère un slug basique
UPDATE public.courses
SET slug = LOWER(
  REGEXP_REPLACE(
    REGEXP_REPLACE(
      REGEXP_REPLACE(
        COALESCE(title, 'cours-sans-titre'),
        '[^a-z0-9]+', '-', 'g'
      ),
      '^-+|-+$', '', 'g'
    ),
    '^(.{100}).*$', '\1', 'g'
  )
)
WHERE slug IS NULL OR slug = '';

-- 4. Résoudre les doublons en ajoutant un suffixe numérique
DO $$
DECLARE
  course_record RECORD;
  base_slug TEXT;
  final_slug TEXT;
  counter INTEGER;
BEGIN
  FOR course_record IN 
    SELECT id, title, slug 
    FROM public.courses 
    WHERE slug IS NOT NULL
  LOOP
    base_slug := course_record.slug;
    final_slug := base_slug;
    counter := 0;
    
    -- Vérifier si le slug est unique
    WHILE EXISTS (
      SELECT 1 FROM public.courses 
      WHERE slug = final_slug 
      AND id != course_record.id
    ) LOOP
      counter := counter + 1;
      final_slug := base_slug || '-' || counter;
    END LOOP;
    
    -- Mettre à jour le slug si nécessaire
    IF final_slug != course_record.slug THEN
      UPDATE public.courses
      SET slug = final_slug
      WHERE id = course_record.id;
    END IF;
  END LOOP;
END $$;

-- 5. Ajouter la contrainte UNIQUE sur slug (après avoir résolu les doublons)
DO $$
BEGIN
  -- Vérifier s'il y a encore des doublons
  IF EXISTS (
    SELECT slug, COUNT(*) 
    FROM public.courses 
    WHERE slug IS NOT NULL 
    GROUP BY slug 
    HAVING COUNT(*) > 1
  ) THEN
    RAISE NOTICE 'ATTENTION: Des slugs en double existent encore. Vérifiez manuellement.';
  ELSE
    -- Ajouter la contrainte UNIQUE si pas de doublons
    BEGIN
      ALTER TABLE public.courses 
      ADD CONSTRAINT courses_slug_unique UNIQUE (slug);
      RAISE NOTICE 'Contrainte UNIQUE ajoutée avec succès.';
    EXCEPTION WHEN duplicate_object THEN
      RAISE NOTICE 'La contrainte UNIQUE existe déjà.';
    END;
  END IF;
END $$;

-- 6. Créer une fonction pour générer automatiquement un slug unique
CREATE OR REPLACE FUNCTION generate_unique_slug(title_text TEXT, existing_id UUID DEFAULT NULL)
RETURNS TEXT AS $$
DECLARE
  base_slug TEXT;
  final_slug TEXT;
  counter INTEGER := 0;
BEGIN
  -- Générer le slug de base
  base_slug := LOWER(
    REGEXP_REPLACE(
      REGEXP_REPLACE(
        REGEXP_REPLACE(
          COALESCE(title_text, 'cours-sans-titre'),
          '[^a-z0-9]+', '-', 'g'
        ),
        '^-+|-+$', '', 'g'
      ),
      '^(.{100}).*$', '\1', 'g'
    )
  );
  
  final_slug := base_slug;
  
  -- Vérifier l'unicité et ajouter un suffixe si nécessaire
  WHILE EXISTS (
    SELECT 1 FROM public.courses 
    WHERE slug = final_slug 
    AND (existing_id IS NULL OR id != existing_id)
  ) LOOP
    counter := counter + 1;
    final_slug := base_slug || '-' || counter;
  END LOOP;
  
  RETURN final_slug;
END;
$$ LANGUAGE plpgsql;

-- 7. Créer un trigger pour générer automatiquement le slug lors de l'insertion/mise à jour
CREATE OR REPLACE FUNCTION set_course_slug()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.slug IS NULL OR NEW.slug = '' THEN
    NEW.slug := generate_unique_slug(NEW.title, NEW.id);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_set_course_slug ON public.courses;
CREATE TRIGGER trigger_set_course_slug
  BEFORE INSERT OR UPDATE ON public.courses
  FOR EACH ROW
  WHEN (NEW.slug IS NULL OR NEW.slug = '')
  EXECUTE FUNCTION set_course_slug();

-- Message de confirmation
DO $$
BEGIN
  RAISE NOTICE '✅ Migration des slugs terminée avec succès !';
  RAISE NOTICE '   - Colonne slug ajoutée';
  RAISE NOTICE '   - Index créé';
  RAISE NOTICE '   - Slugs générés pour les cours existants';
  RAISE NOTICE '   - Fonction et trigger créés';
END $$;


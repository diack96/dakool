-- Migration: Ajouter la colonne slug à la table courses
-- Date: 2024
-- Description: Permet d'utiliser des URLs lisibles comme /courses/marketing-digital au lieu de UUIDs

-- 1. Ajouter la colonne slug (nullable pour l'instant)
ALTER TABLE public.courses 
ADD COLUMN IF NOT EXISTS slug VARCHAR(255);

-- 2. Créer un index pour améliorer les performances de recherche par slug
CREATE INDEX IF NOT EXISTS idx_courses_slug ON public.courses(slug);

-- 3. Générer des slugs pour les cours existants à partir de leur titre
-- Note: Cette fonction génère un slug basique, vous pouvez l'améliorer
UPDATE public.courses
SET slug = LOWER(
  REGEXP_REPLACE(
    REGEXP_REPLACE(
      REGEXP_REPLACE(
        UNACCENT(title),
        '[^a-z0-9]+', '-', 'g'
      ),
      '^-+|-+$', '', 'g'
    ),
    '^(.{100}).*$', '\1', 'g'
  )
)
WHERE slug IS NULL OR slug = '';

-- 4. Ajouter une contrainte UNIQUE sur slug (après avoir généré les slugs)
-- Note: Si des doublons existent, cette commande échouera
-- Dans ce cas, vous devrez les résoudre manuellement
DO $$
BEGIN
  -- Vérifier s'il y a des doublons
  IF EXISTS (
    SELECT slug, COUNT(*) 
    FROM public.courses 
    WHERE slug IS NOT NULL 
    GROUP BY slug 
    HAVING COUNT(*) > 1
  ) THEN
    RAISE NOTICE 'ATTENTION: Des slugs en double existent. Résolvez-les avant d''ajouter la contrainte UNIQUE.';
  ELSE
    -- Ajouter la contrainte UNIQUE si pas de doublons
    ALTER TABLE public.courses 
    ADD CONSTRAINT courses_slug_unique UNIQUE (slug);
  END IF;
END $$;

-- 5. Créer une fonction pour générer automatiquement un slug unique
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
          UNACCENT(title_text),
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

-- 6. Créer un trigger pour générer automatiquement le slug lors de l'insertion
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

-- Note: Pour utiliser UNACCENT, vous devez avoir l'extension installée:
-- CREATE EXTENSION IF NOT EXISTS unaccent;


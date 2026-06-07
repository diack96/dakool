-- ============================================================
-- MIGRATION DES SLUGS POUR LES COURS - ÉTAPE PAR ÉTAPE
-- ============================================================
-- Exécutez chaque section séparément dans Supabase Dashboard > SQL Editor
-- ============================================================

-- ============================================================
-- ÉTAPE 1: Ajouter la colonne slug
-- ============================================================
ALTER TABLE public.courses 
ADD COLUMN IF NOT EXISTS slug VARCHAR(255);

-- ============================================================
-- ÉTAPE 2: Créer l'index pour améliorer les performances
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_courses_slug ON public.courses(slug);

-- ============================================================
-- ÉTAPE 3: Générer des slugs pour les cours existants
-- ============================================================
UPDATE public.courses
SET slug = LOWER(
  REGEXP_REPLACE(
    REGEXP_REPLACE(
      REGEXP_REPLACE(
        title,
        '[^a-z0-9]+', '-', 'g'
      ),
      '^-+|-+$', '', 'g'
    ),
    '^(.{100}).*$', '\1', 'g'
  )
)
WHERE slug IS NULL OR slug = '';

-- ============================================================
-- ÉTAPE 4: Résoudre les doublons (ajouter un suffixe numérique)
-- ============================================================
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
    
    WHILE EXISTS (
      SELECT 1 FROM public.courses 
      WHERE slug = final_slug 
      AND id != course_record.id
    ) LOOP
      counter := counter + 1;
      final_slug := base_slug || '-' || counter;
    END LOOP;
    
    IF final_slug != course_record.slug THEN
      UPDATE public.courses
      SET slug = final_slug
      WHERE id = course_record.id;
    END IF;
  END LOOP;
END $$;

-- ============================================================
-- ÉTAPE 5: Ajouter la contrainte UNIQUE
-- ============================================================
DO $$
BEGIN
  IF EXISTS (
    SELECT slug, COUNT(*) 
    FROM public.courses 
    WHERE slug IS NOT NULL 
    GROUP BY slug 
    HAVING COUNT(*) > 1
  ) THEN
    RAISE NOTICE 'ATTENTION: Des slugs en double existent encore.';
  ELSE
    BEGIN
      ALTER TABLE public.courses 
      ADD CONSTRAINT courses_slug_unique UNIQUE (slug);
      RAISE NOTICE 'Contrainte UNIQUE ajoutée.';
    EXCEPTION WHEN duplicate_object THEN
      RAISE NOTICE 'La contrainte UNIQUE existe déjà.';
    END;
  END IF;
END $$;

-- ============================================================
-- ÉTAPE 6: Créer la fonction pour générer des slugs uniques
-- ============================================================
CREATE OR REPLACE FUNCTION generate_unique_slug(title_text TEXT, existing_id UUID DEFAULT NULL)
RETURNS TEXT AS $$
DECLARE
  base_slug TEXT;
  final_slug TEXT;
  counter INTEGER := 0;
BEGIN
  base_slug := LOWER(
    REGEXP_REPLACE(
      REGEXP_REPLACE(
        REGEXP_REPLACE(
          title_text,
          '[^a-z0-9]+', '-', 'g'
        ),
        '^-+|-+$', '', 'g'
      ),
      '^(.{100}).*$', '\1', 'g'
    )
  );
  
  final_slug := base_slug;
  
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

-- ============================================================
-- ÉTAPE 7: Créer le trigger pour génération automatique
-- ============================================================
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


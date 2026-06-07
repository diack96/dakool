-- ============================================================
-- MIGRATION: Fonctions et triggers pour les slugs
-- ============================================================
-- Exécutez ce fichier APRÈS avoir exécuté 01-add-slug-column.sql
-- ============================================================

-- Fonction pour générer un slug unique
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
          COALESCE(title_text, 'cours-sans-titre'),
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

-- Fonction trigger pour génération automatique
CREATE OR REPLACE FUNCTION set_course_slug()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.slug IS NULL OR NEW.slug = '' THEN
    NEW.slug := generate_unique_slug(NEW.title, NEW.id);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Créer le trigger
DROP TRIGGER IF EXISTS trigger_set_course_slug ON public.courses;
CREATE TRIGGER trigger_set_course_slug
  BEFORE INSERT OR UPDATE ON public.courses
  FOR EACH ROW
  WHEN (NEW.slug IS NULL OR NEW.slug = '')
  EXECUTE FUNCTION set_course_slug();


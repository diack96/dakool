-- ============================================================
-- MIGRATION: Ajouter la colonne slug aux cours
-- ============================================================
-- IMPORTANT: Copiez UNIQUEMENT ce fichier SQL
-- Ne copiez PAS de fichiers .ts, .tsx, .js ou .jsx
-- ============================================================

-- Étape 1: Ajouter la colonne slug
ALTER TABLE public.courses 
ADD COLUMN IF NOT EXISTS slug VARCHAR(255);

-- Étape 2: Créer l'index
CREATE INDEX IF NOT EXISTS idx_courses_slug ON public.courses(slug);

-- Étape 3: Générer les slugs pour les cours existants
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

-- Étape 4: Résoudre les doublons
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

-- Étape 5: Ajouter la contrainte UNIQUE
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'courses_slug_unique'
  ) THEN
    BEGIN
      ALTER TABLE public.courses 
      ADD CONSTRAINT courses_slug_unique UNIQUE (slug);
    EXCEPTION WHEN OTHERS THEN
      RAISE NOTICE 'Impossible d''ajouter la contrainte UNIQUE: %', SQLERRM;
    END;
  END IF;
END $$;


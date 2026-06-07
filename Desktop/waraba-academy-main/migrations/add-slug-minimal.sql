-- Migration minimale: Ajouter la colonne slug
-- Copiez-collez UNIQUEMENT ce contenu dans Supabase SQL Editor

-- 1. Ajouter la colonne
ALTER TABLE public.courses 
ADD COLUMN IF NOT EXISTS slug VARCHAR(255);

-- 2. Créer l'index
CREATE INDEX IF NOT EXISTS idx_courses_slug ON public.courses(slug);

-- 3. Générer les slugs pour les cours existants
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


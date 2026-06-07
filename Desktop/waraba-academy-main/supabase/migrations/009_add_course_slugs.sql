-- ============================================================
-- MIGRATION COMPLÈTE: Ajouter les slugs aux cours pour URLs lisibles
-- ============================================================
-- Date: 2024
-- Description: Permet d'utiliser des URLs comme /courses/marketing-digital
--              au lieu de /courses/05e56f93-6e53-464c-b045-82f00c800464
--
-- INSTRUCTIONS:
-- 1. Ouvrez Supabase Dashboard > SQL Editor
-- 2. Copiez-collez TOUT ce fichier
-- 3. Cliquez sur "Run" (ou Ctrl+Enter)
-- 4. Vérifiez avec les requêtes en bas du fichier
-- ============================================================

-- ============================================================
-- ÉTAPE 1: Ajouter la colonne slug si elle n'existe pas
-- ============================================================
ALTER TABLE public.courses 
ADD COLUMN IF NOT EXISTS slug VARCHAR(255);

-- ============================================================
-- ÉTAPE 2: Créer l'index pour améliorer les performances de recherche
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_courses_slug ON public.courses(slug);

-- ============================================================
-- ÉTAPE 3: Générer les slugs pour les cours existants à partir de leur titre
-- ============================================================
UPDATE public.courses
SET slug = LOWER(
  REGEXP_REPLACE(
    REGEXP_REPLACE(
      REGEXP_REPLACE(
        COALESCE(title, 'cours-sans-titre'),
        '[^a-z0-9]+', '-', 'g'  -- Remplacer caractères spéciaux par des tirets
      ),
      '^-+|-+$', '', 'g'  -- Supprimer les tirets en début et fin
    ),
    '^(.{100}).*$', '\1', 'g'  -- Limiter à 100 caractères
  )
)
WHERE slug IS NULL OR slug = '';

-- ============================================================
-- ÉTAPE 4: Résoudre les doublons en ajoutant un suffixe numérique
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
    
    -- Vérifier si le slug est unique, sinon ajouter un numéro
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

-- ============================================================
-- ÉTAPE 5: Ajouter la contrainte UNIQUE sur slug (après avoir résolu les doublons)
-- ============================================================
DO $$
BEGIN
  -- Vérifier si la contrainte existe déjà
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'courses_slug_unique'
    AND conrelid = 'public.courses'::regclass
  ) THEN
    -- Vérifier s'il y a encore des doublons
    IF EXISTS (
      SELECT slug, COUNT(*) 
      FROM public.courses 
      WHERE slug IS NOT NULL 
      GROUP BY slug 
      HAVING COUNT(*) > 1
    ) THEN
      RAISE NOTICE 'ATTENTION: Des slugs en double existent encore. Vérifiez les données.';
    ELSE
      -- Ajouter la contrainte UNIQUE
      ALTER TABLE public.courses 
      ADD CONSTRAINT courses_slug_unique UNIQUE (slug);
      RAISE NOTICE '✅ Contrainte UNIQUE ajoutée sur slug';
    END IF;
  ELSE
    RAISE NOTICE '✅ Contrainte UNIQUE existe déjà';
  END IF;
END $$;

-- ============================================================
-- ÉTAPE 6: Créer la fonction pour générer automatiquement un slug unique
-- ============================================================
CREATE OR REPLACE FUNCTION public.generate_unique_slug(title_text TEXT, existing_id UUID DEFAULT NULL)
RETURNS TEXT AS $$
DECLARE
  base_slug TEXT;
  final_slug TEXT;
  counter INTEGER := 0;
BEGIN
  -- Générer le slug de base depuis le titre
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

-- ============================================================
-- ÉTAPE 7: Créer la fonction trigger pour génération automatique
-- ============================================================
CREATE OR REPLACE FUNCTION public.set_course_slug()
RETURNS TRIGGER AS $$
BEGIN
  -- Générer automatiquement le slug si il est NULL ou vide
  IF NEW.slug IS NULL OR NEW.slug = '' THEN
    NEW.slug := public.generate_unique_slug(NEW.title, NEW.id);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- ÉTAPE 8: Créer le trigger pour génération automatique lors de l'insertion/mise à jour
-- ============================================================
DROP TRIGGER IF EXISTS trigger_set_course_slug ON public.courses;
CREATE TRIGGER trigger_set_course_slug
  BEFORE INSERT OR UPDATE ON public.courses
  FOR EACH ROW
  WHEN (NEW.slug IS NULL OR NEW.slug = '')
  EXECUTE FUNCTION public.set_course_slug();

-- ============================================================
-- ✅ MIGRATION TERMINÉE
-- ============================================================
-- La migration est maintenant complète. Les slugs ont été générés
-- pour tous les cours existants et seront générés automatiquement
-- pour les nouveaux cours.
-- ============================================================

-- ============================================================
-- VÉRIFICATIONS (Optionnel - Exécutez ces requêtes pour vérifier)
-- ============================================================

-- 1. Vérifier que tous les cours ont un slug :
-- SELECT id, title, slug FROM public.courses WHERE slug IS NULL;
-- Résultat attendu : 0 lignes (tous les cours ont un slug)

-- 2. Vérifier qu'il n'y a pas de doublons :
-- SELECT slug, COUNT(*) as count 
-- FROM public.courses 
-- WHERE slug IS NOT NULL 
-- GROUP BY slug 
-- HAVING COUNT(*) > 1;
-- Résultat attendu : 0 lignes (pas de doublons)

-- 3. Voir quelques exemples de slugs générés :
-- SELECT title, slug FROM public.courses LIMIT 10;
-- Vous devriez voir des slugs comme :
-- "Marketing Digital" → "marketing-digital"
-- "Développement Web" → "developpement-web"
-- "Introduction à React" → "introduction-a-react"

-- 4. Tester la génération automatique (créer un cours de test) :
-- INSERT INTO public.courses (title, description, price) 
-- VALUES ('Test Course', 'Description test', 0);
-- SELECT title, slug FROM public.courses WHERE title = 'Test Course';
-- Le slug devrait être généré automatiquement : "test-course"

-- ============================================================
-- NOTES IMPORTANTES
-- ============================================================
-- 1. Les slugs sont générés automatiquement pour tous les nouveaux cours
-- 2. Les URLs avec UUID continuent de fonctionner (compatibilité)
-- 3. Si deux cours ont le même titre, le deuxième aura un suffixe (ex: marketing-digital-2)
-- 4. Format des slugs : minuscules, tirets, max 100 caractères
-- 5. Les slugs sont uniques grâce à la contrainte UNIQUE
-- ============================================================

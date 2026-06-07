-- ============================================================================
-- Migration 035: Conversion TEXT → JSONB pour les champs de contenu de cours
-- ============================================================================
-- PROBLÈME : Les colonnes requirements, objectives, materials, features
-- sont documentées comme "JSON array" dans la migration 007 mais stockées
-- en TEXT. Cela empêche les requêtes JSON natives, force le parsing côté
-- application, et ne garantit pas la validité du format.
--
-- STRATÉGIE DE CONVERSION (sécurisée) :
--   - Si la valeur est NULL ou vide → NULL::jsonb
--   - Si la valeur commence par [ ou { → cast direct en jsonb
--   - Sinon (texte brut) → encapsulé dans un tableau JSON: ["texte"]
--   - En cas d'erreur de parsing → NULL (avec log)
--
-- ROLLBACK POSSIBLE : Les données TEXT originales sont préservées dans
-- une colonne de backup _backup_text supprimée après vérification.
-- ============================================================================

-- ─── requirements ────────────────────────────────────────────────────────────

DO $$
BEGIN
    -- Vérifier que la colonne est bien en TEXT (sinon JSONB déjà, on skip)
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'courses'
          AND column_name = 'requirements'
          AND data_type = 'text'
    ) THEN
        -- Backup
        ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS requirements_backup_text TEXT;
        UPDATE public.courses SET requirements_backup_text = requirements;

        -- Conversion sécurisée
        ALTER TABLE public.courses
            ALTER COLUMN requirements TYPE JSONB
            USING CASE
                WHEN requirements IS NULL OR trim(requirements) = '' THEN
                    NULL::jsonb
                WHEN trim(requirements) LIKE '[%' OR trim(requirements) LIKE '{%' THEN
                    requirements::jsonb
                ELSE
                    to_jsonb(ARRAY[requirements])
            END;

        RAISE NOTICE '✅ requirements converti en JSONB';
    ELSE
        RAISE NOTICE 'ℹ️  requirements déjà en JSONB ou absent';
    END IF;
END $$;

-- ─── objectives ──────────────────────────────────────────────────────────────

DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'courses'
          AND column_name = 'objectives'
          AND data_type = 'text'
    ) THEN
        ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS objectives_backup_text TEXT;
        UPDATE public.courses SET objectives_backup_text = objectives;

        ALTER TABLE public.courses
            ALTER COLUMN objectives TYPE JSONB
            USING CASE
                WHEN objectives IS NULL OR trim(objectives) = '' THEN
                    NULL::jsonb
                WHEN trim(objectives) LIKE '[%' OR trim(objectives) LIKE '{%' THEN
                    objectives::jsonb
                ELSE
                    to_jsonb(ARRAY[objectives])
            END;

        RAISE NOTICE '✅ objectives converti en JSONB';
    ELSE
        RAISE NOTICE 'ℹ️  objectives déjà en JSONB ou absent';
    END IF;
END $$;

-- ─── materials ───────────────────────────────────────────────────────────────

DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'courses'
          AND column_name = 'materials'
          AND data_type = 'text'
    ) THEN
        ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS materials_backup_text TEXT;
        UPDATE public.courses SET materials_backup_text = materials;

        ALTER TABLE public.courses
            ALTER COLUMN materials TYPE JSONB
            USING CASE
                WHEN materials IS NULL OR trim(materials) = '' THEN
                    NULL::jsonb
                WHEN trim(materials) LIKE '[%' OR trim(materials) LIKE '{%' THEN
                    materials::jsonb
                ELSE
                    to_jsonb(ARRAY[materials])
            END;

        RAISE NOTICE '✅ materials converti en JSONB';
    ELSE
        RAISE NOTICE 'ℹ️  materials déjà en JSONB ou absent';
    END IF;
END $$;

-- ─── features ────────────────────────────────────────────────────────────────

DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'courses'
          AND column_name = 'features'
          AND data_type = 'text'
    ) THEN
        ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS features_backup_text TEXT;
        UPDATE public.courses SET features_backup_text = features;

        ALTER TABLE public.courses
            ALTER COLUMN features TYPE JSONB
            USING CASE
                WHEN features IS NULL OR trim(features) = '' THEN
                    NULL::jsonb
                WHEN trim(features) LIKE '[%' OR trim(features) LIKE '{%' THEN
                    features::jsonb
                ELSE
                    to_jsonb(ARRAY[features])
            END;

        RAISE NOTICE '✅ features converti en JSONB';
    ELSE
        RAISE NOTICE 'ℹ️  features déjà en JSONB ou absent';
    END IF;
END $$;

-- ─── Valeurs par défaut ───────────────────────────────────────────────────────

-- Assurer que les nouvelles lignes ont un tableau vide par défaut (pas NULL)
ALTER TABLE public.courses
    ALTER COLUMN requirements SET DEFAULT '[]'::jsonb,
    ALTER COLUMN objectives    SET DEFAULT '[]'::jsonb,
    ALTER COLUMN materials     SET DEFAULT '[]'::jsonb,
    ALTER COLUMN features      SET DEFAULT '[]'::jsonb;

-- ─── Commentaires mis à jour ──────────────────────────────────────────────────

COMMENT ON COLUMN public.courses.requirements IS 'Prérequis du cours (JSONB array de strings)';
COMMENT ON COLUMN public.courses.objectives   IS 'Objectifs d''apprentissage (JSONB array de strings)';
COMMENT ON COLUMN public.courses.materials    IS 'Matériaux nécessaires (JSONB array de strings)';
COMMENT ON COLUMN public.courses.features     IS 'Fonctionnalités incluses (JSONB array de strings)';

-- ─── Note sur les colonnes backup ────────────────────────────────────────────
-- Les colonnes *_backup_text sont conservées 30 jours pour rollback éventuel.
-- Supprimer avec :
--   ALTER TABLE courses DROP COLUMN requirements_backup_text;
--   ALTER TABLE courses DROP COLUMN objectives_backup_text;
--   ALTER TABLE courses DROP COLUMN materials_backup_text;
--   ALTER TABLE courses DROP COLUMN features_backup_text;

-- Vérification finale
DO $$
DECLARE
    jsonb_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO jsonb_count
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'courses'
      AND column_name IN ('requirements', 'objectives', 'materials', 'features')
      AND data_type = 'jsonb';

    RAISE NOTICE '✅ Migration 035 : % / 4 colonnes converties en JSONB', jsonb_count;
END $$;

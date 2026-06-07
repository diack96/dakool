-- Migration 007: Ajout des colonnes pour le syllabus et autres champs de cours
-- Version améliorée avec JSONB pour syllabus (cohérent avec SETUP_COMPLET_FINAL.sql)

-- Ajouter la colonne syllabus (JSONB pour stocker le programme détaillé)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'courses' 
        AND column_name = 'syllabus'
    ) THEN
        ALTER TABLE public.courses 
        ADD COLUMN syllabus JSONB;
        
        COMMENT ON COLUMN public.courses.syllabus IS 'Programme détaillé du cours (JSONB contenant modules et leçons)';
        
        RAISE NOTICE '✅ Colonne syllabus (JSONB) ajoutée avec succès';
    ELSE
        -- Si la colonne existe déjà en TEXT, la convertir en JSONB
        IF EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_schema = 'public' 
            AND table_name = 'courses' 
            AND column_name = 'syllabus'
            AND data_type = 'text'
        ) THEN
            ALTER TABLE public.courses 
            ALTER COLUMN syllabus TYPE JSONB USING 
                CASE 
                    WHEN syllabus IS NULL OR syllabus = '' THEN NULL::jsonb
                    ELSE syllabus::jsonb
                END;
            
            RAISE NOTICE '✅ Colonne syllabus convertie de TEXT vers JSONB';
        ELSE
            RAISE NOTICE 'ℹ️  Colonne syllabus existe déjà (JSONB)';
        END IF;
    END IF;
END $$;

-- Ajouter la colonne requirements (JSONB pour les prérequis)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'courses' 
        AND column_name = 'requirements'
    ) THEN
        ALTER TABLE public.courses 
        ADD COLUMN requirements TEXT;
        
        COMMENT ON COLUMN public.courses.requirements IS 'Liste des prérequis du cours (JSON array)';
    END IF;
END $$;

-- Ajouter la colonne objectives (JSONB pour les objectifs)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'courses' 
        AND column_name = 'objectives'
    ) THEN
        ALTER TABLE public.courses 
        ADD COLUMN objectives TEXT;
        
        COMMENT ON COLUMN public.courses.objectives IS 'Liste des objectifs d''apprentissage (JSON array)';
    END IF;
END $$;

-- Ajouter la colonne materials (JSONB pour les matériaux)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'courses' 
        AND column_name = 'materials'
    ) THEN
        ALTER TABLE public.courses 
        ADD COLUMN materials TEXT;
        
        COMMENT ON COLUMN public.courses.materials IS 'Liste des matériaux nécessaires (JSON array)';
    END IF;
END $$;

-- Ajouter la colonne features (JSONB pour les fonctionnalités incluses)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'courses' 
        AND column_name = 'features'
    ) THEN
        ALTER TABLE public.courses 
        ADD COLUMN features TEXT;
        
        COMMENT ON COLUMN public.courses.features IS 'Liste des fonctionnalités incluses dans le cours (JSON array)';
    END IF;
END $$;

-- Ajouter la colonne instructor_name (nom de l'instructeur saisi manuellement)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'courses' 
        AND column_name = 'instructor_name'
    ) THEN
        ALTER TABLE public.courses 
        ADD COLUMN instructor_name VARCHAR(255);
        
        COMMENT ON COLUMN public.courses.instructor_name IS 'Nom de l''instructeur (peut être différent de profiles)';
    END IF;
END $$;

-- Ajouter la colonne instructor_bio (bio de l'instructeur)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'courses' 
        AND column_name = 'instructor_bio'
    ) THEN
        ALTER TABLE public.courses 
        ADD COLUMN instructor_bio TEXT;
        
        COMMENT ON COLUMN public.courses.instructor_bio IS 'Biographie de l''instructeur';
    END IF;
END $$;

-- Ajouter la colonne language (langue du cours)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'courses' 
        AND column_name = 'language'
    ) THEN
        ALTER TABLE public.courses 
        ADD COLUMN language VARCHAR(10) DEFAULT 'fr';
        
        COMMENT ON COLUMN public.courses.language IS 'Langue du cours (fr, en, etc.)';
    END IF;
END $$;

-- Ajouter la colonne certificate (certificat inclus)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'courses' 
        AND column_name = 'certificate'
    ) THEN
        ALTER TABLE public.courses 
        ADD COLUMN certificate BOOLEAN DEFAULT true;
        
        COMMENT ON COLUMN public.courses.certificate IS 'Indique si un certificat est inclus dans le cours';
    END IF;
END $$;

-- Ajouter la colonne is_featured (cours mis en avant)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'courses' 
        AND column_name = 'is_featured'
    ) THEN
        ALTER TABLE public.courses 
        ADD COLUMN is_featured BOOLEAN DEFAULT false;
        
        COMMENT ON COLUMN public.courses.is_featured IS 'Indique si le cours est mis en avant';
    END IF;
END $$;

-- Ajouter la colonne is_popular (cours populaire)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'courses' 
        AND column_name = 'is_popular'
    ) THEN
        ALTER TABLE public.courses 
        ADD COLUMN is_popular BOOLEAN DEFAULT false;
        
        COMMENT ON COLUMN public.courses.is_popular IS 'Indique si le cours est populaire';
    END IF;
END $$;

-- Ajouter la colonne display_order (ordre d'affichage)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'courses' 
        AND column_name = 'display_order'
    ) THEN
        ALTER TABLE public.courses 
        ADD COLUMN display_order INTEGER DEFAULT 0;
        
        COMMENT ON COLUMN public.courses.display_order IS 'Ordre d''affichage du cours (pour tri personnalisé)';
    END IF;
END $$;

-- Ajouter la colonne original_price (prix original avant réduction)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'courses' 
        AND column_name = 'original_price'
    ) THEN
        ALTER TABLE public.courses 
        ADD COLUMN original_price NUMERIC(10, 2);
        
        COMMENT ON COLUMN public.courses.original_price IS 'Prix original avant réduction (pour afficher les promotions)';
    END IF;
END $$;

-- Ajouter la colonne video_preview (URL de la vidéo de prévisualisation)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'courses' 
        AND column_name = 'video_preview'
    ) THEN
        ALTER TABLE public.courses 
        ADD COLUMN video_preview TEXT;
        
        COMMENT ON COLUMN public.courses.video_preview IS 'URL de la vidéo de prévisualisation du cours';
    END IF;
END $$;

-- Ajouter la colonne short_description (description courte)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'courses' 
        AND column_name = 'short_description'
    ) THEN
        ALTER TABLE public.courses 
        ADD COLUMN short_description TEXT;
        
        COMMENT ON COLUMN public.courses.short_description IS 'Description courte du cours (pour les cartes et aperçus)';
    END IF;
END $$;

-- Créer un index sur is_featured et is_popular pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_courses_is_featured ON public.courses(is_featured) WHERE is_featured = true;
CREATE INDEX IF NOT EXISTS idx_courses_is_popular ON public.courses(is_popular) WHERE is_popular = true;
CREATE INDEX IF NOT EXISTS idx_courses_display_order ON public.courses(display_order);

-- Log de confirmation
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '═══════════════════════════════════════════════════════════';
    RAISE NOTICE '✅ Migration 007 terminée avec succès!';
    RAISE NOTICE '   Colonne syllabus (JSONB) ajoutée';
    RAISE NOTICE '   Toutes les autres colonnes vérifiées/ajoutées';
    RAISE NOTICE '   Index de performance créés';
    RAISE NOTICE '═══════════════════════════════════════════════════════════';
END $$;


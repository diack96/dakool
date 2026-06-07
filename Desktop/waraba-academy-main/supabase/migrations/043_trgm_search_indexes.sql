-- =============================================================================
-- Migration 043 — Trigram indexes for ILIKE full-text searches
-- =============================================================================
-- Problem: Every ILIKE '%x%' search performs a full sequential table scan.
--   PostgreSQL's standard B-tree indexes only accelerate prefix queries (LIKE 'x%').
--   Infix/suffix patterns (%x%) cannot use B-tree and fall back to seq scan.
--
-- Fix: pg_trgm GIN indexes — they break text into 3-character n-grams and
--   index each gram. PostgreSQL then uses the index for any ILIKE pattern,
--   including infix (%x%) and suffix (%x). No API code changes required.
--
-- Routes and columns covered:
--   api/courses/route.ts:66              courses(title, description)       PUBLIC
--   api/admin/courses/route.ts:143       courses(title, description)       ADMIN
--   api/admin/users/route.ts:78          profiles(first_name,last_name,email) ADMIN
--   api/admin/coupons/route.ts:43        coupons(code, description)        ADMIN
--   api/admin/lessons/route.ts:44        lessons(title)                    ADMIN
--   api/admin/certificates/route.ts:32   certificates(student_name,        ADMIN
--                                          course_title, certificate_number)
--
-- Index type: GIN (Generalized Inverted Index) — preferred over GIST for
--   read-heavy workloads. Slower to build/update, faster to query.
-- Partial indexes on soft-deleted tables (deleted_at IS NULL) keep index size
--   minimal and scans fast by excluding deleted records.
-- =============================================================================

-- Activer l'extension pg_trgm (disponible par défaut sur Supabase, idempotent)
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- =============================================================================
-- courses — recherche publique (catalogue) + admin
-- Partial index: exclure les cours soft-deleted (migration 037)
-- =============================================================================

CREATE INDEX IF NOT EXISTS idx_courses_title_trgm
    ON public.courses USING GIN (title gin_trgm_ops)
    WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_courses_description_trgm
    ON public.courses USING GIN (description gin_trgm_ops)
    WHERE deleted_at IS NULL;

-- =============================================================================
-- profiles — recherche admin (prénom, nom, email)
-- =============================================================================

CREATE INDEX IF NOT EXISTS idx_profiles_first_name_trgm
    ON public.profiles USING GIN (first_name gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_profiles_last_name_trgm
    ON public.profiles USING GIN (last_name gin_trgm_ops);

-- Email: cas fréquent = recherche de domaine (%@gmail.com%) ou préfixe (john%)
-- GIN trigram couvre les deux.
CREATE INDEX IF NOT EXISTS idx_profiles_email_trgm
    ON public.profiles USING GIN (email gin_trgm_ops);

-- =============================================================================
-- coupons — recherche admin (code de réduction, description)
-- =============================================================================

CREATE INDEX IF NOT EXISTS idx_coupons_code_trgm
    ON public.coupons USING GIN (code gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_coupons_description_trgm
    ON public.coupons USING GIN (description gin_trgm_ops);

-- =============================================================================
-- lessons — recherche admin (titre uniquement)
-- Partial index: exclure les leçons soft-deleted (migration 037)
-- =============================================================================

CREATE INDEX IF NOT EXISTS idx_lessons_title_trgm
    ON public.lessons USING GIN (title gin_trgm_ops)
    WHERE deleted_at IS NULL;

-- =============================================================================
-- certificates — recherche admin (nom étudiant, titre cours, numéro certificat)
-- Note: certificate_number a déjà un index B-tree (migration 022) qui couvre
-- les lookups exacts. Le trigram ici couvre le ILIKE '%x%' de la recherche admin.
-- =============================================================================

CREATE INDEX IF NOT EXISTS idx_certificates_student_name_trgm
    ON public.certificates USING GIN (student_name gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_certificates_course_title_trgm
    ON public.certificates USING GIN (course_title gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_certificates_number_trgm
    ON public.certificates USING GIN (certificate_number gin_trgm_ops);

-- =============================================================================
-- Vérification
-- =============================================================================

DO $$
DECLARE
    v_trgm        BOOLEAN;
    v_courses_t   BOOLEAN;
    v_courses_d   BOOLEAN;
    v_profiles_fn BOOLEAN;
    v_profiles_e  BOOLEAN;
BEGIN
    SELECT EXISTS (
        SELECT 1 FROM pg_extension WHERE extname = 'pg_trgm'
    ) INTO v_trgm;

    SELECT EXISTS (
        SELECT 1 FROM pg_indexes
        WHERE schemaname = 'public' AND indexname = 'idx_courses_title_trgm'
    ) INTO v_courses_t;

    SELECT EXISTS (
        SELECT 1 FROM pg_indexes
        WHERE schemaname = 'public' AND indexname = 'idx_courses_description_trgm'
    ) INTO v_courses_d;

    SELECT EXISTS (
        SELECT 1 FROM pg_indexes
        WHERE schemaname = 'public' AND indexname = 'idx_profiles_first_name_trgm'
    ) INTO v_profiles_fn;

    SELECT EXISTS (
        SELECT 1 FROM pg_indexes
        WHERE schemaname = 'public' AND indexname = 'idx_profiles_email_trgm'
    ) INTO v_profiles_e;

    IF NOT v_trgm THEN
        RAISE EXCEPTION '❌ Migration 043: extension pg_trgm non installée';
    END IF;
    IF NOT v_courses_t OR NOT v_courses_d THEN
        RAISE EXCEPTION '❌ Migration 043: index trigram manquants sur courses';
    END IF;
    IF NOT v_profiles_fn OR NOT v_profiles_e THEN
        RAISE EXCEPTION '❌ Migration 043: index trigram manquants sur profiles';
    END IF;

    RAISE NOTICE '✅ Migration 043: extension pg_trgm active';
    RAISE NOTICE '✅ Migration 043: courses   — idx sur title + description (partial: deleted_at IS NULL)';
    RAISE NOTICE '✅ Migration 043: profiles  — idx sur first_name + last_name + email';
    RAISE NOTICE '✅ Migration 043: coupons   — idx sur code + description';
    RAISE NOTICE '✅ Migration 043: lessons   — idx sur title (partial: deleted_at IS NULL)';
    RAISE NOTICE '✅ Migration 043: certificates — idx sur student_name + course_title + certificate_number';
    RAISE NOTICE '';
    RAISE NOTICE '🎉 Migration 043 appliquée avec succès';
    RAISE NOTICE '   Les requêtes ILIKE ''%%x%%'' utilisent désormais des index GIN trigram';
    RAISE NOTICE '   au lieu de sequential scans.';
END $$;

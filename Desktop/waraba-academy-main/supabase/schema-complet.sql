-- ============================================================================
-- WARABA ACADEMY - SCHÉMA COMPLET DE BASE DE DONNÉES
-- ============================================================================
-- Version: 5.0 - Schéma unifié corrigé
-- Date: 2025-2026
--
-- ⚠️  ATTENTION : CE FICHIER EFFACE TOUTES LES DONNÉES EXISTANTES
-- ⚠️  NE L'EXÉCUTER QUE POUR INITIALISER UNE BASE DE DONNÉES NEUVE
-- ⚠️  Pour ajouter une fonctionnalité, utilisez les migrations dans
--     supabase/migrations/0XX_*.sql
-- ============================================================================

-- ============================================================================
-- 0. GARDE-FOU : Empêcher l'exécution accidentelle sur une base avec données
-- ============================================================================
DO $$
DECLARE
    courses_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO courses_count FROM information_schema.tables
        WHERE table_schema = 'public' AND table_name = 'courses';

    IF courses_count > 0 THEN
        -- La table courses existe, vérifier s'il y a des données
        EXECUTE 'SELECT COUNT(*) FROM public.courses' INTO courses_count;
        IF courses_count > 0 THEN
            RAISE EXCEPTION '
╔══════════════════════════════════════════════════════════════════╗
║  STOP ! La base contient % cours.                              ║
║  Ce script va TOUT EFFACER.                                    ║
║                                                                ║
║  Si vous voulez vraiment réinitialiser, exécutez d''abord :    ║
║  DROP TABLE IF EXISTS public.courses CASCADE;                  ║
║  puis relancez ce script.                                      ║
║                                                                ║
║  Pour ajouter une fonctionnalité, utilisez les migrations :    ║
║  supabase/migrations/0XX_*.sql                                 ║
╚══════════════════════════════════════════════════════════════════╝
', courses_count;
        END IF;
    END IF;

    RAISE NOTICE '✅ Base vide, initialisation en cours...';
END $$;

-- ============================================================================
-- 1. NETTOYAGE COMPLET (DROP)
-- ============================================================================

DO $$
DECLARE
    r RECORD;
BEGIN
    -- Supprimer toutes les politiques RLS existantes
    FOR r IN (SELECT schemaname, tablename, policyname FROM pg_policies WHERE schemaname = 'public')
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I', r.policyname, r.schemaname, r.tablename);
    END LOOP;

    FOR r IN (SELECT schemaname, tablename, policyname FROM pg_policies WHERE schemaname = 'storage')
    LOOP
        BEGIN
            EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I', r.policyname, r.schemaname, r.tablename);
        EXCEPTION WHEN OTHERS THEN NULL;
        END;
    END LOOP;
END $$;

-- Supprimer les triggers
DROP TRIGGER IF EXISTS trigger_set_course_slug ON public.courses;
DROP TRIGGER IF EXISTS set_updated_at_profiles ON public.profiles;
DROP TRIGGER IF EXISTS set_updated_at_courses ON public.courses;
DROP TRIGGER IF EXISTS set_updated_at_enrollments ON public.enrollments;
DROP TRIGGER IF EXISTS set_updated_at_lessons ON public.lessons;
DROP TRIGGER IF EXISTS set_updated_at_categories ON public.categories;
DROP TRIGGER IF EXISTS update_user_progress_updated_at ON public.user_progress;
DROP TRIGGER IF EXISTS update_quizzes_updated_at ON public.quizzes;
DROP TRIGGER IF EXISTS update_quiz_questions_updated_at ON public.quiz_questions;
DROP TRIGGER IF EXISTS update_notifications_updated_at ON public.notifications;
DROP TRIGGER IF EXISTS update_payments_updated_at ON public.payments;
DROP TRIGGER IF EXISTS update_course_reviews_updated_at ON public.course_reviews;
DROP TRIGGER IF EXISTS coupons_updated_at ON public.coupons;
DROP TRIGGER IF EXISTS set_updated_at_admin_roles ON public.admin_roles;

-- Supprimer les tables dans l'ordre (dépendances d'abord)
DROP TABLE IF EXISTS public.user_quiz_responses CASCADE;
DROP TABLE IF EXISTS public.quiz_attempts CASCADE;
DROP TABLE IF EXISTS public.quiz_answers CASCADE;
DROP TABLE IF EXISTS public.quiz_questions CASCADE;
DROP TABLE IF EXISTS public.quizzes CASCADE;
DROP TABLE IF EXISTS public.user_progress CASCADE;
DROP TABLE IF EXISTS public.course_reviews CASCADE;
DROP TABLE IF EXISTS public.coupon_usages CASCADE;
DROP TABLE IF EXISTS public.coupons CASCADE;
DROP TABLE IF EXISTS public.payments CASCADE;
DROP TABLE IF EXISTS public.notifications CASCADE;
DROP TABLE IF EXISTS public.enrollments CASCADE;
DROP TABLE IF EXISTS public.lessons CASCADE;
DROP TABLE IF EXISTS public.course_slug_redirects CASCADE;
DROP TABLE IF EXISTS public.courses CASCADE;
DROP TABLE IF EXISTS public.categories CASCADE;
DROP TABLE IF EXISTS public.admin_audit_logs CASCADE;
DROP TABLE IF EXISTS public.admin_roles CASCADE;
DROP TABLE IF EXISTS public.admin_permissions CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

-- Supprimer les fonctions
DROP FUNCTION IF EXISTS public.is_admin(UUID) CASCADE;
DROP FUNCTION IF EXISTS public.is_admin() CASCADE;
DROP FUNCTION IF EXISTS public.handle_updated_at() CASCADE;
DROP FUNCTION IF EXISTS public.generate_unique_slug(TEXT, UUID, INTEGER) CASCADE;
DROP FUNCTION IF EXISTS public.generate_unique_slug(TEXT, UUID) CASCADE;
DROP FUNCTION IF EXISTS public.set_course_slug() CASCADE;
DROP FUNCTION IF EXISTS public.update_updated_at_column() CASCADE;
DROP FUNCTION IF EXISTS public.update_coupons_updated_at() CASCADE;

DO $$ BEGIN RAISE NOTICE '✅ Nettoyage terminé'; END $$;

-- ============================================================================
-- 2. EXTENSIONS
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

DO $$
BEGIN
    CREATE EXTENSION IF NOT EXISTS unaccent;
EXCEPTION
    WHEN insufficient_privilege THEN
        RAISE WARNING '⚠️ Extension unaccent non disponible';
    WHEN duplicate_object THEN NULL;
END $$;

-- ============================================================================
-- 3. TABLES PRINCIPALES
-- ============================================================================

-- Profils utilisateurs
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL UNIQUE,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    full_name VARCHAR(200),
    role VARCHAR(20) DEFAULT 'student' CHECK (role IN ('student', 'instructor', 'admin')),
    avatar_url TEXT,
    bio TEXT,
    phone VARCHAR(20),
    location VARCHAR(255),
    admin_role_id UUID,
    custom_permissions UUID[] DEFAULT '{}',
    onboarding_completed BOOLEAN DEFAULT false,
    first_course_id UUID,
    welcome_email_sent BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Catégories de cours
CREATE TABLE public.categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    slug VARCHAR(255) UNIQUE,
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Cours
CREATE TABLE public.courses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    short_description TEXT,
    instructor_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    price NUMERIC(10, 2) DEFAULT 0 CHECK (price >= 0),
    original_price NUMERIC(10, 2),
    image_url TEXT,
    thumbnail TEXT,
    video_preview TEXT,
    slug VARCHAR(255),
    is_published BOOLEAN DEFAULT false,
    is_free BOOLEAN DEFAULT false,
    is_coming_soon BOOLEAN DEFAULT false,
    status VARCHAR(20) DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'PUBLISHED', 'ARCHIVED')),
    level VARCHAR(20) DEFAULT 'beginner' CHECK (level IN ('beginner', 'intermediate', 'advanced')),
    duration INTEGER CHECK (duration IS NULL OR duration > 0),
    language VARCHAR(10) DEFAULT 'fr' CHECK (language IN ('fr', 'en', 'ar')),
    certificate BOOLEAN DEFAULT true,
    syllabus JSONB,
    requirements TEXT,
    objectives TEXT,
    materials TEXT,
    features TEXT,
    instructor_name VARCHAR(255),
    instructor_bio TEXT,
    instructor_avatar_url TEXT,
    is_featured BOOLEAN DEFAULT false,
    is_popular BOOLEAN DEFAULT false,
    is_starter_course BOOLEAN DEFAULT false,
    display_order INTEGER DEFAULT 0 CHECK (display_order >= 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- FK circulaire profiles -> courses (first_course_id)
ALTER TABLE public.profiles
    ADD CONSTRAINT fk_profiles_first_course
    FOREIGN KEY (first_course_id)
    REFERENCES public.courses(id)
    ON DELETE SET NULL;

-- Leçons
CREATE TABLE public.lessons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    content TEXT,
    video_url TEXT,
    duration INTEGER DEFAULT 0 CHECK (duration >= 0),
    lesson_order INTEGER DEFAULT 0,
    is_free BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Inscriptions
CREATE TABLE public.enrollments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('pending', 'active', 'completed', 'cancelled')),
    enrolled_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT enrollments_user_course_unique UNIQUE (user_id, course_id)
);

-- Progression utilisateur
-- NOTE: lesson_id est TEXT (pas UUID FK) car certaines leçons utilisent des IDs string côté client
CREATE TABLE public.user_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
    lesson_id TEXT NOT NULL,
    is_completed BOOLEAN DEFAULT false,
    completed_at TIMESTAMP WITH TIME ZONE,
    progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
    time_spent INTEGER DEFAULT 0 CHECK (time_spent >= 0),
    last_played_time NUMERIC(10, 2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT user_progress_unique UNIQUE (user_id, course_id, lesson_id)
);

-- Paiements
CREATE TABLE public.payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    course_id UUID REFERENCES public.courses(id) ON DELETE SET NULL,
    amount NUMERIC(10, 2) NOT NULL CHECK (amount > 0),
    currency VARCHAR(10) DEFAULT 'XOF',
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
    payment_method VARCHAR(50),
    transaction_id VARCHAR(255),
    gateway_response JSONB,
    paid_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Coupons
CREATE TABLE public.coupons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    discount_type VARCHAR(20) NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
    discount_value NUMERIC(10, 2) NOT NULL CHECK (discount_value > 0),
    min_purchase NUMERIC(10, 2) DEFAULT 0,
    max_discount NUMERIC(10, 2),
    usage_limit INTEGER,
    usage_count INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    starts_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE,
    applicable_courses UUID[] DEFAULT '{}',
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Historique d'utilisation des coupons
CREATE TABLE public.coupon_usages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    coupon_id UUID NOT NULL REFERENCES public.coupons(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    payment_id UUID REFERENCES public.payments(id) ON DELETE SET NULL,
    course_id UUID REFERENCES public.courses(id) ON DELETE SET NULL,
    discount_amount NUMERIC(10, 2) NOT NULL,
    used_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Avis sur les cours
CREATE TABLE public.course_reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    is_verified BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT course_reviews_unique UNIQUE (course_id, user_id)
);

-- Notifications
CREATE TABLE public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    message TEXT,
    type VARCHAR(20) DEFAULT 'info' CHECK (type IN ('info', 'success', 'warning', 'error')),
    is_read BOOLEAN DEFAULT false,
    read_at TIMESTAMP WITH TIME ZONE,
    action_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Quiz
CREATE TABLE public.quizzes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    passing_score INTEGER DEFAULT 70 CHECK (passing_score >= 0 AND passing_score <= 100),
    time_limit INTEGER CHECK (time_limit IS NULL OR time_limit > 0),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE public.quiz_questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    quiz_id UUID NOT NULL REFERENCES public.quizzes(id) ON DELETE CASCADE,
    question_text TEXT NOT NULL,
    question_type VARCHAR(50) NOT NULL CHECK (question_type IN ('multiple_choice', 'true_false', 'text')),
    points INTEGER DEFAULT 1 CHECK (points > 0),
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE public.quiz_answers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    question_id UUID NOT NULL REFERENCES public.quiz_questions(id) ON DELETE CASCADE,
    answer_text TEXT NOT NULL,
    is_correct BOOLEAN DEFAULT false,
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE public.quiz_attempts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    quiz_id UUID NOT NULL REFERENCES public.quizzes(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    score INTEGER DEFAULT 0,
    max_score INTEGER DEFAULT 0,
    total_questions INTEGER DEFAULT 0,
    passed BOOLEAN DEFAULT false,
    time_taken INTEGER,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE public.user_quiz_responses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    attempt_id UUID NOT NULL REFERENCES public.quiz_attempts(id) ON DELETE CASCADE,
    question_id UUID NOT NULL REFERENCES public.quiz_questions(id) ON DELETE CASCADE,
    selected_answer_id UUID REFERENCES public.quiz_answers(id),
    text_response TEXT,
    is_correct BOOLEAN,
    points_earned INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Administration
CREATE TABLE public.admin_permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    resource VARCHAR(100) NOT NULL,
    action VARCHAR(50) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE public.admin_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    permissions UUID[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE public.admin_audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    action VARCHAR(100) NOT NULL,
    resource VARCHAR(500) NOT NULL,
    ip_address INET,
    user_agent TEXT,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    success BOOLEAN DEFAULT true,
    details JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Redirections de slugs
CREATE TABLE public.course_slug_redirects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    old_slug TEXT NOT NULL,
    new_slug TEXT NOT NULL,
    course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    hits INTEGER DEFAULT 0,
    last_hit_at TIMESTAMP WITH TIME ZONE,
    CONSTRAINT course_slug_redirects_unique UNIQUE (old_slug, course_id)
);

DO $$ BEGIN RAISE NOTICE '✅ Tables créées (20 tables)'; END $$;

-- ============================================================================
-- 4. INDEX DE PERFORMANCE
-- ============================================================================

-- profiles
CREATE INDEX idx_profiles_role ON public.profiles(role);
CREATE INDEX idx_profiles_email ON public.profiles(email);
CREATE INDEX idx_profiles_onboarding ON public.profiles(onboarding_completed) WHERE onboarding_completed = false;

-- courses
CREATE INDEX idx_courses_slug ON public.courses(slug);
CREATE INDEX idx_courses_category_id ON public.courses(category_id);
CREATE INDEX idx_courses_instructor_id ON public.courses(instructor_id);
CREATE INDEX idx_courses_is_published ON public.courses(is_published) WHERE is_published = true;
CREATE INDEX idx_courses_status ON public.courses(status);
CREATE INDEX idx_courses_level ON public.courses(level);
CREATE INDEX idx_courses_is_featured ON public.courses(is_featured) WHERE is_featured = true;
CREATE INDEX idx_courses_is_popular ON public.courses(is_popular) WHERE is_popular = true;
CREATE INDEX idx_courses_display_order ON public.courses(display_order);
CREATE INDEX idx_courses_created_at ON public.courses(created_at DESC);
CREATE INDEX idx_courses_updated_at ON public.courses(updated_at DESC);

-- lessons
CREATE INDEX idx_lessons_course_id ON public.lessons(course_id);
CREATE INDEX idx_lessons_order ON public.lessons(course_id, lesson_order);

-- enrollments
CREATE INDEX idx_enrollments_user_id ON public.enrollments(user_id);
CREATE INDEX idx_enrollments_course_id ON public.enrollments(course_id);
CREATE INDEX idx_enrollments_status ON public.enrollments(status);
CREATE INDEX idx_enrollments_user_status ON public.enrollments(user_id, status) WHERE status = 'active';
CREATE INDEX idx_enrollments_user_course ON public.enrollments(user_id, course_id);
CREATE INDEX idx_enrollments_updated_at ON public.enrollments(updated_at DESC);

-- user_progress
CREATE INDEX idx_user_progress_user_id ON public.user_progress(user_id);
CREATE INDEX idx_user_progress_course_id ON public.user_progress(course_id);
CREATE INDEX idx_user_progress_lesson_id ON public.user_progress(lesson_id);
CREATE INDEX idx_user_progress_user_course ON public.user_progress(user_id, course_id);
CREATE INDEX idx_user_progress_completed ON public.user_progress(user_id, is_completed) WHERE is_completed = true;

-- payments
CREATE INDEX idx_payments_user_id ON public.payments(user_id);
CREATE INDEX idx_payments_course_id ON public.payments(course_id);
CREATE INDEX idx_payments_status ON public.payments(status);
CREATE INDEX idx_payments_course_status ON public.payments(course_id, status) WHERE status = 'completed';

-- coupons
CREATE INDEX idx_coupons_code ON public.coupons(code);
CREATE INDEX idx_coupons_active ON public.coupons(is_active) WHERE is_active = true;
CREATE INDEX idx_coupon_usages_coupon ON public.coupon_usages(coupon_id);
CREATE INDEX idx_coupon_usages_user ON public.coupon_usages(user_id);

-- reviews
CREATE INDEX idx_course_reviews_course_id ON public.course_reviews(course_id);
CREATE INDEX idx_course_reviews_user_id ON public.course_reviews(user_id);

-- notifications
CREATE INDEX idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX idx_notifications_is_read ON public.notifications(is_read) WHERE is_read = false;

-- quizzes
CREATE INDEX idx_quizzes_course_id ON public.quizzes(course_id);
CREATE INDEX idx_quiz_questions_quiz_id ON public.quiz_questions(quiz_id);
CREATE INDEX idx_quiz_answers_question_id ON public.quiz_answers(question_id);
CREATE INDEX idx_quiz_attempts_user_id ON public.quiz_attempts(user_id);
CREATE INDEX idx_quiz_attempts_quiz_id ON public.quiz_attempts(quiz_id);
CREATE INDEX idx_quiz_attempts_user_quiz ON public.quiz_attempts(user_id, quiz_id);
CREATE INDEX idx_quiz_attempts_completed_at ON public.quiz_attempts(completed_at);

-- redirections
CREATE INDEX idx_redirects_old_slug ON public.course_slug_redirects(old_slug);
CREATE INDEX idx_redirects_course_id ON public.course_slug_redirects(course_id);

-- audit logs
CREATE INDEX idx_audit_logs_user_id ON public.admin_audit_logs(user_id);
CREATE INDEX idx_audit_logs_timestamp ON public.admin_audit_logs(timestamp DESC);

DO $$ BEGIN RAISE NOTICE '✅ Index créés'; END $$;

-- ============================================================================
-- 5. FONCTIONS
-- ============================================================================

-- Vérifier si un utilisateur est admin (SECURITY DEFINER pour bypass RLS)
CREATE OR REPLACE FUNCTION public.is_admin(check_user_id UUID DEFAULT NULL)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
DECLARE
    target_user_id UUID;
    user_role TEXT;
BEGIN
    target_user_id := COALESCE(check_user_id, auth.uid());
    IF target_user_id IS NULL THEN
        RETURN FALSE;
    END IF;

    SELECT role INTO user_role
    FROM public.profiles
    WHERE id = target_user_id;

    RETURN user_role = 'admin';
END;
$$;

-- Mettre à jour updated_at (utilisé par tous les triggers)
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

-- Générer un slug unique pour les cours
CREATE OR REPLACE FUNCTION public.generate_unique_slug(
    p_title TEXT,
    p_id UUID DEFAULT NULL,
    p_max_length INTEGER DEFAULT 60
)
RETURNS TEXT AS $$
DECLARE
    base_slug TEXT;
    final_slug TEXT;
    slug_exists BOOLEAN;
    counter INTEGER := 0;
    normalized_title TEXT;
BEGIN
    normalized_title := COALESCE(p_title, 'cours-sans-titre');

    BEGIN
        base_slug := LOWER(unaccent(normalized_title));
    EXCEPTION WHEN OTHERS THEN
        base_slug := LOWER(TRANSLATE(
            normalized_title,
            'àáâãäåèéêëìíîïòóôõöùúûüýÿñçÀÁÂÃÄÅÈÉÊËÌÍÎÏÒÓÔÕÖÙÚÛÜÝŸÑÇ',
            'aaaaaaeeeeiiiiooooouuuuyyncaaaaaaeeeeiiiiooooouuuuyync'
        ));
    END;

    base_slug := REGEXP_REPLACE(base_slug, '[^a-z0-9]+', '-', 'g');
    base_slug := TRIM(BOTH '-' FROM base_slug);

    IF LENGTH(base_slug) > p_max_length THEN
        base_slug := SUBSTRING(base_slug, 1, p_max_length);
        base_slug := REGEXP_REPLACE(base_slug, '-+$', '');
    END IF;

    IF base_slug = '' OR base_slug IS NULL THEN
        base_slug := 'cours';
    END IF;

    final_slug := base_slug;

    LOOP
        SELECT EXISTS(
            SELECT 1 FROM public.courses
            WHERE slug = final_slug
            AND (p_id IS NULL OR id != p_id)
        ) INTO slug_exists;

        EXIT WHEN NOT slug_exists OR counter >= 20;

        counter := counter + 1;
        final_slug := base_slug || '-' || counter;
    END LOOP;

    IF counter >= 20 THEN
        final_slug := base_slug || '-' || SUBSTRING(MD5(COALESCE(p_id::TEXT, random()::TEXT)), 1, 8);
    END IF;

    RETURN final_slug;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour générer le slug automatiquement
CREATE OR REPLACE FUNCTION public.set_course_slug()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.slug IS NULL OR NEW.slug = '' THEN
        NEW.slug := public.generate_unique_slug(NEW.title, NEW.id, 60);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$ BEGIN RAISE NOTICE '✅ Fonctions créées'; END $$;

-- ============================================================================
-- 6. TRIGGERS (tous utilisent handle_updated_at, pas de fonction dupliquée)
-- ============================================================================

CREATE TRIGGER trigger_set_course_slug
    BEFORE INSERT OR UPDATE ON public.courses
    FOR EACH ROW
    WHEN (NEW.slug IS NULL OR NEW.slug = '')
    EXECUTE FUNCTION public.set_course_slug();

CREATE TRIGGER set_updated_at_profiles
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_categories
    BEFORE UPDATE ON public.categories
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_courses
    BEFORE UPDATE ON public.courses
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_lessons
    BEFORE UPDATE ON public.lessons
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_enrollments
    BEFORE UPDATE ON public.enrollments
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_user_progress_updated_at
    BEFORE UPDATE ON public.user_progress
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_quizzes_updated_at
    BEFORE UPDATE ON public.quizzes
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_quiz_questions_updated_at
    BEFORE UPDATE ON public.quiz_questions
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_notifications_updated_at
    BEFORE UPDATE ON public.notifications
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_payments_updated_at
    BEFORE UPDATE ON public.payments
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_course_reviews_updated_at
    BEFORE UPDATE ON public.course_reviews
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER coupons_updated_at
    BEFORE UPDATE ON public.coupons
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_admin_roles
    BEFORE UPDATE ON public.admin_roles
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DO $$ BEGIN RAISE NOTICE '✅ Triggers créés (14 triggers)'; END $$;

-- ============================================================================
-- 7. POLITIQUES RLS (Row Level Security)
-- ============================================================================

-- === PROFILES ===
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles_select_own" ON public.profiles
    FOR SELECT TO authenticated USING (auth.uid() = id);

CREATE POLICY "profiles_update_own" ON public.profiles
    FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_insert_own" ON public.profiles
    FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_all_admin" ON public.profiles
    FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- === CATEGORIES ===
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "categories_select_public" ON public.categories
    FOR SELECT TO public USING (true);

CREATE POLICY "categories_all_admin" ON public.categories
    FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- === COURSES ===
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "courses_select_published" ON public.courses
    FOR SELECT TO public USING (is_published = true);

CREATE POLICY "courses_select_authenticated" ON public.courses
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "courses_insert_instructor" ON public.courses
    FOR INSERT TO authenticated
    WITH CHECK (
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('instructor', 'admin'))
    );

CREATE POLICY "courses_update_instructor" ON public.courses
    FOR UPDATE TO authenticated
    USING (
        instructor_id = auth.uid() OR
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
    )
    WITH CHECK (
        instructor_id = auth.uid() OR
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
    );

CREATE POLICY "courses_delete_admin" ON public.courses
    FOR DELETE TO authenticated USING (public.is_admin());

-- === LESSONS ===
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "lessons_select_public" ON public.lessons
    FOR SELECT TO public USING (true);

CREATE POLICY "lessons_all_admin" ON public.lessons
    FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "lessons_insert_instructor" ON public.lessons
    FOR INSERT TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.courses c
            WHERE c.id = course_id
            AND (c.instructor_id = auth.uid() OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'))
        )
    );

CREATE POLICY "lessons_update_instructor" ON public.lessons
    FOR UPDATE TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.courses c
            WHERE c.id = course_id
            AND (c.instructor_id = auth.uid() OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'))
        )
    );

CREATE POLICY "lessons_delete_instructor" ON public.lessons
    FOR DELETE TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.courses c
            WHERE c.id = course_id
            AND (c.instructor_id = auth.uid() OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'))
        )
    );

-- === ENROLLMENTS ===
ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "enrollments_select_own" ON public.enrollments
    FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "enrollments_insert_own" ON public.enrollments
    FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "enrollments_update_own" ON public.enrollments
    FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "enrollments_delete_own" ON public.enrollments
    FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "enrollments_all_admin" ON public.enrollments
    FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- === USER_PROGRESS ===
ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "user_progress_all_own" ON public.user_progress
    FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "user_progress_select_admin" ON public.user_progress
    FOR SELECT TO authenticated USING (public.is_admin());

-- === PAYMENTS ===
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "payments_select_own" ON public.payments
    FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "payments_insert_own" ON public.payments
    FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "payments_all_admin" ON public.payments
    FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- === COUPONS ===
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "coupons_select_active" ON public.coupons
    FOR SELECT TO authenticated USING (
        is_active = true
        AND (starts_at IS NULL OR starts_at <= NOW())
        AND (expires_at IS NULL OR expires_at > NOW())
    );

CREATE POLICY "coupons_all_admin" ON public.coupons
    FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- === COUPON_USAGES ===
ALTER TABLE public.coupon_usages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "coupon_usages_select_own" ON public.coupon_usages
    FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "coupon_usages_insert_own" ON public.coupon_usages
    FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "coupon_usages_all_admin" ON public.coupon_usages
    FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- === COURSE_REVIEWS ===
ALTER TABLE public.course_reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "reviews_select_public" ON public.course_reviews
    FOR SELECT TO public USING (true);

CREATE POLICY "reviews_insert_own" ON public.course_reviews
    FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "reviews_update_own" ON public.course_reviews
    FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "reviews_delete_admin" ON public.course_reviews
    FOR DELETE TO authenticated USING (public.is_admin());

-- === NOTIFICATIONS ===
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "notifications_select_own" ON public.notifications
    FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "notifications_update_own" ON public.notifications
    FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "notifications_all_admin" ON public.notifications
    FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- === QUIZZES (questions et réponses lisibles uniquement par les utilisateurs connectés) ===
ALTER TABLE public.quizzes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "quizzes_select_public" ON public.quizzes FOR SELECT TO public USING (true);
CREATE POLICY "quizzes_all_admin" ON public.quizzes FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

ALTER TABLE public.quiz_questions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "quiz_questions_select_authenticated" ON public.quiz_questions FOR SELECT TO authenticated USING (true);
CREATE POLICY "quiz_questions_all_admin" ON public.quiz_questions FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- SÉCURITÉ : quiz_answers n'est PAS public - seuls les utilisateurs connectés peuvent voir les réponses
-- Cela empêche les bots/anonymes de scraper les réponses correctes
ALTER TABLE public.quiz_answers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "quiz_answers_select_authenticated" ON public.quiz_answers FOR SELECT TO authenticated USING (true);
CREATE POLICY "quiz_answers_all_admin" ON public.quiz_answers FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

ALTER TABLE public.quiz_attempts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "quiz_attempts_select_own" ON public.quiz_attempts FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "quiz_attempts_insert_own" ON public.quiz_attempts FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "quiz_attempts_select_admin" ON public.quiz_attempts FOR SELECT TO authenticated USING (public.is_admin());

ALTER TABLE public.user_quiz_responses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "quiz_responses_all_own" ON public.user_quiz_responses
    FOR ALL TO authenticated
    USING (EXISTS (SELECT 1 FROM public.quiz_attempts WHERE id = attempt_id AND user_id = auth.uid()))
    WITH CHECK (EXISTS (SELECT 1 FROM public.quiz_attempts WHERE id = attempt_id AND user_id = auth.uid()));

-- === ADMIN TABLES ===
ALTER TABLE public.admin_audit_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "audit_logs_select_admin" ON public.admin_audit_logs FOR SELECT TO authenticated USING (public.is_admin());
CREATE POLICY "audit_logs_insert_admin" ON public.admin_audit_logs FOR INSERT TO authenticated WITH CHECK (public.is_admin());

ALTER TABLE public.admin_permissions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "permissions_select_admin" ON public.admin_permissions FOR SELECT TO authenticated USING (public.is_admin());

ALTER TABLE public.admin_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "roles_select_admin" ON public.admin_roles FOR SELECT TO authenticated USING (public.is_admin());
CREATE POLICY "roles_all_admin" ON public.admin_roles FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- === REDIRECTIONS ===
ALTER TABLE public.course_slug_redirects ENABLE ROW LEVEL SECURITY;
CREATE POLICY "redirects_select_public" ON public.course_slug_redirects FOR SELECT TO public USING (true);
CREATE POLICY "redirects_all_admin" ON public.course_slug_redirects FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

DO $$ BEGIN RAISE NOTICE '✅ Politiques RLS créées'; END $$;

-- ============================================================================
-- 8. STORAGE BUCKETS + POLICIES
-- ============================================================================

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('course-videos', 'course-videos', false, 1073741824, ARRAY['video/mp4', 'video/webm', 'video/ogg'])
ON CONFLICT (id) DO UPDATE SET file_size_limit = EXCLUDED.file_size_limit, allowed_mime_types = EXCLUDED.allowed_mime_types;

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('avatars', 'avatars', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif'])
ON CONFLICT (id) DO UPDATE SET file_size_limit = EXCLUDED.file_size_limit, allowed_mime_types = EXCLUDED.allowed_mime_types;

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('course-images', 'course-images', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif'])
ON CONFLICT (id) DO UPDATE SET file_size_limit = EXCLUDED.file_size_limit, allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Storage policies : avatars (public bucket)
CREATE POLICY "avatars_select_public" ON storage.objects
    FOR SELECT TO public USING (bucket_id = 'avatars');

CREATE POLICY "avatars_insert_authenticated" ON storage.objects
    FOR INSERT TO authenticated WITH CHECK (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::TEXT);

CREATE POLICY "avatars_update_own" ON storage.objects
    FOR UPDATE TO authenticated USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::TEXT);

CREATE POLICY "avatars_delete_own" ON storage.objects
    FOR DELETE TO authenticated USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::TEXT);

-- Storage policies : course-images (public bucket)
CREATE POLICY "course_images_select_public" ON storage.objects
    FOR SELECT TO public USING (bucket_id = 'course-images');

CREATE POLICY "course_images_insert_admin" ON storage.objects
    FOR INSERT TO authenticated WITH CHECK (bucket_id = 'course-images' AND public.is_admin());

CREATE POLICY "course_images_update_admin" ON storage.objects
    FOR UPDATE TO authenticated USING (bucket_id = 'course-images' AND public.is_admin());

CREATE POLICY "course_images_delete_admin" ON storage.objects
    FOR DELETE TO authenticated USING (bucket_id = 'course-images' AND public.is_admin());

-- Storage policies : course-videos (private bucket)
CREATE POLICY "course_videos_select_authenticated" ON storage.objects
    FOR SELECT TO authenticated USING (bucket_id = 'course-videos');

CREATE POLICY "course_videos_insert_admin" ON storage.objects
    FOR INSERT TO authenticated WITH CHECK (bucket_id = 'course-videos' AND public.is_admin());

CREATE POLICY "course_videos_update_admin" ON storage.objects
    FOR UPDATE TO authenticated USING (bucket_id = 'course-videos' AND public.is_admin());

CREATE POLICY "course_videos_delete_admin" ON storage.objects
    FOR DELETE TO authenticated USING (bucket_id = 'course-videos' AND public.is_admin());

DO $$ BEGIN RAISE NOTICE '✅ Storage configuré avec policies'; END $$;

-- ============================================================================
-- 9. DONNÉES INITIALES
-- ============================================================================

-- Permissions admin
INSERT INTO public.admin_permissions (name, description, resource, action)
VALUES
    ('users.read', 'Lire les informations des utilisateurs', 'users', 'read'),
    ('users.write', 'Modifier les informations des utilisateurs', 'users', 'write'),
    ('users.delete', 'Supprimer des utilisateurs', 'users', 'delete'),
    ('courses.manage', 'Gérer tous les cours', 'courses', 'manage'),
    ('system.monitor', 'Accéder au monitoring système', 'system', 'monitor'),
    ('logs.view', 'Voir les logs d''audit', 'logs', 'view'),
    ('roles.manage', 'Gérer les rôles et permissions', 'roles', 'manage')
ON CONFLICT (name) DO NOTHING;

-- Rôles admin
DO $$
DECLARE
    all_perms UUID[];
    standard_perms UUID[];
BEGIN
    SELECT array_agg(id) INTO all_perms FROM public.admin_permissions;
    SELECT array_agg(id) INTO standard_perms FROM public.admin_permissions
        WHERE name IN ('users.read', 'users.write', 'courses.manage', 'logs.view');

    INSERT INTO public.admin_roles (name, description, permissions)
    VALUES ('super_admin', 'Administrateur avec tous les droits', all_perms)
    ON CONFLICT (name) DO UPDATE SET permissions = EXCLUDED.permissions;

    INSERT INTO public.admin_roles (name, description, permissions)
    VALUES ('admin', 'Administrateur standard', standard_perms)
    ON CONFLICT (name) DO UPDATE SET permissions = EXCLUDED.permissions;
END $$;

-- Catégories par défaut
INSERT INTO public.categories (name, description, slug) VALUES
    ('Développement Web', 'Apprenez à créer des sites et applications web modernes', 'developpement-web'),
    ('Marketing Digital', 'Maîtrisez les stratégies de marketing en ligne', 'marketing-digital'),
    ('Design', 'Créez des designs visuels attrayants', 'design'),
    ('Business', 'Développez vos compétences entrepreneuriales', 'business'),
    ('Data Science', 'Analysez et interprétez les données', 'data-science')
ON CONFLICT (slug) DO NOTHING;

DO $$ BEGIN RAISE NOTICE '✅ Données initiales créées'; END $$;

-- ============================================================================
-- 10. CRÉER LE PROFIL ADMIN
-- ============================================================================

DO $$
DECLARE
    admin_user_id UUID;
    admin_email TEXT := 'abdoudiack0996@icloud.com';
BEGIN
    SELECT id INTO admin_user_id FROM auth.users WHERE email = admin_email;

    IF admin_user_id IS NOT NULL THEN
        INSERT INTO public.profiles (id, email, role, first_name, last_name)
        VALUES (admin_user_id, admin_email, 'admin', 'Admin', 'Waraba')
        ON CONFLICT (id) DO UPDATE SET
            role = 'admin',
            updated_at = NOW();

        RAISE NOTICE '✅ Profil admin créé/mis à jour pour: %', admin_email;
    ELSE
        RAISE WARNING '⚠️ Utilisateur % non trouvé dans auth.users. Créez d''abord le compte.', admin_email;
    END IF;
END $$;

-- ============================================================================
-- 11. VÉRIFICATION FINALE
-- ============================================================================

DO $$
DECLARE
    tables_count INTEGER;
    policies_count INTEGER;
    indexes_count INTEGER;
    triggers_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO tables_count FROM information_schema.tables
        WHERE table_schema = 'public' AND table_type = 'BASE TABLE';

    SELECT COUNT(*) INTO policies_count FROM pg_policies WHERE schemaname IN ('public', 'storage');

    SELECT COUNT(*) INTO indexes_count FROM pg_indexes WHERE schemaname = 'public';

    SELECT COUNT(*) INTO triggers_count FROM information_schema.triggers
        WHERE trigger_schema = 'public';

    RAISE NOTICE '';
    RAISE NOTICE '═══════════════════════════════════════════════════════════';
    RAISE NOTICE '       WARABA ACADEMY - INSTALLATION TERMINÉE v5.0        ';
    RAISE NOTICE '═══════════════════════════════════════════════════════════';
    RAISE NOTICE '   Tables: %  |  RLS policies: %', tables_count, policies_count;
    RAISE NOTICE '   Index: %   |  Triggers: %', indexes_count, triggers_count;
    RAISE NOTICE '═══════════════════════════════════════════════════════════';
    RAISE NOTICE '';
    RAISE NOTICE '⚠️  Pour les futures mises à jour, utilisez les migrations';
    RAISE NOTICE '   dans supabase/migrations/0XX_*.sql';
    RAISE NOTICE '   NE RELANCEZ PAS ce fichier !';
    RAISE NOTICE '';
END $$;

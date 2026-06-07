-- ============================================================================
-- MIGRATION: Ajout de la table lessons
-- ============================================================================
-- Cette migration ajoute la table des leçons pour les cours
-- À exécuter dans Supabase SQL Editor
-- ============================================================================

-- Supprimer la table si elle existe avec l'ancien schéma
DROP TABLE IF EXISTS public.lessons CASCADE;

-- Créer la table lessons
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

-- Index pour les performances
CREATE INDEX idx_lessons_course_id ON public.lessons(course_id);
CREATE INDEX idx_lessons_order ON public.lessons(course_id, lesson_order);

-- Trigger pour updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS set_updated_at_lessons ON public.lessons;
CREATE TRIGGER set_updated_at_lessons
    BEFORE UPDATE ON public.lessons
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Activer RLS
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;

-- Supprimer les anciennes politiques si elles existent
DROP POLICY IF EXISTS "lessons_select_public" ON public.lessons;
DROP POLICY IF EXISTS "lessons_all_admin" ON public.lessons;
DROP POLICY IF EXISTS "lessons_insert_instructor" ON public.lessons;
DROP POLICY IF EXISTS "lessons_update_instructor" ON public.lessons;
DROP POLICY IF EXISTS "lessons_delete_instructor" ON public.lessons;

-- Politiques RLS
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

-- Vérification
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'lessons' AND table_schema = 'public') THEN
        RAISE NOTICE '✅ Table lessons créée avec succès';
    ELSE
        RAISE EXCEPTION '❌ Erreur: table lessons non créée';
    END IF;
END $$;

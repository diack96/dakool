-- ─── Migration 051 : Parcours d'apprentissage ──────────────────────────────
-- Tables: learning_paths, learning_path_courses, user_learning_path_progress

-- ─── 1. Table principale des parcours ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.learning_paths (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title         VARCHAR(255) NOT NULL,
  slug          VARCHAR(255) UNIQUE NOT NULL,
  description   TEXT,
  short_description VARCHAR(500),
  thumbnail     TEXT,
  level         VARCHAR(50) DEFAULT 'all' CHECK (level IN ('all', 'beginner', 'intermediate', 'advanced')),
  status        VARCHAR(20) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  is_featured   BOOLEAN DEFAULT false,
  estimated_duration INT DEFAULT 0, -- en minutes, calculé à partir des cours
  created_by    UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ─── 2. Table de liaison parcours ↔ cours (many-to-many) ───────────────────
CREATE TABLE IF NOT EXISTS public.learning_path_courses (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  learning_path_id  UUID NOT NULL REFERENCES public.learning_paths(id) ON DELETE CASCADE,
  course_id         UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  course_order      INT NOT NULL DEFAULT 0,
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(learning_path_id, course_id)
);

-- ─── 3. Progression utilisateur dans un parcours ──────────────────────────
CREATE TABLE IF NOT EXISTS public.user_learning_path_progress (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id              UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  learning_path_id     UUID NOT NULL REFERENCES public.learning_paths(id) ON DELETE CASCADE,
  progress_percentage  INT DEFAULT 0 CHECK (progress_percentage BETWEEN 0 AND 100),
  started_at           TIMESTAMPTZ DEFAULT NOW(),
  completed_at         TIMESTAMPTZ,
  created_at           TIMESTAMPTZ DEFAULT NOW(),
  updated_at           TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, learning_path_id)
);

-- ─── 4. Index ──────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_learning_paths_status
  ON public.learning_paths (status);

CREATE INDEX IF NOT EXISTS idx_learning_paths_slug
  ON public.learning_paths (slug);

CREATE INDEX IF NOT EXISTS idx_lp_courses_path
  ON public.learning_path_courses (learning_path_id, course_order);

CREATE INDEX IF NOT EXISTS idx_lp_courses_course
  ON public.learning_path_courses (course_id);

CREATE INDEX IF NOT EXISTS idx_user_lp_progress_user
  ON public.user_learning_path_progress (user_id);

-- ─── 5. RLS ────────────────────────────────────────────────────────────────
ALTER TABLE public.learning_paths ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_path_courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_learning_path_progress ENABLE ROW LEVEL SECURITY;

-- Lecture publique des parcours publiés
CREATE POLICY "lp_public_read"
  ON public.learning_paths FOR SELECT
  USING (status = 'published');

-- Admin : lecture/écriture totale
CREATE POLICY "lp_admin_all"
  ON public.learning_paths FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Lecture publique des cours dans un parcours publié
CREATE POLICY "lp_courses_public_read"
  ON public.learning_path_courses FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.learning_paths lp
      WHERE lp.id = learning_path_id AND lp.status = 'published'
    )
  );

-- Admin : gestion des cours dans les parcours
CREATE POLICY "lp_courses_admin_all"
  ON public.learning_path_courses FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Utilisateur : lecture de sa propre progression
CREATE POLICY "user_lp_progress_read_own"
  ON public.user_learning_path_progress FOR SELECT
  USING (user_id = auth.uid());

-- Utilisateur : écriture de sa propre progression
CREATE POLICY "user_lp_progress_write_own"
  ON public.user_learning_path_progress FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "user_lp_progress_update_own"
  ON public.user_learning_path_progress FOR UPDATE
  USING (user_id = auth.uid());

-- Admin : lecture totale des progressions
CREATE POLICY "user_lp_progress_admin_read"
  ON public.user_learning_path_progress FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ─── 6. Trigger updated_at ─────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION update_learning_path_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_learning_paths_updated_at
  BEFORE UPDATE ON public.learning_paths
  FOR EACH ROW EXECUTE FUNCTION update_learning_path_updated_at();

CREATE TRIGGER trg_user_lp_progress_updated_at
  BEFORE UPDATE ON public.user_learning_path_progress
  FOR EACH ROW EXECUTE FUNCTION update_learning_path_updated_at();

DO $$ BEGIN
  RAISE NOTICE '✅ Migration 051: learning_paths, learning_path_courses, user_learning_path_progress créées';
END $$;

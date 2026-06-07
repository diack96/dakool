-- Migration 049: Système de gamification
-- Tables: badges, user_badges
-- Colonnes ajoutées à profiles: xp_total, current_streak, longest_streak, last_activity_date, lessons_completed
-- Fonctions: increment_user_xp(), update_user_streak()

-- ─── 1. Nouvelles colonnes sur profiles ──────────────────────────────────────
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS xp_total          INT  NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS current_streak    INT  NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS longest_streak    INT  NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS last_activity_date DATE,
  ADD COLUMN IF NOT EXISTS lessons_completed  INT  NOT NULL DEFAULT 0;

-- ─── 2. Table badges ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.badges (
  id             UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
  slug           TEXT    UNIQUE NOT NULL,
  name           TEXT    NOT NULL,
  description    TEXT    NOT NULL,
  icon           TEXT    NOT NULL,  -- emoji
  xp_reward      INT     NOT NULL DEFAULT 0,
  condition_type TEXT    NOT NULL,  -- 'lessons_completed' | 'courses_completed' | 'streak_reached' | 'xp_reached' | 'courses_started' | 'progress_reached'
  condition_value INT    NOT NULL,
  created_at     TIMESTAMPTZ DEFAULT NOW()
);

-- ─── 3. Table user_badges ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.user_badges (
  id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id   UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  badge_id  UUID NOT NULL REFERENCES public.badges(id)   ON DELETE CASCADE,
  earned_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, badge_id)
);

-- ─── 4. RLS ──────────────────────────────────────────────────────────────────
ALTER TABLE public.badges      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename='badges' AND policyname='badges_public_read'
  ) THEN
    CREATE POLICY "badges_public_read"
      ON public.badges FOR SELECT USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename='user_badges' AND policyname='user_badges_own_read'
  ) THEN
    CREATE POLICY "user_badges_own_read"
      ON public.user_badges FOR SELECT USING (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename='user_badges' AND policyname='user_badges_service_write'
  ) THEN
    CREATE POLICY "user_badges_service_write"
      ON public.user_badges FOR INSERT WITH CHECK (true);
  END IF;
END $$;

-- ─── 5. Seed badges ──────────────────────────────────────────────────────────
INSERT INTO public.badges (slug, name, description, icon, xp_reward, condition_type, condition_value) VALUES
  ('first_step',  'Premier pas',   'Complétez votre première leçon',                  '🎯', 10,  'lessons_completed', 1),
  ('halfway',     'Mi-chemin',     'Atteignez 50% de progression dans un cours',       '⚡', 20,  'progress_reached',  50),
  ('graduate',    'Diplômé',       'Terminez votre premier cours',                     '🎓', 100, 'courses_completed', 1),
  ('streak_7',    'Assidu',        '7 jours consécutifs d''apprentissage',             '🔥', 50,  'streak_reached',    7),
  ('explorer',    'Explorateur',   'Commencez 3 cours différents',                     '🧭', 30,  'courses_started',   3),
  ('scholar',     'Érudit',        'Atteignez 500 XP',                                 '⭐', 50,  'xp_reached',        500)
ON CONFLICT (slug) DO NOTHING;

-- ─── 6. Fonction: incrémenter XP + leçons complétées (atomique) ───────────────
CREATE OR REPLACE FUNCTION public.increment_user_xp(p_user_id UUID, p_xp INT)
RETURNS VOID
LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  UPDATE public.profiles
  SET
    xp_total         = xp_total + p_xp,
    lessons_completed = lessons_completed + 1,
    updated_at       = NOW()
  WHERE id = p_user_id;
END;
$$;

-- ─── 7. Fonction: mise à jour du streak ──────────────────────────────────────
CREATE OR REPLACE FUNCTION public.update_user_streak(p_user_id UUID)
RETURNS VOID
LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_last_date DATE;
  v_today     DATE := CURRENT_DATE;
  v_streak    INT;
BEGIN
  SELECT last_activity_date, current_streak
  INTO v_last_date, v_streak
  FROM public.profiles
  WHERE id = p_user_id;

  IF v_last_date IS NULL OR v_last_date < v_today - INTERVAL '1 day' THEN
    -- Première activité ou streak cassé → reset à 1
    UPDATE public.profiles SET
      current_streak     = 1,
      last_activity_date = v_today,
      updated_at         = NOW()
    WHERE id = p_user_id;

  ELSIF v_last_date = v_today - INTERVAL '1 day' THEN
    -- Jour consécutif → incrémenter
    UPDATE public.profiles SET
      current_streak     = current_streak + 1,
      longest_streak     = GREATEST(longest_streak, current_streak + 1),
      last_activity_date = v_today,
      updated_at         = NOW()
    WHERE id = p_user_id;

  END IF;
  -- Si v_last_date = v_today : déjà actif aujourd'hui, rien à faire
END;
$$;

-- ─── 8. Index ─────────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_user_badges_user_id ON public.user_badges (user_id);
CREATE INDEX IF NOT EXISTS idx_user_badges_badge_id ON public.user_badges (badge_id);

-- ─── Vérification ─────────────────────────────────────────────────────────────
DO $$
BEGIN
  RAISE NOTICE '✅ Migration 049: colonnes gamification ajoutées à profiles';
  RAISE NOTICE '✅ Migration 049: table badges créée et seedée (6 badges)';
  RAISE NOTICE '✅ Migration 049: table user_badges créée';
  RAISE NOTICE '✅ Migration 049: fonctions increment_user_xp() et update_user_streak() créées';
END $$;

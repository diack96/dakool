-- Assure que la colonne video_preview existe dans courses
-- Safe: vérifie avant d'ajouter

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name   = 'courses'
      AND column_name  = 'video_preview'
  ) THEN
    ALTER TABLE public.courses ADD COLUMN video_preview TEXT;
    COMMENT ON COLUMN public.courses.video_preview IS 'URL de la vidéo de prévisualisation du cours';
  END IF;
END;
$$;

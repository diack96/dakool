-- Migration 050: Ressources de cours
-- Table course_resources : liens et fichiers attachés à un cours
-- Accessibles aux étudiants inscrits depuis la page d'apprentissage

-- ─── 1. Table ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.course_resources (
  id          uuid        NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  course_id   uuid        NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  title       text        NOT NULL CHECK (char_length(title) BETWEEN 1 AND 200),
  type        text        NOT NULL CHECK (type IN ('file', 'link')),
  url         text        NOT NULL CHECK (char_length(url) > 0),
  file_name   text,
  file_size   bigint,
  mime_type   text,
  "order"     int         NOT NULL DEFAULT 0,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

-- ─── 2. Index ─────────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_course_resources_course_id
  ON public.course_resources (course_id, "order");

-- ─── 3. RLS ───────────────────────────────────────────────────────────────────
ALTER TABLE public.course_resources ENABLE ROW LEVEL SECURITY;

-- Les étudiants actifs peuvent lire les ressources de leurs cours
CREATE POLICY "students_read_course_resources"
  ON public.course_resources
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.enrollments
      WHERE enrollments.course_id = course_resources.course_id
        AND enrollments.user_id   = auth.uid()
        AND enrollments.status    = 'active'
    )
  );

-- ─── 4. Supabase Storage bucket ───────────────────────────────────────────────
-- Bucket public pour les fichiers de ressources (PDFs, ZIPs, etc.)
-- À créer manuellement dans le dashboard Supabase si ce SQL ne suffit pas.
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'course-resources',
  'course-resources',
  true,
  20971520,  -- 20 MB max
  ARRAY[
    'application/pdf',
    'application/zip',
    'application/x-zip-compressed',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'text/plain',
    'text/csv'
  ]
)
ON CONFLICT (id) DO NOTHING;

-- Policy storage : seuls les admins peuvent uploader (service role bypasse RLS)
CREATE POLICY "admin_upload_course_resources"
  ON storage.objects
  FOR INSERT
  WITH CHECK (bucket_id = 'course-resources');

CREATE POLICY "public_read_course_resources"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'course-resources');

CREATE POLICY "admin_delete_course_resources"
  ON storage.objects
  FOR DELETE
  USING (bucket_id = 'course-resources');

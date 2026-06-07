-- Migration 022: Certificates table, RLS, storage, indexes
-- Safe to re-run (idempotent with IF NOT EXISTS)

-- 1. Create certificates table
CREATE TABLE IF NOT EXISTS certificates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  certificate_number TEXT UNIQUE NOT NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  enrollment_id UUID REFERENCES enrollments(id) ON DELETE SET NULL,
  issued_at TIMESTAMPTZ DEFAULT NOW(),
  grade INTEGER DEFAULT 100,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'revoked')),
  verification_token TEXT UNIQUE NOT NULL,
  pdf_storage_path TEXT,
  student_name TEXT,
  course_title TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, course_id)
);

-- 2. Indexes
CREATE INDEX IF NOT EXISTS idx_certificates_user_id ON certificates(user_id);
CREATE INDEX IF NOT EXISTS idx_certificates_course_id ON certificates(course_id);
CREATE INDEX IF NOT EXISTS idx_certificates_verification_token ON certificates(verification_token);
CREATE INDEX IF NOT EXISTS idx_certificates_certificate_number ON certificates(certificate_number);

-- 3. Enable RLS
ALTER TABLE certificates ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policies
DO $$
BEGIN
  -- Users can read their own certificates
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'certificates' AND policyname = 'certificates_select_own'
  ) THEN
    CREATE POLICY certificates_select_own ON certificates
      FOR SELECT USING (auth.uid() = user_id);
  END IF;

  -- Public can read active certificates by verification_token (for verification page)
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'certificates' AND policyname = 'certificates_select_verify'
  ) THEN
    CREATE POLICY certificates_select_verify ON certificates
      FOR SELECT USING (status = 'active');
  END IF;

  -- Service role handles INSERT/UPDATE/DELETE (no user-facing write policies needed)
END $$;

-- 5. Storage bucket for certificate PDFs
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'certificates',
  'certificates',
  false,
  5242880, -- 5MB
  ARRAY['application/pdf']
)
ON CONFLICT (id) DO NOTHING;

-- 6. Storage policies
DO $$
BEGIN
  -- Authenticated users can read their own certificate PDFs
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND policyname = 'certificates_storage_select'
  ) THEN
    CREATE POLICY certificates_storage_select ON storage.objects
      FOR SELECT USING (
        bucket_id = 'certificates'
        AND auth.role() = 'authenticated'
        AND (storage.foldername(name))[1] = auth.uid()::text
      );
  END IF;

  -- Service role handles uploads (no insert policy needed for regular users)
END $$;

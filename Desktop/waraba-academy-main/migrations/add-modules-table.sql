-- Migration : table modules + module_id dans lessons

-- 1. Table modules
CREATE TABLE IF NOT EXISTS modules (
  id          UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id   UUID         NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  title       VARCHAR(200) NOT NULL,
  description TEXT         NOT NULL DEFAULT '',
  "order"     INTEGER      NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- 2. Index
CREATE INDEX IF NOT EXISTS idx_modules_course_id ON modules(course_id);
CREATE INDEX IF NOT EXISTS idx_modules_course_order ON modules(course_id, "order");

-- 3. Colonne module_id dans lessons
ALTER TABLE lessons ADD COLUMN IF NOT EXISTS module_id UUID REFERENCES modules(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_lessons_module_id ON lessons(module_id);

-- 4. Trigger updated_at
CREATE OR REPLACE FUNCTION update_modules_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_modules_updated_at ON modules;
CREATE TRIGGER trigger_modules_updated_at
  BEFORE UPDATE ON modules
  FOR EACH ROW EXECUTE FUNCTION update_modules_updated_at();

-- 5. RLS
ALTER TABLE modules ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "modules_select_published" ON modules;
CREATE POLICY "modules_select_published" ON modules FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM courses c WHERE c.id = modules.course_id AND c.is_published = true
  ));

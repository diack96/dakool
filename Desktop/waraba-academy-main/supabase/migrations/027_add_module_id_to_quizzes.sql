-- Add module_id to quizzes to support per-module quizzes
ALTER TABLE public.quizzes
  ADD COLUMN IF NOT EXISTS module_id UUID REFERENCES public.modules(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_quizzes_module_id ON public.quizzes(module_id);

COMMENT ON COLUMN public.quizzes.module_id IS
  'When set, this quiz is associated with a specific module (module quiz). NULL means course-level quiz.';

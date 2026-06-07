-- ============================================================================
-- Migration 034: Index manquants critiques
-- ============================================================================
-- CONTEXTE :
--   L'audit a identifié plusieurs index absents qui causent des seq scans
--   sur des colonnes fréquemment utilisées en filtre ou en JOIN.
--   Tous les CREATE INDEX sont idempotents (IF NOT EXISTS).
--
-- IMPACT ATTENDU :
--   - "Mes cours" instructeur : seq scan → index scan (instructor_id)
--   - Recherche full-text cours : seq scan → GIN index
--   - Progression dashboard : agrégation optimisée (user_progress)
--   - Certificats utilisateur : index scan (certificates.user_id)
-- ============================================================================

-- ─── 1. TABLE courses ────────────────────────────────────────────────────────

-- instructor_id : requête "tous les cours d'un instructeur" — actuellement seq scan
CREATE INDEX IF NOT EXISTS idx_courses_instructor_id
    ON public.courses(instructor_id);

-- Index GIN pour la recherche full-text en français
-- Couvre title + description + short_description
CREATE INDEX IF NOT EXISTS idx_courses_fts_french
    ON public.courses
    USING gin(
        to_tsvector(
            'french',
            coalesce(title, '') || ' ' ||
            coalesce(short_description, '') || ' ' ||
            coalesce(description, '')
        )
    );

-- updated_at DESC : pagination admin "cours récemment modifiés"
CREATE INDEX IF NOT EXISTS idx_courses_updated_at
    ON public.courses(updated_at DESC);

-- ─── 2. TABLE lessons ────────────────────────────────────────────────────────

-- module_id : requête "toutes les leçons d'un module" — actuellement seq scan
CREATE INDEX IF NOT EXISTS idx_lessons_module_id
    ON public.lessons(module_id)
    WHERE module_id IS NOT NULL;

-- ─── 3. TABLE enrollments ────────────────────────────────────────────────────

-- course_id seul : requête "tous les inscrits à un cours" (admin, stats)
CREATE INDEX IF NOT EXISTS idx_enrollments_course_id
    ON public.enrollments(course_id);

-- ─── 4. TABLE user_progress ──────────────────────────────────────────────────

-- (user_id, is_completed) : dashboard progression par utilisateur
CREATE INDEX IF NOT EXISTS idx_user_progress_user_completed
    ON public.user_progress(user_id, is_completed);

-- updated_at : activité récente d'un utilisateur
CREATE INDEX IF NOT EXISTS idx_user_progress_updated_at
    ON public.user_progress(updated_at DESC);

-- ─── 5. TABLE certificates ───────────────────────────────────────────────────

-- user_id : "tous les certificats d'un utilisateur"
CREATE INDEX IF NOT EXISTS idx_certificates_user_id
    ON public.certificates(user_id);

-- course_id : vérification "certificat déjà émis pour ce cours"
CREATE INDEX IF NOT EXISTS idx_certificates_course_id
    ON public.certificates(course_id);

-- ─── 6. TABLE quiz_attempts ──────────────────────────────────────────────────

-- completed_at : filtrer les tentatives terminées
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_completed_at
    ON public.quiz_attempts(completed_at DESC)
    WHERE completed_at IS NOT NULL;

-- (user_id, quiz_id) composite : "mes tentatives pour ce quiz"
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_user_quiz
    ON public.quiz_attempts(user_id, quiz_id);

-- ─── 7. TABLE notifications ──────────────────────────────────────────────────

-- (user_id, created_at DESC) : notifications récentes d'un utilisateur
CREATE INDEX IF NOT EXISTS idx_notifications_user_created_at
    ON public.notifications(user_id, created_at DESC);

-- ─── 8. TABLE course_reviews ─────────────────────────────────────────────────

-- (course_id, rating) : calcul de note moyenne par cours
CREATE INDEX IF NOT EXISTS idx_course_reviews_course_rating
    ON public.course_reviews(course_id, rating);

-- ─── 9. TABLE payments ───────────────────────────────────────────────────────

-- course_id seul : vérification de paiement pour un cours donné
CREATE INDEX IF NOT EXISTS idx_payments_course_id
    ON public.payments(course_id);

-- ─── 10. TABLE admin_audit_logs ──────────────────────────────────────────────

-- resource : filtrer les logs par ressource (ex: 'courses', 'users')
CREATE INDEX IF NOT EXISTS idx_admin_audit_logs_resource
    ON public.admin_audit_logs(resource);

-- (user_id, timestamp DESC) : historique des actions d'un admin
CREATE INDEX IF NOT EXISTS idx_admin_audit_logs_user_timestamp
    ON public.admin_audit_logs(user_id, timestamp DESC)
    WHERE user_id IS NOT NULL;

-- ─── 11. TABLE modules ───────────────────────────────────────────────────────

-- (course_id, order) : ordre des modules dans un cours
CREATE INDEX IF NOT EXISTS idx_modules_course_order
    ON public.modules(course_id, "order");

-- Vérification du nombre d'index créés
DO $$
DECLARE
    idx_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO idx_count
    FROM pg_indexes
    WHERE schemaname = 'public'
      AND indexname IN (
          'idx_courses_instructor_id',
          'idx_courses_fts_french',
          'idx_lessons_module_id',
          'idx_enrollments_course_id',
          'idx_certificates_user_id',
          'idx_quiz_attempts_completed_at',
          'idx_notifications_user_created_at'
      );

    RAISE NOTICE '✅ Migration 034 : % index critiques vérifiés/créés', idx_count;
END $$;

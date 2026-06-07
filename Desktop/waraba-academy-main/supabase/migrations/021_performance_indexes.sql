-- Migration 021: Add missing database indexes for query performance
-- Safe: CREATE INDEX IF NOT EXISTS is idempotent

-- Profiles table: filtered by role in admin users list
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);

-- Courses table: filtered/sorted in multiple admin and public endpoints
CREATE INDEX IF NOT EXISTS idx_courses_status ON courses(status);
CREATE INDEX IF NOT EXISTS idx_courses_is_published ON courses(is_published);
CREATE INDEX IF NOT EXISTS idx_courses_category_id ON courses(category_id);
CREATE INDEX IF NOT EXISTS idx_courses_level ON courses(level);
CREATE INDEX IF NOT EXISTS idx_courses_created_at ON courses(created_at DESC);

-- Enrollments table: frequently queried by user+course and status
CREATE INDEX IF NOT EXISTS idx_enrollments_user_course ON enrollments(user_id, course_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_status ON enrollments(status);
CREATE INDEX IF NOT EXISTS idx_enrollments_user_status ON enrollments(user_id, status);

-- Payments table: filtered by status and user in finances/payments APIs
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_created_at ON payments(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_payments_user_status ON payments(user_id, status);

-- Lessons table: queried by course_id for lesson counts
CREATE INDEX IF NOT EXISTS idx_lessons_course_id ON lessons(course_id);

-- Quiz tables: queried by course and user
CREATE INDEX IF NOT EXISTS idx_quizzes_course_id ON quizzes(course_id);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_user_id ON quiz_attempts(user_id);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_quiz_id ON quiz_attempts(quiz_id);

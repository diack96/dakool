-- ============================================================================
-- Migration 026: Enable RLS on backup_course_slugs
-- SECURITY FIX: Table was public without RLS enabled (exposed to PostgREST).
-- This is an internal backup table not accessed by the application.
-- Enabling RLS with no policies blocks all client access.
-- Only the service_role (which bypasses RLS) can read/write this table.
-- ============================================================================

ALTER TABLE public.backup_course_slugs ENABLE ROW LEVEL SECURITY;

-- No policies added intentionally:
-- - Anonymous and authenticated users have zero access
-- - service_role bypasses RLS and retains full access for admin operations

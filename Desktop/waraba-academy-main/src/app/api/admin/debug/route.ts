import { NextRequest, NextResponse } from 'next/server';
import { withAdminAuth } from '@/middleware/adminAuth';
import { getAdminSupabaseClient } from '@/lib/supabase-server';

/**
 * GET /api/admin/debug
 * Endpoint de diagnostic pour vérifier l'état de la connexion Supabase et les données
 * Accessible uniquement aux admins authentifiés
 */
async function GET (_request: NextRequest) {
  const results: Record<string, unknown> = {
    env: {
      hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      hasAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      hasServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/\/.*@/, '//***@') ?? null,
    },
    tables: {} as Record<string, unknown>,
    errors: [] as string[],
  };

  try {
    const supabase = getAdminSupabaseClient();

    const tables = [
      'profiles',
      'courses',
      'enrollments',
      'lessons',
      'user_progress',
      'payments',
      'quizzes',
      'quiz_attempts',
      'notifications',
      'course_reviews',
      'admin_audit_logs',
      'categories',
      'coupons',
    ];

    for (const table of tables) {
      const { count, error } = await supabase
        .from(table as never)
        .select('*', { count: 'exact', head: true });

      if (error) {
        (results.tables as Record<string, unknown>)[table] = {
          count: null,
          error: error.message,
          code: error.code,
        };
        (results.errors as string[]).push(`${table}: ${error.message}`);
      } else {
        (results.tables as Record<string, unknown>)[table] = { count };
      }
    }

    // Vérifier spécifiquement si l'admin a un profil
    const { data: adminProfiles, error: adminErr } = await supabase
      .from('profiles')
      .select('id, email, role')
      .eq('role', 'admin')
      .limit(5);

    results.adminProfiles = adminErr
      ? { error: adminErr.message }
      : adminProfiles;

  } catch (err: unknown) {
    (results.errors as string[]).push(
      err instanceof Error ? err.message : 'Erreur createAdminSupabaseClient'
    );
  }

  return NextResponse.json({ success: true, ...results });
}

export const GET_handler = withAdminAuth(GET);
export { GET_handler as GET };

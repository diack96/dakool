import { NextRequest, NextResponse } from 'next/server';
import { createAdminSupabaseClient } from '@/lib/supabase-server';

/**
 * GET /api/cron/cleanup
 * Nettoyage quotidien (3h UTC) :
 *   - rate_limit_log  : supprime les entrées expirées
 *   - admin_audit_logs : supprime les logs > 90 jours
 */
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = createAdminSupabaseClient();

  const [rateLimitResult, auditResult] = await Promise.all([
    supabase.rpc('rate_limit_cleanup'),
    supabase.rpc('cleanup_old_audit_logs', { p_days: 90 }),
  ]);

  const errors = [rateLimitResult.error?.message, auditResult.error?.message].filter(Boolean);

  console.log(`[cron/cleanup] rate_limit_log nettoyé | audit_logs supprimés: ${auditResult.data ?? 0}${errors.length ? ` | erreurs: ${errors.join(', ')}` : ''}`);

  return NextResponse.json({
    success: errors.length === 0,
    auditLogsDeleted: auditResult.data ?? 0,
    errors: errors.length ? errors : undefined,
  });
}

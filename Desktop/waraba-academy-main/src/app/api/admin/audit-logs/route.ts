import { NextRequest, NextResponse } from 'next/server';
import { withAdminAuth } from '@/middleware/adminAuth';
import { getAdminSupabaseClient } from '@/lib/supabase-server';
import { handleApiError } from '@/lib/errors';

async function GET(request: NextRequest) {
  try {
    const supabase = getAdminSupabaseClient();
    const { searchParams } = request.nextUrl;
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = Math.min(100, parseInt(searchParams.get('limit') || '50'));
    const offset = (page - 1) * limit;
    const action = searchParams.get('action') || '';

    let query = supabase
      .from('admin_audit_logs')
      .select('id, user_id, action, resource, ip_address, timestamp, success, details', { count: 'exact' })
      .order('timestamp', { ascending: false })
      .range(offset, offset + limit - 1);

    if (action) {
      query = query.eq('action', action);
    }

    const { data, error, count } = await query;
    if (error) throw error;

    // Enrichir avec les emails admin
    const userIds = [...new Set((data || []).map((l: any) => l.user_id).filter(Boolean))];
    let profileMap: Record<string, string> = {};
    if (userIds.length > 0) {
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, email, first_name, last_name')
        .in('id', userIds);
      for (const p of profiles || []) {
        const name = [p.first_name, p.last_name].filter(Boolean).join(' ') || p.email;
        profileMap[(p as any).id] = name;
      }
    }

    const logs = (data || []).map((log: any) => ({
      ...log,
      adminName: profileMap[log.user_id] || log.user_id,
    }));

    return NextResponse.json({
      success: true,
      logs,
      total: count ?? 0,
      page,
      totalPages: Math.ceil((count ?? 0) / limit),
    });
  } catch (error) {
    return handleApiError(error);
  }
}

const GET_handler = withAdminAuth(GET);
export { GET_handler as GET };

import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

/**
 * Health check endpoint
 * SECURITY: Returns minimal info only — no uptime, env, or version
 */
export async function GET() {
  try {
    let dbOk = false;
    try {
      const cookieStore = await cookies();
      const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          cookies: {
            getAll() {
              return cookieStore.getAll();
            },
            setAll() {
              // No-op for health check
            },
          },
        },
      );
      const { error } = await supabase.from('profiles').select('id').limit(1);
      dbOk = !error;
    } catch {
      dbOk = false;
    }

    const statusCode = dbOk ? 200 : 503;

    return NextResponse.json(
      { status: dbOk ? 'ok' : 'degraded' },
      { status: statusCode },
    );
  } catch {
    return NextResponse.json({ status: 'error' }, { status: 503 });
  }
}

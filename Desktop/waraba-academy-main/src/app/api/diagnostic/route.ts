import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import { createClient } from '@supabase/supabase-js';

// Client admin pour vérifier le rôle
function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

/**
 * Endpoint de diagnostic pour vérifier l'état du système
 * GET /api/diagnostic
 *
 * PROTÉGÉ: Accessible uniquement aux administrateurs
 *
 * Vérifie:
 * - Connexion à Supabase
 * - Existence des tables
 * - Variables d'environnement (présence uniquement)
 */
export async function GET (_request: NextRequest) {
  // Vérifier l'authentification admin
  const supabaseAuth = await createServerSupabaseClient();
  const { data: { user }, error: authError } = await supabaseAuth.auth.getUser();

  if (authError || !user) {
    return NextResponse.json(
      { error: 'Non authentifié' },
      { status: 401 }
    );
  }

  // Vérifier le rôle admin via service role
  const adminClient = getAdminClient();
  if (!adminClient) {
    return NextResponse.json(
      { error: 'Configuration serveur incomplète' },
      { status: 500 }
    );
  }

  const { data: profile } = await adminClient
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (!profile || profile.role !== 'admin') {
    return NextResponse.json(
      { error: 'Accès réservé aux administrateurs' },
      { status: 403 }
    );
  }

  const diagnostics: Record<string, any> = {
    timestamp: new Date().toISOString(),
    environment: {
      configured: !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
    },
    database: {
      connected: false,
      tables: {} as Record<string, { exists: boolean }>,
    },
    api: {
      status: 'ok',
    },
  };

  try {
    // 1. Tester la connexion Supabase
    const supabase = await createServerSupabaseClient();
    diagnostics.database.connected = true;

    // 2. Vérifier l'existence des tables critiques (sans exposer row counts ni données)
    const tablesToCheck = ['courses', 'enrollments', 'profiles', 'categories'];

    for (const table of tablesToCheck) {
      try {
        const { error } = await supabase
          .from(table)
          .select('id', { count: 'exact', head: true });

        diagnostics.database.tables[table] = {
          exists: !error,
        };
      } catch {
        diagnostics.database.tables[table] = {
          exists: false,
        };
      }
    }
  } catch {
    diagnostics.database.connected = false;
    diagnostics.api.status = 'error';
  }

  // Déterminer le statut global
  const hasCriticalErrors =
    !diagnostics.database.connected ||
    Object.values(diagnostics.database.tables).some((t: any) => !t.exists);

  const statusCode = hasCriticalErrors ? 500 : 200;

  return NextResponse.json(
    {
      success: !hasCriticalErrors,
      diagnostics,
      summary: {
        status: hasCriticalErrors ? 'ERROR' : 'OK',
        message: hasCriticalErrors
          ? 'Des problèmes critiques ont été détectés'
          : 'Tous les systèmes fonctionnent correctement',
      },
    },
    { status: statusCode },
  );
}

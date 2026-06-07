/**
 * Client Supabase admin (service role) — Node.js uniquement
 * ⚠️ À utiliser UNIQUEMENT dans les routes API (runtime Node.js, pas Edge)
 * ⚠️ NE JAMAIS utiliser côté client (browser) ni dans le middleware Edge
 */

import { createClient } from '@supabase/supabase-js';

export function createAdminSupabaseClient() {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY is not set. Required for admin operations.');
  }

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL is not set.');
  }

  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    },
  );
}

/**
 * Singleton process-level du client admin.
 * La clé service role ne change jamais et persistSession=false → aucun état
 * par utilisateur → safe à réutiliser entre toutes les requêtes du même
 * process Node.js. Évite de recréer un client à chaque handler call.
 */
let _adminClient: ReturnType<typeof createAdminSupabaseClient> | null = null;

export function getAdminSupabaseClient(): ReturnType<typeof createAdminSupabaseClient> {
  if (!_adminClient) {
    _adminClient = createAdminSupabaseClient();
  }
  return _adminClient;
}

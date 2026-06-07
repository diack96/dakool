/**
 * Helpers Supabase côté client uniquement
 * À utiliser dans les Client Components
 */

import { createBrowserClient } from '@supabase/ssr';
import { Database } from '@/types/supabase';

/**
 * Crée un client Supabase côté navigateur
 * ✅ À utiliser dans les Client Components
 */
export function createBrowserSupabaseClient () {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}


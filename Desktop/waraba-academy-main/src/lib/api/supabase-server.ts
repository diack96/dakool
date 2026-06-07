/**
 * Re-export du helper Supabase existant pour compatibilité
 * Utilise le helper existant dans src/lib/supabase-server.ts
 */
import { createServerSupabaseClient } from '@/lib/supabase-server';
export { createServerSupabaseClient as createSupabaseServerClient };

/**
 * Vérifier l'authentification et retourner la session
 */
export async function getAuthSession() {
  const supabase = await createServerSupabaseClient();
  const { data: { session }, error } = await supabase.auth.getSession();

  if (error) {
    throw new Error(`Erreur lors de la récupération de la session: ${error.message}`);
  }

  return { session, supabase };
}

/**
 * Vérifier l'authentification et retourner l'utilisateur
 */
export async function getAuthUser() {
  const supabase = await createServerSupabaseClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error) {
    throw new Error(`Erreur lors de la récupération de l'utilisateur: ${error.message}`);
  }

  return { user, supabase };
}

/**
 * Vérifier si l'utilisateur est admin
 */
export async function isAdmin(): Promise<boolean> {
  try {
    const { session } = await getAuthSession();
    return session?.user?.user_metadata?.role === 'admin';
  } catch {
    return false;
  }
}

import { createAdminSupabaseClient } from './supabase-server';

/**
 * Rate limiter DB-based — fonctionne sur Vercel serverless (pas de MemoryStore in-process).
 * Utilise une fonction SQL atomique (upsert + reset de fenêtre).
 *
 * @returns true si la requête est BLOQUÉE, false si elle est autorisée
 */
export async function dbRateLimit(
  key: string,
  max: number,
  windowMs: number,
): Promise<boolean> {
  try {
    const supabase = createAdminSupabaseClient();
    const resetAt = new Date(Date.now() + windowMs).toISOString();

    const { data: count, error } = await supabase.rpc('rate_limit_check', {
      p_key: key,
      p_max: max,
      p_reset_at: resetAt,
    });

    if (error) {
      // En cas d'erreur DB, on laisse passer (fail open) pour ne pas bloquer les users légitimes
      console.error('[dbRateLimit] RPC error:', error.message);
      return false;
    }

    return (count as number) > max;
  } catch {
    // Fail open
    return false;
  }
}

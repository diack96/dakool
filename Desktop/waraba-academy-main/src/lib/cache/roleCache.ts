/**
 * Cache simple pour les rôles utilisateur (fallback si Redis non disponible)
 */

import { CACHE_TTL } from '../constants';

interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

class InMemoryRoleCache {
  private cache: Map<string, CacheEntry<any>> = new Map();
  private cleanupInterval: NodeJS.Timeout;

  constructor () {
    // Nettoyer le cache toutes les minutes
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, 60 * 1000);
  }

  get<T> (key: string): T | null {
    const entry = this.cache.get(key);

    if (!entry) {
      return null;
    }

    // Vérifier l'expiration
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    return entry.data as T;
  }

  set<T> (key: string, data: T, ttlSeconds: number = CACHE_TTL.USER_ROLE): void {
    const expiresAt = Date.now() + (ttlSeconds * 1000);
    this.cache.set(key, { data, expiresAt });
  }

  delete (key: string): void {
    this.cache.delete(key);
  }

  clear (): void {
    this.cache.clear();
  }

  private cleanup (): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiresAt) {
        this.cache.delete(key);
      }
    }
  }

  destroy (): void {
    clearInterval(this.cleanupInterval);
    this.cache.clear();
  }
}

// Instance globale
const roleCache = new InMemoryRoleCache();

/**
 * Récupère le rôle utilisateur depuis le cache ou la DB
 */
export async function getCachedUserRole (userId: string): Promise<string | null> {
  const cacheKey = `user:role:${userId}`;

  // Vérifier le cache
  const cachedRole = roleCache.get<string>(cacheKey);
  if (cachedRole) {
    return cachedRole;
  }

  // Sinon, récupérer depuis la DB
  try {
    const { createServerSupabaseClient } = await import('../supabase-server');
    const supabase = await createServerSupabaseClient();

    const { data: profile, error } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .single();

    if (error || !profile) {
      return null;
    }

    // Mettre en cache
    roleCache.set(cacheKey, (profile as { id: string; role: string; email?: string } | null)?.role || '', CACHE_TTL.USER_ROLE);

    return (profile as { id: string; role: string; email?: string } | null)?.role || '';
  } catch (error) {
    console.error('Erreur lors de la récupération du rôle:', error);
    return null;
  }
}

/**
 * Invalide le cache pour un utilisateur
 */
export function invalidateUserRoleCache (userId: string): void {
  const cacheKey = `user:role:${userId}`;
  roleCache.delete(cacheKey);
}

/**
 * Nettoie tout le cache (utile pour les tests)
 */
export function clearRoleCache (): void {
  roleCache.clear();
}


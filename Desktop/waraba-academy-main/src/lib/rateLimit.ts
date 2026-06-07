import { NextRequest, NextResponse } from 'next/server';
import { RateLimitError } from './errors';
import { config } from './config';
// Note: apiLogger (Winston) désactivé pour compatibilité Edge Runtime
// Winston utilise des modules Node.js (fs, path) non disponibles en Edge
// Utiliser console.log/error/warn à la place

// Interface pour les règles de rate limiting
interface RateLimitRule {
  windowMs: number
  maxRequests: number
  keyGenerator: (request: NextRequest) => string
  message?: string
}

// Configuration par défaut
const defaultRule: RateLimitRule = {
  windowMs: typeof config.RATE_LIMIT_WINDOW_MS === 'string' ? Number(config.RATE_LIMIT_WINDOW_MS) : config.RATE_LIMIT_WINDOW_MS,
  maxRequests: typeof config.RATE_LIMIT_MAX_REQUESTS === 'string' ? Number(config.RATE_LIMIT_MAX_REQUESTS) : config.RATE_LIMIT_MAX_REQUESTS,
  keyGenerator: (request: NextRequest) => {
    // Utiliser l'IP comme clé par défaut
    const forwarded = request.headers.get('x-forwarded-for');
    const ip = forwarded ? forwarded.split(',')[0] : request.headers.get('x-real-ip') || 'unknown';
    return `rate_limit:${ip}`;
  },
  message: 'Trop de requêtes. Réessayez plus tard.',
};

// Store en mémoire pour le rate limiting (en production, utiliser Redis)
class MemoryStore {
  private store = new Map<string, { count: number; resetTime: number }>();

  increment (key: string, windowMs: number): { count: number; resetTime: number } {
    const now = Date.now();
    const resetTime = now + windowMs;

    const current = this.store.get(key);
    if (!current || now > current.resetTime) {
      // Nouvelle fenêtre ou expiration
      this.store.set(key, { count: 1, resetTime });
      return { count: 1, resetTime };
    }

    // Incrémenter le compteur
    current.count++;
    this.store.set(key, current);
    return current;
  }

  get (key: string): { count: number; resetTime: number } | undefined {
    const current = this.store.get(key);
    if (current && Date.now() > current.resetTime) {
      // Expiré, supprimer
      this.store.delete(key);
      return undefined;
    }
    return current;
  }

  // Nettoyage périodique des entrées expirées
  cleanup () {
    const now = Date.now();
    for (const [key, value] of this.store.entries()) {
      if (now > value.resetTime) {
        this.store.delete(key);
      }
    }
  }
}

// Store global
const store = new MemoryStore();

// Nettoyage automatique toutes les 5 minutes
setInterval(() => store.cleanup(), 5 * 60 * 1000);

// Fonction de rate limiting
export function createRateLimiter (rule: Partial<RateLimitRule> = {}) {
  const finalRule = { ...defaultRule, ...rule };

  return async function rateLimitMiddleware (request: NextRequest): Promise<NextResponse | null> {
    try {
      const key = finalRule.keyGenerator(request);
      const { count, resetTime } = store.increment(key, finalRule.windowMs);

      // Ajouter les headers de rate limiting
      const remaining = Math.max(0, finalRule.maxRequests - count);
      const resetTimeSeconds = Math.ceil(resetTime / 1000);

      // Vérifier si la limite est dépassée
      if (count > finalRule.maxRequests) {
        console.warn('[RateLimit] ⚠️ Rate limit exceeded:', {
          key,
          count,
          maxRequests: finalRule.maxRequests,
          ip: request.headers.get('x-forwarded-for')?.split(',')[0] || request.headers.get('x-real-ip') || 'unknown',
          userAgent: request.headers.get('user-agent'),
        });

        throw new RateLimitError(finalRule.message || 'Trop de requêtes');
      }

      // Headers de rate limiting (optionnels mais utiles)
      const response = NextResponse.next();
      response.headers.set('X-RateLimit-Limit', finalRule.maxRequests.toString());
      response.headers.set('X-RateLimit-Remaining', remaining.toString());
      response.headers.set('X-RateLimit-Reset', resetTimeSeconds.toString());

      return null; // Continuer le traitement
    } catch (error) {
      if (error instanceof RateLimitError) {
        const response = NextResponse.json(
          {
            error: error.message,
            errorId: (error as any).errorId || 'RATE_LIMIT_EXCEEDED',
            retryAfter: Math.ceil(finalRule.windowMs / 1000),
          },
          { status: 429 },
        );

        // Headers de rate limiting
        response.headers.set('Retry-After', Math.ceil(finalRule.windowMs / 1000).toString());
        response.headers.set('X-RateLimit-Limit', finalRule.maxRequests.toString());
        response.headers.set('X-RateLimit-Remaining', '0');
        response.headers.set('X-RateLimit-Reset', Math.ceil((Date.now() + finalRule.windowMs) / 1000).toString());

        return response;
      }
      throw error;
    }
  };
}

// Rate limiters spécialisés
export const authRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 5, // 5 tentatives de connexion
  keyGenerator: (request: NextRequest) => {
    // Clé spécifique pour l'authentification
    const forwarded = request.headers.get('x-forwarded-for');
    const ip = forwarded ? forwarded.split(',')[0] : request.headers.get('x-real-ip') || 'unknown';
    return `auth_rate_limit:${ip}`;
  },
  message: 'Trop de tentatives de connexion. Réessayez dans 15 minutes.',
});

export const apiRateLimiter = createRateLimiter({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 100, // 100 requêtes par minute
  keyGenerator: (request: NextRequest) => {
    // Clé pour l'API générale
    const forwarded = request.headers.get('x-forwarded-for');
    const ip = forwarded ? forwarded.split(',')[0] : request.headers.get('x-real-ip') || 'unknown';
    return `api_rate_limit:${ip}`;
  },
  message: 'Trop de requêtes API. Réessayez plus tard.',
});

export const strictRateLimiter = createRateLimiter({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 10, // 10 requêtes par minute
  keyGenerator: (request: NextRequest) => {
    // Clé pour les endpoints sensibles
    const forwarded = request.headers.get('x-forwarded-for');
    const ip = forwarded ? forwarded.split(',')[0] : request.headers.get('x-real-ip') || 'unknown';
    return `strict_rate_limit:${ip}`;
  },
  message: 'Trop de requêtes. Réessayez plus tard.',
});

// Middleware de rate limiting pour Next.js
// Supporte les handlers avec ou sans paramètres additionnels (comme params dans Next.js App Router)
export function withRateLimit<T extends any[] = []> (
  handler: (request: NextRequest, ...args: T) => Promise<NextResponse>,
  rateLimiter = apiRateLimiter,
) {
  return async (request: NextRequest, ...args: T): Promise<NextResponse> => {
    // Appliquer le rate limiting
    const rateLimitResponse = await rateLimiter(request);
    if (rateLimitResponse) {
      return rateLimitResponse;
    }

    // Continuer avec le handler original
    return handler(request, ...args);
  };
}

// Fonction utilitaire pour obtenir les statistiques de rate limiting
export function getRateLimitStats (): { totalKeys: number; storeSize: number } {
  const storeData = (store as any).store;
  return {
    totalKeys: storeData?.size || 0,
    storeSize: JSON.stringify(storeData || {}).length,
  };
}

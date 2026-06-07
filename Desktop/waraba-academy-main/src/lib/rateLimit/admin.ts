/**
 * Rate limiting spécifique pour les routes admin
 */

import { NextRequest, NextResponse } from 'next/server';
import { createRateLimiter } from '../rateLimit';
import { RATE_LIMIT } from '../constants';

// Rate limiter pour les routes admin
const adminRateLimiter = createRateLimiter({
  maxRequests: RATE_LIMIT.ADMIN_API.maxRequests,
  windowMs: RATE_LIMIT.ADMIN_API.windowMs,
  keyGenerator: (request: NextRequest) => {
    // Utiliser l'IP et l'ID utilisateur si disponible
    const forwarded = request.headers.get('x-forwarded-for');
    const ip = forwarded ? forwarded.split(',')[0] : request.headers.get('x-real-ip') || 'unknown';
    const userId = (request as any).adminUser?.id || 'anonymous';
    return `admin:${ip}:${userId}`;
  },
  message: 'Trop de requêtes. Veuillez réessayer dans quelques instants.',
});

/**
 * Middleware de rate limiting pour les routes admin
 */
export async function adminRateLimitMiddleware (request: NextRequest) {
  try {
    const response = await adminRateLimiter(request);

    if (response) {
      // Rate limit dépassé - utiliser console pour éviter winston en Edge Runtime
      const forwarded = request.headers.get('x-forwarded-for');
      const ip = forwarded ? forwarded.split(',')[0] : request.headers.get('x-real-ip') || 'unknown';
      console.warn('Rate limit dépassé sur route admin', {
        ip,
        path: request.nextUrl.pathname,
        userAgent: request.headers.get('user-agent'),
      });
      return response;
    }

    return null; // Continuer
  } catch (error) {
    // SÉCURITÉ: Fail-secure en production, fail-open en développement
    // Utiliser console pour éviter winston en Edge Runtime
    console.error('Erreur dans rate limiter admin', error);

    // En production, bloquer si rate limiter échoue (fail-secure)
    if (process.env.NODE_ENV === 'production') {
      const forwarded = request.headers.get('x-forwarded-for');
      const ip = forwarded ? forwarded.split(',')[0] : request.headers.get('x-real-ip') || 'unknown';
      console.error('Rate limiter admin indisponible en production - Blocage de la requête', {
        ip,
        path: request.nextUrl.pathname,
      });
      return NextResponse.json(
        { error: 'Service temporairement indisponible' },
        { status: 503 },
      );
    }

    // En développement, continuer avec warning
    console.warn('Rate limiter admin non disponible, continuation en dev');
    return null;
  }
}


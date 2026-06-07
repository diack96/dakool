/**
 * Utilitaires de sécurité pour la validation des requêtes
 */

import { NextRequest, NextResponse } from 'next/server';

// Taille maximale des requêtes (10 MB)
export const MAX_REQUEST_SIZE = 10 * 1024 * 1024;

/**
 * Valider la taille d'une requête
 */
export function validateRequestSize (request: NextRequest): NextResponse | null {
  const contentLength = request.headers.get('content-length');

  if (contentLength) {
    const size = parseInt(contentLength, 10);

    if (isNaN(size) || size > MAX_REQUEST_SIZE) {
      return NextResponse.json(
        {
          error: 'Requête trop volumineuse',
          maxSize: `${MAX_REQUEST_SIZE / (1024 * 1024)} MB`,
        },
        { status: 413 },
      );
    }
  }

  return null;
}

/**
 * Valider l'origine d'une requête (protection CSRF basique)
 */
export function validateOrigin (request: NextRequest): boolean {
  const origin = request.headers.get('origin');
  const referer = request.headers.get('referer');

  // Liste des origines autorisées
  const allowedOrigins = [
    process.env.NEXT_PUBLIC_APP_URL,
    'https://waraba-academy.vercel.app',
    'http://localhost:3000',
    'http://localhost:3001',
  ].filter(Boolean);

  // SÉCURITÉ: Si pas d'origine ET pas de referer, rejeter en production
  // Cela empêche les attaques CSRF où les headers sont supprimés
  if (!origin && !referer) {
    // En développement, être plus permissif pour faciliter les tests
    if (process.env.NODE_ENV === 'development') {
      return true;
    }
    // En production, rejeter les requêtes sans origine identifiable
    return false;
  }

  // Vérifier l'origine
  if (origin) {
    try {
      const originUrl = new URL(origin);
      const isAllowed = allowedOrigins.some(allowed => {
        if (!allowed) return false;
        try {
          const allowedUrl = new URL(allowed);
          return originUrl.origin === allowedUrl.origin;
        } catch {
          return false;
        }
      });

      if (isAllowed) {
        return true;
      }
    } catch {
      // URL invalide
    }
  }

  // Vérifier le referer
  if (referer) {
    try {
      const refererUrl = new URL(referer);
      const isAllowed = allowedOrigins.some(allowed => {
        if (!allowed) return false;
        try {
          const allowedUrl = new URL(allowed);
          return refererUrl.origin === allowedUrl.origin;
        } catch {
          return false;
        }
      });

      if (isAllowed) {
        return true;
      }
    } catch {
      // URL invalide
    }
  }

  // En développement, être plus permissif
  if (process.env.NODE_ENV === 'development') {
    return true;
  }

  return false;
}

/**
 * Middleware de validation de requête complète
 */
export function validateRequest (request: NextRequest): NextResponse | null {
  // Valider la taille
  const sizeError = validateRequestSize(request);
  if (sizeError) {
    return sizeError;
  }

  // Valider l'origine pour les requêtes POST/PUT/DELETE
  const { method } = request;
  if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(method)) {
    if (!validateOrigin(request)) {
      return NextResponse.json(
        { error: 'Origine non autorisée' },
        { status: 403 },
      );
    }
  }

  return null;
}


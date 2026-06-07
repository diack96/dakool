/**
 * Utilitaires API partagés pour standardiser les réponses et réduire le code dupliqué
 */

import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';

// Types de réponse standardisés
export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
  meta?: {
    count?: number;
    page?: number;
    limit?: number;
  };
}

export interface ApiErrorResponse {
  success: false;
  error: string;
  code?: string;
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

// Headers de cache
export const CACHE_HEADERS = {
  NO_CACHE: {
    'Cache-Control': 'no-store, no-cache, must-revalidate',
  },
  // Données utilisateur : private empêche les CDN de partager entre users
  PRIVATE_SHORT: {
    'Cache-Control': 'private, max-age=60, stale-while-revalidate=300',
  },
  SHORT: {
    'Cache-Control': 'public, max-age=60, s-maxage=120, stale-while-revalidate=300',
  },
  MEDIUM: {
    'Cache-Control': 'public, max-age=300, s-maxage=600, stale-while-revalidate=900',
  },
  LONG: {
    'Cache-Control': 'public, max-age=3600, s-maxage=7200, stale-while-revalidate=86400',
  },
} as const;

/**
 * Réponse de succès standardisée
 */
export function successResponse<T>(
  data: T,
  options?: {
    status?: number;
    cache?: keyof typeof CACHE_HEADERS;
    meta?: ApiSuccessResponse<T>['meta'];
  }
): NextResponse<ApiSuccessResponse<T>> {
  const { status = 200, cache = 'NO_CACHE', meta } = options || {};

  return NextResponse.json(
    { success: true as const, data, ...(meta && { meta }) },
    { status, headers: CACHE_HEADERS[cache] }
  );
}

/**
 * Réponse d'erreur standardisée
 */
export function errorResponse(
  error: string,
  options?: {
    status?: number;
    code?: string;
  }
): NextResponse<ApiErrorResponse> {
  const { status = 500, code } = options || {};

  // Log en développement uniquement
  if (process.env.NODE_ENV === 'development') {
    console.error(`[API Error] ${code || status}: ${error}`);
  }

  return NextResponse.json(
    { success: false as const, error, ...(code && { code }) },
    { status, headers: CACHE_HEADERS.NO_CACHE }
  );
}

/**
 * Wrapper pour les handlers API avec gestion d'erreur automatique
 */
export async function withErrorHandling<T>(
  handler: () => Promise<NextResponse<T>>
): Promise<NextResponse<T | ApiErrorResponse>> {
  try {
    return await handler();
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erreur interne du serveur';
    return errorResponse(message, { status: 500 });
  }
}

/**
 * Vérifie l'authentification et retourne le user
 */
export async function requireAuth(): Promise<{
  user: { id: string; email?: string } | null;
  error: NextResponse<ApiErrorResponse> | null;
}> {
  try {
    const supabase = await createServerSupabaseClient();
    // getSession() valide le JWT depuis le cookie localement — zéro appel réseau Auth
    // (getUser() ferait un appel réseau vers Supabase Auth à chaque requête)
    const { data: { session }, error } = await supabase.auth.getSession();
    const user = session?.user;

    if (error || !user) {
      return {
        user: null,
        error: errorResponse('Non authentifié', { status: 401, code: 'UNAUTHORIZED' }),
      };
    }

    return { user, error: null };
  } catch {
    return {
      user: null,
      error: errorResponse('Erreur d\'authentification', { status: 401 }),
    };
  }
}

/**
 * Parse les paramètres de pagination
 */
export function parsePagination(searchParams: URLSearchParams): {
  page: number;
  limit: number;
  offset: number;
} {
  const rawPage = parseInt(searchParams.get('page') || '1', 10);
  const page = Math.max(1, isNaN(rawPage) ? 1 : rawPage);
  const rawLimit = parseInt(searchParams.get('limit') || '20', 10);
  const limit = Math.min(100, Math.max(1, isNaN(rawLimit) ? 20 : rawLimit));
  const offset = (page - 1) * limit;

  return { page, limit, offset };
}

/**
 * Mapping des niveaux de cours (français → DB)
 */
export const LEVEL_MAP: Record<string, string> = {
  'DÉBUTANT': 'beginner',
  'DEBUTANT': 'beginner',
  'INTERMÉDIAIRE': 'intermediate',
  'INTERMEDIAIRE': 'intermediate',
  'AVANCÉ': 'advanced',
  'AVANCE': 'advanced',
  'BEGINNER': 'beginner',
  'INTERMEDIATE': 'intermediate',
  'ADVANCED': 'advanced',
};

export function normalizeLevel(level: string): string {
  return LEVEL_MAP[level.toUpperCase()] || level.toLowerCase();
}

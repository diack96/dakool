/**
 * Gestion d'erreurs standardisée pour l'API
 */

import { NextResponse } from 'next/server';

export class ApiError extends Error {
  constructor (
    public statusCode: number,
    message: string,
    public code: string,
    public details?: any,
  ) {
    super(message);
    this.name = 'ApiError';
    Object.setPrototypeOf(this, ApiError.prototype);
  }

  toJSON () {
    return {
      error: {
        code: this.code,
        message: this.message,
        details: this.details,
      },
    };
  }
}

// Codes d'erreur standardisés
export const ErrorCodes = {
  // Validation
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  INVALID_INPUT: 'INVALID_INPUT',
  MISSING_REQUIRED_FIELD: 'MISSING_REQUIRED_FIELD',

  // Authentication
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  SESSION_EXPIRED: 'SESSION_EXPIRED',

  // Resources
  NOT_FOUND: 'NOT_FOUND',
  ALREADY_EXISTS: 'ALREADY_EXISTS',
  CONFLICT: 'CONFLICT',

  // Server
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  DATABASE_ERROR: 'DATABASE_ERROR',
  EXTERNAL_SERVICE_ERROR: 'EXTERNAL_SERVICE_ERROR',

  // Rate Limiting
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',

  // Admin
  ADMIN_ACCESS_REQUIRED: 'ADMIN_ACCESS_REQUIRED',
  INSUFFICIENT_PERMISSIONS: 'INSUFFICIENT_PERMISSIONS',
} as const;

// Classe d'erreur pour le rate limiting
export class RateLimitError extends ApiError {
  constructor (message = 'Trop de requêtes. Réessayez plus tard.', retryAfter?: number) {
    super(429, message, ErrorCodes.RATE_LIMIT_EXCEEDED, { retryAfter });
    this.name = 'RateLimitError';
    Object.setPrototypeOf(this, RateLimitError.prototype);
  }
}

// Factory functions pour créer des erreurs courantes
export function createValidationError (message: string, details?: any) {
  return new ApiError(400, message, ErrorCodes.VALIDATION_ERROR, details);
}

export function createUnauthorizedError (message = 'Non authentifié') {
  return new ApiError(401, message, ErrorCodes.UNAUTHORIZED);
}

export function createForbiddenError (message = 'Accès refusé') {
  return new ApiError(403, message, ErrorCodes.FORBIDDEN);
}

export function createNotFoundError (resource: string) {
  return new ApiError(404, `${resource} non trouvé`, ErrorCodes.NOT_FOUND);
}

export function createAdminRequiredError () {
  return new ApiError(403, 'Accès administrateur requis', ErrorCodes.ADMIN_ACCESS_REQUIRED);
}

export function createInternalError (message = 'Erreur interne du serveur', details?: any) {
  return new ApiError(500, message, ErrorCodes.INTERNAL_ERROR, details);
}

// Handler d'erreurs pour Next.js API routes
export function handleApiError (error: unknown): NextResponse {
  if (error instanceof ApiError) {
    return NextResponse.json({
      success: false,
      error: error.message,
      details: error.details,
      code: error.code,
    }, { status: error.statusCode });
  }

  // Erreur Zod validation
  if (error && typeof error === 'object' && 'issues' in error) {
    const zodError = error as { issues: Array<{ message: string; path: (string | number)[] }> };
    return NextResponse.json({
      success: false,
      error: 'Erreur de validation',
      details: zodError.issues.map((issue) => ({
        field: issue.path.join('.'),
        message: issue.message,
      })),
      code: ErrorCodes.VALIDATION_ERROR,
    }, { status: 400 });
  }

  // Erreur inconnue
  // Note: On utilise console.error ici car c'est dans le handler d'erreurs lui-même
  // et apiLogger pourrait causer une boucle infinie
  const errorMessage = error instanceof Error ? error.message : 'Une erreur inattendue est survenue';
  return NextResponse.json({
    success: false,
    error: errorMessage,
    code: ErrorCodes.INTERNAL_ERROR,
  }, { status: 500 });
}


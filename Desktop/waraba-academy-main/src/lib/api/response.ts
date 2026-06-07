import { NextResponse } from 'next/server';

/**
 * Standard API Response Helper
 * 
 * Standardise toutes les réponses API pour une cohérence dans toute l'application
 */

export interface ApiErrorResponse {
  success: false;
  error: string;
  code?: string;
  details?: any;
}

export interface ApiSuccessResponse<T = any> {
  success: true;
  data?: T;
  message?: string;
}

export type ApiResponse<T = any> = ApiSuccessResponse<T> | ApiErrorResponse;

/**
 * Créer une réponse de succès standardisée
 */
export function successResponse<T>(
  data?: T,
  message?: string,
  status: number = 200,
  headers?: Record<string, string>,
): NextResponse<ApiSuccessResponse<T>> {
  const response: ApiSuccessResponse<T> = {
    success: true,
    ...(data !== undefined && { data }),
    ...(message && { message }),
  };

  const responseHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    ...headers,
  };

  return NextResponse.json(response, {
    status,
    headers: responseHeaders,
  });
}

/**
 * Créer une réponse d'erreur standardisée
 */
export function errorResponse(
  error: string,
  status: number = 500,
  code?: string,
  details?: any,
  headers?: Record<string, string>,
): NextResponse<ApiErrorResponse> {
  const response: ApiErrorResponse = {
    success: false,
    error,
    ...(code && { code }),
    ...(details && { details }),
  };

  const responseHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    ...headers,
  };

  return NextResponse.json(response, {
    status,
    headers: responseHeaders,
  });
}

/**
 * Codes d'erreur standardisés
 */
export const ErrorCodes = {
  // Authentification
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  
  // Ressources
  NOT_FOUND: 'NOT_FOUND',
  ALREADY_EXISTS: 'ALREADY_EXISTS',
  
  // Validation
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  INVALID_INPUT: 'INVALID_INPUT',
  
  // Serveur
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  DATABASE_ERROR: 'DATABASE_ERROR',
  EXTERNAL_SERVICE_ERROR: 'EXTERNAL_SERVICE_ERROR',
  
  // Cours spécifiques
  COURSE_NOT_PUBLISHED: 'COURSE_NOT_PUBLISHED',
  ENROLLMENT_REQUIRED: 'ENROLLMENT_REQUIRED',
  LESSON_NOT_FOUND: 'LESSON_NOT_FOUND',
} as const;

/**
 * Helpers pour les erreurs courantes
 */
export const ApiErrors = {
  unauthorized: (message = 'Non authentifié') =>
    errorResponse(message, 401, ErrorCodes.UNAUTHORIZED),
  
  forbidden: (message = 'Accès refusé') =>
    errorResponse(message, 403, ErrorCodes.FORBIDDEN),
  
  notFound: (resource = 'Ressource', id?: string) =>
    errorResponse(
      id ? `${resource} avec l'ID "${id}" non trouvé` : `${resource} non trouvé`,
      404,
      ErrorCodes.NOT_FOUND,
    ),
  
  validationError: (message = 'Données invalides', details?: any) =>
    errorResponse(message, 400, ErrorCodes.VALIDATION_ERROR, details),
  
  internalError: (message = 'Erreur interne du serveur', details?: any) =>
    errorResponse(message, 500, ErrorCodes.INTERNAL_ERROR, details),
  
  databaseError: (message = 'Erreur de base de données', details?: any) =>
    errorResponse(message, 500, ErrorCodes.DATABASE_ERROR, details),
  
  courseNotPublished: (courseId?: string) =>
    errorResponse(
      courseId
        ? `Le cours "${courseId}" n'est pas encore publié`
        : 'Ce cours n\'est pas encore disponible',
      403,
      ErrorCodes.COURSE_NOT_PUBLISHED,
    ),
  
  enrollmentRequired: (courseId?: string) =>
    errorResponse(
      courseId
        ? `Inscription requise : Vous devez être inscrit au cours "${courseId}" pour accéder à son contenu. Si vous êtes déjà inscrit, veuillez réessayer dans quelques instants.`
        : 'Inscription requise : Vous devez être inscrit à ce cours pour accéder à son contenu. Si vous êtes déjà inscrit, veuillez réessayer dans quelques instants.',
      403,
      ErrorCodes.ENROLLMENT_REQUIRED,
    ),
};

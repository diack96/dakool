/**
 * Tests unitaires pour la gestion d'erreurs
 * @jest-environment node
 */

import { ApiError, ErrorCodes, handleApiError, createValidationError } from '@/lib/errors';
import { NextResponse } from 'next/server';

describe('ApiError', () => {
  it('devrait créer une erreur avec les bonnes propriétés', () => {
    const error = new ApiError(400, 'Erreur de validation', ErrorCodes.VALIDATION_ERROR, {
      field: 'email',
    });

    expect(error.statusCode).toBe(400);
    expect(error.message).toBe('Erreur de validation');
    expect(error.code).toBe(ErrorCodes.VALIDATION_ERROR);
    expect(error.details).toEqual({ field: 'email' });
  });

  it('devrait convertir en JSON correctement', () => {
    const error = new ApiError(404, 'Non trouvé', ErrorCodes.NOT_FOUND);
    const json = error.toJSON();

    expect(json).toEqual({
      error: {
        code: ErrorCodes.NOT_FOUND,
        message: 'Non trouvé',
        details: undefined,
      },
    });
  });
});

describe('handleApiError', () => {
  it('devrait gérer ApiError correctement', () => {
    const error = new ApiError(400, 'Erreur de validation', ErrorCodes.VALIDATION_ERROR);
    const response = handleApiError(error);

    expect(response).toBeInstanceOf(NextResponse);
    expect(response.status).toBe(400);
  });

  it('devrait gérer les erreurs Zod', () => {
    const zodError = {
      issues: [
        { message: 'Email invalide', path: ['email'] },
        { message: 'Mot de passe requis', path: ['password'] },
      ],
    };

    const response = handleApiError(zodError);
    const json = response.json();

    expect(response.status).toBe(400);
    expect(json).resolves.toMatchObject({
      success: false,
      error: 'Erreur de validation',
      code: ErrorCodes.VALIDATION_ERROR,
    });
  });

  it('devrait gérer les erreurs inconnues', () => {
    const error = new Error('Erreur inconnue');
    const response = handleApiError(error);

    expect(response.status).toBe(500);
  });
});

describe('createValidationError', () => {
  it('devrait créer une erreur de validation', () => {
    const error = createValidationError('Champ requis', [
      { field: 'email', message: 'Email requis' },
    ]);

    expect(error).toBeInstanceOf(ApiError);
    expect(error.statusCode).toBe(400);
    expect(error.code).toBe(ErrorCodes.VALIDATION_ERROR);
  });
});


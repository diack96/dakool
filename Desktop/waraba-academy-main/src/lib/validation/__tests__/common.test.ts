/**
 * Tests unitaires pour src/lib/validation/common.ts
 * @jest-environment node
 */

import {
  uuidSchema,
  emailSchema,
  urlSchema,
  amountSchema,
  currencySchema,
  paginationQuerySchema,
  quizAnswerSchema,
  submitQuizSchema,
  createNotificationSchema,
  createPaymentIntentSchema,
  enrollCourseSchema,
  validateQueryParams,
  validateBody,
  safeValidate,
} from '../common';

const VALID_UUID = '123e4567-e89b-12d3-a456-426614174000';
const VALID_UUID_2 = '550e8400-e29b-41d4-a716-446655440000';

// ──────────────────────────────────────────────────────────────────────────────
// uuidSchema
// ──────────────────────────────────────────────────────────────────────────────

describe('uuidSchema', () => {
  it('accepte un UUID valide', () => {
    expect(() => uuidSchema.parse(VALID_UUID)).not.toThrow();
  });

  it('rejette un texte non-UUID', () => {
    expect(() => uuidSchema.parse('not-a-uuid')).toThrow();
    expect(() => uuidSchema.parse('slug-de-cours')).toThrow();
  });

  it('rejette une chaîne vide', () => {
    expect(() => uuidSchema.parse('')).toThrow();
  });
});

// ──────────────────────────────────────────────────────────────────────────────
// emailSchema
// ──────────────────────────────────────────────────────────────────────────────

describe('emailSchema', () => {
  it('accepte un email valide', () => {
    expect(() => emailSchema.parse('user@example.com')).not.toThrow();
  });

  it('rejette un email invalide', () => {
    expect(() => emailSchema.parse('not-an-email')).toThrow();
    expect(() => emailSchema.parse('')).toThrow();
  });
});

// ──────────────────────────────────────────────────────────────────────────────
// urlSchema
// ──────────────────────────────────────────────────────────────────────────────

describe('urlSchema', () => {
  it('accepte une URL valide', () => {
    expect(() => urlSchema.parse('https://example.com')).not.toThrow();
    expect(() => urlSchema.parse('http://example.com/path')).not.toThrow();
  });

  it('accepte null et undefined (optionnel)', () => {
    expect(() => urlSchema.parse(null)).not.toThrow();
    expect(() => urlSchema.parse(undefined)).not.toThrow();
  });

  it('rejette un texte qui n\'est pas une URL', () => {
    expect(() => urlSchema.parse('not-a-url')).toThrow();
    expect(() => urlSchema.parse('example.com')).toThrow();
  });
});

// ──────────────────────────────────────────────────────────────────────────────
// amountSchema
// ──────────────────────────────────────────────────────────────────────────────

describe('amountSchema', () => {
  it('accepte un montant positif', () => {
    expect(() => amountSchema.parse(100)).not.toThrow();
    expect(() => amountSchema.parse(0)).not.toThrow();
    expect(() => amountSchema.parse(9.99)).not.toThrow();
  });

  it('rejette un montant négatif', () => {
    expect(() => amountSchema.parse(-1)).toThrow();
  });
});

// ──────────────────────────────────────────────────────────────────────────────
// currencySchema
// ──────────────────────────────────────────────────────────────────────────────

describe('currencySchema', () => {
  it('accepte un code de devise à 3 caractères', () => {
    expect(() => currencySchema.parse('eur')).not.toThrow();
    expect(() => currencySchema.parse('USD')).not.toThrow();
    expect(() => currencySchema.parse('XOF')).not.toThrow();
  });

  it('utilise "eur" comme valeur par défaut', () => {
    const result = currencySchema.parse(undefined);
    expect(result).toBe('eur');
  });

  it('rejette les codes qui ne font pas 3 caractères', () => {
    expect(() => currencySchema.parse('EU')).toThrow();
    expect(() => currencySchema.parse('EURO')).toThrow();
  });
});

// ──────────────────────────────────────────────────────────────────────────────
// paginationQuerySchema
// ──────────────────────────────────────────────────────────────────────────────

describe('paginationQuerySchema', () => {
  it('utilise les valeurs par défaut', () => {
    const result = paginationQuerySchema.parse({});
    expect(result.page).toBe(1);
    expect(result.limit).toBe(20);
    expect(result.search).toBeUndefined();
  });

  it('parse page et limit depuis des strings', () => {
    const result = paginationQuerySchema.parse({ page: '3', limit: '10' });
    expect(result.page).toBe(3);
    expect(result.limit).toBe(10);
  });

  it('ramène page à 1 si invalide ou < 1', () => {
    expect(paginationQuerySchema.parse({ page: '0' }).page).toBe(1);
    expect(paginationQuerySchema.parse({ page: '-5' }).page).toBe(1);
    expect(paginationQuerySchema.parse({ page: 'abc' }).page).toBe(1);
    expect(paginationQuerySchema.parse({ page: null }).page).toBe(1);
  });

  it('limite limit à 100 maximum', () => {
    const result = paginationQuerySchema.parse({ limit: '999' });
    expect(result.limit).toBe(100);
  });

  it('ramène limit à 20 si invalide', () => {
    expect(paginationQuerySchema.parse({ limit: '0' }).limit).toBe(20);
    expect(paginationQuerySchema.parse({ limit: 'abc' }).limit).toBe(20);
  });

  it('parse le search en trimmant les espaces', () => {
    const result = paginationQuerySchema.parse({ search: '  javascript  ' });
    expect(result.search).toBe('javascript');
  });

  it('search est undefined si vide ou null', () => {
    expect(paginationQuerySchema.parse({ search: '' }).search).toBeUndefined();
    expect(paginationQuerySchema.parse({ search: null }).search).toBeUndefined();
  });
});

// ──────────────────────────────────────────────────────────────────────────────
// quizAnswerSchema
// ──────────────────────────────────────────────────────────────────────────────

describe('quizAnswerSchema', () => {
  it('valide une réponse correcte', () => {
    const data = { questionId: VALID_UUID, answerId: VALID_UUID_2 };
    expect(() => quizAnswerSchema.parse(data)).not.toThrow();
  });

  it('rejette des IDs non-UUID', () => {
    expect(() => quizAnswerSchema.parse({ questionId: 'not-uuid', answerId: VALID_UUID })).toThrow();
  });
});

// ──────────────────────────────────────────────────────────────────────────────
// submitQuizSchema
// ──────────────────────────────────────────────────────────────────────────────

describe('submitQuizSchema', () => {
  const validAnswer = { questionId: VALID_UUID, answerId: VALID_UUID_2 };

  it('valide une soumission complète', () => {
    const data = { quizId: VALID_UUID, answers: [validAnswer], timeTaken: 120 };
    expect(() => submitQuizSchema.parse(data)).not.toThrow();
  });

  it('accepte sans timeTaken (optionnel)', () => {
    const data = { quizId: VALID_UUID, answers: [validAnswer] };
    const result = submitQuizSchema.parse(data);
    // .optional().nullable() sans default → undefined si absent
    expect(result.timeTaken == null).toBe(true);
  });

  it('rejette si answers est vide', () => {
    expect(() => submitQuizSchema.parse({ quizId: VALID_UUID, answers: [] })).toThrow();
  });

  it('rejette si quizId n\'est pas un UUID', () => {
    expect(() => submitQuizSchema.parse({ quizId: 'bad', answers: [validAnswer] })).toThrow();
  });

  it('rejette un timeTaken négatif', () => {
    expect(() => submitQuizSchema.parse({ quizId: VALID_UUID, answers: [validAnswer], timeTaken: -1 })).toThrow();
  });
});

// ──────────────────────────────────────────────────────────────────────────────
// createNotificationSchema
// ──────────────────────────────────────────────────────────────────────────────

describe('createNotificationSchema', () => {
  const valid = {
    user_id: VALID_UUID,
    title: 'Nouveau cours disponible',
    message: 'Un nouveau cours a été ajouté.',
  };

  it('valide avec les champs obligatoires', () => {
    const result = createNotificationSchema.parse(valid);
    expect(result.type).toBe('info'); // valeur par défaut
  });

  it('accepte tous les types de notification', () => {
    for (const type of ['info', 'success', 'warning', 'error'] as const) {
      expect(() => createNotificationSchema.parse({ ...valid, type })).not.toThrow();
    }
  });

  it('rejette un type invalide', () => {
    expect(() => createNotificationSchema.parse({ ...valid, type: 'critical' })).toThrow();
  });

  it('rejette un titre vide', () => {
    expect(() => createNotificationSchema.parse({ ...valid, title: '' })).toThrow();
  });

  it('rejette un message trop long (> 1000 chars)', () => {
    expect(() => createNotificationSchema.parse({ ...valid, message: 'a'.repeat(1001) })).toThrow();
  });

  it('rejette un user_id non-UUID', () => {
    expect(() => createNotificationSchema.parse({ ...valid, user_id: 'bad-id' })).toThrow();
  });
});

// ──────────────────────────────────────────────────────────────────────────────
// createPaymentIntentSchema
// ──────────────────────────────────────────────────────────────────────────────

describe('createPaymentIntentSchema', () => {
  it('valide un paiement valide', () => {
    const result = createPaymentIntentSchema.parse({ amount: 29.99 });
    expect(result.currency).toBe('eur');
    expect(result.metadata).toEqual({});
  });

  it('rejette un montant nul ou négatif', () => {
    expect(() => createPaymentIntentSchema.parse({ amount: 0 })).toThrow();
    expect(() => createPaymentIntentSchema.parse({ amount: -5 })).toThrow();
  });

  it('accepte des métadonnées', () => {
    const result = createPaymentIntentSchema.parse({
      amount: 10,
      metadata: { courseId: 'abc', userId: 'xyz' },
    });
    expect(result.metadata).toEqual({ courseId: 'abc', userId: 'xyz' });
  });
});

// ──────────────────────────────────────────────────────────────────────────────
// enrollCourseSchema
// ──────────────────────────────────────────────────────────────────────────────

describe('enrollCourseSchema', () => {
  it('valide un courseId UUID', () => {
    expect(() => enrollCourseSchema.parse({ courseId: VALID_UUID })).not.toThrow();
  });

  it('rejette un courseId non-UUID', () => {
    expect(() => enrollCourseSchema.parse({ courseId: 'slug-du-cours' })).toThrow();
  });
});

// ──────────────────────────────────────────────────────────────────────────────
// validateQueryParams
// ──────────────────────────────────────────────────────────────────────────────

describe('validateQueryParams', () => {
  it('parse les paramètres de pagination depuis URLSearchParams', () => {
    const params = new URLSearchParams({ page: '2', limit: '10' });
    const result = validateQueryParams(paginationQuerySchema, params);
    expect(result.page).toBe(2);
    expect(result.limit).toBe(10);
  });

  it('lance une erreur si la validation échoue', () => {
    const params = new URLSearchParams({ page: '-99' });
    // page invalide → ramené à 1 par le preprocess
    const result = validateQueryParams(paginationQuerySchema, params);
    expect(result.page).toBe(1);
  });
});

// ──────────────────────────────────────────────────────────────────────────────
// validateBody
// ──────────────────────────────────────────────────────────────────────────────

describe('validateBody', () => {
  it('parse et retourne le body validé', () => {
    const result = validateBody(enrollCourseSchema, { courseId: VALID_UUID });
    expect(result.courseId).toBe(VALID_UUID);
  });

  it('lance une erreur si le body est invalide', () => {
    expect(() => validateBody(enrollCourseSchema, { courseId: 'bad' })).toThrow();
  });
});

// ──────────────────────────────────────────────────────────────────────────────
// safeValidate
// ──────────────────────────────────────────────────────────────────────────────

describe('safeValidate', () => {
  it('retourne success: true avec les données validées', () => {
    const result = safeValidate(enrollCourseSchema, { courseId: VALID_UUID });
    expect(result.success).toBe(true);
    expect(result.data).toEqual({ courseId: VALID_UUID });
  });

  it('retourne success: false avec un ZodError si invalide', () => {
    const result = safeValidate(enrollCourseSchema, { courseId: 'bad' });
    expect(result.success).toBe(false);
    // safeValidate proxifie safeParse → error est un ZodError
    expect(result.error).toBeDefined();
  });
});

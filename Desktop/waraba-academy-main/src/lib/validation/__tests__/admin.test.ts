/**
 * Tests unitaires pour src/lib/validation/admin.ts
 * @jest-environment node
 */

import {
  createUserSchema,
  updateUserSchema,
  createCourseSchema,
  updateCourseSchema,
  paginationSchema,
  checkPermissionsSchema,
  createAdminRoleSchema,
  createCategorySchema,
  validateAndParse,
  safeValidate,
} from '../admin';

const VALID_UUID = '123e4567-e89b-12d3-a456-426614174000';

// ──────────────────────────────────────────────────────────────────────────────
// createUserSchema
// ──────────────────────────────────────────────────────────────────────────────

describe('createUserSchema', () => {
  const valid = {
    email: 'user@example.com',
    password: 'Password123',
    first_name: 'Mamadou',
    last_name: 'Diallo',
    role: 'student' as const,
  };

  it('valide un utilisateur complet', () => {
    expect(() => createUserSchema.parse(valid)).not.toThrow();
  });

  it('accepte tous les rôles valides', () => {
    for (const role of ['admin', 'instructor', 'student'] as const) {
      expect(() => createUserSchema.parse({ ...valid, role })).not.toThrow();
    }
  });

  it('rejette un rôle invalide', () => {
    expect(() => createUserSchema.parse({ ...valid, role: 'superadmin' })).toThrow();
  });

  it('rejette un email invalide', () => {
    expect(() => createUserSchema.parse({ ...valid, email: 'not-email' })).toThrow();
  });

  it('rejette un mot de passe trop court', () => {
    expect(() => createUserSchema.parse({ ...valid, password: 'abc' })).toThrow();
  });

  it('rejette un prénom vide', () => {
    expect(() => createUserSchema.parse({ ...valid, first_name: '' })).toThrow();
  });

  it('accepte admin_role_id UUID optionnel', () => {
    const result = createUserSchema.parse({ ...valid, admin_role_id: VALID_UUID });
    expect(result.admin_role_id).toBe(VALID_UUID);
  });

  it('accepte admin_role_id null', () => {
    expect(() => createUserSchema.parse({ ...valid, admin_role_id: null })).not.toThrow();
  });
});

// ──────────────────────────────────────────────────────────────────────────────
// updateUserSchema
// ──────────────────────────────────────────────────────────────────────────────

describe('updateUserSchema', () => {
  it('valide une mise à jour partielle', () => {
    expect(() => updateUserSchema.parse({ first_name: 'Nouveau' })).not.toThrow();
    expect(() => updateUserSchema.parse({ email: 'new@test.com' })).not.toThrow();
  });

  it('valide un objet vide (tout optionnel)', () => {
    expect(() => updateUserSchema.parse({})).not.toThrow();
  });

  it('rejette un email invalide', () => {
    expect(() => updateUserSchema.parse({ email: 'bad-email' })).toThrow();
  });

  it('rejette un rôle invalide', () => {
    expect(() => updateUserSchema.parse({ role: 'superadmin' })).toThrow();
  });
});

// ──────────────────────────────────────────────────────────────────────────────
// createCourseSchema
// ──────────────────────────────────────────────────────────────────────────────

describe('createCourseSchema', () => {
  const valid = {
    title: 'Introduction au Marketing',
    description: 'Un cours complet sur le marketing digital',
    category_id: VALID_UUID,
    price: 29.99,
  };

  it('valide un cours complet', () => {
    expect(() => createCourseSchema.parse(valid)).not.toThrow();
  });

  it('accepte un prix à 0 (cours gratuit)', () => {
    expect(() => createCourseSchema.parse({ ...valid, price: 0 })).not.toThrow();
  });

  it('rejette un titre vide', () => {
    expect(() => createCourseSchema.parse({ ...valid, title: '' })).toThrow();
  });

  it('rejette une description trop courte (< 10 chars)', () => {
    expect(() => createCourseSchema.parse({ ...valid, description: 'Court' })).toThrow();
  });

  it('rejette un prix négatif', () => {
    expect(() => createCourseSchema.parse({ ...valid, price: -5 })).toThrow();
  });

  it('rejette un category_id non-UUID', () => {
    expect(() => createCourseSchema.parse({ ...valid, category_id: 'slug' })).toThrow();
  });

  it('accepte thumbnail_url et video_url optionnels', () => {
    const result = createCourseSchema.parse({
      ...valid,
      thumbnail_url: 'https://example.com/img.jpg',
      video_url: 'https://youtube.com/watch?v=abc',
    });
    expect(result.thumbnail_url).toBe('https://example.com/img.jpg');
  });
});

// ──────────────────────────────────────────────────────────────────────────────
// updateCourseSchema (partial de createCourseSchema)
// ──────────────────────────────────────────────────────────────────────────────

describe('updateCourseSchema', () => {
  it('valide une mise à jour partielle', () => {
    expect(() => updateCourseSchema.parse({ title: 'Nouveau Titre' })).not.toThrow();
    expect(() => updateCourseSchema.parse({ price: 49.99 })).not.toThrow();
  });

  it('valide un objet vide', () => {
    expect(() => updateCourseSchema.parse({})).not.toThrow();
  });

  it('rejette un prix négatif même en update', () => {
    expect(() => updateCourseSchema.parse({ price: -1 })).toThrow();
  });
});

// ──────────────────────────────────────────────────────────────────────────────
// paginationSchema (admin version avec role/status)
// ──────────────────────────────────────────────────────────────────────────────

describe('paginationSchema (admin)', () => {
  it('utilise les valeurs par défaut', () => {
    const result = paginationSchema.parse({});
    expect(result.page).toBe(1);
    expect(result.limit).toBe(20);
  });

  it('parse page et limit depuis des strings', () => {
    const result = paginationSchema.parse({ page: '3', limit: '15' });
    expect(result.page).toBe(3);
    expect(result.limit).toBe(15);
  });

  it('accepte un rôle valide', () => {
    const result = paginationSchema.parse({ role: 'instructor' });
    expect(result.role).toBe('instructor');
  });

  it('retourne role undefined si invalide', () => {
    const result = paginationSchema.parse({ role: 'superadmin' });
    expect(result.role).toBeUndefined();
  });

  it('accepte un status valide', () => {
    expect(paginationSchema.parse({ status: 'active' }).status).toBe('active');
    expect(paginationSchema.parse({ status: 'inactive' }).status).toBe('inactive');
  });

  it('retourne status undefined si invalide', () => {
    const result = paginationSchema.parse({ status: 'banned' });
    expect(result.status).toBeUndefined();
  });

  it('limite limit à 100 maximum', () => {
    expect(paginationSchema.parse({ limit: '500' }).limit).toBe(100);
  });
});

// ──────────────────────────────────────────────────────────────────────────────
// checkPermissionsSchema
// ──────────────────────────────────────────────────────────────────────────────

describe('checkPermissionsSchema', () => {
  it('valide avec une liste de permissions', () => {
    expect(() => checkPermissionsSchema.parse({ permissions: ['users.read', 'courses.manage'] })).not.toThrow();
  });

  it('rejette une liste vide', () => {
    expect(() => checkPermissionsSchema.parse({ permissions: [] })).toThrow();
  });
});

// ──────────────────────────────────────────────────────────────────────────────
// createAdminRoleSchema
// ──────────────────────────────────────────────────────────────────────────────

describe('createAdminRoleSchema', () => {
  it('valide un rôle minimal', () => {
    expect(() => createAdminRoleSchema.parse({ name: 'Modérateur' })).not.toThrow();
  });

  it('rejette un nom vide', () => {
    expect(() => createAdminRoleSchema.parse({ name: '' })).toThrow();
  });

  it('accepte des permissions UUID', () => {
    const result = createAdminRoleSchema.parse({ name: 'Rôle', permissions: [VALID_UUID] });
    expect(result.permissions).toHaveLength(1);
  });
});

// ──────────────────────────────────────────────────────────────────────────────
// createCategorySchema
// ──────────────────────────────────────────────────────────────────────────────

describe('createCategorySchema', () => {
  const valid = { name: 'Marketing', slug: 'marketing' };

  it('valide une catégorie correcte', () => {
    expect(() => createCategorySchema.parse(valid)).not.toThrow();
  });

  it('rejette un slug avec des majuscules', () => {
    expect(() => createCategorySchema.parse({ ...valid, slug: 'Marketing-Digital' })).toThrow();
  });

  it('rejette un slug avec des espaces', () => {
    expect(() => createCategorySchema.parse({ ...valid, slug: 'marketing digital' })).toThrow();
  });

  it('accepte un slug valide avec tirets et chiffres', () => {
    expect(() => createCategorySchema.parse({ ...valid, slug: 'web-dev-2025' })).not.toThrow();
  });

  it('rejette un nom vide', () => {
    expect(() => createCategorySchema.parse({ ...valid, name: '' })).toThrow();
  });
});

// ──────────────────────────────────────────────────────────────────────────────
// validateAndParse / safeValidate (admin version)
// ──────────────────────────────────────────────────────────────────────────────

describe('validateAndParse', () => {
  it('retourne les données validées', () => {
    const result = validateAndParse(enrollCourseSchemaCompat, { courseId: VALID_UUID });
    expect(result.courseId).toBe(VALID_UUID);
  });

  it('lance une erreur Zod si invalide', () => {
    expect(() => validateAndParse(enrollCourseSchemaCompat, { courseId: 'bad' })).toThrow();
  });
});

describe('safeValidate (admin)', () => {
  it('retourne success: true et les données', () => {
    const result = safeValidate(createCategorySchema, { name: 'Tech', slug: 'tech' });
    expect(result.success).toBe(true);
    expect(result.data?.name).toBe('Tech');
  });

  it('retourne success: false avec un message d\'erreur', () => {
    const result = safeValidate(createCategorySchema, { name: '', slug: '' });
    expect(result.success).toBe(false);
    expect(result.error).toBeTruthy();
  });

  it('ne lance pas d\'exception même si invalide', () => {
    expect(() => safeValidate(createCategorySchema, null)).not.toThrow();
  });
});

// Proxy pour les tests validateAndParse
import { z } from 'zod';
const enrollCourseSchemaCompat = z.object({ courseId: z.string().uuid() });

/**
 * Tests unitaires pour src/lib/constants.ts
 * Vérifie la structure et les valeurs des constantes métier
 * @jest-environment node
 */

import {
  USER_ROLES,
  ADMIN_ROLES,
  PERMISSIONS,
  ENROLLMENT_STATUS,
  PAYMENT_STATUS,
  CACHE_TTL,
  RATE_LIMIT,
  SITE_STATS,
} from '@/lib/constants';

// ──────────────────────────────────────────────────────────────────────────────
// USER_ROLES
// ──────────────────────────────────────────────────────────────────────────────

describe('USER_ROLES', () => {
  it('contient les trois rôles principaux', () => {
    expect(USER_ROLES.ADMIN).toBe('admin');
    expect(USER_ROLES.INSTRUCTOR).toBe('instructor');
    expect(USER_ROLES.STUDENT).toBe('student');
  });

  it('n\'a pas de valeurs dupliquées', () => {
    const values = Object.values(USER_ROLES);
    expect(new Set(values).size).toBe(values.length);
  });
});

// ──────────────────────────────────────────────────────────────────────────────
// ADMIN_ROLES
// ──────────────────────────────────────────────────────────────────────────────

describe('ADMIN_ROLES', () => {
  it('contient les rôles admin attendus', () => {
    expect(ADMIN_ROLES.SUPER_ADMIN).toBe('super_admin');
    expect(ADMIN_ROLES.ADMIN).toBe('admin');
    expect(ADMIN_ROLES.MODERATOR).toBe('moderator');
  });

  it('n\'a pas de valeurs dupliquées', () => {
    const values = Object.values(ADMIN_ROLES);
    expect(new Set(values).size).toBe(values.length);
  });
});

// ──────────────────────────────────────────────────────────────────────────────
// PERMISSIONS
// ──────────────────────────────────────────────────────────────────────────────

describe('PERMISSIONS', () => {
  it('a des permissions pour les utilisateurs', () => {
    expect(PERMISSIONS.USERS_READ).toBe('users.read');
    expect(PERMISSIONS.USERS_WRITE).toBe('users.write');
    expect(PERMISSIONS.USERS_DELETE).toBe('users.delete');
  });

  it('a des permissions pour les cours', () => {
    expect(PERMISSIONS.COURSES_MANAGE).toBe('courses.manage');
    expect(PERMISSIONS.COURSES_CREATE).toBe('courses.create');
    expect(PERMISSIONS.COURSES_EDIT).toBe('courses.edit');
    expect(PERMISSIONS.COURSES_DELETE).toBe('courses.delete');
  });

  it('a une permission universelle "*"', () => {
    expect(PERMISSIONS.ALL).toBe('*');
  });

  it('utilise le format "domaine.action"', () => {
    const perms = Object.values(PERMISSIONS).filter(p => p !== '*');
    perms.forEach(p => {
      expect(p).toMatch(/^\w+\.\w+$/);
    });
  });
});

// ──────────────────────────────────────────────────────────────────────────────
// ENROLLMENT_STATUS
// ──────────────────────────────────────────────────────────────────────────────

describe('ENROLLMENT_STATUS', () => {
  it('contient les statuts d\'inscription attendus', () => {
    expect(ENROLLMENT_STATUS.PENDING).toBe('pending');
    expect(ENROLLMENT_STATUS.ACTIVE).toBe('active');
    expect(ENROLLMENT_STATUS.COMPLETED).toBe('completed');
    expect(ENROLLMENT_STATUS.CANCELLED).toBe('cancelled');
  });

  it('a exactement 4 statuts', () => {
    expect(Object.keys(ENROLLMENT_STATUS)).toHaveLength(4);
  });

  it('n\'a pas de valeurs dupliquées', () => {
    const values = Object.values(ENROLLMENT_STATUS);
    expect(new Set(values).size).toBe(values.length);
  });
});

// ──────────────────────────────────────────────────────────────────────────────
// PAYMENT_STATUS
// ──────────────────────────────────────────────────────────────────────────────

describe('PAYMENT_STATUS', () => {
  it('contient les statuts de paiement attendus', () => {
    expect(PAYMENT_STATUS.PENDING).toBe('pending');
    expect(PAYMENT_STATUS.COMPLETED).toBe('completed');
    expect(PAYMENT_STATUS.FAILED).toBe('failed');
    expect(PAYMENT_STATUS.REFUNDED).toBe('refunded');
  });

  it('a exactement 4 statuts', () => {
    expect(Object.keys(PAYMENT_STATUS)).toHaveLength(4);
  });
});

// ──────────────────────────────────────────────────────────────────────────────
// CACHE_TTL
// ──────────────────────────────────────────────────────────────────────────────

describe('CACHE_TTL', () => {
  it('a des durées positives en secondes', () => {
    expect(CACHE_TTL.USER_ROLE).toBeGreaterThan(0);
    expect(CACHE_TTL.ADMIN_PERMISSIONS).toBeGreaterThan(0);
    expect(CACHE_TTL.STATS).toBeGreaterThan(0);
  });

  it('les permissions admin durent plus longtemps que les stats', () => {
    expect(CACHE_TTL.ADMIN_PERMISSIONS).toBeGreaterThan(CACHE_TTL.STATS);
  });

  it('les valeurs sont en secondes (< 1 heure)', () => {
    Object.values(CACHE_TTL).forEach(ttl => {
      expect(ttl).toBeLessThan(3600);
    });
  });
});

// ──────────────────────────────────────────────────────────────────────────────
// RATE_LIMIT
// ──────────────────────────────────────────────────────────────────────────────

describe('RATE_LIMIT', () => {
  it('a des limites pour LOGIN, ADMIN_API et API', () => {
    expect(RATE_LIMIT.LOGIN).toBeDefined();
    expect(RATE_LIMIT.ADMIN_API).toBeDefined();
    expect(RATE_LIMIT.API).toBeDefined();
  });

  it('LOGIN est plus restrictif (moins de requêtes) que l\'API générale', () => {
    expect(RATE_LIMIT.LOGIN.maxRequests).toBeLessThan(RATE_LIMIT.API.maxRequests);
  });

  it('chaque limite a maxRequests et windowMs positifs', () => {
    Object.values(RATE_LIMIT).forEach(limit => {
      expect(limit.maxRequests).toBeGreaterThan(0);
      expect(limit.windowMs).toBeGreaterThan(0);
    });
  });

  it('LOGIN a 5 tentatives max (protection brute-force)', () => {
    expect(RATE_LIMIT.LOGIN.maxRequests).toBe(5);
  });
});

// ──────────────────────────────────────────────────────────────────────────────
// SITE_STATS
// ──────────────────────────────────────────────────────────────────────────────

describe('SITE_STATS', () => {
  it('a les stats de base du site', () => {
    expect(SITE_STATS.students).toBeDefined();
    expect(SITE_STATS.courses).toBeDefined();
    expect(SITE_STATS.satisfaction).toBeDefined();
    expect(SITE_STATS.countries).toBeDefined();
  });

  it('satisfaction contient "%"', () => {
    expect(SITE_STATS.satisfaction).toContain('%');
  });

  it('toutes les valeurs sont des chaînes non vides', () => {
    Object.values(SITE_STATS).forEach(v => {
      expect(typeof v).toBe('string');
      expect(v.length).toBeGreaterThan(0);
    });
  });
});

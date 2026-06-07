/**
 * Tests unitaires pour src/lib/api/apiUtils.ts
 * @jest-environment node
 */

import { NextResponse } from 'next/server';
import {
  successResponse,
  errorResponse,
  withErrorHandling,
  parsePagination,
  normalizeLevel,
  CACHE_HEADERS,
  LEVEL_MAP,
} from '@/lib/api/apiUtils';

// ──────────────────────────────────────────────────────────────────────────────
// successResponse
// ──────────────────────────────────────────────────────────────────────────────

describe('successResponse', () => {
  it('retourne un NextResponse avec success: true', async () => {
    const res = successResponse({ id: 1, name: 'Test' });
    expect(res).toBeInstanceOf(NextResponse);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.data).toEqual({ id: 1, name: 'Test' });
  });

  it('utilise le status 200 par défaut', async () => {
    const res = successResponse({});
    expect(res.status).toBe(200);
  });

  it('accepte un status personnalisé', async () => {
    const res = successResponse({}, { status: 201 });
    expect(res.status).toBe(201);
  });

  it('inclut les métadonnées si fournies', async () => {
    const res = successResponse([], { meta: { count: 42, page: 1, limit: 20 } });
    const body = await res.json();
    expect(body.meta).toEqual({ count: 42, page: 1, limit: 20 });
  });

  it('utilise NO_CACHE par défaut', async () => {
    const res = successResponse({});
    expect(res.headers.get('Cache-Control')).toBe(CACHE_HEADERS.NO_CACHE['Cache-Control']);
  });

  it('applique les headers LONG quand spécifié', async () => {
    const res = successResponse({}, { cache: 'LONG' });
    expect(res.headers.get('Cache-Control')).toBe(CACHE_HEADERS.LONG['Cache-Control']);
  });

  it('n\'inclut pas meta si non fourni', async () => {
    const res = successResponse({ ok: true });
    const body = await res.json();
    expect(body.meta).toBeUndefined();
  });
});

// ──────────────────────────────────────────────────────────────────────────────
// errorResponse
// ──────────────────────────────────────────────────────────────────────────────

describe('errorResponse', () => {
  it('retourne un NextResponse avec success: false', async () => {
    const res = errorResponse('Something went wrong');
    expect(res).toBeInstanceOf(NextResponse);
    const body = await res.json();
    expect(body.success).toBe(false);
    expect(body.error).toBe('Something went wrong');
  });

  it('utilise le status 500 par défaut', async () => {
    const res = errorResponse('Erreur');
    expect(res.status).toBe(500);
  });

  it('accepte un status personnalisé', async () => {
    const res = errorResponse('Non trouvé', { status: 404 });
    expect(res.status).toBe(404);
  });

  it('inclut le code si fourni', async () => {
    const res = errorResponse('Non autorisé', { status: 401, code: 'UNAUTHORIZED' });
    const body = await res.json();
    expect(body.code).toBe('UNAUTHORIZED');
  });

  it('n\'inclut pas le code si non fourni', async () => {
    const res = errorResponse('Erreur');
    const body = await res.json();
    expect(body.code).toBeUndefined();
  });

  it('applique toujours NO_CACHE sur les erreurs', async () => {
    const res = errorResponse('Erreur');
    expect(res.headers.get('Cache-Control')).toBe(CACHE_HEADERS.NO_CACHE['Cache-Control']);
  });
});

// ──────────────────────────────────────────────────────────────────────────────
// withErrorHandling
// ──────────────────────────────────────────────────────────────────────────────

describe('withErrorHandling', () => {
  it('retourne le résultat du handler si pas d\'erreur', async () => {
    const res = await withErrorHandling(async () => successResponse({ ok: true }));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
  });

  it('retourne une erreur 500 si le handler lance une exception Error', async () => {
    const res = await withErrorHandling(async () => {
      throw new Error('Crash inattendu');
    });
    expect(res.status).toBe(500);
    const body = await res.json();
    expect(body.success).toBe(false);
    expect(body.error).toBe('Crash inattendu');
  });

  it('retourne une erreur 500 générique si l\'exception n\'est pas une Error', async () => {
    const res = await withErrorHandling(async () => {
      throw 'string error';
    });
    expect(res.status).toBe(500);
    const body = await res.json();
    expect(body.success).toBe(false);
    expect(body.error).toBe('Erreur interne du serveur');
  });
});

// ──────────────────────────────────────────────────────────────────────────────
// parsePagination
// ──────────────────────────────────────────────────────────────────────────────

describe('parsePagination', () => {
  it('retourne les valeurs par défaut (page=1, limit=20)', () => {
    const params = new URLSearchParams();
    const result = parsePagination(params);
    expect(result).toEqual({ page: 1, limit: 20, offset: 0 });
  });

  it('parse correctement page et limit', () => {
    const params = new URLSearchParams({ page: '3', limit: '10' });
    const result = parsePagination(params);
    expect(result).toEqual({ page: 3, limit: 10, offset: 20 });
  });

  it('calcule l\'offset correctement', () => {
    const params = new URLSearchParams({ page: '5', limit: '10' });
    const { offset } = parsePagination(params);
    expect(offset).toBe(40);
  });

  it('limite limit à 100 maximum', () => {
    const params = new URLSearchParams({ limit: '999' });
    const { limit } = parsePagination(params);
    expect(limit).toBe(100);
  });

  it('limite page à 1 minimum', () => {
    const params = new URLSearchParams({ page: '-5' });
    const { page } = parsePagination(params);
    expect(page).toBe(1);
  });

  it('limite limit à 1 minimum', () => {
    const params = new URLSearchParams({ limit: '0' });
    const { limit } = parsePagination(params);
    expect(limit).toBe(1);
  });

  it('ignore les valeurs non numériques et utilise les défauts', () => {
    const params = new URLSearchParams({ page: 'abc', limit: 'xyz' });
    const result = parsePagination(params);
    expect(result.page).toBe(1);
    expect(result.limit).toBe(20);
  });
});

// ──────────────────────────────────────────────────────────────────────────────
// normalizeLevel
// ──────────────────────────────────────────────────────────────────────────────

describe('normalizeLevel', () => {
  it('normalise les niveaux français en anglais', () => {
    expect(normalizeLevel('DÉBUTANT')).toBe('beginner');
    expect(normalizeLevel('INTERMÉDIAIRE')).toBe('intermediate');
    expect(normalizeLevel('AVANCÉ')).toBe('advanced');
  });

  it('normalise les variantes sans accents', () => {
    expect(normalizeLevel('DEBUTANT')).toBe('beginner');
    expect(normalizeLevel('INTERMEDIAIRE')).toBe('intermediate');
    expect(normalizeLevel('AVANCE')).toBe('advanced');
  });

  it('normalise les niveaux anglais en minuscules', () => {
    expect(normalizeLevel('BEGINNER')).toBe('beginner');
    expect(normalizeLevel('INTERMEDIATE')).toBe('intermediate');
    expect(normalizeLevel('ADVANCED')).toBe('advanced');
  });

  it('retourne la valeur en minuscules si non reconnue', () => {
    expect(normalizeLevel('EXPERT')).toBe('expert');
    expect(normalizeLevel('Unknown')).toBe('unknown');
  });
});

// ──────────────────────────────────────────────────────────────────────────────
// CACHE_HEADERS
// ──────────────────────────────────────────────────────────────────────────────

describe('CACHE_HEADERS', () => {
  it('NO_CACHE désactive le cache', () => {
    expect(CACHE_HEADERS.NO_CACHE['Cache-Control']).toContain('no-store');
  });

  it('SHORT a une durée courte', () => {
    expect(CACHE_HEADERS.SHORT['Cache-Control']).toContain('max-age=60');
  });

  it('MEDIUM a une durée moyenne', () => {
    expect(CACHE_HEADERS.MEDIUM['Cache-Control']).toContain('max-age=300');
  });

  it('LONG a une longue durée', () => {
    expect(CACHE_HEADERS.LONG['Cache-Control']).toContain('max-age=3600');
  });
});

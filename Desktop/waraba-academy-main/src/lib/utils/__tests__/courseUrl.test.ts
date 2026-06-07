/**
 * Tests unitaires pour src/lib/utils/courseUrl.ts
 * @jest-environment node
 */

import { getCourseUrl, generateCourseSlug, getCourseLearnUrl } from '../courseUrl';

// ──────────────────────────────────────────────────────────────────────────────
// getCourseUrl
// ──────────────────────────────────────────────────────────────────────────────

describe('getCourseUrl', () => {
  it('utilise le slug si disponible', () => {
    const course = { id: 'uuid-123', slug: 'marketing-digital' };
    expect(getCourseUrl(course)).toBe('/courses/marketing-digital');
  });

  it('utilise l\'ID si pas de slug', () => {
    const course = { id: 'uuid-123' };
    expect(getCourseUrl(course)).toBe('/courses/uuid-123');
  });

  it('préfère le slug à l\'ID même si l\'ID est présent', () => {
    const course = { id: 'uuid-123', slug: 'mon-cours' };
    expect(getCourseUrl(course)).toBe('/courses/mon-cours');
  });

  it('gère un slug vide (utilise l\'ID)', () => {
    const course = { id: 'uuid-123', slug: '' };
    expect(getCourseUrl(course)).toBe('/courses/uuid-123');
  });
});

// ──────────────────────────────────────────────────────────────────────────────
// generateCourseSlug
// ──────────────────────────────────────────────────────────────────────────────

describe('generateCourseSlug', () => {
  it('génère un slug à partir d\'un titre', () => {
    expect(generateCourseSlug('Marketing Digital')).toBe('marketing-digital');
  });

  it('supprime les accents', () => {
    expect(generateCourseSlug('Développement Web')).toBe('developpement-web');
  });

  it('gère les titres avec caractères spéciaux', () => {
    const result = generateCourseSlug('React & Next.js : Guide Complet');
    expect(result).not.toContain('&');
    expect(result).not.toContain(':');
    expect(result).toContain('react');
    expect(result).toContain('next');
  });
});

// ──────────────────────────────────────────────────────────────────────────────
// getCourseLearnUrl
// ──────────────────────────────────────────────────────────────────────────────

describe('getCourseLearnUrl', () => {
  it('utilise le slug s\'il existe (objet)', () => {
    const course = { id: 'uuid-123', slug: 'marketing-digital' };
    expect(getCourseLearnUrl(course)).toBe('/courses/marketing-digital/learn');
  });

  it('utilise l\'ID si pas de slug (objet)', () => {
    const course = { id: 'uuid-123' };
    expect(getCourseLearnUrl(course)).toBe('/courses/uuid-123/learn');
  });

  it('accepte une chaîne directement (ID ou slug)', () => {
    expect(getCourseLearnUrl('uuid-123')).toBe('/courses/uuid-123/learn');
    expect(getCourseLearnUrl('marketing-digital')).toBe('/courses/marketing-digital/learn');
  });

  it('gère un slug vide (utilise l\'ID)', () => {
    const course = { id: 'uuid-123', slug: '' };
    expect(getCourseLearnUrl(course)).toBe('/courses/uuid-123/learn');
  });
});

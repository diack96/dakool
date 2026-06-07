/**
 * Tests unitaires pour src/lib/utils/slug.ts
 * @jest-environment node
 */

import { generateSlug, isUUID } from '../slug';

// ──────────────────────────────────────────────────────────────────────────────
// generateSlug
// ──────────────────────────────────────────────────────────────────────────────

describe('generateSlug', () => {
  it('convertit en minuscules', () => {
    expect(generateSlug('HELLO WORLD')).toBe('hello-world');
  });

  it('remplace les espaces par des tirets', () => {
    expect(generateSlug('Marketing Digital')).toBe('marketing-digital');
  });

  it('supprime les accents', () => {
    expect(generateSlug('Développement Web')).toBe('developpement-web');
    expect(generateSlug('Données Structurées')).toBe('donnees-structurees');
    expect(generateSlug('Créativité & Innovation')).toBe('creativite-innovation');
  });

  it('supprime les caractères spéciaux', () => {
    expect(generateSlug('C++ & Java!')).not.toContain('+');
    expect(generateSlug('Hello, World!')).toBe('hello-world');
  });

  it('supprime les tirets en début et fin', () => {
    expect(generateSlug('-hello-')).toBe('hello');
    expect(generateSlug('---test---')).toBe('test');
  });

  it('remplace plusieurs espaces/tirets consécutifs par un seul tiret', () => {
    expect(generateSlug('hello   world')).toBe('hello-world');
    expect(generateSlug('a---b')).toBe('a-b');
  });

  it('limite le slug à 100 caractères', () => {
    const longTitle = 'a'.repeat(200);
    expect(generateSlug(longTitle).length).toBeLessThanOrEqual(100);
  });

  it('gère les titres de cours réels', () => {
    expect(generateSlug('Introduction au Marketing Digital')).toBe('introduction-au-marketing-digital');
    expect(generateSlug('JavaScript Avancé - ES2025')).toBe('javascript-avance-es2025');
    expect(generateSlug('Gestion de Projet Agile & Scrum')).toBe('gestion-de-projet-agile-scrum');
  });

  it('gère un texte déjà en format slug', () => {
    expect(generateSlug('already-a-slug')).toBe('already-a-slug');
  });

  it('gère un texte vide', () => {
    expect(generateSlug('')).toBe('');
  });

  it('gère les chiffres', () => {
    expect(generateSlug('Module 1 : Introduction')).toBe('module-1-introduction');
  });
});

// ──────────────────────────────────────────────────────────────────────────────
// isUUID
// ──────────────────────────────────────────────────────────────────────────────

describe('isUUID', () => {
  it('retourne true pour un UUID v4 valide', () => {
    expect(isUUID('123e4567-e89b-12d3-a456-426614174000')).toBe(true);
    expect(isUUID('550e8400-e29b-41d4-a716-446655440000')).toBe(true);
    expect(isUUID('00000000-0000-0000-0000-000000000000')).toBe(true);
  });

  it('est insensible à la casse', () => {
    expect(isUUID('123E4567-E89B-12D3-A456-426614174000')).toBe(true);
    expect(isUUID('123e4567-E89B-12d3-A456-426614174000')).toBe(true);
  });

  it('retourne false pour un slug (texte)', () => {
    expect(isUUID('marketing-digital')).toBe(false);
    expect(isUUID('introduction-au-web')).toBe(false);
  });

  it('retourne false pour une chaîne vide', () => {
    expect(isUUID('')).toBe(false);
  });

  it('retourne false pour un UUID mal formé', () => {
    expect(isUUID('123e4567-e89b-12d3-a456')).toBe(false); // trop court
    expect(isUUID('123e4567e89b12d3a456426614174000')).toBe(false); // sans tirets
    expect(isUUID('gggggggg-gggg-gggg-gggg-gggggggggggg')).toBe(false); // caractères invalides
  });

  it('retourne false pour un nombre', () => {
    expect(isUUID('12345')).toBe(false);
  });
});

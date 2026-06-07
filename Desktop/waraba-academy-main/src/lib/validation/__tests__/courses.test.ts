/**
 * Tests unitaires pour src/lib/validation/courses.ts
 * @jest-environment node
 */

import {
  createLessonSchema,
  lessonProgressSchema,
  updateProgressSchema,
} from '../courses';

// ──────────────────────────────────────────────────────────────────────────────
// createLessonSchema
// ──────────────────────────────────────────────────────────────────────────────

describe('createLessonSchema', () => {
  const valid = {
    title: 'Introduction aux variables',
    description: 'Apprenez les bases des variables en programmation',
    content: 'Dans cette leçon, nous allons voir comment déclarer des variables...',
    order: 1,
  };

  it('valide une leçon complète', () => {
    expect(() => createLessonSchema.parse(valid)).not.toThrow();
  });

  it('utilise order = 0 par défaut', () => {
    const result = createLessonSchema.parse({ ...valid, order: undefined });
    expect(result.order).toBe(0);
  });

  it('rejette un titre vide', () => {
    expect(() => createLessonSchema.parse({ ...valid, title: '' })).toThrow();
  });

  it('rejette un titre trop long (> 200 chars)', () => {
    expect(() => createLessonSchema.parse({ ...valid, title: 'A'.repeat(201) })).toThrow();
  });

  it('rejette une description vide', () => {
    expect(() => createLessonSchema.parse({ ...valid, description: '' })).toThrow();
  });

  it('rejette un contenu vide', () => {
    expect(() => createLessonSchema.parse({ ...valid, content: '' })).toThrow();
  });

  it('accepte videoUrl valide', () => {
    const result = createLessonSchema.parse({
      ...valid,
      videoUrl: 'https://youtube.com/watch?v=abc',
    });
    expect(result.videoUrl).toBe('https://youtube.com/watch?v=abc');
  });

  it('accepte videoUrl null', () => {
    expect(() => createLessonSchema.parse({ ...valid, videoUrl: null })).not.toThrow();
  });

  it('rejette une videoUrl invalide (non-URL)', () => {
    expect(() => createLessonSchema.parse({ ...valid, videoUrl: 'pas-une-url' })).toThrow();
  });

  it('accepte duration en minutes', () => {
    const result = createLessonSchema.parse({ ...valid, duration: 45 });
    expect(result.duration).toBe(45);
  });

  it('rejette une duration négative', () => {
    expect(() => createLessonSchema.parse({ ...valid, duration: -1 })).toThrow();
  });

  it('rejette un order négatif', () => {
    expect(() => createLessonSchema.parse({ ...valid, order: -1 })).toThrow();
  });
});

// ──────────────────────────────────────────────────────────────────────────────
// lessonProgressSchema
// ──────────────────────────────────────────────────────────────────────────────

describe('lessonProgressSchema', () => {
  it('valide un objet vide (tout optionnel)', () => {
    const result = lessonProgressSchema.parse({});
    expect(result.isCompleted).toBe(false); // valeur par défaut
  });

  it('valide une progression partielle', () => {
    const result = lessonProgressSchema.parse({ progress: 0.5, lastPlayedTime: 120 });
    expect(result.progress).toBe(0.5);
    expect(result.lastPlayedTime).toBe(120);
  });

  it('accepte progress = 0 et progress = 1 (bornes)', () => {
    expect(() => lessonProgressSchema.parse({ progress: 0 })).not.toThrow();
    expect(() => lessonProgressSchema.parse({ progress: 1 })).not.toThrow();
  });

  it('rejette progress > 1', () => {
    expect(() => lessonProgressSchema.parse({ progress: 1.5 })).toThrow();
  });

  it('rejette progress < 0', () => {
    expect(() => lessonProgressSchema.parse({ progress: -0.1 })).toThrow();
  });

  it('rejette lastPlayedTime négatif', () => {
    expect(() => lessonProgressSchema.parse({ lastPlayedTime: -1 })).toThrow();
  });

  it('accepte isCompleted true', () => {
    const result = lessonProgressSchema.parse({ isCompleted: true });
    expect(result.isCompleted).toBe(true);
  });
});

// ──────────────────────────────────────────────────────────────────────────────
// updateProgressSchema
// ──────────────────────────────────────────────────────────────────────────────

describe('updateProgressSchema', () => {
  it('valide avec les valeurs par défaut', () => {
    const result = updateProgressSchema.parse({});
    expect(result.lastPlayedTime).toBe(0);
    expect(result.isCompleted).toBe(false);
  });

  it('valide une progression complète', () => {
    const result = updateProgressSchema.parse({
      progress: 0.75,
      lastPlayedTime: 300,
      isCompleted: true,
    });
    expect(result.progress).toBe(0.75);
    expect(result.lastPlayedTime).toBe(300);
    expect(result.isCompleted).toBe(true);
  });

  it('accepte progress entre 0 et 1', () => {
    expect(() => updateProgressSchema.parse({ progress: 0 })).not.toThrow();
    expect(() => updateProgressSchema.parse({ progress: 1 })).not.toThrow();
  });

  it('rejette progress hors bornes', () => {
    expect(() => updateProgressSchema.parse({ progress: 2 })).toThrow();
    expect(() => updateProgressSchema.parse({ progress: -0.5 })).toThrow();
  });

  it('rejette lastPlayedTime négatif', () => {
    expect(() => updateProgressSchema.parse({ lastPlayedTime: -5 })).toThrow();
  });
});

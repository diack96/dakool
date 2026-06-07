/**
 * Tests unitaires pour src/lib/utils/video.ts
 * @jest-environment node
 */

import { isYouTubeUrl, extractYouTubeId, detectVideoType } from '../video';

// ──────────────────────────────────────────────────────────────────────────────
// isYouTubeUrl
// ──────────────────────────────────────────────────────────────────────────────

describe('isYouTubeUrl', () => {
  describe('URLs YouTube valides', () => {
    test.each([
      ['youtube.com/watch', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'],
      ['youtu.be (raccourci)', 'https://youtu.be/dQw4w9WgXcQ'],
      ['youtube.com/embed', 'https://www.youtube.com/embed/dQw4w9WgXcQ'],
      ['youtube.com/shorts', 'https://www.youtube.com/shorts/dQw4w9WgXcQ'],
      ['sans www', 'https://youtube.com/watch?v=abc123'],
      ['avec paramètres supplémentaires', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ&t=30s'],
    ])('retourne true pour: %s', (_label, url) => {
      expect(isYouTubeUrl(url)).toBe(true);
    });
  });

  describe('URLs non-YouTube', () => {
    test.each([
      ['Vimeo', 'https://vimeo.com/123456'],
      ['URL Supabase storage', 'https://example.supabase.co/storage/v1/video.mp4'],
      ['URL MP4 directe', 'https://example.com/video.mp4'],
      ['chaîne vide', ''],
      ['texte quelconque', 'pas une url'],
    ])('retourne false pour: %s', (_label, url) => {
      expect(isYouTubeUrl(url)).toBe(false);
    });
  });
});

// ──────────────────────────────────────────────────────────────────────────────
// extractYouTubeId
// ──────────────────────────────────────────────────────────────────────────────

describe('extractYouTubeId', () => {
  it('extrait l\'ID depuis youtube.com/watch', () => {
    expect(extractYouTubeId('https://www.youtube.com/watch?v=dQw4w9WgXcQ')).toBe('dQw4w9WgXcQ');
  });

  it('extrait l\'ID depuis youtu.be', () => {
    expect(extractYouTubeId('https://youtu.be/dQw4w9WgXcQ')).toBe('dQw4w9WgXcQ');
  });

  it('extrait l\'ID depuis youtube.com/embed', () => {
    expect(extractYouTubeId('https://www.youtube.com/embed/dQw4w9WgXcQ')).toBe('dQw4w9WgXcQ');
  });

  it('extrait l\'ID depuis youtube.com/shorts', () => {
    expect(extractYouTubeId('https://www.youtube.com/shorts/dQw4w9WgXcQ')).toBe('dQw4w9WgXcQ');
  });

  it('ignore les paramètres supplémentaires', () => {
    expect(extractYouTubeId('https://www.youtube.com/watch?v=dQw4w9WgXcQ&t=30s')).toBe('dQw4w9WgXcQ');
    expect(extractYouTubeId('https://youtu.be/dQw4w9WgXcQ?t=30')).toBe('dQw4w9WgXcQ');
  });

  it('retourne null pour une URL non-YouTube', () => {
    expect(extractYouTubeId('https://vimeo.com/123456')).toBeNull();
    expect(extractYouTubeId('https://example.com/video.mp4')).toBeNull();
  });

  it('retourne null pour une chaîne vide ou null', () => {
    expect(extractYouTubeId('')).toBeNull();
    expect(extractYouTubeId(null as any)).toBeNull();
  });
});

// ──────────────────────────────────────────────────────────────────────────────
// detectVideoType
// ──────────────────────────────────────────────────────────────────────────────

describe('detectVideoType', () => {
  it('détecte "youtube" pour les URLs YouTube', () => {
    expect(detectVideoType('https://www.youtube.com/watch?v=dQw4w9WgXcQ')).toBe('youtube');
    expect(detectVideoType('https://youtu.be/dQw4w9WgXcQ')).toBe('youtube');
  });

  it('détecte "direct" pour les fichiers vidéo MP4', () => {
    expect(detectVideoType('https://example.com/video.mp4')).toBe('direct');
    expect(detectVideoType('https://example.com/video.webm')).toBe('direct');
    expect(detectVideoType('https://example.com/video.ogg')).toBe('direct');
  });

  it('détecte "direct" pour les URLs Supabase storage', () => {
    expect(detectVideoType('https://example.supabase.co/storage/v1/object/video.mp4')).toBe('direct');
  });

  it('retourne "unknown" pour les URLs non reconnues', () => {
    expect(detectVideoType('https://vimeo.com/123456')).toBe('unknown');
    expect(detectVideoType('https://example.com/page')).toBe('unknown');
    expect(detectVideoType('pas-une-url')).toBe('unknown');
  });

  it('retourne "unknown" pour une chaîne vide', () => {
    expect(detectVideoType('')).toBe('unknown');
  });

  it('détecte "direct" pour les fichiers avec paramètres de query', () => {
    expect(detectVideoType('https://cdn.example.com/video.mp4?token=abc123')).toBe('direct');
  });
});

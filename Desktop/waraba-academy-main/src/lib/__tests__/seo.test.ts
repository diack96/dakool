/**
 * Tests unitaires pour src/lib/seo.ts
 * @jest-environment node
 */

import { defaultMetadata, generateCourseMetadata, generatePageMetadata } from '@/lib/seo';

const SITE_NAME = 'Waraba Academy';
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://waraba-academy.com';

// ──────────────────────────────────────────────────────────────────────────────
// defaultMetadata
// ──────────────────────────────────────────────────────────────────────────────

describe('defaultMetadata', () => {
  it('a un titre par défaut contenant le nom du site', () => {
    const title = defaultMetadata.title as { default: string; template: string };
    expect(title.default).toContain(SITE_NAME);
  });

  it('a un template de titre avec %s', () => {
    const title = defaultMetadata.title as { default: string; template: string };
    expect(title.template).toContain('%s');
    expect(title.template).toContain(SITE_NAME);
  });

  it('a une description non vide', () => {
    expect(typeof defaultMetadata.description).toBe('string');
    expect((defaultMetadata.description as string).length).toBeGreaterThan(10);
  });

  it('a des données OpenGraph correctes', () => {
    const og = defaultMetadata.openGraph as any;
    expect(og.type).toBe('website');
    expect(og.locale).toBe('fr_FR');
    expect(og.siteName).toBe(SITE_NAME);
    expect(og.images).toHaveLength(1);
    expect(og.images[0].width).toBe(1200);
    expect(og.images[0].height).toBe(630);
  });

  it('a des données Twitter correctes', () => {
    const tw = defaultMetadata.twitter as any;
    expect(tw.card).toBe('summary_large_image');
    expect(tw.images).toHaveLength(1);
  });

  it('configure les robots pour l\'indexation', () => {
    const robots = defaultMetadata.robots as any;
    expect(robots.index).toBe(true);
    expect(robots.follow).toBe(true);
  });

  it('a une metadataBase définie', () => {
    expect(defaultMetadata.metadataBase).toBeInstanceOf(URL);
  });

  it('contient des mots-clés pertinents', () => {
    const keywords = defaultMetadata.keywords as string[];
    expect(keywords).toContain('formation en ligne');
    expect(keywords).toContain('e-learning');
  });

  it('a la catégorie "education"', () => {
    expect(defaultMetadata.category).toBe('education');
  });
});

// ──────────────────────────────────────────────────────────────────────────────
// generateCourseMetadata
// ──────────────────────────────────────────────────────────────────────────────

describe('generateCourseMetadata', () => {
  const course = {
    title: 'Marketing Digital Avancé',
    description: 'Maîtrisez le marketing digital en 2025',
    image: 'https://example.com/marketing.jpg',
    slug: 'marketing-digital-avance',
  };

  it('génère le titre du cours', () => {
    const meta = generateCourseMetadata(course);
    expect(meta.title).toBe(course.title);
  });

  it('génère la description du cours', () => {
    const meta = generateCourseMetadata(course);
    expect(meta.description).toBe(course.description);
  });

  it('génère l\'URL canonique basée sur le slug', () => {
    const meta = generateCourseMetadata(course);
    const alternates = meta.alternates as any;
    expect(alternates.canonical).toContain(course.slug);
    expect(alternates.canonical).toContain('/courses/');
  });

  it('intègre le nom du site dans le titre OpenGraph', () => {
    const meta = generateCourseMetadata(course);
    const og = meta.openGraph as any;
    expect(og.title).toContain(SITE_NAME);
    expect(og.title).toContain(course.title);
  });

  it('utilise l\'image fournie', () => {
    const meta = generateCourseMetadata(course);
    const og = meta.openGraph as any;
    expect(og.images[0].url).toBe(course.image);
  });

  it('utilise une image par défaut si non fournie', () => {
    const courseWithoutImage = { title: 'Test', slug: 'test' };
    const meta = generateCourseMetadata(courseWithoutImage);
    const og = meta.openGraph as any;
    expect(og.images[0].url).toContain(SITE_URL);
  });

  it('génère une description par défaut si non fournie', () => {
    const courseWithoutDesc = { title: 'Test', slug: 'test' };
    const meta = generateCourseMetadata(courseWithoutDesc);
    expect(meta.description).toContain('Test');
  });

  it('a les dimensions d\'image correctes', () => {
    const meta = generateCourseMetadata(course);
    const og = meta.openGraph as any;
    expect(og.images[0].width).toBe(1200);
    expect(og.images[0].height).toBe(630);
  });

  it('configure Twitter card', () => {
    const meta = generateCourseMetadata(course);
    const tw = meta.twitter as any;
    expect(tw.card).toBe('summary_large_image');
    expect(tw.title).toContain(course.title);
    expect(tw.title).toContain(SITE_NAME);
  });
});

// ──────────────────────────────────────────────────────────────────────────────
// generatePageMetadata
// ──────────────────────────────────────────────────────────────────────────────

describe('generatePageMetadata', () => {
  it('génère les métadonnées d\'une page', () => {
    const meta = generatePageMetadata('À propos', 'Découvrez notre équipe', '/about');
    expect(meta.title).toBe('À propos');
    expect(meta.description).toBe('Découvrez notre équipe');
  });

  it('génère l\'URL canonique correcte', () => {
    const meta = generatePageMetadata('Contact', 'Contactez-nous', '/contact');
    const alternates = meta.alternates as any;
    expect(alternates.canonical).toContain('/contact');
    expect(alternates.canonical).toContain(SITE_URL);
  });

  it('intègre le nom du site dans les titres OG et Twitter', () => {
    const meta = generatePageMetadata('Blog', 'Articles', '/blog');
    const og = meta.openGraph as any;
    expect(og.title).toBe(`Blog | ${SITE_NAME}`);
    const tw = meta.twitter as any;
    expect(tw.title).toBe(`Blog | ${SITE_NAME}`);
  });

  it('utilise l\'image fournie', () => {
    const meta = generatePageMetadata('Test', 'Desc', '/test', 'https://example.com/img.jpg');
    const og = meta.openGraph as any;
    expect(og.images[0].url).toBe('https://example.com/img.jpg');
  });

  it('utilise une image par défaut si non fournie', () => {
    const meta = generatePageMetadata('Test', 'Desc', '/test');
    const og = meta.openGraph as any;
    expect(og.images[0].url).toContain(SITE_URL);
  });

  it('a les dimensions d\'image OG correctes', () => {
    const meta = generatePageMetadata('Test', 'Desc', '/test');
    const og = meta.openGraph as any;
    expect(og.images[0].width).toBe(1200);
    expect(og.images[0].height).toBe(630);
  });
});

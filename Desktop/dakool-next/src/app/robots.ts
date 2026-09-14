import type { MetadataRoute } from 'next';
import { SITE_LOCKED } from '@/lib/site-lock';

export default function robots(): MetadataRoute.Robots {
  /* Site fermé : rien à explorer, et pas de plan de site à annoncer. */
  if (SITE_LOCKED) {
    return { rules: { userAgent: '*', disallow: '/' } };
  }

  return {
    rules: {
      userAgent: '*',
      allow: '/',
    },
    sitemap: 'https://dakool.com/sitemap.xml',
  };
}

import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      /* Le tunnel de commande n'a rien à faire dans l'index. */
      disallow: '/checkout',
    },
    sitemap: 'https://dakool.sn/sitemap.xml',
  };
}

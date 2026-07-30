import type { MetadataRoute } from 'next';
import { products } from '@/data/products';
import { teams } from '@/data/teams';

const BASE_URL = 'https://dakool.sn';

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: BASE_URL, changeFrequency: 'weekly', priority: 1 },
    { url: `${BASE_URL}/produits`, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${BASE_URL}/equipes`, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE_URL}/tournois`, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE_URL}/histoire`, changeFrequency: 'yearly', priority: 0.6 },
    { url: `${BASE_URL}/contact`, changeFrequency: 'yearly', priority: 0.6 },
    { url: `${BASE_URL}/mentions-legales`, changeFrequency: 'yearly', priority: 0.2 },
    { url: `${BASE_URL}/confidentialite`, changeFrequency: 'yearly', priority: 0.2 },
    { url: `${BASE_URL}/cgv`, changeFrequency: 'yearly', priority: 0.2 },
  ];

  const productRoutes: MetadataRoute.Sitemap = products.map((product) => ({
    url: `${BASE_URL}/produits/${product.slug}`,
    changeFrequency: 'weekly',
    priority: 0.7,
  }));

  const teamRoutes: MetadataRoute.Sitemap = teams.map((team) => ({
    url: `${BASE_URL}/equipes/${team.slug}`,
    changeFrequency: 'monthly',
    priority: 0.5,
  }));

  return [...staticRoutes, ...productRoutes, ...teamRoutes].map((route) => ({
    ...route,
    lastModified,
  }));
}

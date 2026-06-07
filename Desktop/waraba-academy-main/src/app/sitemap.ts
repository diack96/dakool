import { MetadataRoute } from 'next';
import { createAdminSupabaseClient } from '@/lib/supabase-server';
import { getAllPosts } from '@/lib/blog';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://waraba-academy.com';
  const now = new Date();

  // ── Pages statiques ────────────────────────────────────────────────────────
  const staticPages: MetadataRoute.Sitemap = [
    { url: baseUrl,                        lastModified: now, changeFrequency: 'daily',   priority: 1.0 },
    { url: `${baseUrl}/courses`,           lastModified: now, changeFrequency: 'daily',   priority: 0.95 },
    { url: `${baseUrl}/categories`,        lastModified: now, changeFrequency: 'weekly',  priority: 0.85 },
    { url: `${baseUrl}/blog`,              lastModified: now, changeFrequency: 'weekly',  priority: 0.80 },
    { url: `${baseUrl}/about`,             lastModified: now, changeFrequency: 'monthly', priority: 0.70 },
    { url: `${baseUrl}/contact`,           lastModified: now, changeFrequency: 'monthly', priority: 0.65 },
    { url: `${baseUrl}/faq`,               lastModified: now, changeFrequency: 'monthly', priority: 0.70 },
    { url: `${baseUrl}/privacy`,           lastModified: now, changeFrequency: 'yearly',  priority: 0.30 },
    { url: `${baseUrl}/terms`,             lastModified: now, changeFrequency: 'yearly',  priority: 0.30 },
  ];

  // ── Articles de blog ───────────────────────────────────────────────────────
  const blogPosts = getAllPosts();
  const blogPages: MetadataRoute.Sitemap = blogPosts.map((post) => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: new Date(post.date),
    changeFrequency: 'monthly' as const,
    priority: 0.75,
  }));

  // ── Cours publiés ──────────────────────────────────────────────────────────
  let coursePages: MetadataRoute.Sitemap = [];
  try {
    const supabase = createAdminSupabaseClient();
    const { data: courses } = await supabase
      .from('courses')
      .select('id, slug, updated_at, is_published')
      .eq('is_published', true)
      .order('updated_at', { ascending: false });

    if (courses?.length) {
      coursePages = courses.map((c) => ({
        url: `${baseUrl}/courses/${c.slug || c.id}`,
        lastModified: c.updated_at ? new Date(c.updated_at) : now,
        changeFrequency: 'weekly' as const,
        priority: 0.90,
      }));
    }
  } catch {
    // sitemap reste partiel si la DB est indisponible
  }

  // ── Catégories actives ─────────────────────────────────────────────────────
  let categoryPages: MetadataRoute.Sitemap = [];
  try {
    const supabase = createAdminSupabaseClient();
    const { data: categories } = await supabase
      .from('categories')
      .select('slug, updated_at')
      .eq('is_active', true);

    if (categories?.length) {
      categoryPages = categories.map((c) => ({
        url: `${baseUrl}/categories/${c.slug}`,
        lastModified: c.updated_at ? new Date(c.updated_at) : now,
        changeFrequency: 'weekly' as const,
        priority: 0.75,
      }));
    }
  } catch {
    // sitemap reste partiel si la DB est indisponible
  }

  return [...staticPages, ...blogPages, ...coursePages, ...categoryPages];
}

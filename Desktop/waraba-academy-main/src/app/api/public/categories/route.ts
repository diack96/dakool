import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import { handleApiError } from '@/lib/errors';
import { CACHE_HEADERS } from '@/lib/api/apiUtils';

// Cache Next.js Data Cache côté serveur (5 min) — les catégories changent rarement
export const revalidate = 300;

// GET /api/public/categories - Liste publique des catégories avec nombre de cours
export async function GET (_request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();

    // 2 requêtes parallèles au lieu de N+1 (1 par catégorie)
    const [
      { data: categories, error: categoriesError },
      { data: publishedCourses },
    ] = await Promise.all([
      supabase
        .from('categories')
        .select('id, name, description, slug, image_url')
        .order('name', { ascending: true }),
      supabase
        .from('courses')
        .select('category_id')
        .eq('is_published', true),
    ]);

    if (categoriesError) {
      console.error('Erreur lors de la récupération des catégories', categoriesError);
      throw new Error('Erreur lors de la récupération des catégories');
    }

    // Compter les cours par catégorie en mémoire
    const countByCategory: Record<string, number> = {};
    (publishedCourses || []).forEach((c: any) => {
      if (c.category_id) {
        countByCategory[c.category_id] = (countByCategory[c.category_id] || 0) + 1;
      }
    });

    const categoriesWithCount = (categories || []).map((category: any) => ({
      id: category.id,
      name: category.name,
      description: category.description || '',
      slug: category.slug || category.name.toLowerCase().replace(/\s+/g, '-'),
      image_url: category.image_url || null,
      courseCount: countByCategory[category.id] || 0,
    }));

    const activeCategories = categoriesWithCount.filter(cat => cat.courseCount > 0);

    return NextResponse.json(
      { success: true, categories: activeCategories },
      { headers: CACHE_HEADERS.LONG },
    );
  } catch (error: any) {
    console.error('Erreur lors de la récupération des catégories', error);
    return handleApiError(error);
  }
}


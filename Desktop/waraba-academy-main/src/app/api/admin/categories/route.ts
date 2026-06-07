import { NextRequest, NextResponse } from 'next/server';
import { withAdminAuth } from '@/middleware/adminAuth';
import { getAdminSupabaseClient } from '@/lib/supabase-server';
import { handleApiError } from '@/lib/errors';

// GET /api/admin/categories - Liste des catégories avec nombre de cours
async function GET (_request: NextRequest) {
  try {
    const supabase = getAdminSupabaseClient();

    // Récupérer toutes les catégories
    const { data: categories, error: categoriesError } = await supabase
      .from('categories')
      .select('*')
      .order('name', { ascending: true });

    if (categoriesError) {
      return NextResponse.json(
        { error: 'Erreur Supabase', details: categoriesError.message, code: categoriesError.code },
        { status: 500 },
      );
    }

    // Récupérer le nombre de cours par catégorie en une seule requête (évite N+1)
    const categoryIds = (categories || []).map((c: any) => c.id);
    let courseCountMap: Record<string, number> = {};

    if (categoryIds.length > 0) {
      const { data: coursesRaw } = await supabase
        .from('courses')
        .select('category_id')
        .in('category_id', categoryIds) as { data: Array<{ category_id: string }> | null };

      for (const row of coursesRaw || []) {
        courseCountMap[row.category_id] = (courseCountMap[row.category_id] || 0) + 1;
      }
    }

    const categoriesWithCount = (categories || []).map((category: any) => ({
      id: category.id,
      name: category.name,
      description: category.description || '',
      slug: category.slug || category.name.toLowerCase().replace(/\s+/g, '-'),
      color: category.color || '#3B82F6',
      isActive: category.is_active !== undefined ? category.is_active : true,
      courseCount: courseCountMap[category.id] || 0,
    }));

    return NextResponse.json(categoriesWithCount);
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Erreur inconnue', stack: error?.stack?.split('\n')[0] },
      { status: 500 },
    );
  }
}

// POST /api/admin/categories - Créer une nouvelle catégorie
async function POST (request: NextRequest) {
  try {
    const supabase = getAdminSupabaseClient();
    const body = await request.json();

    const { name, description, slug, color, isActive } = body;

    if (!name) {
      return NextResponse.json(
        { error: 'Le nom de la catégorie est requis' },
        { status: 400 },
      );
    }

    // Générer un slug si non fourni
    const categorySlug = slug || name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

    const { data: category, error } = await supabase
      .from('categories')
      .insert([{
        name: name.trim(),
        description: description || '',
        slug: categorySlug,
        color: color || '#3B82F6',
        is_active: isActive !== undefined ? isActive : true,
      }] as any)
      .select()
      .single();

    if (error) {
      console.error('Erreur lors de la création de la catégorie', error);
      return NextResponse.json(
        { error: 'Erreur lors de la création de la catégorie', details: error.message },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      category: {
        ...(category as any),
        courseCount: 0, // Nouvelle catégorie, 0 cours
      },
    }, { status: 201 });
  } catch (error: any) {
    console.error('Erreur lors de la création de la catégorie', error);
    return handleApiError(error);
  }
}

// Wrapper avec authentification admin
const GET_handler = withAdminAuth(GET);
const POST_handler = withAdminAuth(POST);

export { GET_handler as GET, POST_handler as POST };



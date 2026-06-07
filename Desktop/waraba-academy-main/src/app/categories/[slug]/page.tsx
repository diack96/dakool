import type { Metadata } from 'next';
import { createAdminSupabaseClient } from '@/lib/supabase-server';
import { generatePageMetadata } from '@/lib/seo';
import CategoryClient from './_Client';

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  const { slug } = await params;
  try {
    const supabase = createAdminSupabaseClient();
    const { data: category } = await supabase
      .from('categories')
      .select('name, description')
      .eq('slug', slug)
      .single();

    if (!category) return { title: 'Catégorie introuvable' };

    return generatePageMetadata(
      `Formations ${category.name}`,
      category.description ||
        `Découvrez toutes les formations ${category.name} sur Waraba Academy. Des cours certifiants pour développer vos compétences.`,
      `/categories/${slug}`
    );
  } catch {
    return {};
  }
}

export default function CategoryPage() {
  return <CategoryClient />;
}

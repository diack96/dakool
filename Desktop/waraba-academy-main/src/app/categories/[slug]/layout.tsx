import type { Metadata } from 'next';
import { generatePageMetadata } from '@/lib/seo';
import { createAdminSupabaseClient } from '@/lib/supabase-server';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  
  try {
    const supabase = createAdminSupabaseClient();
    const { data: category } = await supabase
      .from('categories')
      .select('name, description')
      .eq('slug', slug)
      .single();

    if (category) {
      return generatePageMetadata(
        category.name,
        category.description || `Découvrez tous les cours de la catégorie ${category.name} sur Waraba Academy`,
        `/categories/${slug}`,
      );
    }
  } catch (error) {
    console.error('Erreur lors de la récupération de la catégorie pour métadonnées:', error);
  }

  // Métadonnées par défaut
  return generatePageMetadata(
    'Catégorie',
    'Découvrez nos cours par catégorie',
    `/categories/${slug}`,
  );
}

export default function CategoryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}


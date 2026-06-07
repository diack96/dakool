import type { Metadata } from 'next';
import { generateCourseMetadata } from '@/lib/seo';
import { getCourseForMetadata } from '@/lib/course-server';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const course = await getCourseForMetadata(id);

  if (!course) {
    // Métadonnées par défaut si le cours n'est pas trouvé
    // On ne met pas noindex ici : une erreur transitoire (timeout DB, clé Supabase)
    // ne doit pas empêcher Google d'indexer une page valide.
    return {
      title: 'Formation — Waraba Academy',
      description: 'Découvrez nos formations certifiantes en Digital, IA et Soft Skills, accessibles depuis toute l\'Afrique.',
    };
  }

  return generateCourseMetadata({
    title: course.title,
    description: course.description,
    image: course.image,
    slug: course.slug,
  });
}

export default function CourseLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}


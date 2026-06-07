import { createAdminSupabaseClient } from './supabase-server';
import { isUUID } from './utils/slug';

/**
 * Récupère un cours par ID ou slug pour les métadonnées SEO (côté serveur)
 */
export async function getCourseForMetadata(idOrSlug: string) {
  try {
    const supabase = createAdminSupabaseClient();
    const isIdUUID = isUUID(idOrSlug);

    let query = supabase
      .from('courses')
      .select(`
        id,
        title,
        description,
        thumbnail,
        image,
        slug,
        is_published
      `);

    if (isIdUUID) {
      query = query.eq('id', idOrSlug);
    } else {
      query = query.eq('slug', idOrSlug);
    }

    const { data: course, error } = await query.single();

    if (error || !course) {
      return null;
    }

    return {
      id: course.id,
      title: course.title,
      description: course.description || undefined,
      image: course.thumbnail || course.image || undefined,
      slug: course.slug || course.id,
    };
  } catch (error) {
    console.error('Erreur lors de la récupération du cours pour métadonnées:', error);
    return null;
  }
}


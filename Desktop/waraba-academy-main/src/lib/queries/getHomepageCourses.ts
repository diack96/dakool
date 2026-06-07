import { unstable_cache } from 'next/cache';
import { createClient } from '@supabase/supabase-js';

const COURSE_SELECT = `
  id, title, description, level, price, is_free, thumbnail, slug,
  is_coming_soon, display_students_count,
  categories (id, name),
  profiles:instructor_id (first_name, last_name, avatar_url)
`;

function normalizeCourses(data: any[]): any[] {
  return data.map((c: any) => ({
    ...c,
    isFree: c.is_free,
    isComingSoon: c.is_coming_soon,
    totalStudents: c.display_students_count ?? 0,
    category: c.categories ? { name: (c.categories as any).name } : null,
    instructor: c.profiles
      ? {
          first_name: (c.profiles as any).first_name,
          last_name: (c.profiles as any).last_name,
          avatar_url: (c.profiles as any).avatar_url,
        }
      : {},
  }));
}

/**
 * Récupère les cours publiés pour la homepage avec cache ISR 5 minutes.
 * Essaie d'abord le client admin (service role), puis le client anon en fallback.
 */
export const getHomepageCourses = unstable_cache(
  async (): Promise<any[]> => {
    const query = async (client: ReturnType<typeof createClient>) => {
      return client
        .from('courses')
        .select(COURSE_SELECT)
        .eq('is_published', true)
        .order('display_students_count', { ascending: false, nullsFirst: false })
        .limit(12);
    };

    // Tentative 1 : client admin (service role — bypass RLS)
    try {
      const { getAdminSupabaseClient } = await import('@/lib/supabase-server');
      const supabase = getAdminSupabaseClient();
      const { data, error } = await query(supabase as any);
      if (!error && data && data.length > 0) return normalizeCourses(data);
    } catch {
      // admin client indisponible → fallback anon
    }

    // Tentative 2 : client anon (soumis à RLS)
    try {
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        { auth: { persistSession: false } },
      );
      const { data, error } = await query(supabase as any);
      if (!error && data && data.length > 0) return normalizeCourses(data);
    } catch {
      // Les deux clients ont échoué
    }

    return [];
  },
  ['homepage-courses'],
  { revalidate: 300 },
);

import type { Metadata } from 'next';
import { createAdminSupabaseClient } from '@/lib/supabase-server';
import { generateCourseMetadata } from '@/lib/seo';
import CourseDetailClient from './_Client';

export const revalidate = 3600;

const isUUID = (s: string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(s);

export async function generateMetadata(
  { params }: { params: Promise<{ id: string }> }
): Promise<Metadata> {
  const { id } = await params;
  try {
    const supabase = createAdminSupabaseClient();
    const { data: course } = await supabase
      .from('courses')
      .select('title, description, thumbnail, image_url, slug, level, duration')
      .eq(isUUID(id) ? 'id' : 'slug', id)
      .eq('is_published', true)
      .single();

    if (!course) return { title: 'Formation introuvable' };

    return generateCourseMetadata({
      title: course.title,
      description: course.description,
      image: course.thumbnail || course.image_url,
      slug: course.slug || id,
    });
  } catch {
    return {};
  }
}

export default function CourseDetailPage() {
  return <CourseDetailClient />;
}

import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';

// GET — détail public d'un parcours (par slug)
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const { slug } = await params;
    const supabase = await createServerSupabaseClient();

    const { data: pathData, error } = await supabase
      .from('learning_paths')
      .select('*')
      .eq('slug', slug)
      .eq('status', 'published')
      .single();

    if (error || !pathData) {
      return NextResponse.json({ error: 'Parcours non trouvé' }, { status: 404 });
    }
    const path = pathData as any;

    // Récupérer les cours du parcours dans l'ordre
    const { data: lpCourses } = await supabase
      .from('learning_path_courses')
      .select(`
        id,
        course_id,
        course_order,
        courses (
          id, title, slug, thumbnail, image_url, level, duration, price, is_free, rating, description
        )
      `)
      .eq('learning_path_id', path.id)
      .order('course_order', { ascending: true });

    // Compter les inscrits dans chaque cours
    const courseIds = (lpCourses || []).map((lpc: any) => lpc.course_id);
    let enrollmentCountMap: Record<string, number> = {};
    if (courseIds.length > 0) {
      const { data: enrollments } = await supabase
        .from('enrollments')
        .select('course_id')
        .in('course_id', courseIds)
        .in('status', ['active', 'completed']);
      (enrollments || []).forEach((e: any) => {
        enrollmentCountMap[e.course_id] = (enrollmentCountMap[e.course_id] || 0) + 1;
      });
    }

    const courses = (lpCourses || []).map((lpc: any) => ({
      ...lpc,
      course: lpc.courses
        ? { ...lpc.courses, total_students: enrollmentCountMap[lpc.course_id] || 0 }
        : null,
      courses: undefined,
    }));

    return NextResponse.json(
      { success: true, path: { ...path, courses } },
      { headers: { 'Cache-Control': 'public, max-age=60, s-maxage=300, stale-while-revalidate=3600' } },
    );
  } catch {
    return NextResponse.json({ error: 'Erreur interne' }, { status: 500 });
  }
}

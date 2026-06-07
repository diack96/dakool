import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';

// GET — liste publique des parcours publiés
export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { searchParams } = new URL(request.url);
    const level = searchParams.get('level') || '';
    const featured = searchParams.get('featured') === 'true';

    let query = supabase
      .from('learning_paths')
      .select('*')
      .eq('status', 'published')
      .order('is_featured', { ascending: false })
      .order('created_at', { ascending: false });

    if (level && level !== 'all') {
      query = query.eq('level', level);
    }
    if (featured) {
      query = query.eq('is_featured', true);
    }

    const { data: paths, error } = await query;
    if (error) {
      return NextResponse.json({ error: 'Erreur' }, { status: 500 });
    }

    // Enrichir avec le nombre de cours par parcours
    const pathIds = (paths || []).map((p: any) => p.id);
    let coursesCountMap: Record<string, number> = {};

    if (pathIds.length > 0) {
      const { data: lpCourses } = await supabase
        .from('learning_path_courses')
        .select('learning_path_id')
        .in('learning_path_id', pathIds);

      (lpCourses || []).forEach((lpc: any) => {
        coursesCountMap[lpc.learning_path_id] = (coursesCountMap[lpc.learning_path_id] || 0) + 1;
      });
    }

    const enriched = (paths || []).map((p: any) => ({
      ...p,
      courses_count: coursesCountMap[p.id] || 0,
    }));

    return NextResponse.json(
      { success: true, paths: enriched },
      { headers: { 'Cache-Control': 'public, max-age=60, s-maxage=300, stale-while-revalidate=3600' } },
    );
  } catch {
    return NextResponse.json({ error: 'Erreur interne' }, { status: 500 });
  }
}

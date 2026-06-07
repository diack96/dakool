import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient, createAdminSupabaseClient } from '@/lib/supabase-server';
import { isUUID } from '@/lib/utils/slug';

/**
 * GET /api/courses/[id]/resources
 * Retourne les ressources d'un cours. [id] peut être un UUID ou un slug.
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: courseIdentifier } = await params;
  const supabase = await createServerSupabaseClient();

  // Résoudre le slug en UUID si nécessaire
  let courseId = courseIdentifier;
  if (!isUUID(courseIdentifier)) {
    const { data: row } = await supabase
      .from('courses')
      .select('id')
      .eq('slug', courseIdentifier)
      .maybeSingle();
    if (!row) {
      return NextResponse.json({ resources: [] });
    }
    courseId = (row as { id: string }).id;
  }

  const admin = createAdminSupabaseClient();
  const { data, error } = await admin
    .from('course_resources')
    .select('id, title, type, url, file_name, file_size, mime_type, order')
    .eq('course_id', courseId)
    .order('order', { ascending: true })
    .order('created_at', { ascending: true });

  if (error) {
    // Table absente en prod (migration non appliquée) ou autre erreur DB
    console.error('[GET resources]', error.message);
    return NextResponse.json({ resources: [] });
  }

  return NextResponse.json({ resources: data ?? [] });
}

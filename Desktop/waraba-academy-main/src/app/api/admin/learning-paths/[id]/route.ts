import { NextRequest, NextResponse } from 'next/server';
import { withAdminAuth } from '@/middleware/adminAuth';
import { getAdminSupabaseClient } from '@/lib/supabase-server';
import { z } from 'zod';

const updateSchema = z.object({
  title: z.string().min(3).max(255).optional(),
  slug: z.string().min(3).max(255).regex(/^[a-z0-9-]+$/).optional(),
  description: z.string().optional(),
  short_description: z.string().max(500).optional(),
  thumbnail: z.string().url().optional().or(z.literal('')),
  level: z.enum(['all', 'beginner', 'intermediate', 'advanced']).optional(),
  status: z.enum(['draft', 'published', 'archived']).optional(),
  is_featured: z.boolean().optional(),
});

async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const supabase = getAdminSupabaseClient();

    const { data: path, error } = await supabase
      .from('learning_paths')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !path) {
      return NextResponse.json({ error: 'Parcours non trouvé' }, { status: 404 });
    }

    const { data: lpCourses } = await supabase
      .from('learning_path_courses')
      .select(`
        id,
        course_id,
        course_order,
        courses (
          id, title, slug, thumbnail, image_url, level, duration, price, is_free
        )
      `)
      .eq('learning_path_id', id)
      .order('course_order', { ascending: true });

    return NextResponse.json({
      success: true,
      path: { ...path, courses: lpCourses || [] },
    });
  } catch {
    return NextResponse.json({ error: 'Erreur interne' }, { status: 500 });
  }
}

async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const validation = updateSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ error: 'Données invalides', details: validation.error.errors }, { status: 400 });
    }

    const supabase = getAdminSupabaseClient();
    const updateData: any = { ...validation.data };
    if (updateData.thumbnail === '') updateData.thumbnail = null;

    const { data: path, error } = await supabase
      .from('learning_paths')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json({ error: 'Ce slug est déjà utilisé' }, { status: 409 });
      }
      return NextResponse.json({ error: 'Erreur lors de la mise à jour' }, { status: 500 });
    }

    return NextResponse.json({ success: true, path });
  } catch {
    return NextResponse.json({ error: 'Erreur interne' }, { status: 500 });
  }
}

async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const supabase = getAdminSupabaseClient();

    const { error } = await supabase
      .from('learning_paths')
      .delete()
      .eq('id', id);

    if (error) {
      return NextResponse.json({ error: 'Erreur lors de la suppression' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Erreur interne' }, { status: 500 });
  }
}

export const GET_handler = withAdminAuth(GET as any);
export const PATCH_handler = withAdminAuth(PATCH as any);
export const DELETE_handler = withAdminAuth(DELETE as any);
export { GET_handler as GET, PATCH_handler as PATCH, DELETE_handler as DELETE };

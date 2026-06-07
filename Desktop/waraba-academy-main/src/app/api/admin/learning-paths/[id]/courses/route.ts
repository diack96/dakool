import { NextRequest, NextResponse } from 'next/server';
import { withAdminAuth } from '@/middleware/adminAuth';
import { getAdminSupabaseClient } from '@/lib/supabase-server';
import { z } from 'zod';

const addCourseSchema = z.object({
  course_id: z.string().uuid('ID de cours invalide'),
  course_order: z.number().int().min(0).optional().default(0),
});

const reorderSchema = z.object({
  courses: z.array(z.object({
    id: z.string().uuid(),
    course_order: z.number().int().min(0),
  })),
});

async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id: pathId } = await params;
    const body = await request.json();
    const validation = addCourseSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ error: 'Données invalides', details: validation.error.errors }, { status: 400 });
    }

    const supabase = getAdminSupabaseClient();
    const { data, error } = await supabase
      .from('learning_path_courses')
      .insert({
        learning_path_id: pathId,
        course_id: validation.data.course_id,
        course_order: validation.data.course_order,
      })
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json({ error: 'Ce cours est déjà dans le parcours' }, { status: 409 });
      }
      return NextResponse.json({ error: 'Erreur lors de l\'ajout' }, { status: 500 });
    }

    return NextResponse.json({ success: true, data }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Erreur interne' }, { status: 500 });
  }
}

async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id: pathId } = await params;
    const body = await request.json();
    const validation = reorderSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ error: 'Données invalides' }, { status: 400 });
    }

    const supabase = getAdminSupabaseClient();
    await Promise.all(
      validation.data.courses.map(({ id, course_order }) =>
        supabase
          .from('learning_path_courses')
          .update({ course_order })
          .eq('id', id)
          .eq('learning_path_id', pathId),
      ),
    );

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Erreur interne' }, { status: 500 });
  }
}

async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id: pathId } = await params;
    const { searchParams } = new URL(request.url);
    const courseId = searchParams.get('courseId');

    if (!courseId) {
      return NextResponse.json({ error: 'courseId requis' }, { status: 400 });
    }

    const supabase = getAdminSupabaseClient();
    const { error } = await supabase
      .from('learning_path_courses')
      .delete()
      .eq('learning_path_id', pathId)
      .eq('course_id', courseId);

    if (error) {
      return NextResponse.json({ error: 'Erreur lors de la suppression' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Erreur interne' }, { status: 500 });
  }
}

export const POST_handler = withAdminAuth(POST as any);
export const PATCH_handler = withAdminAuth(PATCH as any);
export const DELETE_handler = withAdminAuth(DELETE as any);
export { POST_handler as POST, PATCH_handler as PATCH, DELETE_handler as DELETE };

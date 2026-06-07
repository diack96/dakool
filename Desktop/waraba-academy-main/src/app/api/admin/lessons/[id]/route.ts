import { NextRequest, NextResponse } from 'next/server';
import { withAdminAuth, logAdminAction } from '@/middleware/adminAuth';
import { getAdminSupabaseClient } from '@/lib/supabase-server';
import { handleApiError, createValidationError, createInternalError } from '@/lib/errors';
import { z } from 'zod';

// Schéma de validation pour mise à jour
const updateLessonSchema = z.object({
  module_id: z.string().uuid().optional().nullable(),
  title: z.string().min(1).max(200).optional(),
  description: z.string().optional(),
  content: z.string().optional(),
  video_url: z.union([z.string().url(), z.string().length(0), z.null()]).optional().nullable().transform(val => val === '' ? null : val),
  duration: z.union([z.number(), z.string()]).transform(val => Number(val) || 0).optional(),
  order: z.union([z.number(), z.string()]).transform(val => Number(val) || 0).optional(), // mapped to lesson_order
  is_free: z.union([z.boolean(), z.string()]).transform(val => val === true || val === 'true').optional(),
});

// GET /api/admin/lessons/[id] - Récupérer une leçon
async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = getAdminSupabaseClient();

    const { data: lesson, error } = await supabase
      .from('lessons')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !lesson) {
      return NextResponse.json(
        { success: false, error: 'Leçon non trouvée' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      lesson,
    });
  } catch (error) {
    console.error('Erreur GET lesson:', error);
    return handleApiError(error);
  }
}

// PATCH /api/admin/lessons/[id] - Mettre à jour une leçon
async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = getAdminSupabaseClient();
    const body = await request.json();

    // Validation
    const validation = updateLessonSchema.safeParse(body);
    if (!validation.success) {
      throw createValidationError('Données invalides', validation.error.issues);
    }

    // Map order to lesson_order for database
    const { order, ...restData } = validation.data;
    const updateData: Record<string, unknown> = {
      ...restData,
      updated_at: new Date().toISOString(),
    };
    if (order !== undefined) {
      updateData.lesson_order = order;
    }

    const { data: lesson, error } = await supabase
      .from('lessons')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Erreur mise à jour leçon:', error);
      throw createInternalError('Erreur lors de la mise à jour', { dbError: error.message });
    }

    // Log de l'action
    logAdminAction({
      user_id: (request as any).adminUser?.id || 'unknown',
      action: 'lessons.update',
      resource: `/api/admin/lessons/${id}`,
      ip_address: request.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown',
      user_agent: request.headers.get('user-agent') || 'unknown',
      timestamp: new Date().toISOString(),
      success: true,
      details: { lesson_id: id, updates: Object.keys(validation.data) },
    }).catch(() => {});

    return NextResponse.json({
      success: true,
      lesson,
    });
  } catch (error) {
    console.error('Erreur PATCH lesson:', error);
    return handleApiError(error);
  }
}

// DELETE /api/admin/lessons/[id] - Supprimer une leçon
async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = getAdminSupabaseClient();

    // Récupérer la leçon pour le log
    const { data: lesson } = await supabase
      .from('lessons')
      .select('id, title, course_id')
      .eq('id', id)
      .single();

    if (!lesson) {
      return NextResponse.json(
        { success: false, error: 'Leçon non trouvée' },
        { status: 404 }
      );
    }

    // Supprimer la leçon
    const { error } = await supabase
      .from('lessons')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Erreur suppression leçon:', error);
      throw createInternalError('Erreur lors de la suppression', { dbError: error.message });
    }

    // Réordonner les leçons restantes
    const { data: remainingLessons } = await supabase
      .from('lessons')
      .select('id, lesson_order')
      .eq('course_id', lesson.course_id)
      .order('lesson_order', { ascending: true });

    if (remainingLessons) {
      for (let i = 0; i < remainingLessons.length; i++) {
        const lessonItem = remainingLessons[i] as { id: string; lesson_order: number };
        if (lessonItem.lesson_order !== i + 1) {
          await supabase
            .from('lessons')
            .update({ lesson_order: i + 1 })
            .eq('id', lessonItem.id);
        }
      }
    }

    // Log de l'action
    logAdminAction({
      user_id: (request as any).adminUser?.id || 'unknown',
      action: 'lessons.delete',
      resource: `/api/admin/lessons/${id}`,
      ip_address: request.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown',
      user_agent: request.headers.get('user-agent') || 'unknown',
      timestamp: new Date().toISOString(),
      success: true,
      details: { lesson_id: id, lesson_title: lesson.title },
    }).catch(() => {});

    return NextResponse.json({
      success: true,
      message: 'Leçon supprimée avec succès',
    });
  } catch (error) {
    console.error('Erreur DELETE lesson:', error);
    return handleApiError(error);
  }
}

// Wrapper avec authentification admin
export const GET_handler = withAdminAuth(GET);
export const PATCH_handler = withAdminAuth(PATCH);
export const DELETE_handler = withAdminAuth(DELETE);

export { GET_handler as GET, PATCH_handler as PATCH, DELETE_handler as DELETE };

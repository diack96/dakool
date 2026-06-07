import { NextRequest, NextResponse } from 'next/server';
import { withAdminAuth, logAdminAction } from '@/middleware/adminAuth';
import { getAdminSupabaseClient } from '@/lib/supabase-server';
import { handleApiError, createValidationError } from '@/lib/errors';
import { z } from 'zod';

const updateModuleSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().optional(),
  order: z.union([z.number(), z.string()])
    .transform(val => Number(val) || 0)
    .optional(),
});

// PATCH /api/admin/modules/[id]
async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const supabase = getAdminSupabaseClient();
    const body = await request.json();

    const validation = updateModuleSchema.safeParse(body);
    if (!validation.success) {
      throw createValidationError('Données invalides', validation.error.issues);
    }

    const { data: module, error } = await supabase
      .from('modules')
      .update({ ...validation.data, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Erreur mise à jour module:', error.message);
      return NextResponse.json(
        { success: false, error: 'Erreur lors de la mise à jour du module' },
        { status: 500 },
      );
    }

    logAdminAction({
      user_id: (request as any).adminUser?.id || 'unknown',
      action: 'modules.update',
      resource: `/api/admin/modules/${id}`,
      ip_address: request.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown',
      user_agent: request.headers.get('user-agent') || 'unknown',
      timestamp: new Date().toISOString(),
      success: true,
      details: { module_id: id, updates: Object.keys(validation.data) },
    }).catch(() => {});

    return NextResponse.json({ success: true, module });
  } catch (error) {
    return handleApiError(error);
  }
}

// DELETE /api/admin/modules/[id]
// Les leçons associées conservent leur contenu (module_id devient NULL via ON DELETE SET NULL)
async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const supabase = getAdminSupabaseClient();

    const { data: module } = await supabase
      .from('modules')
      .select('id, title, course_id')
      .eq('id', id)
      .single();

    if (!module) {
      return NextResponse.json(
        { success: false, error: 'Module non trouvé' },
        { status: 404 },
      );
    }

    const { error } = await supabase
      .from('modules')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Erreur suppression module:', error.message);
      return NextResponse.json(
        { success: false, error: 'Erreur lors de la suppression du module' },
        { status: 500 },
      );
    }

    // Renuméroter les modules restants
    const { data: remaining } = await supabase
      .from('modules')
      .select('id, order')
      .eq('course_id', module.course_id)
      .order('order', { ascending: true });

    if (remaining) {
      await Promise.all(
        remaining.map((m: any, i: number) =>
          supabase.from('modules').update({ order: i + 1 }).eq('id', m.id),
        ),
      );
    }

    logAdminAction({
      user_id: (request as any).adminUser?.id || 'unknown',
      action: 'modules.delete',
      resource: `/api/admin/modules/${id}`,
      ip_address: request.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown',
      user_agent: request.headers.get('user-agent') || 'unknown',
      timestamp: new Date().toISOString(),
      success: true,
      details: { module_id: id, module_title: module.title },
    }).catch(() => {});

    return NextResponse.json({
      success: true,
      message: 'Module supprimé. Les leçons associées sont conservées sans module.',
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export const PATCH_handler = withAdminAuth(PATCH);
export const DELETE_handler = withAdminAuth(DELETE);
export { PATCH_handler as PATCH, DELETE_handler as DELETE };

import { NextRequest, NextResponse } from 'next/server';
import { withAdminAuth, logAdminAction } from '@/middleware/adminAuth';
import { getAdminSupabaseClient } from '@/lib/supabase-server';
import { handleApiError, createValidationError } from '@/lib/errors';
import { z } from 'zod';

const reorderSchema = z.object({
  course_id: z.string().uuid(),
  modules: z.array(z.object({
    id: z.string().uuid(),
    order: z.number().min(1),
  })),
});

// POST /api/admin/modules/reorder
async function POST(request: NextRequest) {
  try {
    const supabase = getAdminSupabaseClient();
    const body = await request.json();

    const validation = reorderSchema.safeParse(body);
    if (!validation.success) {
      throw createValidationError('Données invalides', validation.error.issues);
    }

    const { course_id, modules } = validation.data;

    const updates = await Promise.all(
      modules.map(({ id, order }) =>
        supabase
          .from('modules')
          .update({ order, updated_at: new Date().toISOString() })
          .eq('id', id)
          .eq('course_id', course_id),
      ),
    );

    const errors = updates.filter(u => u.error);
    if (errors.length > 0) {
      console.error('Erreurs réordonnancement modules:', errors);
      return NextResponse.json(
        { success: false, error: 'Erreur lors du réordonnancement' },
        { status: 500 },
      );
    }

    logAdminAction({
      user_id: (request as any).adminUser?.id || 'unknown',
      action: 'modules.reorder',
      resource: '/api/admin/modules/reorder',
      ip_address: request.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown',
      user_agent: request.headers.get('user-agent') || 'unknown',
      timestamp: new Date().toISOString(),
      success: true,
      details: { course_id, modules_count: modules.length },
    }).catch(() => {});

    return NextResponse.json({ success: true, message: 'Modules réordonnés avec succès' });
  } catch (error) {
    return handleApiError(error);
  }
}

export const POST_handler = withAdminAuth(POST);
export { POST_handler as POST };

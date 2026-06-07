import { NextRequest, NextResponse } from 'next/server';
import { withAdminAuth, logAdminAction } from '@/middleware/adminAuth';
import { getAdminSupabaseClient } from '@/lib/supabase-server';
import { handleApiError, createValidationError } from '@/lib/errors';
import { z } from 'zod';

// Schéma de validation pour le réordonnancement
const reorderSchema = z.object({
  course_id: z.string().uuid(),
  lessons: z.array(z.object({
    id: z.string().uuid(),
    order: z.number().min(1),
  })),
});

// POST /api/admin/lessons/reorder - Réordonner les leçons
async function POST(request: NextRequest) {
  try {
    const supabase = getAdminSupabaseClient();
    const body = await request.json();

    // Validation
    const validation = reorderSchema.safeParse(body);
    if (!validation.success) {
      throw createValidationError('Données invalides', validation.error.issues);
    }

    const { course_id, lessons } = validation.data;

    // Mettre à jour l'ordre de chaque leçon (order -> lesson_order in DB)
    const updates = await Promise.all(
      lessons.map(({ id, order }) =>
        supabase
          .from('lessons')
          .update({ lesson_order: order, updated_at: new Date().toISOString() })
          .eq('id', id)
          .eq('course_id', course_id)
      )
    );

    // Vérifier les erreurs
    const errors = updates.filter(u => u.error);
    if (errors.length > 0) {
      console.error('Erreurs lors du réordonnancement:', errors);
      return NextResponse.json(
        { success: false, error: 'Erreur lors du réordonnancement' },
        { status: 500 }
      );
    }

    // Log de l'action
    logAdminAction({
      user_id: (request as any).adminUser?.id || 'unknown',
      action: 'lessons.reorder',
      resource: '/api/admin/lessons/reorder',
      ip_address: request.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown',
      user_agent: request.headers.get('user-agent') || 'unknown',
      timestamp: new Date().toISOString(),
      success: true,
      details: { course_id, lessons_count: lessons.length },
    }).catch(() => {});

    return NextResponse.json({
      success: true,
      message: 'Leçons réordonnées avec succès',
    });
  } catch (error) {
    console.error('Erreur POST reorder:', error);
    return handleApiError(error);
  }
}

// Wrapper avec authentification admin
export const POST_handler = withAdminAuth(POST);

export { POST_handler as POST };

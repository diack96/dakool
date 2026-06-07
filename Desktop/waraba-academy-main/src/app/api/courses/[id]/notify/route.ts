import { NextRequest } from 'next/server';
import { createServerSupabaseClient, createAdminSupabaseClient } from '@/lib/supabase-server';
import { successResponse, ApiErrors, errorResponse } from '@/lib/api/response';

// POST /api/courses/[id]/notify
// Enregistre une demande de notification de lancement pour un cours coming soon.
export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const supabase = await createServerSupabaseClient();

    // 1. Authentification
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return ApiErrors.unauthorized();

    const user = session.user;

    // 2. Vérifier que le cours existe et est bien en coming soon
    const admin = createAdminSupabaseClient();
    const { data: course, error: courseErr } = await admin
      .from('courses')
      .select('id, title, is_coming_soon')
      .eq('id', id)
      .maybeSingle();

    if (courseErr || !course) return ApiErrors.notFound('Cours', id);

    if (!course.is_coming_soon) {
      return errorResponse('Ce cours est déjà disponible.', 400, 'ALREADY_AVAILABLE');
    }

    // 3. Récupérer email + prénom depuis le profil
    const { data: profile } = await admin
      .from('profiles')
      .select('email, first_name')
      .eq('id', user.id)
      .maybeSingle();

    const email = profile?.email || user.email;
    if (!email) return errorResponse('Email introuvable sur le profil.', 400, 'NO_EMAIL');

    // 4. Enregistrer (upsert — idempotent)
    const { error: insertErr } = await admin
      .from('course_launch_notifications')
      .upsert(
        {
          course_id:  course.id,
          user_id:    user.id,
          email,
          first_name: profile?.first_name || null,
        },
        { onConflict: 'course_id,email', ignoreDuplicates: true },
      );

    if (insertErr) {
      console.error('[notify] Insert error:', insertErr.message);
      return errorResponse('Erreur lors de l\'enregistrement.', 500, 'DB_ERROR');
    }

    return successResponse({ registered: true, courseTitle: course.title });
  } catch (err) {
    console.error('[notify] Unexpected error:', err);
    return ApiErrors.internalError('Erreur serveur');
  }
}

// DELETE /api/courses/[id]/notify — se désinscrire
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const supabase = await createServerSupabaseClient();
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return ApiErrors.unauthorized();

    const admin = createAdminSupabaseClient();
    await admin
      .from('course_launch_notifications')
      .delete()
      .eq('course_id', id)
      .eq('user_id', session.user.id);

    return successResponse({ unregistered: true });
  } catch {
    return ApiErrors.internalError('Erreur serveur');
  }
}

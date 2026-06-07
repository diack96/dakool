import { NextRequest } from 'next/server';
import { createServerSupabaseClient, createAdminSupabaseClient } from '@/lib/supabase-server';
import { successResponse, ApiErrors, errorResponse } from '@/lib/api/response';

// GET /api/courses/[id]/reviews — liste publique + stats
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id: courseId } = await params;
    const { searchParams } = new URL(request.url);
    const page  = Math.max(1, parseInt(searchParams.get('page')  || '1'));
    const limit = Math.min(20, parseInt(searchParams.get('limit') || '10'));
    const offset = (page - 1) * limit;

    // Auth optionnelle — pour marquer la review de l'utilisateur courant
    const supabase = await createServerSupabaseClient();
    const { data: { session } } = await supabase.auth.getSession();
    const currentUserId = session?.user?.id ?? null;

    const admin = createAdminSupabaseClient();

    // Récupérer toutes les reviews pour les stats (sans pagination)
    const { data: allReviews, error: statsErr } = await admin
      .from('course_reviews')
      .select('user_id, rating')
      .eq('course_id', courseId);

    if (statsErr) return ApiErrors.internalError('Erreur récupération stats');

    const safeReviews = allReviews ?? [];
    const total = safeReviews.length;
    const avgRating = total > 0
      ? Math.round((safeReviews.reduce((s, r) => s + r.rating, 0) / total) * 10) / 10
      : 0;

    const distribution: Record<string, number> = { '5': 0, '4': 0, '3': 0, '2': 0, '1': 0 };
    safeReviews.forEach(r => {
      const k = String(r.rating);
      if (k in distribution) distribution[k] = (distribution[k] ?? 0) + 1;
    });

    // Reviews paginées
    const { data: reviews, error: revErr } = await admin
      .from('course_reviews')
      .select('id, user_id, rating, comment, is_verified, created_at')
      .eq('course_id', courseId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (revErr) return ApiErrors.internalError('Erreur récupération avis');

    // Profils en batch
    const userIds = [...new Set((reviews ?? []).map(r => r.user_id))];
    type ProfileEntry = { first_name: string | null; last_name: string | null };
    const profileMap: Record<string, ProfileEntry> = {};
    if (userIds.length > 0) {
      const { data: profiles } = await admin
        .from('profiles')
        .select('id, first_name, last_name')
        .in('id', userIds);
      profiles?.forEach(p => {
        profileMap[p.id] = { first_name: p.first_name as string | null, last_name: p.last_name as string | null };
      });
    }

    const mapped = (reviews ?? []).map(r => {
      const p: ProfileEntry = profileMap[r.user_id] ?? { first_name: null, last_name: null };
      const firstName    = p.first_name || 'Étudiant';
      const lastInitial  = p.last_name  ? p.last_name.charAt(0).toUpperCase() + '.' : '';
      return {
        id: r.id,
        rating: r.rating,
        comment: r.comment ?? null,
        isVerified: r.is_verified,
        createdAt: r.created_at,
        authorName: `${firstName} ${lastInitial}`.trim(),
        authorInitials: `${(p.first_name || 'E').charAt(0)}${(p.last_name || '').charAt(0)}`.toUpperCase(),
        isOwn: r.user_id === currentUserId,
      };
    });

    return successResponse({ reviews: mapped, stats: { total, avgRating, distribution }, page, hasMore: offset + limit < total });
  } catch (err) {
    console.error('[GET reviews]', err);
    return ApiErrors.internalError('Erreur serveur');
  }
}

// POST /api/courses/[id]/reviews — créer ou mettre à jour son avis
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id: courseId } = await params;
    const supabase = await createServerSupabaseClient();
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return ApiErrors.unauthorized();

    const userId = session.user.id;
    const body = await request.json();
    const rating  = parseInt(body.rating);
    const comment = typeof body.comment === 'string' ? body.comment.trim().slice(0, 500) : null;

    if (!rating || rating < 1 || rating > 5) {
      return errorResponse('La note doit être entre 1 et 5.', 400, 'INVALID_RATING');
    }

    const admin = createAdminSupabaseClient();

    // Vérifier l'inscription active ou complétée
    const { data: enrollment } = await admin
      .from('enrollments')
      .select('id')
      .eq('user_id', userId)
      .eq('course_id', courseId)
      .in('status', ['active', 'completed'])
      .maybeSingle();

    if (!enrollment) {
      return errorResponse('Vous devez être inscrit au cours pour laisser un avis.', 403, 'NOT_ENROLLED');
    }

    const { data: review, error } = await admin
      .from('course_reviews')
      .upsert(
        { user_id: userId, course_id: courseId, rating, comment, updated_at: new Date().toISOString() },
        { onConflict: 'user_id,course_id' },
      )
      .select('id, rating, comment, created_at')
      .single();

    if (error) {
      console.error('[POST reviews]', error.message);
      return ApiErrors.internalError('Erreur lors de la sauvegarde');
    }

    return successResponse({ review });
  } catch (err) {
    console.error('[POST reviews]', err);
    return ApiErrors.internalError('Erreur serveur');
  }
}

// DELETE /api/courses/[id]/reviews — supprimer son propre avis
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id: courseId } = await params;
    const supabase = await createServerSupabaseClient();
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return ApiErrors.unauthorized();

    const admin = createAdminSupabaseClient();
    await admin
      .from('course_reviews')
      .delete()
      .eq('course_id', courseId)
      .eq('user_id', session.user.id);

    return successResponse({ deleted: true });
  } catch (err) {
    console.error('[DELETE reviews]', err);
    return ApiErrors.internalError('Erreur serveur');
  }
}

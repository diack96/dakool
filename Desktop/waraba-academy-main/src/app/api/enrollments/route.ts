import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import { successResponse, errorResponse, CACHE_HEADERS } from '@/lib/api/apiUtils';
import { dbRateLimit } from '@/lib/dbRateLimit';
import { z } from 'zod';
import { trackProgress } from '@/lib/gamification';

const uuidSchema = z.string().uuid('ID invalide');

// GET - Récupérer les inscriptions de l'utilisateur connecté
export async function GET(_request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();

    // getSession() : validation JWT locale, zéro appel réseau Auth
    const { data: { session }, error: authError } = await supabase.auth.getSession();
    const user = session?.user;
    if (authError || !user) {
      return errorResponse('Non authentifié', { status: 401, code: 'UNAUTHORIZED' });
    }

    // Récupérer les inscriptions avec les cours.
    // On utilise l'agrégat COUNT de PostgREST pour totalLessons — aucun row de leçon
    // n'est chargé (évite N_enrollments × N_lessons objets dans la réponse).
    // La RLS RESTRICTIVE lessons_hide_deleted (migration 037) garantit que les
    // leçons soft-deleted ne sont pas comptées pour les utilisateurs non-admins.
    const { data: enrollments, error } = await supabase
      .from('enrollments')
      .select(`
        id,
        user_id,
        course_id,
        status,
        progress,
        enrolled_at,
        completed_at,
        created_at,
        courses (
          id,
          title,
          slug,
          thumbnail,
          image_url,
          level,
          category_id,
          duration,
          lessons_count:lessons(count)
        )
      `)
      .eq('user_id', user.id)
      .in('status', ['active', 'completed', 'pending'])
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[enrollments GET] Supabase error:', error.code, error.message);
      // Erreur RLS - retourner tableau vide plutôt qu'erreur
      if (error.code === '42501' || error.code === 'PGRST301') {
        return NextResponse.json(
          { success: true, enrollments: [] },
          { headers: CACHE_HEADERS.NO_CACHE }
        );
      }
      return errorResponse('Erreur lors de la récupération des inscriptions', { status: 500 });
    }

    // Aplatir le résultat de l'agrégat COUNT et normaliser le shape de sortie
    const enrichedEnrollments = (enrollments || []).map((e: any) => {
      if (!e.courses) return e;
      const lessonsCount = e.courses.lessons_count as Array<{ count: number }> | undefined;
      const totalLessons = lessonsCount?.[0]?.count ?? 0;
      const { lessons_count: _, ...coursesWithoutCount } = e.courses;
      return {
        ...e,
        courses: {
          ...coursesWithoutCount,
          totalLessons,
          totalDuration: e.courses.duration || 0,
        },
      };
    });

    return NextResponse.json(
      { success: true, enrollments: enrichedEnrollments },
      { headers: CACHE_HEADERS.NO_CACHE }
    );
  } catch (error) {
    console.error('[enrollments GET] Unexpected error:', error);
    return errorResponse('Erreur interne du serveur', { status: 500 });
  }
}

// POST - Créer une nouvelle inscription
export async function POST(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    ?? request.headers.get('x-real-ip')
    ?? 'unknown';
  const blocked = await dbRateLimit(`enrollments:${ip}`, 10, 60_000);
  if (blocked) return errorResponse('Trop de requêtes. Réessayez plus tard.', { status: 429 });

  try {
    const supabase = await createServerSupabaseClient();

    // getSession() : validation JWT locale, zéro appel réseau Auth
    const { data: { session }, error: authError } = await supabase.auth.getSession();
    const user = session?.user;
    if (authError || !user) {
      return errorResponse('Non authentifié', { status: 401, code: 'UNAUTHORIZED' });
    }

    // Parser le body
    let body;
    try {
      body = await request.json();
    } catch {
      return errorResponse('Corps de requête invalide', { status: 400 });
    }

    const { courseId } = body;
    if (!courseId) {
      return errorResponse('courseId est requis', { status: 400, code: 'VALIDATION_ERROR' });
    }

    // Résoudre le courseId (peut être un slug ou un UUID)
    let resolvedCourseId = courseId;
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(courseId);

    if (!isUUID) {
      // C'est un slug, récupérer l'UUID
      const { data: course } = await supabase
        .from('courses')
        .select('id')
        .eq('slug', courseId)
        .single();

      if (course) {
        resolvedCourseId = (course as { id: string }).id;
      }
    }

    // Vérifier l'inscription existante et le cours en parallèle
    const [{ data: existing }, { data: course, error: courseError }] = await Promise.all([
      supabase
        .from('enrollments')
        .select('id, status')
        .eq('user_id', user.id)
        .eq('course_id', resolvedCourseId)
        .limit(1)
        .maybeSingle(),
      supabase
        .from('courses')
        .select('id, title, description, slug, price, is_free, is_published')
        .eq('id', resolvedCourseId)
        .single(),
    ]);

    if (existing) {
      return NextResponse.json({
        success: true,
        message: 'Vous êtes déjà inscrit à ce cours',
        enrollment: existing,
        alreadyEnrolled: true,
      });
    }

    if (courseError || !course) {
      return errorResponse('Cours non trouvé', { status: 404, code: 'NOT_FOUND' });
    }

    // Si cours payant, vérifier qu'un paiement complété existe
    const courseData = course as { id: string; title: string; price: number | null; is_free: boolean; is_published: boolean };
    const isFree = courseData.is_free || !courseData.price || courseData.price === 0;
    if (!isFree) {
      const { data: completedPayment } = await supabase
        .from('payments')
        .select('id')
        .eq('user_id', user.id)
        .eq('course_id', resolvedCourseId)
        .eq('status', 'completed')
        .limit(1)
        .single();

      if (!completedPayment) {
        return errorResponse('Ce cours nécessite un paiement', { status: 402, code: 'PAYMENT_REQUIRED' });
      }
    }

    // Créer l'inscription
    const enrollmentData = {
      user_id: user.id,
      course_id: resolvedCourseId,
      status: 'active',
      progress: 0,
      enrolled_at: new Date().toISOString(),
    };

    const { data: enrollment, error: insertError } = await supabase
      .from('enrollments')
      .insert(enrollmentData as never)
      .select()
      .single();

    if (insertError) {
      // Contrainte unique violée = déjà inscrit
      if (insertError.code === '23505') {
        return NextResponse.json({
          success: true,
          message: 'Vous êtes déjà inscrit à ce cours',
          alreadyEnrolled: true,
        });
      }
      return errorResponse('Erreur lors de l\'inscription', { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Inscription réussie',
      enrollment,
    }, { status: 201 });
  } catch (error) {
    return errorResponse('Erreur interne du serveur', { status: 500 });
  }
}

// PATCH - Mettre à jour une inscription (progression)
export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();

    // getSession() : validation JWT locale, zéro appel réseau Auth
    const { data: { session }, error: authError } = await supabase.auth.getSession();
    const user = session?.user;
    if (authError || !user) {
      return errorResponse('Non authentifié', { status: 401 });
    }

    const body = await request.json();
    const { enrollmentId, progress, status } = body;

    if (!enrollmentId) {
      return errorResponse('enrollmentId est requis', { status: 400 });
    }

    // Récupérer la progression actuelle avant mise à jour (pour la gamification)
    let oldProgress = 0;
    if (typeof progress === 'number') {
      const { data: current } = await supabase
        .from('enrollments')
        .select('progress')
        .eq('id', enrollmentId)
        .eq('user_id', user.id)
        .single();
      oldProgress = (current as any)?.progress ?? 0;
    }

    const updateData: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (typeof progress === 'number') updateData.progress = progress;
    if (status) updateData.status = status;
    if (progress === 100) updateData.completed_at = new Date().toISOString();

    const { data: enrollment, error } = await supabase
      .from('enrollments')
      .update(updateData as never)
      .eq('id', enrollmentId)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) {
      return errorResponse('Erreur lors de la mise à jour', { status: 500 });
    }

    // Gamification — fire-and-forget, ne bloque pas la réponse
    if (typeof progress === 'number') {
      trackProgress(user.id, oldProgress, progress);
    }

    return successResponse(enrollment);
  } catch (error) {
    return errorResponse('Erreur interne du serveur', { status: 500 });
  }
}

// DELETE - Supprimer une inscription
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();

    // getSession() : validation JWT locale, zéro appel réseau Auth
    const { data: { session }, error: authError } = await supabase.auth.getSession();
    const user = session?.user;
    if (authError || !user) {
      return errorResponse('Non authentifié', { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const rawId = searchParams.get('id');

    if (!rawId) {
      return errorResponse('id est requis', { status: 400 });
    }

    const validation = uuidSchema.safeParse(rawId);
    if (!validation.success) {
      return errorResponse('ID invalide', { status: 400 });
    }
    const enrollmentId = validation.data;

    // Récupérer l'enrollment pour connaître le course_id
    const { data: enrollment, error: fetchError } = await supabase
      .from('enrollments')
      .select('id, course_id')
      .eq('id', enrollmentId)
      .eq('user_id', user.id)
      .single();

    if (fetchError || !enrollment) {
      return errorResponse('Inscription introuvable', { status: 404 });
    }

    // Bloquer la suppression si un paiement complété existe pour ce cours
    const { data: completedPayment } = await supabase
      .from('payments')
      .select('id')
      .eq('user_id', user.id)
      .eq('course_id', (enrollment as any).course_id)
      .eq('status', 'completed')
      .limit(1)
      .maybeSingle();

    if (completedPayment) {
      return errorResponse(
        'Impossible de se désinscrire d\'un cours payant. Contactez le support.',
        { status: 403, code: 'PAID_ENROLLMENT' },
      );
    }

    const { error } = await supabase
      .from('enrollments')
      .delete()
      .eq('id', enrollmentId)
      .eq('user_id', user.id);

    if (error) {
      return errorResponse('Erreur lors de la suppression', { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'Inscription supprimée' });
  } catch (error) {
    return errorResponse('Erreur interne du serveur', { status: 500 });
  }
}

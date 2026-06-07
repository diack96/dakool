import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { apiRateLimiter } from '@/lib/rateLimit';

// DELETE - Annuler une inscription (mettre le statut à 'cancelled')
export async function DELETE (
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // Appliquer le rate limiting
  const rateLimitResponse = await apiRateLimiter(request);
  if (rateLimitResponse) {
    return rateLimitResponse;
  }

  try {
    const { id: courseIdOrEnrollmentId } = await params;
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll () {
            return cookieStore.getAll();
          },
          setAll (cookiesToSet: Array<{ name: string; value: string; options?: any }>) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options),
              );
            } catch {
              // Ignorer les erreurs de cookies côté serveur
            }
          },
        },
      },
    );

    // Vérifier l'authentification
    const { data: { session }, error: authError } = await supabase.auth.getSession();
    const user = session?.user;

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 },
      );
    }

    // Résoudre le courseId (slug ou UUID) en UUID réel si nécessaire
    const isIdUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(courseIdOrEnrollmentId);
    let resolvedCourseId: string | null = null;
    let enrollmentId: string | null = null;

    if (isIdUUID) {
      // C'est peut-être un UUID de cours ou d'enrollment
      // Chercher d'abord comme enrollment ID
      const { data: enrollmentById } = await supabase
        .from('enrollments')
        .select('id, course_id, user_id')
        .eq('id', courseIdOrEnrollmentId)
        .eq('user_id', user.id)
        .maybeSingle();

      if (enrollmentById) {
        enrollmentId = enrollmentById.id;
        resolvedCourseId = enrollmentById.course_id;
      } else {
        // Sinon, chercher comme course ID
        const { data: course } = await supabase
          .from('courses')
          .select('id')
          .eq('id', courseIdOrEnrollmentId)
          .maybeSingle();

        if (course) {
          resolvedCourseId = course.id;
        }
      }
    } else {
      // C'est un slug, chercher le cours
      const { data: course } = await supabase
        .from('courses')
        .select('id')
        .eq('slug', courseIdOrEnrollmentId)
        .maybeSingle();

      if (course) {
        resolvedCourseId = course.id;
      }
    }

    // Si on a un courseId mais pas d'enrollmentId, chercher l'enrollment
    if (resolvedCourseId && !enrollmentId) {
      const { data: enrollment } = await supabase
        .from('enrollments')
        .select('id, course_id, user_id, status')
        .eq('course_id', resolvedCourseId)
        .eq('user_id', user.id)
        .maybeSingle();

      if (enrollment) {
        enrollmentId = enrollment.id;
      }
    }

    if (!enrollmentId) {
      return NextResponse.json(
        { error: 'Inscription non trouvée' },
        { status: 404 },
      );
    }

    // Mettre à jour le statut à 'cancelled' au lieu de supprimer
    const { data: updatedEnrollment, error: updateError } = await supabase
      .from('enrollments')
      .update({
        status: 'cancelled',
        updated_at: new Date().toISOString(),
      })
      .eq('id', enrollmentId)
      .eq('user_id', user.id)
      .select()
      .single();

    if (updateError) {
      console.error('[API Enrollments DELETE] ❌ Erreur lors de l\'annulation:', {
        error: updateError.message,
        enrollmentId,
        userId: user.id,
      });
      return NextResponse.json(
        { error: 'Erreur lors de l\'annulation de l\'inscription' },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Inscription annulée avec succès',
      enrollment: updatedEnrollment,
    });
  } catch (error: unknown) {
    console.error('[API Enrollments DELETE] ❌ ERREUR 500:', {
      error: error instanceof Error ? error.message : String(error),
      name: error instanceof Error ? error.name : typeof error,
    });
    
    return NextResponse.json(
      { 
        error: 'Erreur interne du serveur lors de l\'annulation de l\'inscription',
        details: process.env.NODE_ENV === 'development' ? {
          message: error instanceof Error ? error.message : String(error),
        } : undefined,
      },
      { status: 500 },
    );
  }
}

// Handler pour les méthodes non supportées
async function methodNotAllowedHandler (method: string) {
  return NextResponse.json(
    { 
      error: `Méthode ${method} non autorisée. Utilisez DELETE.`,
      allowedMethods: ['DELETE'],
    },
    { 
      status: 405,
      headers: {
        'Allow': 'DELETE',
      },
    },
  );
}

export async function GET (_request: NextRequest) {
  return methodNotAllowedHandler('GET');
}

export async function POST (_request: NextRequest) {
  return methodNotAllowedHandler('POST');
}

export async function PUT (_request: NextRequest) {
  return methodNotAllowedHandler('PUT');
}

export async function PATCH (_request: NextRequest) {
  return methodNotAllowedHandler('PATCH');
}

export async function OPTIONS (_request: NextRequest) {
  const origin = _request.headers.get('origin') || '';
  const allowedOrigin = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Allow': 'DELETE',
      'Access-Control-Allow-Methods': 'DELETE',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Allow-Origin': origin === allowedOrigin ? allowedOrigin : '',
      'Access-Control-Max-Age': '86400',
    },
  });
}

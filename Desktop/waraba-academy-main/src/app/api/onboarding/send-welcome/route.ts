import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import { sendEmail, addContactToAudience } from '@/lib/email';
import { welcomeWithCourseTemplate } from '@/lib/email/templates';
import { errorResponse } from '@/lib/api/apiUtils';
import { strictRateLimiter } from '@/lib/rateLimit';

interface ProfileData {
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  welcome_email_sent: boolean | null;
}

interface CourseData {
  id: string;
  title: string;
  description: string | null;
  slug: string | null;
  thumbnail: string | null;
  image_url: string | null;
}

// POST - Envoie l'email de bienvenue avec le cours sélectionné
export async function POST(request: NextRequest) {
  const rateLimitResponse = await strictRateLimiter(request);
  if (rateLimitResponse) return rateLimitResponse;

  try {
    const supabase = await createServerSupabaseClient();

    // Vérifier l'authentification
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

    // Récupérer le profil utilisateur
    const { data: profileResult, error: profileError } = await supabase
      .from('profiles')
      .select('first_name, last_name, email, welcome_email_sent')
      .eq('id', user.id)
      .single();

    const profile = profileResult as ProfileData | null;

    if (profileError || !profile) {
      return errorResponse('Profil non trouvé', { status: 404, code: 'NOT_FOUND' });
    }

    // Vérifier si l'email a déjà été envoyé
    if (profile.welcome_email_sent) {
      return NextResponse.json({
        success: true,
        message: 'Email de bienvenue déjà envoyé',
        alreadySent: true,
      });
    }

    // Récupérer les informations du cours
    const { data: courseResult, error: courseError } = await supabase
      .from('courses')
      .select('id, title, description, slug, thumbnail, image_url')
      .eq('id', courseId)
      .single();

    const course = courseResult as CourseData | null;

    if (courseError || !course) {
      return errorResponse('Cours non trouvé', { status: 404, code: 'NOT_FOUND' });
    }

    // Construire les URLs
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://waraba-academy.com';
    const courseUrl = course.slug
      ? `${baseUrl}/courses/${course.slug}`
      : `${baseUrl}/courses/${course.id}`;
    const dashboardUrl = `${baseUrl}/dashboard`;

    // Construire le nom d'utilisateur
    const userName = profile.first_name && profile.last_name
      ? `${profile.first_name} ${profile.last_name}`
      : profile.first_name || profile.email?.split('@')[0] || 'Apprenant';

    // Générer le template email
    const { html, text } = await welcomeWithCourseTemplate({
      userName,
      courseTitle: course.title,
      courseDescription: course.description || 'Un cours passionnant vous attend !',
      courseUrl,
      courseThumbnail: course.thumbnail || course.image_url || undefined,
      dashboardUrl,
    });

    // Envoyer l'email
    const userEmail = profile.email || user.email;
    if (!userEmail) {
      return errorResponse('Adresse email non trouvée', { status: 400, code: 'EMAIL_MISSING' });
    }

    const emailResult = await sendEmail({
      to: userEmail,
      subject: `🎉 Bienvenue sur Waraba Academy, ${userName} ! Votre premier cours vous attend`,
      html,
      text,
    });

    if (!emailResult.success) {
      console.error('Erreur envoi email bienvenue:', emailResult.error);
      return errorResponse('Erreur lors de l\'envoi de l\'email', { status: 500 });
    }

    // Ajouter à l'audience Resend (non bloquant)
    addContactToAudience({
      email: userEmail,
      firstName: profile.first_name || undefined,
      lastName: profile.last_name || undefined,
    }).catch(() => {});

    // Marquer l'email comme envoyé et sauvegarder le premier cours
    await supabase
      .from('profiles')
      .update({
        welcome_email_sent: true,
        first_course_id: courseId,
      } as never)
      .eq('id', user.id);

    return NextResponse.json({
      success: true,
      message: 'Email de bienvenue envoyé avec succès',
      messageId: emailResult.messageId,
    });
  } catch (error) {
    console.error('Erreur send-welcome:', error);
    return errorResponse('Erreur interne du serveur', { status: 500 });
  }
}

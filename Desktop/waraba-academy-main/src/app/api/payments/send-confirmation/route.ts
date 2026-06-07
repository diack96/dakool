import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import { sendEmail, isEmailConfigured } from '@/lib/email';
import { enrollmentConfirmationTemplate } from '@/lib/email/templates';
import { strictRateLimiter } from '@/lib/rateLimit';

/**
 * API pour envoyer un email de confirmation après inscription/paiement
 * POST /api/payments/send-confirmation
 */
export async function POST(request: NextRequest) {
  const rateLimitResponse = await strictRateLimiter(request);
  if (rateLimitResponse) return rateLimitResponse;

  try {
    const supabase = await createServerSupabaseClient();

    // Vérifier l'authentification
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 },
      );
    }

    const body = await request.json();
    const { enrollmentId, paymentId, courseId } = body;

    if (!enrollmentId || !courseId) {
      return NextResponse.json(
        { error: 'enrollmentId et courseId requis' },
        { status: 400 },
      );
    }

    // Récupérer les données de l'inscription
    const { data: enrollment, error: enrollmentError } = await supabase
      .from('enrollments')
      .select(`
        id,
        user_id,
        course_id,
        enrolled_at,
        courses (
          id,
          title,
          slug,
          price,
          description
        )
      `)
      .eq('id', enrollmentId)
      .eq('user_id', user.id)
      .single();

    if (enrollmentError || !enrollment) {
      return NextResponse.json(
        { error: 'Inscription non trouvée' },
        { status: 404 },
      );
    }

    const enrollmentData = enrollment as {
      id: string;
      user_id: string;
      course_id: string;
      enrolled_at: string;
      courses: { id: string; title: string; slug?: string; price: number | null };
    };

    // Récupérer les données du paiement si fourni
    let paymentData: { amount: number; currency: string } | null = null;
    if (paymentId) {
      const { data: payment } = await supabase
        .from('payments')
        .select('id, amount, currency, paid_at')
        .eq('id', paymentId)
        .eq('user_id', user.id)
        .single();

      if (payment) {
        paymentData = payment as { amount: number; currency: string };
      }
    }

    // Récupérer le profil utilisateur
    const { data: profile } = await supabase
      .from('profiles')
      .select('first_name, last_name, email')
      .eq('id', user.id)
      .single();

    const profileData = profile as { first_name?: string; last_name?: string; email?: string } | null;
    const userEmail = profileData?.email || user.email || '';
    const userName = profileData
      ? `${profileData.first_name || ''} ${profileData.last_name || ''}`.trim() || 'Utilisateur'
      : 'Utilisateur';

    const course = enrollmentData.courses;
    const isFreeCourse = !paymentData && (!course.price || course.price === 0);

    // Vérifier si le service email est configuré
    if (!isEmailConfigured()) {
      console.log('📧 Email service non configuré. Email simulé:', {
        to: userEmail,
        course: course.title,
        isFreeCourse,
      });
      return NextResponse.json({
        success: true,
        message: 'Email de confirmation (simulé - service non configuré)',
        emailSent: false,
        simulated: true,
      });
    }

    // Construire l'URL du cours
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://waraba-academy.com';
    const courseUrl = `${baseUrl}/courses/${course.slug || course.id}/learn`;

    // Générer le template email
    const { html, text } = await enrollmentConfirmationTemplate({
      userName,
      courseTitle: course.title,
      courseUrl,
      enrollmentDate: enrollmentData.enrolled_at,
      isFreeCourse,
      amount: paymentData?.amount,
      currency: paymentData?.currency,
    });

    // Envoyer l'email
    const result = await sendEmail({
      to: userEmail,
      subject: isFreeCourse
        ? `Confirmation d'inscription - ${course.title}`
        : `Confirmation de paiement - ${course.title}`,
      html,
      text,
    });

    if (!result.success) {
      console.error('❌ Erreur envoi email confirmation:', result.error);
      return NextResponse.json({
        success: true, // Ne pas bloquer le flux même si l'email échoue
        message: 'Inscription confirmée (email non envoyé)',
        emailSent: false,
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Email de confirmation envoyé',
      emailSent: true,
      messageId: result.messageId,
    });
  } catch (error) {
    console.error('Erreur lors de l\'envoi de l\'email de confirmation:', error);
    return NextResponse.json(
      { error: 'Erreur lors de l\'envoi de l\'email' },
      { status: 500 },
    );
  }
}

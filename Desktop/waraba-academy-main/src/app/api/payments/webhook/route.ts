import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { apiLogger } from '@/lib/logger';
import { getAdminSupabaseClient } from '@/lib/supabase-server';
import { sendEmail, isEmailConfigured } from '@/lib/email';
import { enrollmentConfirmationTemplate } from '@/lib/email/templates';

// Initialiser Stripe - validation au runtime, pas au build time
let stripe: Stripe | null = null;
let endpointSecret: string | null = null;

function getStripeInstance (): Stripe {
  if (!stripe) {
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

    // Toujours vérifier que le secret est configuré
    if (!stripeSecretKey) {
      throw new Error('STRIPE_SECRET_KEY est requis. Configurez la variable d\'environnement.');
    }

    stripe = new Stripe(stripeSecretKey, {
      apiVersion: '2025-08-27.basil' as const,
    });
  }
  return stripe;
}

function getWebhookSecret (): string {
  if (!endpointSecret) {
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    // Toujours vérifier que le secret est configuré
    if (!webhookSecret) {
      throw new Error('STRIPE_WEBHOOK_SECRET est requis. Configurez la variable d\'environnement.');
    }

    endpointSecret = webhookSecret;
  }
  return endpointSecret;
}

async function sendConfirmationEmail (
  supabase: ReturnType<typeof getAdminSupabaseClient>,
  userId: string,
  courseId: string,
  enrolledAt: string,
  paymentIntent: Stripe.PaymentIntent,
) {
  const [{ data: profile }, { data: course }] = await Promise.all([
    supabase.from('profiles').select('first_name, last_name, email').eq('id', userId).single(),
    supabase.from('courses').select('title, slug').eq('id', courseId).single(),
  ]);

  if (!course) return;

  const profileData = profile as { first_name?: string; last_name?: string; email?: string } | null;
  const userEmail = profileData?.email || '';
  if (!userEmail) return;

  const userName = profileData
    ? `${profileData.first_name || ''} ${profileData.last_name || ''}`.trim() || 'Apprenant'
    : 'Apprenant';

  const courseData = course as { title: string; slug?: string };
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://waraba-academy.com';
  const courseUrl = `${baseUrl}/courses/${courseData.slug || courseId}/learn`;

  const { html, text } = await enrollmentConfirmationTemplate({
    userName,
    courseTitle: courseData.title,
    courseUrl,
    enrollmentDate: enrolledAt,
    isFreeCourse: false,
    amount: paymentIntent.amount / 100,
    currency: paymentIntent.currency.toUpperCase(),
  });

  await sendEmail({
    to: userEmail,
    subject: `Confirmation de paiement - ${courseData.title}`,
    html,
    text,
  });
}

/**
 * Met à jour le statut d'un paiement dans la base de données
 * et crée l'inscription si le paiement est réussi
 */
async function updatePaymentStatus (
  paymentIntentId: string,
  status: 'completed' | 'failed',
  paymentIntent: Stripe.PaymentIntent,
) {
  try {
    const supabase = getAdminSupabaseClient();

    // Chercher le paiement par transaction_id (payment_intent.id)
    const { data: existingPayment, error: findError } = await supabase
      .from('payments')
      .select('id, user_id, course_id, status')
      .eq('transaction_id', paymentIntentId)
      .single();

    if (findError || !existingPayment) {
      apiLogger.warn('Paiement non trouvé dans la base de données', {
        paymentIntentId,
        error: findError?.message,
      });
      return;
    }

    // Ne pas mettre à jour si déjà complété
    if (existingPayment.status === 'completed' && status === 'completed') {
      apiLogger.info('Paiement déjà complété, ignoré', {
        paymentId: existingPayment.id,
        paymentIntentId,
      });
      return;
    }

    // Mettre à jour le statut du paiement
    // SECURITY: Only store essential fields from PaymentIntent — never the full object
    const sanitizedResponse = {
      id: paymentIntent.id,
      amount: paymentIntent.amount,
      currency: paymentIntent.currency,
      status: paymentIntent.status,
      created: paymentIntent.created,
      payment_method_types: paymentIntent.payment_method_types,
    };

    const updateData: any = {
      status,
      updated_at: new Date().toISOString(),
      gateway_response: sanitizedResponse,
    };

    if (status === 'completed') {
      updateData.paid_at = new Date().toISOString();
    }

    const { error: updateError } = await supabase
      .from('payments')
      .update(updateData)
      .eq('id', existingPayment.id);

    if (updateError) {
      apiLogger.error('Erreur lors de la mise à jour du paiement', updateError, {
        paymentId: existingPayment.id,
        paymentIntentId,
      });
      return;
    }

    apiLogger.info('Statut du paiement mis à jour', {
      paymentId: existingPayment.id,
      paymentIntentId,
      status,
    });

    // Si le paiement est réussi, créer l'inscription si elle n'existe pas
    if (status === 'completed') {
      const { data: existingEnrollment } = await supabase
        .from('enrollments')
        .select('id')
        .eq('user_id', existingPayment.user_id)
        .eq('course_id', existingPayment.course_id)
        .in('status', ['active', 'completed'])
        .single();

      if (!existingEnrollment) {
        const enrolledAt = new Date().toISOString();
        const { data: newEnrollment, error: enrollmentError } = await supabase
          .from('enrollments')
          .insert({
            user_id: existingPayment.user_id,
            course_id: existingPayment.course_id,
            status: 'active',
            enrolled_at: enrolledAt,
          })
          .select('id')
          .single();

        if (enrollmentError) {
          apiLogger.error('Erreur lors de la création de l\'inscription après paiement', enrollmentError, {
            userId: existingPayment.user_id,
            courseId: existingPayment.course_id,
            paymentId: existingPayment.id,
          });
        } else {
          apiLogger.info('Inscription créée automatiquement après paiement réussi', {
            userId: existingPayment.user_id,
            courseId: existingPayment.course_id,
            paymentId: existingPayment.id,
          });

          // Envoyer l'email de confirmation (fire-and-forget)
          if (isEmailConfigured() && newEnrollment) {
            sendConfirmationEmail(
              supabase,
              existingPayment.user_id,
              existingPayment.course_id,
              enrolledAt,
              paymentIntent,
            ).catch((err) => apiLogger.error('Erreur email confirmation paiement', err, {}));
          }
        }
      }
    }
  } catch (error) {
    apiLogger.error('Erreur inattendue lors de la mise à jour du paiement', error, {
      paymentIntentId,
      status,
    });
  }
}

export async function POST (request: NextRequest) {
  const body = await request.text();
  const sig = request.headers.get('stripe-signature');

  let event: Stripe.Event;

  try {
    if (!sig) {
      throw new Error('Signature Stripe manquante');
    }

    const stripeInstance = getStripeInstance();
    const webhookSecret = getWebhookSecret();
    event = stripeInstance.webhooks.constructEvent(body, sig, webhookSecret);
  } catch (err) {
    apiLogger.error('Erreur de signature webhook Stripe', err, {
      hasSignature: !!sig,
    });
    return NextResponse.json(
      { error: 'Signature invalide' },
      { status: 400 },
    );
  }

  try {
    switch (event.type) {
    case 'payment_intent.succeeded': {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      apiLogger.info('Paiement Stripe réussi', {
        paymentIntentId: paymentIntent.id,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency,
      });

      // Mettre à jour le statut du paiement dans la base de données
      await updatePaymentStatus(
        paymentIntent.id,
        'completed',
        paymentIntent,
      );

      break;
    }

    case 'payment_intent.payment_failed': {
      const failedPayment = event.data.object as Stripe.PaymentIntent;
      apiLogger.warn('Paiement Stripe échoué', {
        paymentIntentId: failedPayment.id,
        amount: failedPayment.amount,
        currency: failedPayment.currency,
        lastPaymentError: failedPayment.last_payment_error,
      });

      // Mettre à jour le statut du paiement en échec
      await updatePaymentStatus(
        failedPayment.id,
        'failed',
        failedPayment,
      );

      break;
    }

    default:
      apiLogger.info('Événement Stripe non géré', {
        eventType: event.type,
      });
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    apiLogger.error('Erreur lors du traitement du webhook Stripe', error, {
      eventType: event.type,
    });
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 },
    );
  }
}


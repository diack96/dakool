import { NextRequest, NextResponse } from 'next/server';
import { createHmac, timingSafeEqual } from 'crypto';
import { getAdminSupabaseClient } from '@/lib/supabase-server';
import { apiLogger } from '@/lib/logger';
import { sendEmail } from '@/lib/email';
import { enrollmentConfirmationTemplate, paymentFailedTemplate } from '@/lib/email/templates';

/**
 * Nettoie une variable d'env corrompue (BOM UTF-8, \n litéral, CRLF).
 */
function cleanEnvVar(value: string | undefined): string {
  if (!value) return '';
  return value
    .replace(/^﻿/, '')
    .replace(/\\r\\n$/, '')
    .replace(/\\n$/, '')
    .replace(/[\r\n\t]+$/, '')
    .trim();
}

/**
 * Vérifie la signature HMAC-SHA256 du webhook Wave.
 *
 * Header  :  Wave-Signature: t={timestamp},v1={hmac_hex}
 *             (peut aussi arriver en X-Wave-Signature selon la version du portail)
 * Payload :  {timestamp}{raw_request_body}   ← concaténation directe, SANS séparateur
 *             (même format que les requêtes sortantes — doc Wave : "timestamp + body")
 *
 * Note : on accepte aussi le format Stripe-like "{timestamp}.{body}" en fallback
 *        pour la compatibilité ascendante (rotation de format).
 *
 * Sécurité :
 *  - Timestamp valide (± 5 min, anti-replay)
 *  - Comparaison timing-safe (anti-timing attack)
 *  - Plusieurs v1= supportés (rotation de clés)
 *
 * Docs : https://docs.wave.com/business#request-signing
 */
function verifyWaveSignature(
  rawBody:         string,
  signatureHeader: string,
  secret:          string,
): boolean {
  // Format : "t=1639081943,v1=abc123" (plusieurs v1= possibles lors d'une rotation)
  const parts          = signatureHeader.split(',');
  const timestampPart  = parts.find(p => p.startsWith('t='));
  const signatureParts = parts.filter(p => p.startsWith('v1='));

  if (!timestampPart || signatureParts.length === 0) return false;

  const timestamp = timestampPart.slice(2);
  const ts        = parseInt(timestamp, 10);

  // Rejeter les timestamps hors fenêtre ± 5 minutes (anti-replay)
  const now = Math.floor(Date.now() / 1000);
  if (isNaN(ts) || Math.abs(now - ts) > 300) return false;

  // Wave documente deux formats selon la version de l'API :
  //   v1 (ancien) : "{timestamp}.{raw_body}"  (dot separator, Stripe-like)
  //   v2 (actuel) : "{timestamp}{raw_body}"   (no separator, même format que les requêtes sortantes)
  // On calcule les deux et on accepte l'un ou l'autre.
  const signedPayloadDot    = `${timestamp}.${rawBody}`;
  const signedPayloadNoDot  = `${timestamp}${rawBody}`;
  const expectedDot    = createHmac('sha256', secret).update(signedPayloadDot,   'utf8').digest('hex');
  const expectedNoDot  = createHmac('sha256', secret).update(signedPayloadNoDot, 'utf8').digest('hex');
  const expectedBufDot   = Buffer.from(expectedDot,   'hex');
  const expectedBufNoDot = Buffer.from(expectedNoDot, 'hex');

  for (const part of signatureParts) {
    try {
      const sigBuf = Buffer.from(part.slice(3), 'hex'); // retire "v1="
      if (
        (sigBuf.length === expectedBufDot.length   && timingSafeEqual(sigBuf, expectedBufDot))   ||
        (sigBuf.length === expectedBufNoDot.length && timingSafeEqual(sigBuf, expectedBufNoDot))
      ) {
        return true;
      }
    } catch { /* hex invalide — continuer */ }
  }

  return false;
}

/**
 * Envoie l'email de confirmation de paiement après enrollment.
 * Fire-and-forget — les erreurs sont loggées mais ne bloquent pas la réponse webhook.
 */
async function sendPaymentConfirmationEmail(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: any,
  userId:   string,
  courseId: string,
  paymentId: string,
): Promise<void> {
  try {
    // Récupérer le profil utilisateur
    const { data: profile } = await supabase
      .from('profiles')
      .select('first_name, last_name, email')
      .eq('id', userId)
      .single();

    // Récupérer les infos du cours
    const { data: course } = await supabase
      .from('courses')
      .select('id, title, slug, price')
      .eq('id', courseId)
      .single();

    // Récupérer le paiement
    const { data: payment } = await supabase
      .from('payments')
      .select('amount, currency, paid_at')
      .eq('id', paymentId)
      .single();

    // Récupérer l'enrollment
    const { data: enrollment } = await supabase
      .from('enrollments')
      .select('enrolled_at')
      .eq('user_id', userId)
      .eq('course_id', courseId)
      .single();

    if (!profile || !course) {
      apiLogger.warn('Webhook Wave : données manquantes pour email confirmation', { userId, courseId });
      return;
    }

    const userEmail = profile.email || '';
    if (!userEmail) return;

    const userName = `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || 'Étudiant';
    const siteUrl  = process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_APP_URL || 'https://waraba-academy.com';
    const courseUrl = `${siteUrl}/courses/${course.slug || course.id}/learn`;

    const { html, text } = await enrollmentConfirmationTemplate({
      userName,
      courseTitle:    course.title,
      courseUrl,
      enrollmentDate: enrollment?.enrolled_at || new Date().toISOString(),
      isFreeCourse:   false,
      amount:         payment?.amount,
      currency:       payment?.currency || 'XOF',
    });

    const result = await sendEmail({
      to:      userEmail,
      subject: `Confirmation de paiement — ${course.title}`,
      html,
      text,
    });

    if (result.success) {
      apiLogger.info('Webhook Wave : email confirmation envoyé', { userId, courseId, email: userEmail });
    } else {
      apiLogger.warn('Webhook Wave : email confirmation non envoyé', { error: result.error });
    }
  } catch (err) {
    apiLogger.error('Webhook Wave : erreur envoi email confirmation', err as Error, { userId, courseId });
  }
}

/**
 * Envoie l'email d'échec de paiement.
 * Fire-and-forget — les erreurs sont loggées mais ne bloquent pas la réponse webhook.
 */
async function sendPaymentFailedEmail(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: any,
  userId:   string,
  courseId: string,
  amount:   number,
): Promise<void> {
  try {
    const { data: profile } = await supabase
      .from('profiles')
      .select('first_name, last_name, email')
      .eq('id', userId)
      .single();

    const { data: course } = await supabase
      .from('courses')
      .select('title, slug')
      .eq('id', courseId)
      .single();

    if (!profile || !course) return;

    const userEmail = profile.email || '';
    if (!userEmail) return;

    const userName = `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || 'Étudiant';
    const siteUrl  = process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_APP_URL || 'https://waraba-academy.com';
    const retryUrl = `${siteUrl}/courses/${course.slug || courseId}/payment`;

    const { html, text } = await paymentFailedTemplate({
      userName,
      courseTitle: course.title,
      amount,
      currency:    'XOF',
      retryUrl,
    });

    const result = await sendEmail({
      to:      userEmail,
      subject: `Paiement non abouti — ${course.title}`,
      html,
      text,
    });

    if (result.success) {
      apiLogger.info('Webhook Wave : email échec paiement envoyé', { userId, courseId, email: userEmail });
    } else {
      apiLogger.warn('Webhook Wave : email échec paiement non envoyé', { error: result.error });
    }
  } catch (err) {
    apiLogger.error('Webhook Wave : erreur envoi email échec paiement', err as Error, { userId, courseId });
  }
}

/**
 * POST /api/wave/webhook
 *
 * Configuré dans Wave Business Portal → Developers → Webhooks.
 * URL production : https://waraba-academy.com/api/wave/webhook
 *
 * Événements gérés :
 *  - checkout.session.completed      → paiement réussi → enrollment créé
 *  - checkout.session.payment_failed → paiement échoué
 *
 * Variable d'env requise : WAVE_WEBHOOK_SECRET
 */
export async function POST(request: NextRequest) {
  const webhookSecret = cleanEnvVar(process.env.WAVE_WEBHOOK_SECRET) || undefined;

  // Lire le body brut AVANT tout parsing (re-sérialiser casserait la signature)
  const rawBody = await request.text();

  // Vérification de signature (si secret configuré)
  if (webhookSecret) {
    // Wave peut envoyer "Wave-Signature" ou "X-Wave-Signature" selon la version
    const signatureHeader =
      request.headers.get('wave-signature') ??
      request.headers.get('x-wave-signature') ??
      '';

    if (!signatureHeader) {
      apiLogger.warn('Webhook Wave : header Wave-Signature absent');
      return NextResponse.json({ error: 'Signature manquante' }, { status: 403 });
    }

    if (!verifyWaveSignature(rawBody, signatureHeader, webhookSecret)) {
      apiLogger.warn('Webhook Wave : signature invalide');
      return NextResponse.json({ error: 'Signature invalide' }, { status: 403 });
    }
  }

  // Parser le payload JSON
  let payload: Record<string, unknown>;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: 'Payload invalide' }, { status: 400 });
  }

  const eventType = payload?.type as string | undefined;
  const data      = payload?.data as Record<string, unknown> | undefined;

  if (!eventType || !data) {
    apiLogger.warn('Webhook Wave : payload mal formé', { payload });
    return NextResponse.json({ received: true });
  }

  // Ignorer les événements hors périmètre
  if (
    eventType !== 'checkout.session.completed' &&
    eventType !== 'checkout.session.payment_failed'
  ) {
    apiLogger.info('Webhook Wave : événement ignoré', { eventType });
    return NextResponse.json({ received: true });
  }

  const sessionId      = data?.id              as string | undefined;
  const checkoutStatus = data?.checkout_status as string | undefined;
  const paymentStatus  = data?.payment_status  as string | undefined;
  const transactionId  = data?.transaction_id  as string | undefined;

  if (!sessionId) {
    apiLogger.warn('Webhook Wave : session ID absent', { eventType });
    return NextResponse.json({ received: true });
  }

  const isSuccess = eventType === 'checkout.session.completed'
    && checkoutStatus === 'complete'
    && paymentStatus  === 'succeeded';

  const newStatus = isSuccess ? 'completed' : 'failed';
  const supabase  = getAdminSupabaseClient();

  // Retrouver le paiement correspondant
  const { data: payment, error: findError } = await supabase
    .from('payments')
    .select('id, user_id, course_id, status')
    .eq('transaction_id', sessionId)
    .single();

  if (findError || !payment) {
    apiLogger.warn('Webhook Wave : paiement non trouvé', { sessionId });
    return NextResponse.json({ received: true }); // 200 pour éviter les retry Wave
  }

  // Idempotence : déjà traité
  if (payment.status === 'completed' || payment.status === 'failed') {
    return NextResponse.json({ received: true });
  }

  // Mise à jour du statut du paiement
  const { error: updateError } = await supabase
    .from('payments')
    .update({
      status:           newStatus,
      payment_method:   'wave',
      gateway_response: {
        session_id:      sessionId,
        checkout_status: checkoutStatus,
        payment_status:  paymentStatus,
        transaction_id:  transactionId,
        event:           eventType,
      },
      ...(isSuccess ? { paid_at: new Date().toISOString() } : {}),
    } as never)
    .eq('id', payment.id);

  if (updateError) {
    apiLogger.error('Webhook Wave : erreur update paiement', updateError, { sessionId });
    return NextResponse.json({ error: 'Erreur interne' }, { status: 500 });
  }

  // Paiement échoué → notifier l'utilisateur
  if (!isSuccess) {
    const failedAmount = (data?.amount_received as number) || 0;
    void sendPaymentFailedEmail(supabase, payment.user_id, payment.course_id, failedAmount);
    return NextResponse.json({ received: true });
  }

  // Paiement réussi → créer l'enrollment (idempotent)
  if (isSuccess) {
    const { data: existing } = await supabase
      .from('enrollments')
      .select('id')
      .eq('user_id', payment.user_id)
      .eq('course_id', payment.course_id)
      .in('status', ['active', 'completed'])
      .single();

    if (!existing) {
      const { error: enrollError } = await supabase
        .from('enrollments')
        .insert({
          user_id:     payment.user_id,
          course_id:   payment.course_id,
          status:      'active',
          enrolled_at: new Date().toISOString(),
        } as never);

      if (enrollError) {
        apiLogger.error('Webhook Wave : erreur enrollment', enrollError, {
          sessionId,
          userId:   payment.user_id,
          courseId: payment.course_id,
        });
        return NextResponse.json({ error: 'Erreur création enrollment' }, { status: 500 });
      }

      apiLogger.info('Webhook Wave : enrollment créé', {
        sessionId,
        userId:   payment.user_id,
        courseId: payment.course_id,
      });

      // Envoyer email de confirmation (fire-and-forget — ne bloque pas la réponse)
      void sendPaymentConfirmationEmail(supabase, payment.user_id, payment.course_id, payment.id);
    }
  }

  return NextResponse.json({ received: true });
}

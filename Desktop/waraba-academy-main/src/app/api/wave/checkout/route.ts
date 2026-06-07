import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient, getAdminSupabaseClient } from '@/lib/supabase-server';
import { strictRateLimiter } from '@/lib/rateLimit';
import { cleanEnvVar, waveRequest } from '@/lib/wave';
import { z } from 'zod';

const schema = z.object({
  courseId: z.string().uuid('courseId doit être un UUID valide'),
});

/**
 * POST /api/wave/checkout
 *
 * Crée une session de paiement Wave et retourne wave_launch_url + session_id.
 *
 * Variables d'env requises :
 *   WAVE_API_KEY        — clé API Wave (Bearer token)
 *   WAVE_SIGNING_SECRET — secret de signature des requêtes sortantes (affiché une seule
 *                         fois à la création de la clé ; Wave-Signature header obligatoire)
 *
 * Docs : https://docs.wave.com/checkout
 */
export async function POST(request: NextRequest) {
  // Rate limiting strict (endpoint paiement sensible)
  const rateLimitResponse = await strictRateLimiter(request);
  if (rateLimitResponse) return rateLimitResponse;

  const supabase = await createServerSupabaseClient();

  // Authentification obligatoire
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
  }

  // Validation du body
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Corps de requête invalide' }, { status: 400 });
  }

  const validation = schema.safeParse(body);
  if (!validation.success) {
    return NextResponse.json(
      { error: 'Données invalides', details: validation.error.issues.map(i => i.message) },
      { status: 400 },
    );
  }

  const { courseId }  = validation.data;
  const adminSupabase = getAdminSupabaseClient();

  // Prix du cours lu en DB (jamais depuis le client)
  const { data: course, error: courseError } = await adminSupabase
    .from('courses')
    .select('id, title, price')
    .eq('id', courseId)
    .single();

  if (courseError || !course) {
    return NextResponse.json({ error: 'Cours non trouvé' }, { status: 404 });
  }

  const coursePrice = parseFloat(String(course.price));
  if (isNaN(coursePrice) || coursePrice <= 0) {
    return NextResponse.json(
      { error: 'Ce cours ne peut pas être acheté (prix invalide)' },
      { status: 400 },
    );
  }

  // Idempotence : utilisateur déjà inscrit ?
  const { data: existing } = await adminSupabase
    .from('enrollments')
    .select('id')
    .eq('user_id', user.id)
    .eq('course_id', courseId)
    .in('status', ['active', 'completed'])
    .single();

  if (existing) {
    return NextResponse.json({ error: 'Vous êtes déjà inscrit à ce cours' }, { status: 400 });
  }

  const apiKey        = cleanEnvVar(process.env.WAVE_API_KEY);
  const signingSecret = cleanEnvVar(process.env.WAVE_SIGNING_SECRET);

  if (!apiKey || !signingSecret) {
    console.error('[Wave Checkout] Variables d\'env manquantes:', {
      hasApiKey: !!apiKey,
      hasSigningSecret: !!signingSecret,
    });
    return NextResponse.json({ error: 'Passerelle de paiement non configurée' }, { status: 503 });
  }

  // URL de base : NEXT_PUBLIC_SITE_URL (toujours HTTPS) en priorité
  const siteUrl = cleanEnvVar(process.env.NEXT_PUBLIC_SITE_URL)
    || cleanEnvVar(process.env.NEXT_PUBLIC_APP_URL)
    || 'https://waraba-academy.com';

  const successUrl = `${siteUrl}/courses/${courseId}/payment?wave_return=success`;
  const errorUrl   = `${siteUrl}/courses/${courseId}/payment?wave_return=error`;

  // Appel API Wave signé : création de la session de checkout
  const { ok, status, data: waveData } = await waveRequest(
    '/checkout/sessions',
    'POST',
    {
      amount:           String(Math.round(coursePrice)), // XOF : entier, pas de décimales
      currency:         'XOF',
      success_url:      successUrl,
      error_url:        errorUrl,
      client_reference: `${user.id}:${courseId}`,       // référence interne (≤255 chars)
    },
    apiKey,
    signingSecret,
  );

  if (!ok) {
    // LOG DEBUG — code HTTP Wave + message complet pour diagnostiquer
    console.error('[Wave Checkout] Erreur API Wave:', {
      httpStatus:    status,
      waveError:     waveData,
      apiKeyPrefix:  apiKey.slice(0, 20) + '…',
      hasSigningKey: !!signingSecret,
      coursePrice,
      successUrl,
    });
    return NextResponse.json(
      { error: 'Erreur lors de la création de la session Wave', details: waveData },
      { status: 502 },
    );
  }

  const sessionId     = waveData?.id              as string | undefined;
  const waveLaunchUrl = waveData?.wave_launch_url as string | undefined;

  if (!sessionId || !waveLaunchUrl) {
    console.error('[Wave Checkout] Réponse Wave invalide:', waveData);
    return NextResponse.json({ error: 'Réponse Wave invalide' }, { status: 502 });
  }

  // Enregistrement du paiement en DB (status=pending)
  const { error: paymentError } = await adminSupabase
    .from('payments')
    .insert({
      user_id:        user.id,
      course_id:      courseId,
      amount:         coursePrice,
      currency:       'XOF',
      status:         'pending',
      payment_method: 'wave',
      transaction_id: sessionId,
    } as never);

  if (paymentError) {
    console.error('[Wave Checkout] Erreur DB:', paymentError);
    return NextResponse.json({ error: "Erreur lors de l'enregistrement du paiement" }, { status: 500 });
  }

  // session_id renvoyé au client pour stockage en sessionStorage
  return NextResponse.json({ wave_launch_url: waveLaunchUrl, session_id: sessionId });
}

import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient, getAdminSupabaseClient } from '@/lib/supabase-server';
import { cleanEnvVar, waveRequest } from '@/lib/wave';

/**
 * GET /api/wave/verify?sessionId=cos-xxx
 *
 * Appelé par le client après que Wave redirige vers success_url.
 * Interroge l'API Wave (requête signée) pour confirmer le statut réel,
 * met à jour le paiement en DB et crée l'enrollment si succès.
 *
 * Variables d'env requises :
 *   WAVE_API_KEY        — clé API Wave (Bearer token)
 *   WAVE_SIGNING_SECRET — secret de signature des requêtes sortantes
 *
 * Idempotent : si webhook déjà traité → retourne immediately.
 * Docs : https://docs.wave.com/checkout
 */
export async function GET(request: NextRequest) {
  const supabase = await createServerSupabaseClient();

  // Auth obligatoire
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const sessionId = searchParams.get('sessionId');

  if (!sessionId) {
    return NextResponse.json({ error: 'sessionId est requis' }, { status: 400 });
  }

  const apiKey        = cleanEnvVar(process.env.WAVE_API_KEY);
  const signingSecret = cleanEnvVar(process.env.WAVE_SIGNING_SECRET);

  if (!apiKey || !signingSecret) {
    return NextResponse.json({ error: 'Passerelle de paiement non configurée' }, { status: 503 });
  }

  // Interroger l'API Wave (requête GET signée)
  const { ok, status, data: sessionData } = await waveRequest(
    `/checkout/sessions/${encodeURIComponent(sessionId)}`,
    'GET',
    null,
    apiKey,
    signingSecret,
  );

  if (!ok) {
    console.error('[Wave Verify] Erreur API Wave:', status, sessionData);
    return NextResponse.json({ error: 'Impossible de vérifier la session Wave' }, { status: 502 });
  }

  const checkoutStatus = sessionData?.checkout_status as string | undefined;
  const paymentStatus  = sessionData?.payment_status  as string | undefined;
  const transactionId  = sessionData?.transaction_id  as string | undefined;

  const adminSupabase = getAdminSupabaseClient();

  // Récupérer le paiement — doit appartenir à l'utilisateur courant
  const { data: payment, error: findError } = await adminSupabase
    .from('payments')
    .select('id, user_id, course_id, status')
    .eq('transaction_id', sessionId)
    .eq('user_id', user.id)
    .single();

  if (findError || !payment) {
    return NextResponse.json({ error: 'Paiement non trouvé' }, { status: 404 });
  }

  // Idempotence : déjà traité par le webhook ou un appel précédent
  if (payment.status === 'completed') {
    return NextResponse.json({ success: true, status: 'completed', already_enrolled: true });
  }

  const isSuccess = checkoutStatus === 'complete' && paymentStatus === 'succeeded';
  const newStatus = isSuccess ? 'completed' : 'failed';

  // Mise à jour du paiement
  await adminSupabase
    .from('payments')
    .update({
      status:           newStatus,
      payment_method:   'wave',
      gateway_response: {
        session_id:      sessionId,
        checkout_status: checkoutStatus,
        payment_status:  paymentStatus,
        transaction_id:  transactionId,
      },
      ...(isSuccess ? { paid_at: new Date().toISOString() } : {}),
    } as never)
    .eq('id', payment.id);

  if (!isSuccess) {
    return NextResponse.json({ success: false, status: checkoutStatus ?? 'failed' });
  }

  // Créer l'enrollment si pas encore fait (idempotent)
  const { data: existingEnrollment } = await adminSupabase
    .from('enrollments')
    .select('id')
    .eq('user_id', payment.user_id)
    .eq('course_id', payment.course_id)
    .in('status', ['active', 'completed'])
    .single();

  if (!existingEnrollment) {
    const { error: enrollError } = await adminSupabase
      .from('enrollments')
      .insert({
        user_id:     payment.user_id,
        course_id:   payment.course_id,
        status:      'active',
        enrolled_at: new Date().toISOString(),
      } as never);

    if (enrollError) {
      console.error('[Wave Verify] Erreur enrollment:', enrollError);
      // Payment confirmé — le webhook créera l'enrollment en fallback
    }
  }

  return NextResponse.json({ success: true, status: 'completed' });
}

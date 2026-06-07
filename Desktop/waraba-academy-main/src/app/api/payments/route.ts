import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { apiLogger } from '@/lib/logger';
import { z } from 'zod';
import { strictRateLimiter } from '@/lib/rateLimit';

// Schéma de validation pour la création de paiement
// SECURITY: amount is NOT accepted from client — always read from DB
const createPaymentSchema = z.object({
  courseId: z.string().uuid('ID de cours invalide'),
  currency: z.enum(['EUR', 'USD', 'XOF']).default('EUR'),
  paymentMethod: z.enum(['stripe', 'paypal', 'mobile_money']).default('stripe'),
});

// GET - Récupérer les paiements de l'utilisateur connecté
export async function GET (request: NextRequest) {
  try {
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
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 },
      );
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '50');

    // Construire la requête
    let query = supabase
      .from('payments')
      .select(`
        *,
        courses (
          id,
          title,
          description,
          image_url,
          price
        )
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (status) {
      query = query.eq('status', status);
    }

    const { data: payments, error } = await query;

    if (error) {
      apiLogger.error('Erreur lors de la récupération des paiements', error, {
        userId: user.id,
        status,
      });
      return NextResponse.json(
        { error: 'Erreur lors de la récupération des paiements' },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      payments: payments || [],
      count: payments?.length || 0,
    });
  } catch (error: unknown) {
    apiLogger.error('Erreur serveur lors de la récupération des paiements', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 },
    );
  }
}

// POST - Créer un nouveau paiement
export async function POST (request: NextRequest) {
  try {
    // Rate limiting strict sur les paiements
    const rateLimitResponse = await strictRateLimiter(request);
    if (rateLimitResponse) return rateLimitResponse;

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
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 },
      );
    }

    const body = await request.json();

    // Validation Zod des données de paiement
    const validation = createPaymentSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Données de paiement invalides', details: validation.error.issues.map(i => i.message) },
        { status: 400 },
      );
    }

    const { courseId, currency, paymentMethod } = validation.data;

    // Vérifier que le cours existe et récupérer le prix depuis la DB
    const { data: course, error: courseError } = await supabase
      .from('courses')
      .select('id, title, price')
      .eq('id', courseId)
      .single();

    if (courseError || !course) {
      return NextResponse.json(
        { error: 'Cours non trouvé' },
        { status: 404 },
      );
    }

    // SECURITY: Always use DB price, never trust client
    const amount = parseFloat(String(course.price));
    if (isNaN(amount) || amount <= 0) {
      return NextResponse.json(
        { error: 'Ce cours ne peut pas être acheté (prix invalide)' },
        { status: 400 },
      );
    }

    // Vérifier que l'utilisateur n'est pas déjà inscrit
    const { data: existingEnrollment } = await supabase
      .from('enrollments')
      .select('id')
      .eq('user_id', user.id)
      .eq('course_id', courseId)
      .in('status', ['active', 'completed'])
      .single();

    if (existingEnrollment) {
      return NextResponse.json(
        { error: 'Vous êtes déjà inscrit à ce cours' },
        { status: 400 },
      );
    }

    // Créer le paiement avec les données validées
    const paymentData = {
      user_id: user.id,
      course_id: courseId,
      amount,
      currency,
      status: 'pending' as const,
      payment_method: paymentMethod,
    };

    const { data: payment, error } = await supabase
      .from('payments')
      .insert(paymentData)
      .select()
      .single();

    if (error) {
      apiLogger.error('Erreur lors de la création du paiement', error, {
        userId: user.id,
        courseId,
        amount,
      });
      return NextResponse.json(
        { error: 'Erreur lors de la création du paiement' },
        { status: 500 },
      );
    }

    // Le paiement est créé en status 'pending'.
    // Le flux Stripe (create-payment-intent → webhook) gère la confirmation
    // et la création automatique de l'inscription via /api/payments/webhook.

    return NextResponse.json({
      success: true,
      message: 'Paiement créé en attente de confirmation',
      payment: {
        ...payment,
        course: {
          id: course.id,
          title: course.title,
          price: course.price,
        },
      },
    }, { status: 201 });
  } catch (error: unknown) {
    apiLogger.error('Erreur serveur lors de la création du paiement', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 },
    );
  }
}

// PATCH - Mettre à jour le statut d'un paiement
export async function PATCH (request: NextRequest) {
  try {
    // Rate limiting strict sur les mutations de paiement
    const rateLimitResponse = await strictRateLimiter(request);
    if (rateLimitResponse) return rateLimitResponse;

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
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 },
      );
    }

    const body = await request.json();
    const { paymentId, status, transactionId, gatewayResponse } = body;

    if (!paymentId || !status) {
      return NextResponse.json(
        { error: 'ID du paiement et statut sont requis' },
        { status: 400 },
      );
    }

    // SÉCURITÉ: Valider que le statut est une valeur autorisée
    const ALLOWED_STATUSES = ['pending', 'completed', 'failed', 'refunded', 'cancelled'];
    if (!ALLOWED_STATUSES.includes(status)) {
      return NextResponse.json(
        { error: 'Statut invalide' },
        { status: 400 },
      );
    }

    // SÉCURITÉ: Vérifier les permissions depuis la DB
    const { checkUserRoleFromDB } = await import('@/lib/security/roleCheck');
    const roleCheck = await checkUserRoleFromDB(user.id);

    if (roleCheck.error) {
      return NextResponse.json(
        { error: 'Erreur de vérification des permissions' },
        { status: 403 },
      );
    }

    const { isAdmin } = roleCheck;

    if (!isAdmin) {
      // SÉCURITÉ: Les non-admins ne peuvent que annuler leurs propres paiements en attente
      if (status !== 'cancelled') {
        return NextResponse.json(
          { error: 'Seuls les administrateurs peuvent modifier le statut des paiements' },
          { status: 403 },
        );
      }

      // Vérifier que l'utilisateur est propriétaire du paiement
      const { data: payment, error: checkError } = await supabase
        .from('payments')
        .select('user_id, status')
        .eq('id', paymentId)
        .single();

      if (checkError || !payment || payment.user_id !== user.id) {
        return NextResponse.json(
          { error: 'Accès refusé' },
          { status: 403 },
        );
      }

      // Ne permettre l'annulation que des paiements en attente
      if (payment.status !== 'pending') {
        return NextResponse.json(
          { error: 'Seuls les paiements en attente peuvent être annulés' },
          { status: 400 },
        );
      }
    }

    // Construire les données de mise à jour
    const updateData: any = { status };

    if (status === 'completed') {
      updateData.paid_at = new Date().toISOString();
    }

    if (isAdmin && transactionId) {
      updateData.transaction_id = transactionId;
    }

    if (isAdmin && gatewayResponse) {
      updateData.gateway_response = gatewayResponse;
    }

    // SÉCURITÉ: Ajouter .eq('user_id') pour les non-admins afin de prévenir les IDOR
    let updateQuery = supabase
      .from('payments')
      .update(updateData)
      .eq('id', paymentId);

    if (!isAdmin) {
      updateQuery = updateQuery.eq('user_id', user.id);
    }

    const { error } = await updateQuery;

    if (error) {
      apiLogger.error('Erreur lors de la mise à jour du paiement', error, {
        paymentId,
        status: updateData.status,
      });
      return NextResponse.json(
        { error: 'Erreur lors de la mise à jour du paiement' },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Statut du paiement mis à jour',
    });
  } catch (error: unknown) {
    apiLogger.error('Erreur serveur lors de la mise à jour du paiement', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 },
    );
  }
}


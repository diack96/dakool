import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { apiLogger } from '@/lib/logger';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import { dbRateLimit } from '@/lib/dbRateLimit';
import { z } from 'zod';

// Initialiser Stripe de manière lazy pour éviter les erreurs si non configuré
let stripeInstance: Stripe | null = null;

function getStripeInstance (): Stripe {
  if (!stripeInstance) {
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

    if (!stripeSecretKey || stripeSecretKey === 'sk_test_default') {
      throw new Error('STRIPE_SECRET_KEY doit être configuré. Veuillez configurer votre clé API Stripe dans les variables d\'environnement.');
    }

    stripeInstance = new Stripe(stripeSecretKey, {
      apiVersion: '2025-08-27.basil' as const,
    });
  }
  return stripeInstance;
}

// Amount is derived from DB — only courseId and currency are needed from the client
const createPaymentIntentSchema = z.object({
  courseId: z.string().uuid('courseId doit être un UUID valide'),
  currency: z.string().length(3, 'La devise doit être au format ISO 4217 (3 caractères)').default('xof'),
});

export async function POST (request: NextRequest) {
  try {
    // Rate limiting strict DB-based (fonctionne sur Vercel serverless)
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
      ?? request.headers.get('x-real-ip')
      ?? 'unknown';
    const blocked = await dbRateLimit(`payments:${ip}`, 10, 60_000);
    if (blocked) {
      return NextResponse.json(
        { error: 'Trop de requêtes. Réessayez plus tard.' },
        { status: 429 },
      );
    }

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

    // Validation avec Zod
    const validation = createPaymentIntentSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        {
          error: 'Données invalides',
          details: validation.error.issues.map(e => ({
            field: e.path.join('.'),
            message: e.message,
          })),
        },
        { status: 400 },
      );
    }

    const { courseId, currency } = validation.data;

    // Vérifier que le cours existe et récupérer le prix depuis la DB
    const { data: courseData, error: courseError } = await supabase
      .from('courses')
      .select('id, title, price')
      .eq('id', courseId)
      .single();

    if (courseError || !courseData) {
      return NextResponse.json(
        { error: 'Cours non trouvé' },
        { status: 404 },
      );
    }

    const course = courseData as { id: string; title: string; price: number };
    const coursePrice = parseFloat(String(course.price));
    if (isNaN(coursePrice) || coursePrice <= 0) {
      return NextResponse.json(
        { error: 'Ce cours ne peut pas être acheté via Stripe (prix invalide)' },
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

    // Obtenir l'instance Stripe
    const stripe = getStripeInstance();

    // Créer l'intention de paiement Stripe — amount from DB, not client
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(coursePrice * 100), // Stripe utilise les centimes
      currency: currency.toLowerCase(),
      metadata: {
        courseId,
        userId: user.id,
        courseTitle: course.title,
      },
      automatic_payment_methods: {
        enabled: true,
      },
    });

    // Créer le paiement en base de données avec le transaction_id
    const { error: paymentError } = await supabase
      .from('payments')
      .insert({
        user_id: user.id,
        course_id: courseId,
        amount: coursePrice,
        currency: currency.toUpperCase(),
        status: 'pending',
        payment_method: 'stripe',
        transaction_id: paymentIntent.id,
      } as never);

    if (paymentError) {
      apiLogger.error('Erreur lors de la création du paiement en DB', paymentError, {
        userId: user.id,
        courseId,
        paymentIntentId: paymentIntent.id,
      });
      // Annuler le PaymentIntent si on ne peut pas créer le record
      await stripe.paymentIntents.cancel(paymentIntent.id);
      return NextResponse.json(
        { error: 'Erreur lors de la création du paiement' },
        { status: 500 },
      );
    }

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    });
  } catch (error: unknown) {
    // Gérer les erreurs Stripe spécifiques
    if (error instanceof Stripe.errors.StripeError) {
      apiLogger.error('Erreur Stripe lors de la création de l\'intention de paiement', error, {
        errorType: error.type,
        errorCode: error.code,
      });
      return NextResponse.json(
        { error: error.message },
        { status: 400 },
      );
    }

    apiLogger.error('Erreur serveur lors de la création de l\'intention de paiement', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 },
    );
  }
}

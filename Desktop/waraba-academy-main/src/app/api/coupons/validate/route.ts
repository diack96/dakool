import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient, createAdminSupabaseClient } from '@/lib/supabase-server';

// POST /api/coupons/validate
// Valide un code promo pour un cours donné et retourne le prix après réduction.
export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) {
      return NextResponse.json({ valid: false, error: 'Non authentifié.' }, { status: 401 });
    }

    const body = await request.json();
    const code     = typeof body.code     === 'string' ? body.code.trim().toUpperCase() : '';
    const courseId = typeof body.courseId === 'string' ? body.courseId.trim()           : '';

    if (!code || !courseId) {
      return NextResponse.json({ valid: false, error: 'Code ou cours manquant.' }, { status: 400 });
    }

    const admin = createAdminSupabaseClient();

    // Récupérer le prix réel du cours depuis la DB (jamais du client)
    const { data: course, error: courseErr } = await admin
      .from('courses')
      .select('id, price')
      .eq('id', courseId)
      .maybeSingle();

    if (courseErr || !course) {
      return NextResponse.json({ valid: false, error: 'Cours introuvable.' }, { status: 404 });
    }

    const coursePrice = Number(course.price) || 0;

    // Récupérer le coupon
    const { data: coupon, error: couponErr } = await admin
      .from('coupons')
      .select('id, code, description, discount_type, discount_value, min_purchase, max_discount, usage_limit, usage_count, is_active, starts_at, expires_at')
      .eq('code', code)
      .maybeSingle();

    if (couponErr || !coupon) {
      return NextResponse.json({ valid: false, error: 'Code promo invalide.' });
    }

    // Vérifications
    if (!coupon.is_active) {
      return NextResponse.json({ valid: false, error: 'Ce code promo n\'est plus actif.' });
    }

    const now = new Date();
    if (coupon.starts_at && new Date(coupon.starts_at) > now) {
      return NextResponse.json({ valid: false, error: 'Ce code promo n\'est pas encore valide.' });
    }
    if (coupon.expires_at && new Date(coupon.expires_at) <= now) {
      return NextResponse.json({ valid: false, error: 'Ce code promo a expiré.' });
    }
    if (coupon.usage_limit !== null && (coupon.usage_count ?? 0) >= coupon.usage_limit) {
      return NextResponse.json({ valid: false, error: 'Ce code promo a atteint sa limite d\'utilisation.' });
    }
    if (coupon.min_purchase && coursePrice < Number(coupon.min_purchase)) {
      return NextResponse.json({
        valid: false,
        error: `Ce code promo est valable à partir de ${Number(coupon.min_purchase).toLocaleString('fr-FR')} FCFA.`,
      });
    }

    // Calcul de la réduction
    const value = Number(coupon.discount_value);
    let discountAmount: number;

    if (coupon.discount_type === 'percentage') {
      discountAmount = coursePrice * (value / 100);
      if (coupon.max_discount) {
        discountAmount = Math.min(discountAmount, Number(coupon.max_discount));
      }
    } else {
      discountAmount = Math.min(value, coursePrice);
    }

    discountAmount = Math.round(discountAmount);
    const finalPrice = Math.max(0, coursePrice - discountAmount);

    return NextResponse.json({
      valid: true,
      couponId: coupon.id,
      code: coupon.code,
      description: coupon.description || null,
      discountType: coupon.discount_type,
      discountValue: value,
      discountAmount,
      originalPrice: coursePrice,
      finalPrice,
    });
  } catch (err) {
    console.error('[POST /api/coupons/validate]', err);
    return NextResponse.json({ valid: false, error: 'Erreur interne.' }, { status: 500 });
  }
}

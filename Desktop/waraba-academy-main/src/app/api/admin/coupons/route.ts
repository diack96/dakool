import { NextRequest, NextResponse } from 'next/server';
import { withAdminAuth, logAdminAction } from '@/middleware/adminAuth';
import { getAdminSupabaseClient } from '@/lib/supabase-server';
import { handleApiError, createValidationError, createInternalError } from '@/lib/errors';
import { z } from 'zod';

// Schéma de validation pour un coupon
const couponSchema = z.object({
  code: z.string().min(3).max(50).toUpperCase(),
  description: z.string().optional(),
  discount_type: z.enum(['percentage', 'fixed']),
  discount_value: z.number().positive(),
  min_purchase: z.number().min(0).optional().default(0),
  max_discount: z.number().positive().optional().nullable(),
  usage_limit: z.number().int().positive().optional().nullable(),
  is_active: z.boolean().optional().default(true),
  starts_at: z.string().optional(),
  expires_at: z.string().optional().nullable(),
  applicable_courses: z.array(z.string().uuid()).optional().default([]),
});

// GET /api/admin/coupons - Liste des coupons
async function GET(request: NextRequest) {
  try {
    const supabase = getAdminSupabaseClient();
    const { searchParams } = new URL(request.url);

    const search = searchParams.get('search');
    const status = searchParams.get('status'); // active, expired, all

    let query = supabase
      .from('coupons')
      .select('*')
      .order('created_at', { ascending: false });

    if (search) {
      // SÉCURITÉ: Sanitizer l'input de recherche pour prévenir l'injection PostgREST
      const sanitized = search
        .substring(0, 100)
        .replace(/[%_\\]/g, (c) => `\\${c}`)
        .replace(/[,().]/g, '');
      if (sanitized.trim().length > 0) {
        query = query.or(`code.ilike.%${sanitized}%,description.ilike.%${sanitized}%`);
      }
    }

    if (status === 'active') {
      query = query
        .eq('is_active', true)
        .or(`expires_at.is.null,expires_at.gt.${new Date().toISOString()}`);
    } else if (status === 'expired') {
      query = query.lt('expires_at', new Date().toISOString());
    }

    const { data: coupons, error } = await query;

    if (error) {
      console.error('Erreur récupération coupons:', error);
      throw createInternalError('Erreur lors de la récupération des coupons', { dbError: error.message });
    }

    // Statistiques
    const totalCoupons = coupons?.length || 0;
    const activeCoupons = (coupons || []).filter((c: any) =>
      c.is_active && (!c.expires_at || new Date(c.expires_at) > new Date())
    ).length;
    const totalUsages = (coupons || []).reduce((sum: number, c: any) => sum + (c.usage_count || 0), 0);

    return NextResponse.json({
      success: true,
      coupons: coupons || [],
      stats: {
        total: totalCoupons,
        active: activeCoupons,
        expired: totalCoupons - activeCoupons,
        totalUsages,
      },
    });
  } catch (error) {
    console.error('Erreur GET coupons:', error);
    return handleApiError(error);
  }
}

// POST /api/admin/coupons - Créer un coupon
async function POST(request: NextRequest) {
  try {
    const supabase = getAdminSupabaseClient();
    const body = await request.json();

    // Validation
    const validation = couponSchema.safeParse(body);
    if (!validation.success) {
      throw createValidationError('Données invalides', validation.error.issues);
    }

    const data = validation.data;

    // Vérifier si le code existe déjà
    const { data: existing } = await supabase
      .from('coupons')
      .select('id')
      .eq('code', data.code)
      .single();

    if (existing) {
      return NextResponse.json(
        { success: false, error: 'Ce code promo existe déjà' },
        { status: 400 }
      );
    }

    const adminUserId = (request as any).adminUser?.id;

    const { data: coupon, error } = await supabase
      .from('coupons')
      .insert([{
        code: data.code,
        description: data.description,
        discount_type: data.discount_type,
        discount_value: data.discount_value,
        min_purchase: data.min_purchase,
        max_discount: data.max_discount,
        usage_limit: data.usage_limit,
        is_active: data.is_active,
        starts_at: data.starts_at || new Date().toISOString(),
        expires_at: data.expires_at,
        applicable_courses: data.applicable_courses,
        created_by: adminUserId,
      }])
      .select()
      .single();

    if (error) {
      console.error('Erreur création coupon:', error);
      throw createInternalError('Erreur lors de la création du coupon', { dbError: error.message });
    }

    // Log de l'action
    logAdminAction({
      user_id: adminUserId || 'unknown',
      action: 'coupons.create',
      resource: '/api/admin/coupons',
      ip_address: request.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown',
      user_agent: request.headers.get('user-agent') || 'unknown',
      timestamp: new Date().toISOString(),
      success: true,
      details: { coupon_id: coupon.id, code: data.code },
    }).catch(() => {});

    return NextResponse.json({
      success: true,
      coupon,
    });
  } catch (error) {
    console.error('Erreur POST coupons:', error);
    return handleApiError(error);
  }
}

// Wrapper avec authentification admin
export const GET_handler = withAdminAuth(GET);
export const POST_handler = withAdminAuth(POST);

export { GET_handler as GET, POST_handler as POST };

import { NextRequest, NextResponse } from 'next/server';
import { withAdminAuth, logAdminAction } from '@/middleware/adminAuth';
import { getAdminSupabaseClient } from '@/lib/supabase-server';
import { handleApiError, createValidationError, createInternalError } from '@/lib/errors';
import { z } from 'zod';

// Schéma de validation pour mise à jour
const updateCouponSchema = z.object({
  code: z.string().min(3).max(50).toUpperCase().optional(),
  description: z.string().optional(),
  discount_type: z.enum(['percentage', 'fixed']).optional(),
  discount_value: z.number().positive().optional(),
  min_purchase: z.number().min(0).optional(),
  max_discount: z.number().positive().optional().nullable(),
  usage_limit: z.number().int().positive().optional().nullable(),
  is_active: z.boolean().optional(),
  starts_at: z.string().optional(),
  expires_at: z.string().optional().nullable(),
  applicable_courses: z.array(z.string().uuid()).optional(),
});

// GET /api/admin/coupons/[id] - Récupérer un coupon avec statistiques
async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = getAdminSupabaseClient();

    // Récupérer le coupon
    const { data: coupon, error } = await supabase
      .from('coupons')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !coupon) {
      return NextResponse.json(
        { success: false, error: 'Coupon non trouvé' },
        { status: 404 }
      );
    }

    // Récupérer les utilisations
    const { data: usages } = await supabase
      .from('coupon_usages')
      .select(`
        id,
        user_id,
        payment_id,
        course_id,
        discount_amount,
        used_at,
        profiles:user_id (
          email,
          first_name,
          last_name
        ),
        courses:course_id (
          title
        )
      `)
      .eq('coupon_id', id)
      .order('used_at', { ascending: false })
      .limit(50);

    const totalDiscountGiven = (usages || []).reduce((sum: number, u: any) => sum + (u.discount_amount || 0), 0);

    return NextResponse.json({
      success: true,
      coupon,
      usages: usages || [],
      stats: {
        usageCount: coupon.usage_count || 0,
        totalDiscountGiven,
      },
    });
  } catch (error) {
    console.error('Erreur GET coupon:', error);
    return handleApiError(error);
  }
}

// PATCH /api/admin/coupons/[id] - Mettre à jour un coupon
async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = getAdminSupabaseClient();
    const body = await request.json();

    // Validation
    const validation = updateCouponSchema.safeParse(body);
    if (!validation.success) {
      throw createValidationError('Données invalides', validation.error.issues);
    }

    // Si le code change, vérifier qu'il n'existe pas déjà
    if (validation.data.code) {
      const { data: existing } = await supabase
        .from('coupons')
        .select('id')
        .eq('code', validation.data.code)
        .neq('id', id)
        .single();

      if (existing) {
        return NextResponse.json(
          { success: false, error: 'Ce code promo existe déjà' },
          { status: 400 }
        );
      }
    }

    const updateData = {
      ...validation.data,
      updated_at: new Date().toISOString(),
    };

    const { data: coupon, error } = await supabase
      .from('coupons')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Erreur mise à jour coupon:', error);
      throw createInternalError('Erreur lors de la mise à jour', { dbError: error.message });
    }

    // Log de l'action
    logAdminAction({
      user_id: (request as any).adminUser?.id || 'unknown',
      action: 'coupons.update',
      resource: `/api/admin/coupons/${id}`,
      ip_address: request.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown',
      user_agent: request.headers.get('user-agent') || 'unknown',
      timestamp: new Date().toISOString(),
      success: true,
      details: { coupon_id: id, updates: Object.keys(validation.data) },
    }).catch(() => {});

    return NextResponse.json({
      success: true,
      coupon,
    });
  } catch (error) {
    console.error('Erreur PATCH coupon:', error);
    return handleApiError(error);
  }
}

// DELETE /api/admin/coupons/[id] - Supprimer un coupon
async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = getAdminSupabaseClient();

    // Récupérer le coupon pour le log
    const { data: coupon } = await supabase
      .from('coupons')
      .select('id, code')
      .eq('id', id)
      .single();

    if (!coupon) {
      return NextResponse.json(
        { success: false, error: 'Coupon non trouvé' },
        { status: 404 }
      );
    }

    // Supprimer le coupon (les usages seront supprimés en cascade)
    const { error } = await supabase
      .from('coupons')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Erreur suppression coupon:', error);
      throw createInternalError('Erreur lors de la suppression', { dbError: error.message });
    }

    // Log de l'action
    logAdminAction({
      user_id: (request as any).adminUser?.id || 'unknown',
      action: 'coupons.delete',
      resource: `/api/admin/coupons/${id}`,
      ip_address: request.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown',
      user_agent: request.headers.get('user-agent') || 'unknown',
      timestamp: new Date().toISOString(),
      success: true,
      details: { coupon_id: id, code: coupon.code },
    }).catch(() => {});

    return NextResponse.json({
      success: true,
      message: 'Coupon supprimé avec succès',
    });
  } catch (error) {
    console.error('Erreur DELETE coupon:', error);
    return handleApiError(error);
  }
}

// Wrapper avec authentification admin
export const GET_handler = withAdminAuth(GET);
export const PATCH_handler = withAdminAuth(PATCH);
export const DELETE_handler = withAdminAuth(DELETE);

export { GET_handler as GET, PATCH_handler as PATCH, DELETE_handler as DELETE };

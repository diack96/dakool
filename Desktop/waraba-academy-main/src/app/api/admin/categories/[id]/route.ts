import { NextRequest, NextResponse } from 'next/server';
import { withAdminAuth, logAdminAction } from '@/middleware/adminAuth';
import { getAdminSupabaseClient } from '@/lib/supabase-server';
import { handleApiError, createValidationError, createInternalError } from '@/lib/errors';
import { z } from 'zod';

const uuidSchema = z.string().uuid('ID invalide');

const updateCategorySchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().optional(),
  slug: z.string().min(1).max(100).optional(),
  color: z.string().max(20).optional(),
  isActive: z.boolean().optional(),
});

// GET /api/admin/categories/[id]
async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: rawId } = await params;
    if (!uuidSchema.safeParse(rawId).success) {
      return NextResponse.json({ success: false, error: 'ID invalide' }, { status: 400 });
    }
    const id = rawId;
    const supabase = getAdminSupabaseClient();

    const { data: category, error } = await supabase
      .from('categories')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !category) {
      return NextResponse.json(
        { success: false, error: 'Catégorie non trouvée' },
        { status: 404 }
      );
    }

    const { count } = await supabase
      .from('courses')
      .select('*', { count: 'exact', head: true })
      .eq('category_id', id);

    return NextResponse.json({
      success: true,
      category: {
        ...category,
        courseCount: count || 0,
      },
    });
  } catch (error) {
    console.error('Erreur GET catégorie:', error);
    return handleApiError(error);
  }
}

// PATCH /api/admin/categories/[id]
async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: rawId } = await params;
    if (!uuidSchema.safeParse(rawId).success) {
      return NextResponse.json({ success: false, error: 'ID invalide' }, { status: 400 });
    }
    const id = rawId;
    const supabase = getAdminSupabaseClient();
    const body = await request.json();

    const validation = updateCategorySchema.safeParse(body);
    if (!validation.success) {
      throw createValidationError('Données invalides', validation.error.issues);
    }

    // Build update data with snake_case mapping
    const updateData: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };
    if (validation.data.name !== undefined) updateData.name = validation.data.name;
    if (validation.data.description !== undefined) updateData.description = validation.data.description;
    if (validation.data.slug !== undefined) updateData.slug = validation.data.slug;
    if (validation.data.color !== undefined) updateData.color = validation.data.color;
    if (validation.data.isActive !== undefined) updateData.is_active = validation.data.isActive;

    // If slug changes, check uniqueness
    if (validation.data.slug) {
      const { data: existing } = await supabase
        .from('categories')
        .select('id')
        .eq('slug', validation.data.slug)
        .neq('id', id)
        .single();

      if (existing) {
        return NextResponse.json(
          { success: false, error: 'Ce slug existe déjà' },
          { status: 400 }
        );
      }
    }

    const { data: category, error } = await supabase
      .from('categories')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Erreur mise à jour catégorie:', error);
      throw createInternalError('Erreur lors de la mise à jour');
    }

    logAdminAction({
      user_id: (request as any).adminUser?.id || 'unknown',
      action: 'categories.update',
      resource: `/api/admin/categories/${id}`,
      ip_address: request.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown',
      user_agent: request.headers.get('user-agent') || 'unknown',
      timestamp: new Date().toISOString(),
      success: true,
      details: { category_id: id, updates: Object.keys(validation.data) },
    }).catch(() => {});

    return NextResponse.json({ success: true, category });
  } catch (error) {
    console.error('Erreur PATCH catégorie:', error);
    return handleApiError(error);
  }
}

// DELETE /api/admin/categories/[id]
async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: rawId } = await params;
    if (!uuidSchema.safeParse(rawId).success) {
      return NextResponse.json({ success: false, error: 'ID invalide' }, { status: 400 });
    }
    const id = rawId;
    const supabase = getAdminSupabaseClient();

    // Check if courses exist for this category
    const { count } = await supabase
      .from('courses')
      .select('*', { count: 'exact', head: true })
      .eq('category_id', id);

    if (count && count > 0) {
      return NextResponse.json(
        { success: false, error: `Impossible de supprimer : ${count} cours sont liés à cette catégorie` },
        { status: 400 }
      );
    }

    const { data: category } = await supabase
      .from('categories')
      .select('id, name')
      .eq('id', id)
      .single();

    if (!category) {
      return NextResponse.json(
        { success: false, error: 'Catégorie non trouvée' },
        { status: 404 }
      );
    }

    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Erreur suppression catégorie:', error);
      throw createInternalError('Erreur lors de la suppression');
    }

    logAdminAction({
      user_id: (request as any).adminUser?.id || 'unknown',
      action: 'categories.delete',
      resource: `/api/admin/categories/${id}`,
      ip_address: request.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown',
      user_agent: request.headers.get('user-agent') || 'unknown',
      timestamp: new Date().toISOString(),
      success: true,
      details: { category_id: id, name: (category as any).name },
    }).catch(() => {});

    return NextResponse.json({ success: true, message: 'Catégorie supprimée avec succès' });
  } catch (error) {
    console.error('Erreur DELETE catégorie:', error);
    return handleApiError(error);
  }
}

export const GET_handler = withAdminAuth(GET);
export const PATCH_handler = withAdminAuth(PATCH);
export const DELETE_handler = withAdminAuth(DELETE);

export { GET_handler as GET, PATCH_handler as PATCH, DELETE_handler as DELETE };

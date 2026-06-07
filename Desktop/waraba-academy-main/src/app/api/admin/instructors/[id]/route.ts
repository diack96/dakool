import { NextRequest, NextResponse } from 'next/server';
import { withAdminAuth, logAdminAction } from '@/middleware/adminAuth';
import { getAdminSupabaseClient } from '@/lib/supabase-server';
import { handleApiError, createValidationError, createInternalError } from '@/lib/errors';
import { z } from 'zod';

const updateInstructorSchema = z.object({
  first_name: z.string().min(1).max(100).optional(),
  last_name: z.string().min(1).max(100).optional(),
  bio: z.string().optional(),
  specialization: z.string().optional(),
  avatar_url: z.string().url().optional().or(z.literal('')),
});

// PATCH /api/admin/instructors/[id]
async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = getAdminSupabaseClient();
    const body = await request.json();

    const validation = updateInstructorSchema.safeParse(body);
    if (!validation.success) {
      throw createValidationError('Données invalides', validation.error.issues);
    }

    const updateData: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };
    if (validation.data.first_name !== undefined) updateData.first_name = validation.data.first_name;
    if (validation.data.last_name !== undefined) updateData.last_name = validation.data.last_name;
    if (validation.data.first_name !== undefined || validation.data.last_name !== undefined) {
      updateData.full_name = `${validation.data.first_name || ''} ${validation.data.last_name || ''}`.trim();
    }
    if (validation.data.bio !== undefined) updateData.bio = validation.data.bio;
    if (validation.data.specialization !== undefined) updateData.location = validation.data.specialization;
    if (validation.data.avatar_url !== undefined) updateData.avatar_url = validation.data.avatar_url || null;

    const { data: instructor, error } = await supabase
      .from('profiles')
      .update(updateData)
      .eq('id', id)
      .eq('role', 'instructor')
      .select()
      .single();

    if (error) {
      console.error('Erreur mise à jour instructeur:', error);
      throw createInternalError('Erreur lors de la mise à jour', { dbError: error.message });
    }

    logAdminAction({
      user_id: (request as any).adminUser?.id || 'unknown',
      action: 'instructors.update',
      resource: `/api/admin/instructors/${id}`,
      ip_address: request.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown',
      user_agent: request.headers.get('user-agent') || 'unknown',
      timestamp: new Date().toISOString(),
      success: true,
      details: { instructor_id: id, updates: Object.keys(validation.data) },
    }).catch(() => {});

    return NextResponse.json({ success: true, instructor });
  } catch (error) {
    console.error('Erreur PATCH instructeur:', error);
    return handleApiError(error);
  }
}

// DELETE /api/admin/instructors/[id]
async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = getAdminSupabaseClient();

    // Check the instructor exists
    const { data: instructor } = await supabase
      .from('profiles')
      .select('id, first_name, last_name, email')
      .eq('id', id)
      .eq('role', 'instructor')
      .single();

    if (!instructor) {
      return NextResponse.json(
        { success: false, error: 'Instructeur non trouvé' },
        { status: 404 }
      );
    }

    // Delete profile
    const { error } = await supabase
      .from('profiles')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Erreur suppression instructeur:', error);
      throw createInternalError('Erreur lors de la suppression', { dbError: error.message });
    }

    // Try to delete auth user
    try {
      await supabase.auth.admin.deleteUser(id);
    } catch {
      // non-blocking
    }

    logAdminAction({
      user_id: (request as any).adminUser?.id || 'unknown',
      action: 'instructors.delete',
      resource: `/api/admin/instructors/${id}`,
      ip_address: request.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown',
      user_agent: request.headers.get('user-agent') || 'unknown',
      timestamp: new Date().toISOString(),
      success: true,
      details: { instructor_id: id, email: (instructor as any).email },
    }).catch(() => {});

    return NextResponse.json({ success: true, message: 'Instructeur supprimé avec succès' });
  } catch (error) {
    console.error('Erreur DELETE instructeur:', error);
    return handleApiError(error);
  }
}

export const PATCH_handler = withAdminAuth(PATCH);
export const DELETE_handler = withAdminAuth(DELETE);

export { PATCH_handler as PATCH, DELETE_handler as DELETE };

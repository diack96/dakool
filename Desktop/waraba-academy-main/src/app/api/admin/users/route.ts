import { NextRequest, NextResponse } from 'next/server';
import { withAdminAuth, logAdminAction } from '@/middleware/adminAuth';
import { createServerSupabaseClient, getAdminSupabaseClient } from '@/lib/supabase-server';
import { paginationSchema, createUserSchema, validateAndParse } from '@/lib/validation/admin';
import { handleApiError, createValidationError, createInternalError } from '@/lib/errors';
// Note: apiLogger (winston) désactivé pour compatibilité Edge Runtime
// Utiliser console.log/error/warn à la place
// import { apiLogger } from '@/lib/logger';

// GET /api/admin/users - Liste des utilisateurs avec pagination
async function GET (request: NextRequest) {
  try {
    // Utiliser le client admin avec SERVICE_ROLE_KEY pour contourner RLS
    const supabase = getAdminSupabaseClient();

    const { searchParams } = new URL(request.url);

    // Préparer les paramètres avec valeurs par défaut
    const pageParam = searchParams.get('page') || '1';
    const limitParam = searchParams.get('limit') || '100';
    const searchParam = searchParams.get('search') || undefined;
    const roleParam = searchParams.get('role') || undefined;
    const statusParam = searchParams.get('status') || undefined;

    // Validation avec Zod
    const validation = paginationSchema.safeParse({
      page: pageParam,
      limit: limitParam,
      search: searchParam,
      role: roleParam,
      status: statusParam,
    });

    if (!validation.success) {
      console.error('❌ Erreur de validation pagination:', validation.error.issues);
      throw createValidationError('Paramètres de pagination invalides', validation.error.issues);
    }

    const { page, limit, search, role } = validation.data;
    const offset = (page - 1) * limit;

    // Construction de la requête - utiliser uniquement les colonnes qui existent
    let query = supabase
      .from('profiles')
      .select(`
        id,
        first_name,
        last_name,
        email,
        role,
        avatar_url,
        created_at,
        updated_at
      `, { count: 'exact' });

    // Filtres
    if (role) {
      query = query.eq('role', role);
    }
    if (search) {
      // Sanitize search: escape special PostgREST/SQL characters and limit length
      const sanitized = search
        .substring(0, 100)
        .replace(/[%_\\]/g, (c) => `\\${c}`)
        .replace(/[,().]/g, '');
      query = query.or(`first_name.ilike.%${sanitized}%,last_name.ilike.%${sanitized}%,email.ilike.%${sanitized}%`);
    }
    // Note: last_sign_in_at n'existe pas dans profiles, donc on ne peut pas filtrer par statut actif/inactif
    // On pourrait récupérer cette info depuis auth.users si nécessaire

    // Pagination et tri
    // Note: range() est inclusif des deux côtés, donc offset + limit - 1
    const endIndex = offset + limit - 1;

    const { data: users, error, count } = await query
      .order('created_at', { ascending: false })
      .range(offset, endIndex);

    if (error) {
      console.error('Erreur DB lors de la récupération des utilisateurs', error);
      console.error('❌ Erreur Supabase:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
      });
      throw createInternalError('Erreur lors de la récupération des utilisateurs', { dbError: error.message });
    }

    // Enrichir les utilisateurs avec les statistiques en batch (évite N+1)
    const userIds = (users || []).map((u: any) => u.id);
    const instructorIds = (users || []).filter((u: any) => u.role === 'instructor').map((u: any) => u.id);

    // Batch: 2 requêtes indépendantes en parallèle (enrollments + cours instructeurs)
    const enrollmentCountsMap: Record<string, number> = {};
    const studentCountsMap: Record<string, number> = {};

    const [enrollmentCountsResult, instructorCoursesResult] = await Promise.all([
      userIds.length > 0
        ? supabase
            .from('enrollments')
            .select('user_id')
            .in('user_id', userIds)
            .in('status', ['active', 'completed'])
        : Promise.resolve({ data: [] }),
      instructorIds.length > 0
        ? supabase
            .from('courses')
            .select('id, instructor_id')
            .in('instructor_id', instructorIds)
        : Promise.resolve({ data: [] }),
    ]);

    (enrollmentCountsResult.data || []).forEach((e: any) => {
      enrollmentCountsMap[e.user_id] = (enrollmentCountsMap[e.user_id] || 0) + 1;
    });

    const allInstructorCourses = instructorCoursesResult.data || [];
    if (allInstructorCourses.length > 0) {
      const courseIds = allInstructorCourses.map((c: any) => c.id);
      const courseToInstructor: Record<string, string> = {};
      allInstructorCourses.forEach((c: any) => {
        courseToInstructor[c.id] = c.instructor_id;
      });

      const { data: studentEnrollments } = await supabase
        .from('enrollments')
        .select('course_id')
        .in('course_id', courseIds)
        .in('status', ['active', 'completed']);

      (studentEnrollments || []).forEach((e: any) => {
        const instructorId = courseToInstructor[e.course_id];
        if (instructorId) {
          studentCountsMap[instructorId] = (studentCountsMap[instructorId] || 0) + 1;
        }
      });
    }

    const enrichedUsers = (users || []).map((user: any) => ({
      ...user,
      total_courses: enrollmentCountsMap[user.id] || 0,
      total_students: studentCountsMap[user.id] || 0,
    }));

    // Log de l'action (non bloquant)
    logAdminAction({
      user_id: (request as any).adminUser.id,
      action: 'users.list',
      resource: '/api/admin/users',
      ip_address: request.headers.get('x-forwarded-for')?.split(',')[0] || request.headers.get('x-real-ip') || 'unknown',
      user_agent: request.headers.get('user-agent') || 'unknown',
      timestamp: new Date().toISOString(),
      success: true,
      details: { page, limit, total: count },
    }).catch((logError) => {
      console.error('Erreur lors du log admin (non bloquant):', logError);
    });

    return NextResponse.json({
      success: true,
      users: enrichedUsers || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        pages: Math.ceil((count || 0) / limit),
      },
    });
  } catch (error: unknown) {
    // Logger l'erreur avec plus de détails
    const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
    const errorStack = error instanceof Error ? error.stack : undefined;

    console.error('❌ Erreur complète lors de la récupération des utilisateurs:', {
      message: errorMessage,
      stack: errorStack,
        ip: request.headers.get('x-forwarded-for')?.split(',')[0] || request.headers.get('x-real-ip') || 'unknown',
      userAgent: request.headers.get('user-agent'),
    });

    console.error('Erreur lors de la récupération des utilisateurs', error, {
        ip: request.headers.get('x-forwarded-for')?.split(',')[0] || request.headers.get('x-real-ip') || 'unknown',
      userAgent: request.headers.get('user-agent'),
    });

    const adminUserId = (request as any).adminUser?.id || 'unknown';

    // Essayer de logger l'action, mais ne pas bloquer si ça échoue
    try {
      await logAdminAction({
        user_id: adminUserId,
        action: 'users.list',
        resource: '/api/admin/users',
        ip_address: request.headers.get('x-forwarded-for')?.split(',')[0] || request.headers.get('x-real-ip') || 'unknown',
        user_agent: request.headers.get('user-agent') || 'unknown',
        timestamp: new Date().toISOString(),
        success: false,
        details: { error: errorMessage },
      });
    } catch (logError) {
      console.error('Erreur lors du log admin (non bloquant):', logError);
    }

    return handleApiError(error);
  }
}

// POST /api/admin/users - Créer un utilisateur
async function POST (request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();

    const body = await request.json();

    // Validation avec Zod
    const validatedData = validateAndParse(createUserSchema, body);
    const { email, password, first_name, last_name, role, admin_role_id } = validatedData;

    // Créer l'utilisateur dans Supabase Auth
    const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        first_name,
        last_name,
        role,
      },
    });

    if (authError) {
      console.error('Erreur lors de la création utilisateur auth', authError);
      throw createInternalError('Erreur lors de la création de l\'utilisateur', { authError: authError.message });
    }

    // Créer le profil
    const { error: profileError } = await supabase
      .from('profiles')
      .insert([{
        id: authUser.user.id,
        first_name,
        last_name,
        full_name: `${first_name} ${last_name}`,
        email,
        role,
        admin_role_id: role === 'admin' ? admin_role_id : null,
      }] as any);

    if (profileError) {
      console.error('Erreur lors de la création du profil', profileError);
      // Supprimer l'utilisateur auth si le profil échoue
      await supabase.auth.admin.deleteUser(authUser.user.id);
      throw createInternalError('Erreur lors de la création du profil', { profileError: profileError.message });
    }

    // Log de l'action
    await logAdminAction({
      user_id: (request as any).adminUser.id,
      action: 'users.create',
      resource: '/api/admin/users',
      ip_address: request.headers.get('x-forwarded-for')?.split(',')[0] || request.headers.get('x-real-ip') || 'unknown',
      user_agent: request.headers.get('user-agent') || 'unknown',
      timestamp: new Date().toISOString(),
      success: true,
      details: { created_user_id: authUser.user.id, role },
    });

    return NextResponse.json({
      success: true,
      user: {
        id: authUser.user.id,
        email,
        first_name,
        last_name,
        role,
      },
    });
  } catch (error: unknown) {
    console.error('Erreur lors de la création de l\'utilisateur', error, {
        ip: request.headers.get('x-forwarded-for')?.split(',')[0] || request.headers.get('x-real-ip') || 'unknown',
      email: 'body' in request ? (request as any).body?.email : undefined,
    });

    const adminUserId = (request as any).adminUser?.id || 'unknown';
    await logAdminAction({
      user_id: adminUserId,
      action: 'users.create',
      resource: '/api/admin/users',
      ip_address: request.headers.get('x-forwarded-for')?.split(',')[0] || request.headers.get('x-real-ip') || 'unknown',
      user_agent: request.headers.get('user-agent') || 'unknown',
      timestamp: new Date().toISOString(),
      success: false,
      details: { error: error instanceof Error ? error.message : 'Erreur inconnue' },
    });

    return handleApiError(error);
  }
}

// PATCH /api/admin/users - Modifier un utilisateur (id passé dans le body)
async function PATCH (request: NextRequest) {
  try {
    const supabase = getAdminSupabaseClient();
    const body = await request.json();

    const { id, role, first_name, last_name } = body;

    if (!id) {
      throw createValidationError('ID utilisateur requis', []);
    }

    const updateData: Record<string, unknown> = { updated_at: new Date().toISOString() };
    // SÉCURITÉ: Valider que le rôle est une valeur autorisée
    const VALID_ROLES = ['admin', 'instructor', 'student'] as const;
    if (role) {
      if (!VALID_ROLES.includes(role)) {
        return NextResponse.json(
          { success: false, error: `Rôle invalide. Valeurs autorisées: ${VALID_ROLES.join(', ')}` },
          { status: 400 },
        );
      }
      updateData.role = role;
    }
    if (first_name !== undefined) updateData.first_name = first_name;
    if (last_name !== undefined) updateData.last_name = last_name;
    if (first_name !== undefined || last_name !== undefined) {
      updateData.full_name = `${first_name || ''} ${last_name || ''}`.trim();
    }

    const { data: user, error } = await supabase
      .from('profiles')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Erreur mise à jour utilisateur:', error);
      throw createInternalError('Erreur lors de la mise à jour', { dbError: error.message });
    }

    logAdminAction({
      user_id: (request as any).adminUser?.id || 'unknown',
      action: 'users.update',
      resource: `/api/admin/users/${id}`,
      ip_address: request.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown',
      user_agent: request.headers.get('user-agent') || 'unknown',
      timestamp: new Date().toISOString(),
      success: true,
      details: { updated_user_id: id, updates: Object.keys(updateData) },
    }).catch(() => {});

    return NextResponse.json({ success: true, user });
  } catch (error) {
    console.error('Erreur PATCH utilisateur:', error);
    return handleApiError(error);
  }
}

// DELETE /api/admin/users - Supprimer un utilisateur (id passé en query param)
async function DELETE (request: NextRequest) {
  try {
    const supabase = getAdminSupabaseClient();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      throw createValidationError('ID utilisateur requis', []);
    }

    // Delete profile first
    const { error: profileError } = await supabase
      .from('profiles')
      .delete()
      .eq('id', id);

    if (profileError) {
      console.error('Erreur suppression profil:', profileError);
      throw createInternalError('Erreur lors de la suppression du profil', { dbError: profileError.message });
    }

    // Try to disable auth user (may fail if no admin access to auth)
    try {
      await supabase.auth.admin.deleteUser(id);
    } catch (authErr) {
      console.warn('Impossible de supprimer le user auth (non-bloquant):', authErr);
    }

    logAdminAction({
      user_id: (request as any).adminUser?.id || 'unknown',
      action: 'users.delete',
      resource: `/api/admin/users/${id}`,
      ip_address: request.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown',
      user_agent: request.headers.get('user-agent') || 'unknown',
      timestamp: new Date().toISOString(),
      success: true,
      details: { deleted_user_id: id },
    }).catch(() => {});

    return NextResponse.json({ success: true, message: 'Utilisateur supprimé avec succès' });
  } catch (error) {
    console.error('Erreur DELETE utilisateur:', error);
    return handleApiError(error);
  }
}

// Wrapper avec authentification admin
export const GET_handler = withAdminAuth(GET);
export const POST_handler = withAdminAuth(POST);
export const PATCH_handler = withAdminAuth(PATCH);
export const DELETE_handler = withAdminAuth(DELETE);

export { GET_handler as GET, POST_handler as POST, PATCH_handler as PATCH, DELETE_handler as DELETE };


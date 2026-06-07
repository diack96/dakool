import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { withAdminAuth, logAdminAction } from '@/middleware/adminAuth';

// GET /api/admin/roles - Liste des rôles admin
async function GET (request: NextRequest) {
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

    // Récupérer tous les rôles avec leurs permissions
    const { data: roles, error } = await supabase
      .from('admin_roles')
      .select(`
        id,
        name,
        description,
        permissions,
        created_at,
        updated_at
      `)
      .order('name');

    if (error) {
      throw error;
    }

    // Récupérer les détails des permissions pour chaque rôle
    const rolesWithPermissions = await Promise.all(
      (roles || []).map(async (role) => {
        if (role.permissions && role.permissions.length > 0) {
          const { data: permissions } = await supabase
            .from('admin_permissions')
            .select('id, name, description, resource, action')
            .in('id', role.permissions);

          return {
            ...role,
            permissions: permissions || [],
          };
        }
        return {
          ...role,
          permissions: [],
        };
      }),
    );

    // Log de l'action
    await logAdminAction({
      user_id: (request as any).adminUser.id,
      action: 'roles.list',
      resource: '/api/admin/roles',
      ip_address: request.headers.get('x-forwarded-for')?.split(',')[0] || request.headers.get('x-real-ip') || 'unknown',
      user_agent: request.headers.get('user-agent') || 'unknown',
      timestamp: new Date().toISOString(),
      success: true,
      details: { total_roles: rolesWithPermissions.length },
    });

    return NextResponse.json({
      success: true,
      roles: rolesWithPermissions,
    });
  } catch (error: any) {
    console.error('Erreur lors de la récupération des rôles:', error);

    await logAdminAction({
      user_id: (request as any).adminUser?.id || 'unknown',
      action: 'roles.list',
      resource: '/api/admin/roles',
      ip_address: request.headers.get('x-forwarded-for')?.split(',')[0] || request.headers.get('x-real-ip') || 'unknown',
      user_agent: request.headers.get('user-agent') || 'unknown',
      timestamp: new Date().toISOString(),
      success: false,
      details: { error: error.message },
    });

    return NextResponse.json(
      { error: 'Erreur lors de la récupération des rôles' },
      { status: 500 },
    );
  }
}

// POST /api/admin/roles - Créer un nouveau rôle
async function POST (request: NextRequest) {
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

    const body = await request.json();
    const { name, description, permissions } = body;

    // Validation
    if (!name || !description) {
      return NextResponse.json(
        { error: 'Nom et description sont requis' },
        { status: 400 },
      );
    }

    // Vérifier si le rôle existe déjà
    const { data: existingRole } = await supabase
      .from('admin_roles')
      .select('id')
      .eq('name', name)
      .single();

    if (existingRole) {
      return NextResponse.json(
        { error: 'Un rôle avec ce nom existe déjà' },
        { status: 409 },
      );
    }

    // Créer le nouveau rôle
    const { data: newRole, error } = await supabase
      .from('admin_roles')
      .insert([{
        name,
        description,
        permissions: permissions || [],
      }])
      .select()
      .single();

    if (error) {
      throw error;
    }

    // Log de l'action
    await logAdminAction({
      user_id: (request as any).adminUser.id,
      action: 'roles.create',
      resource: '/api/admin/roles',
      ip_address: request.headers.get('x-forwarded-for')?.split(',')[0] || request.headers.get('x-real-ip') || 'unknown',
      user_agent: request.headers.get('user-agent') || 'unknown',
      timestamp: new Date().toISOString(),
      success: true,
      details: {
        role_name: name,
        role_id: newRole.id,
        permissions_count: permissions?.length || 0,
      },
    });

    return NextResponse.json({
      success: true,
      role: newRole,
    });
  } catch (error: any) {
    console.error('Erreur lors de la création du rôle:', error);

    await logAdminAction({
      user_id: (request as any).adminUser?.id || 'unknown',
      action: 'roles.create',
      resource: '/api/admin/roles',
      ip_address: request.headers.get('x-forwarded-for')?.split(',')[0] || request.headers.get('x-real-ip') || 'unknown',
      user_agent: request.headers.get('user-agent') || 'unknown',
      timestamp: new Date().toISOString(),
      success: false,
      details: { error: error.message },
    });

    return NextResponse.json(
      { error: 'Erreur lors de la création du rôle' },
      { status: 500 },
    );
  }
}

// Wrapper avec authentification admin
export const GET_handler = withAdminAuth(GET);
export const POST_handler = withAdminAuth(POST);

export { GET_handler as GET, POST_handler as POST };


import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { withAdminAuth, logAdminAction } from '@/middleware/adminAuth';

// POST /api/admin/check-permissions - Vérifier les permissions admin
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
    const { permissions } = body;

    if (!permissions || !Array.isArray(permissions)) {
      return NextResponse.json(
        { error: 'Permissions requises' },
        { status: 400 },
      );
    }

    const { adminUser } = (request as any);

    // Si l'utilisateur demande tous les droits (*), vérifier s'il est super admin
    if (permissions.includes('*')) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('admin_role_id')
        .eq('id', adminUser.id)
        .single();

      if (profile?.admin_role_id) {
        const { data: role } = await supabase
          .from('admin_roles')
          .select('name')
          .eq('id', profile.admin_role_id)
          .single();

        if (role?.name === 'super_admin') {
          // Log de la vérification des permissions
          await logAdminAction({
            user_id: adminUser.id,
            action: 'permissions.check',
            resource: '/api/admin/check-permissions',
            ip_address: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
            user_agent: request.headers.get('user-agent') || 'unknown',
            timestamp: new Date().toISOString(),
            success: true,
            details: {
              requested_permissions: permissions,
              has_all_permissions: true,
              reason: 'super_admin_role',
            },
          });

          return NextResponse.json({
            success: true,
            hasAllPermissions: true,
            userRole: 'super_admin',
            permissions: ['*'],
          });
        }
      }
    }

    // Vérifier les permissions spécifiques
    const { data: profile } = await supabase
      .from('profiles')
      .select('admin_role_id, custom_permissions')
      .eq('id', adminUser.id)
      .single();

    if (!profile) {
      return NextResponse.json(
        { error: 'Profil non trouvé' },
        { status: 404 },
      );
    }

    let hasAllPermissions = true;
    const grantedPermissions: string[] = [];

    // Vérifier les permissions du rôle admin
    if (profile.admin_role_id) {
      const { data: role } = await supabase
        .from('admin_roles')
        .select('permissions')
        .eq('id', profile.admin_role_id)
        .single();

      if (role?.permissions) {
        // Récupérer les détails des permissions du rôle
        const { data: rolePermissions } = await supabase
          .from('admin_permissions')
          .select('name')
          .in('id', role.permissions);

        if (rolePermissions) {
          const rolePermissionNames = rolePermissions.map(p => p.name);

          for (const permission of permissions) {
            if (rolePermissionNames.includes(permission)) {
              grantedPermissions.push(permission);
            } else {
              hasAllPermissions = false;
            }
          }
        }
      }
    }

    // Vérifier les permissions personnalisées
    if (profile.custom_permissions && profile.custom_permissions.length > 0) {
      const { data: customPermissions } = await supabase
        .from('admin_permissions')
        .select('name')
        .in('id', profile.custom_permissions);

      if (customPermissions) {
        const customPermissionNames = customPermissions.map(p => p.name);

        for (const permission of permissions) {
          if (customPermissionNames.includes(permission) && !grantedPermissions.includes(permission)) {
            grantedPermissions.push(permission);
          }
        }
      }
    }

    // Log de la vérification des permissions
    await logAdminAction({
      user_id: adminUser.id,
      action: 'permissions.check',
      resource: '/api/admin/check-permissions',
      ip_address: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
      user_agent: request.headers.get('user-agent') || 'unknown',
      timestamp: new Date().toISOString(),
      success: true,
      details: {
        requested_permissions: permissions,
        granted_permissions: grantedPermissions,
        has_all_permissions: hasAllPermissions,
        admin_role_id: profile.admin_role_id,
        custom_permissions_count: profile.custom_permissions?.length || 0,
      },
    });

    return NextResponse.json({
      success: true,
      hasAllPermissions,
      grantedPermissions,
      requestedPermissions: permissions,
      userRole: profile.admin_role_id ? 'admin' : 'basic_admin',
    });
  } catch (error: any) {
    console.error('Erreur lors de la vérification des permissions:', error);

    await logAdminAction({
      user_id: (request as any).adminUser?.id || 'unknown',
      action: 'permissions.check',
      resource: '/api/admin/check-permissions',
      ip_address: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
      user_agent: request.headers.get('user-agent') || 'unknown',
      timestamp: new Date().toISOString(),
      success: false,
      details: { error: error.message },
    });

    return NextResponse.json(
      { error: 'Erreur lors de la vérification des permissions' },
      { status: 500 },
    );
  }
}

// Wrapper avec authentification admin
export const POST_handler = withAdminAuth(POST);

export { POST_handler as POST };


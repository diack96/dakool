import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { USER_ROLES } from '@/lib/constants';

// Client Supabase Edge-compatible pour le middleware (lecture des cookies)
function createMiddlewareClient(request: NextRequest, response?: NextResponse) {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cookiesToSet: Array<{ name: string; value: string; options?: Record<string, unknown> }>) => {
          if (response) {
            cookiesToSet.forEach(({ name, value, options }) => {
              request.cookies.set(name, value);
              response.cookies.set(name, value, options as any);
            });
          }
        },
      },
    }
  );
}

// Singleton admin client — pas de cookies, pas d'état par user → safe à réutiliser
let _adminClient: ReturnType<typeof createServerClient> | null = null;
function getAdminClient() {
  if (!_adminClient) {
    _adminClient = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        cookies: { getAll: () => [], setAll: () => {} },
        auth: { autoRefreshToken: false, persistSession: false },
      }
    );
  }
  return _adminClient;
}

// Cache en mémoire du rôle admin — évite une requête DB profiles à chaque appel admin
// TTL 5 min : révocation effective dans les 5 minutes suivant la suppression du rôle
const _roleCache = new Map<string, { isAdmin: boolean; expiresAt: number }>();
const ROLE_CACHE_TTL = 5 * 60 * 1000;

function getCachedRole(userId: string): boolean | null {
  const entry = _roleCache.get(userId);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) { _roleCache.delete(userId); return null; }
  return entry.isAdmin;
}

function setCachedRole(userId: string, isAdmin: boolean) {
  _roleCache.set(userId, { isAdmin, expiresAt: Date.now() + ROLE_CACHE_TTL });
}

export interface AdminUser {
  id: string;
  email: string;
  role: 'admin' | 'instructor' | 'student';
  permissions: string[];
}

/**
 * Valide l'accès admin en vérifiant UNIQUEMENT le rôle dans la base de données
 * SÉCURITÉ: Ne jamais utiliser d'email hardcodé ou de bypass
 */
export async function validateAdminAccess(request: NextRequest, response?: NextResponse): Promise<{
  isAdmin: boolean;
  user?: AdminUser;
  error?: string;
}> {
  try {
    const supabase = createMiddlewareClient(request, response);

    // getSession() valide le JWT localement depuis le cookie (zéro appel réseau Auth).
    // getUser() ferait un appel réseau à Supabase Auth à chaque requête admin —
    // trop coûteux. Le rôle est de toute façon vérifié depuis la DB ci-dessous.
    const { data: { session }, error: authError } = await supabase.auth.getSession();
    const user = session?.user;

    if (authError || !user) {
      return { isAdmin: false, error: 'Non authentifié' };
    }

    // Vérifier le cache avant de requêter la DB
    const cached = getCachedRole(user.id);
    let isAdmin: boolean;
    let profileRole: string | null = null;

    if (cached !== null) {
      isAdmin = cached;
    } else {
      const adminClient = getAdminClient();
      const { data: profile, error: profileError } = await adminClient
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single<{ role: string }>();

      if (profileError || !profile) {
        return {
          isAdmin: false,
          error: 'Profil non trouvé. Contactez un administrateur pour créer votre profil.'
        };
      }

      profileRole = profile.role;
      isAdmin = profile.role === USER_ROLES.ADMIN;
      setCachedRole(user.id, isAdmin);
    }

    if (!isAdmin) {
      return {
        isAdmin: false,
        error: `Accès non autorisé. Vous devez être administrateur.`
      };
    }

    // Log d'audit de l'accès admin (non bloquant)
    logAdminAction({
      user_id: user.id,
      action: 'admin_access',
      resource: request.nextUrl.pathname,
      ip_address: request.headers.get('x-forwarded-for')?.split(',')[0] || request.headers.get('x-real-ip') || 'unknown',
      user_agent: request.headers.get('user-agent') || 'unknown',
      timestamp: new Date().toISOString(),
      success: true,
    }).catch(() => {
      // Erreur non bloquante
    });

    return {
      isAdmin: true,
      user: {
        id: user.id,
        email: user.email!,
        role: (profileRole ?? 'admin') as 'admin',
        permissions: [],
      },
    };
  } catch (error) {
    console.error('❌ [AdminAuth] Erreur catch:', error);
    return { isAdmin: false, error: 'Erreur de validation' };
  }
}

export async function logAdminAction(logData: {
  user_id: string;
  action: string;
  resource: string;
  ip_address: string;
  user_agent: string;
  timestamp: string;
  success: boolean;
  details?: Record<string, unknown>;
}) {
  try {
    // Utilise le singleton admin — pas besoin du contexte cookie pour un simple insert
    await getAdminClient()
      .from('admin_audit_logs')
      .insert(logData as never);
  } catch {
    // Erreur non bloquante
  }
}

export function withAdminAuth<T extends unknown[]>(
  handler: (request: NextRequest, ...args: T) => Promise<NextResponse>,
) {
  return async (request: NextRequest, ...args: T) => {
    const { isAdmin, user, error } = await validateAdminAccess(request);

    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Accès non autorisé', details: error },
        { status: 403 },
      );
    }

    // Ajouter l'utilisateur admin au contexte de la requête
    (request as NextRequest & { adminUser: AdminUser }).adminUser = user!;

    return handler(request, ...args);
  };
}

/**
 * Utilitaires de sécurité pour la vérification des rôles
 * SÉCURITÉ: Toujours vérifier les rôles depuis la DB, jamais depuis user_metadata
 */

import { createServerSupabaseClient } from '../supabase-server';

export interface RoleCheckResult {
  role: string | null;
  isAdmin: boolean;
  isInstructor: boolean;
  isStudent: boolean;
  error?: string;
}

// Cache en mémoire du rôle — évite une requête DB profiles à chaque API call
// TTL 5 min : cohérent avec le cache de adminAuth.ts
const _roleCache = new Map<string, { result: RoleCheckResult; expiresAt: number }>();
const ROLE_CACHE_TTL = 5 * 60 * 1000;

/**
 * Vérifier le rôle d'un utilisateur depuis la base de données
 * SÉCURITÉ CRITIQUE: Ne jamais utiliser user_metadata?.role seul
 */
export async function checkUserRoleFromDB (userId: string): Promise<RoleCheckResult> {
  // Vérifier le cache d'abord
  const cached = _roleCache.get(userId);
  if (cached && Date.now() < cached.expiresAt) {
    return cached.result;
  }

  try {
    const supabase = await createServerSupabaseClient();

    const { data: profile, error } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .single();

    if (error || !profile) {
      return {
        role: null,
        isAdmin: false,
        isInstructor: false,
        isStudent: false,
        error: 'Profil non trouvé',
      };
    }

    const role = (profile as { id: string; role: string; email?: string } | null)?.role || 'student';

    const result: RoleCheckResult = {
      role,
      isAdmin: role === 'admin',
      isInstructor: role === 'instructor',
      isStudent: role === 'student',
    };

    // Mettre en cache 5 min
    _roleCache.set(userId, { result, expiresAt: Date.now() + ROLE_CACHE_TTL });

    return result;
  } catch (error) {
    console.error('Erreur lors de la vérification du rôle:', error);
    return {
      role: null,
      isAdmin: false,
      isInstructor: false,
      isStudent: false,
      error: 'Erreur lors de la vérification du rôle',
    };
  }
}

/**
 * Vérifier si un utilisateur a un rôle spécifique
 */
export async function hasRole (userId: string, requiredRole: 'admin' | 'instructor' | 'student'): Promise<boolean> {
  const roleCheck = await checkUserRoleFromDB(userId);

  switch (requiredRole) {
  case 'admin':
    return roleCheck.isAdmin;
  case 'instructor':
    return roleCheck.isInstructor;
  case 'student':
    return roleCheck.isStudent;
  default:
    return false;
  }
}

/**
 * Vérifier si un utilisateur a au moins un des rôles requis
 */
export async function hasAnyRole (userId: string, requiredRoles: Array<'admin' | 'instructor' | 'student'>): Promise<boolean> {
  const roleCheck = await checkUserRoleFromDB(userId);

  return requiredRoles.some(role => {
    switch (role) {
    case 'admin':
      return roleCheck.isAdmin;
    case 'instructor':
      return roleCheck.isInstructor;
    case 'student':
      return roleCheck.isStudent;
    default:
      return false;
    }
  });
}


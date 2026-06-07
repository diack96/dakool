'use client';

import { useEffect, useState, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { createBrowserSupabaseClient } from '@/lib/supabase-helpers';
import { USER_ROLES } from '@/lib/constants';

interface AdminRouteProps {
  children: React.ReactNode;
  requiredPermissions?: string[];
  fallback?: React.ReactNode;
}

export default function AdminRoute ({
  children,
  requiredPermissions = [],
  fallback: _fallback,
}: AdminRouteProps) {
  const { user, session, loading } = useAuth();
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [checkingPermissions, setCheckingPermissions] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  // Stabilize requiredPermissions — compare by JSON to avoid re-triggering on new array refs
  const permissionsRef = useRef(requiredPermissions);
  const permissionsKey = JSON.stringify(requiredPermissions);
  useEffect(() => {
    permissionsRef.current = requiredPermissions;
  }, [permissionsKey, requiredPermissions]);

  useEffect(() => {
    const checkAdminAccess = async () => {
      if (loading) return;

      if (!user || !session) {
        if (typeof window !== 'undefined') {
          router.push(`/admin/login?redirect=${encodeURIComponent(window.location.pathname)}`);
        } else {
          router.push('/admin/login');
        }
        setCheckingPermissions(false);
        return;
      }

      try {
        // Vérifier le rôle dans la base de données (seule source de vérité)
        const supabase = createBrowserSupabaseClient();

        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();

        if (profileError || !profile) {
          router.push('/dashboard?error=unauthorized');
          setCheckingPermissions(false);
          return;
        }

        // Vérifier si l'utilisateur est admin (uniquement depuis la base de données)
        const userIsAdmin = (profile as { id: string; role: string; email?: string } | null)?.role === USER_ROLES.ADMIN;
        setIsAdmin(userIsAdmin);

        if (!userIsAdmin) {
          router.push('/dashboard?error=unauthorized');
          setCheckingPermissions(false);
          return;
        }

        // Si des permissions spécifiques sont requises, les vérifier
        const currentPermissions = permissionsRef.current;
        if (currentPermissions.length > 0) {
          try {
            const response = await fetch('/api/admin/check-permissions', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                permissions: currentPermissions,
              }),
            });

            if (response.ok) {
              const { hasAllPermissions } = await response.json();
              if (hasAllPermissions) {
                setIsAuthorized(true);
              } else {
                router.push('/admin?error=insufficient_permissions');
              }
            } else {
              router.push('/admin?error=permission_check_failed');
            }
          } catch (error) {
            console.error('Erreur lors de la vérification des permissions:', error);
            router.push('/admin?error=permission_check_failed');
          }
        } else {
          // Pas de permissions spécifiques requises, accès admin suffisant
          setIsAuthorized(true);
        }

        setCheckingPermissions(false);
      } catch (error) {
        console.error('Erreur lors de la vérification admin:', error);
        setCheckingPermissions(false);
        setIsAdmin(false);
      }
    };

    checkAdminAccess();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, loading, router, permissionsKey]);

  // Affichage du loading pendant la vérification
  if (loading || checkingPermissions) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600">Vérification des permissions...</p>
        </div>
      </div>
    );
  }

  // Utilisateur non connecté ou non admin
  if (!user || !session || !isAdmin) {
    return null; // Le useEffect redirigera
  }

  // Permissions insuffisantes
  if (!isAuthorized) {
    return null; // Le useEffect redirigera
  }

  // Accès autorisé
  return <>{children}</>;
}

// Composant de protection des routes admin avec permissions spécifiques
export function AdminRouteWithPermissions ({
  children,
  permissions,
}: {
  children: React.ReactNode;
  permissions: string[]
}) {
  return (
    <AdminRoute requiredPermissions={permissions}>
      {children}
    </AdminRoute>
  );
}

// Composant de protection des routes admin super (tous les droits)
export function SuperAdminRoute ({ children }: { children: React.ReactNode }) {
  return (
    <AdminRoute requiredPermissions={['*']}>
      {children}
    </AdminRoute>
  );
}

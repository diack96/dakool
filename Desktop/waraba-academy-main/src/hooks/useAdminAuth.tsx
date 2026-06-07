'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export function useAdminAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const { user, session, loading: authLoading, signOut } = useAuth();

  useEffect(() => {
    // Attendre que AuthContext ait fini de charger
    if (authLoading) {
      return;
    }
    checkAdminAuth();
  // user?.id est stable entre les renders (string ou undefined), contrairement
  // à l'objet user entier qui est recréé à chaque TOKEN_REFRESHED
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, authLoading]);

  const checkAdminAuth = async () => {
    try {
      if (typeof window === 'undefined') {
        setIsLoading(false);
        return;
      }

      const isOnLoginPage = window.location.pathname === '/admin/login';

      // Si pas d'utilisateur connecté
      if (!user || !session) {
        setIsAuthenticated(false);
        setIsLoading(false);
        if (!isOnLoginPage && window.location.pathname.startsWith('/admin')) {
          router.push('/admin/login');
        }
        return;
      }

      // Court-circuit : si le résultat est déjà en cache (sessionStorage ou cookie 1h),
      // éviter l'appel réseau à /api/auth/check-admin
      const sessionCached = sessionStorage.getItem('adminAuthenticated');
      const cookieCached = document.cookie.split(';').some(c => c.trim() === 'adminAuthenticated=true');
      if (sessionCached === 'true' || cookieCached) {
        setIsAuthenticated(true);
        setIsLoading(false);
        return;
      }

      // Appeler l'API serveur pour vérifier le rôle admin (contourne RLS)
      const response = await fetch('/api/auth/check-admin', {
        method: 'GET',
        credentials: 'include',
        cache: 'no-store',
      });

      if (!response.ok) {
        console.error('Erreur check-admin:', response.status);
        setIsAuthenticated(false);
        setIsLoading(false);
        if (!isOnLoginPage) {
          router.push('/admin/login');
        }
        return;
      }

      const data = await response.json();

      if (data.isAdmin) {
        setIsAuthenticated(true);
        sessionStorage.setItem('adminAuthenticated', 'true');
        document.cookie = 'adminAuthenticated=true; path=/; max-age=3600';
      } else {
        setIsAuthenticated(false);
        sessionStorage.removeItem('adminAuthenticated');
        if (!isOnLoginPage && window.location.pathname.startsWith('/admin')) {
          router.push('/admin/login?error=unauthorized');
        }
      }
    } catch (error) {
      console.error('Erreur lors de la vérification admin:', error);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  const logoutAdmin = async () => {
    try {
      sessionStorage.removeItem('adminAuthenticated');
      document.cookie = 'adminAuthenticated=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
      setIsAuthenticated(false);

      if (signOut) {
        await signOut();
      }

      window.location.href = '/';
    } catch (error) {
      console.error('Erreur lors de la déconnexion admin:', error);
      window.location.href = '/';
    }
  };

  const requireAuth = () => {
    if (!isAuthenticated && !isLoading) {
      router.push('/admin/login');
      return false;
    }
    return true;
  };

  return {
    isAuthenticated,
    isLoading,
    logoutAdmin,
    requireAuth,
    checkAdminAuth,
  };
}

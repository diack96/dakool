'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Fonction utilitaire pour gérer les cookies
const setCookie = (name: string, value: string, days: number = 7) => {
  const expires = new Date();
  expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000));
  document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/`;
};

const getCookie = (name: string): string | null => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
  return null;
};

const removeCookie = (name: string) => {
  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
};

export function AuthProvider ({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Vérifier l'authentification au chargement
  useEffect(() => {
    const checkAuth = () => {
      try {
        // Vérifier d'abord les cookies
        const cookieToken = getCookie('auth_token');
        const cookieUser = getCookie('auth_user');

        // Fallback sur localStorage si pas de cookies
        const localToken = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
        const localUser = typeof window !== 'undefined' ? localStorage.getItem('auth_user') : null;

        const finalToken = cookieToken || localToken;
        const finalUser = cookieUser || localUser;

        if (finalToken && finalUser) {
          setToken(finalToken);
          setUser(JSON.parse(finalUser));

          // Synchroniser cookies et localStorage
          if (!cookieToken) setCookie('auth_token', finalToken);
          if (!cookieUser) setCookie('auth_user', finalUser);
        }
      } catch (error) {
        console.error('Erreur lors de la vérification de l\'authentification:', error);
        // Nettoyer en cas d'erreur
        removeCookie('auth_token');
        removeCookie('auth_user');
        if (typeof window !== 'undefined') {
          localStorage.removeItem('auth_token');
          localStorage.removeItem('auth_user');
        }
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true);

      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        const data = await response.json();

        setToken(data.token);
        setUser(data.user);

        // Stocker dans les cookies ET localStorage
        setCookie('auth_token', data.token);
        setCookie('auth_user', JSON.stringify(data.user));
        if (typeof window !== 'undefined') {
          localStorage.setItem('auth_token', data.token);
          localStorage.setItem('auth_user', JSON.stringify(data.user));
        }

        return true;
      } else {
        const error = await response.json();
        console.error('Erreur de connexion:', error.error);
        return false;
      }
    } catch (error) {
      console.error('Erreur lors de la connexion:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);

    // Nettoyer cookies ET localStorage
    removeCookie('auth_token');
    removeCookie('auth_user');
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_user');
    }

    // Rediriger vers l'accueil
    router.push('/');
  };

  const value: AuthContextType = {
    user,
    token,
    login,
    logout,
    isLoading,
    isAuthenticated: !!user && !!token,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth () {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth doit être utilisé dans un AuthProvider');
  }
  return context;
}

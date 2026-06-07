'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Loader2, Shield } from 'lucide-react';

interface SimpleAuthGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export default function SimpleAuthGuard ({ children, fallback }: SimpleAuthGuardProps) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [isRedirecting, setIsRedirecting] = useState(false);

  useEffect(() => {
    if (!loading && !user && !isRedirecting) {
      setIsRedirecting(true);
      window.location.href = '/auth/login';
    }
  }, [user, loading, isRedirecting]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-16 h-16 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600 text-lg">Initialisation de l'authentification...</p>
        </div>
      </div>
    );
  }

  if (!user && isRedirecting) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-16 h-16 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600 text-lg">Redirection vers la connexion...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return fallback || (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Shield className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <p className="text-gray-600 text-lg">Accès refusé</p>
          <p className="text-sm text-gray-500 mb-4">Vous devez être connecté pour accéder à cette page</p>
          <button
            onClick={() => router.push('/auth/login')}
            className="mt-4 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Se connecter
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

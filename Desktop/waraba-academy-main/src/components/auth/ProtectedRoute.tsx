'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'student' | 'admin' | 'instructor';
}

export default function ProtectedRoute ({ children, requiredRole }: ProtectedRouteProps) {
  const { user, loading: isLoading } = useAuth();
  const router = useRouter();
  const [isRedirecting, setIsRedirecting] = useState(false);

  useEffect(() => {
    if (!isLoading && !user && !isRedirecting) {
      setIsRedirecting(true);
      const timer = setTimeout(() => {
        window.location.href = '/auth/login';
      }, 100);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [isLoading, user, isRedirecting]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Initialisation de l'authentification...</p>
        </div>
      </div>
    );
  }

  if (!user && !isRedirecting) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Vérification de l'authentification...</p>
        </div>
      </div>
    );
  }

  if (isRedirecting) {
    return null;
  }

  if (requiredRole && user) {
    const userRole = user.user_metadata?.role || 'student';
    if (userRole !== requiredRole && userRole !== 'admin') {
      router.push('/dashboard');
      return null;
    }
  }

  return <>{children}</>;
}

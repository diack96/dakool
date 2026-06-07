'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export default function ProfileRedirectPage () {
  const router = useRouter();

  useEffect(() => {
    // Rediriger vers la page de profil du dashboard
    router.replace('/dashboard/profile');
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-orange-50">
      <div className="text-center">
        <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
        <p className="text-gray-600">Redirection vers votre profil...</p>
      </div>
    </div>
  );
}


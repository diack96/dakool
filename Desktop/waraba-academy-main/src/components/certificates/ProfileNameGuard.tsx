'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { useState } from 'react';

interface ProfileNameGuardProps {
  children: React.ReactNode;
}

/**
 * ProfileNameGuard
 *
 * Vérifie que l'utilisateur a un vrai prénom + nom dans son profil.
 * Si non, redirige vers /dashboard/profile?from=certificate&next=<url>
 * pour que la validation se fasse dans la page profil.
 */
export default function ProfileNameGuard({ children }: ProfileNameGuardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [checking, setChecking] = useState(true);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    fetch('/api/profile/check', { credentials: 'include', cache: 'no-store' })
      .then(r => r.json())
      .then(data => {
        const fn = (data.profile?.firstName ?? '').trim();
        const ln = (data.profile?.lastName  ?? '').trim();
        if (fn && ln) {
          setReady(true);
        } else {
          // Rediriger vers le profil avec le chemin de retour
          router.replace(
            `/dashboard/profile?from=certificate&next=${encodeURIComponent(pathname)}`,
          );
        }
      })
      .catch(() => {
        // Erreur réseau : laisser passer (fail-open)
        setReady(true);
      })
      .finally(() => setChecking(false));
  }, [pathname, router]);

  if (checking || !ready) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return <>{children}</>;
}

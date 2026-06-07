'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';

interface Props {
  course: { id: string; title: string; price: number };
  onSuccess: () => void;
  onError: (msg: string) => void;
}

const SESSION_STORAGE_KEY = 'wave_pending_session_id';

/**
 * Bouton de paiement Wave Money.
 *
 * Flux complet :
 *   1. Clic → POST /api/wave/checkout → { wave_launch_url, session_id }
 *   2. session_id sauvegardé en sessionStorage (robuste si Wave n'ajoute pas ?id=)
 *   3. window.location.href → page de paiement Wave (URL externe HTTPS)
 *   4. Wave redirige vers success_url?wave_return=success[&id=cos-xxx]
 *   5. useEffect lit session_id depuis URL (?id=) ou sessionStorage (fallback)
 *   6. GET /api/wave/verify?sessionId=cos-xxx → confirme + crée enrollment
 *   7. onSuccess() → redirection dashboard
 *
 * Docs : https://docs.wave.com/checkout
 */
export default function WaveButton({ course, onSuccess: _onSuccess, onError }: Props) {
  const searchParams = useSearchParams();
  const router       = useRouter();

  const [loading,   setLoading]   = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [verified,  setVerified]  = useState<'success' | 'failed' | 'pending' | null>(null);

  // ─── Retour depuis Wave : vérification automatique ──────────────
  useEffect(() => {
    const waveReturn = searchParams.get('wave_return');
    if (!waveReturn) return;

    // Retour annulation / échec côté Wave
    if (waveReturn === 'error') {
      sessionStorage.removeItem(SESSION_STORAGE_KEY);
      router.replace(`/courses/${course.id}/payment/failure?reason=cancelled`);
      return;
    }

    // Retour succès : récupérer session_id depuis l'URL ou sessionStorage
    const sessionIdFromUrl     = searchParams.get('id');   // Wave ajoute ?id=cos-xxx si disponible
    const sessionIdFromStorage = sessionStorage.getItem(SESSION_STORAGE_KEY);
    const sessionId            = sessionIdFromUrl ?? sessionIdFromStorage ?? '';

    // Nettoyer le storage dans tous les cas
    sessionStorage.removeItem(SESSION_STORAGE_KEY);

    if (!sessionId) {
      // Session introuvable (refresh après paiement) — paiement probablement confirmé via webhook
      setVerified('pending');
      return;
    }

    setVerifying(true);

    fetch(`/api/wave/verify?sessionId=${encodeURIComponent(sessionId)}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setVerified('success');
          setTimeout(() => {
            router.replace(`/courses/${course.id}/payment/success`);
          }, 800);
        } else {
          router.replace(`/courses/${course.id}/payment/failure?reason=unconfirmed`);
        }
      })
      .catch(() => {
        router.replace(`/courses/${course.id}/payment/failure?reason=unconfirmed`);
      })
      .finally(() => setVerifying(false));

  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ─── Initiation du paiement ──────────────────────────────────────
  const handlePay = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/wave/checkout', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ courseId: course.id }),
      });

      const data = await res.json();

      if (!res.ok || !data.wave_launch_url) {
        onError(data.error ?? 'Erreur lors de l\'initialisation du paiement Wave.');
        return;
      }

      // Sauvegarder le session_id avant de quitter la page
      // (Wave peut ne pas ajouter ?id= au success_url selon la config)
      sessionStorage.setItem(SESSION_STORAGE_KEY, data.session_id);

      // Redirection vers Wave (URL HTTPS externe → window.location obligatoire)
      window.location.href = data.wave_launch_url;

    } catch {
      onError('Erreur réseau. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  // ─── États visuels ───────────────────────────────────────────────

  if (verifying) {
    return (
      <div className="flex items-center justify-center gap-3 py-4 text-gray-600">
        <Loader2 className="w-5 h-5 animate-spin" />
        <span>Vérification du paiement en cours…</span>
      </div>
    );
  }

  if (verified === 'success') {
    return (
      <div className="flex items-center justify-center gap-3 py-4 text-green-600">
        <CheckCircle className="w-5 h-5" />
        <span className="font-medium">Paiement confirmé ! Redirection…</span>
      </div>
    );
  }

  if (verified === 'pending') {
    return (
      <div className="flex flex-col items-center gap-3 py-4 text-center">
        <CheckCircle className="w-8 h-8 text-green-500" />
        <p className="font-semibold text-gray-800">Votre paiement est en cours de traitement.</p>
        <p className="text-sm text-gray-500">Si vous avez été débité, votre accès sera activé automatiquement dans quelques instants.</p>
        <a href="/dashboard" className="text-sm text-blue-600 hover:underline mt-1">Aller au tableau de bord →</a>
      </div>
    );
  }

  if (verified === 'failed') {
    return (
      <div className="flex flex-col items-center gap-3 py-4">
        <div className="flex items-center gap-2 text-red-600">
          <XCircle className="w-5 h-5" />
          <span>Paiement échoué ou annulé.</span>
        </div>
        <button
          onClick={handlePay}
          disabled={loading}
          className="w-full bg-[#1DC1F5] hover:bg-[#18aed9] disabled:opacity-60 text-white font-semibold py-3 px-6 rounded-xl transition-colors flex items-center justify-center gap-2"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : (
            <span className="bg-white rounded-md px-1 py-0.5 flex items-center">
              <Image src="/logo-wave.png" alt="Wave" width={20} height={20} className="object-contain" />
            </span>
          )}
          Réessayer avec Wave
        </button>
      </div>
    );
  }

  // ─── Bouton principal ─────────────────────────────────────────────
  return (
    <button
      onClick={handlePay}
      disabled={loading}
      className="w-full bg-[#1DC1F5] hover:bg-[#18aed9] active:bg-[#14a0c8] disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-4 px-6 rounded-xl transition-colors flex items-center justify-center gap-3 text-lg shadow-md hover:shadow-lg"
    >
      {loading ? (
        <>
          <Loader2 className="w-5 h-5 animate-spin" />
          Redirection vers Wave…
        </>
      ) : (
        <>
          <span className="bg-white rounded-md px-1.5 py-1 flex items-center">
            <Image src="/logo-wave.png" alt="Wave" width={24} height={24} className="object-contain" />
          </span>
          Payer {course.price.toLocaleString('fr-FR')} FCFA avec Wave
        </>
      )}
    </button>
  );
}

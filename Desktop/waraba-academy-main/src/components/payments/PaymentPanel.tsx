'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { CheckCircle, ShieldCheck, AlertCircle } from 'lucide-react';
import { AdminCourse } from '@/types';
import WaveButton from './WaveButton';
import { useAuth } from '@/contexts/AuthContext';

export default function PaymentPanel({ course, overridePrice }: { course: AdminCourse; overridePrice?: number }) {
  const router       = useRouter();
  const { user }     = useAuth();
  const searchParams = useSearchParams();

  // Si Wave redirige vers cette page (?wave_return=...), afficher directement le bouton Wave
  // pour que son useEffect lance la vérification automatique.
  const isWaveReturn   = searchParams.get('wave_return') !== null;
  const effectivePrice = overridePrice ?? course.price;

  const [showWaveButton, setShowWaveButton] = useState(isWaveReturn);
  const [waveError,      setWaveError]      = useState<string | null>(null);

  const handleWaveSuccess = () => {
    router.push('/dashboard?payment=success');
  };

  const handleWaveError = (error: string) => {
    setWaveError(error);
  };

  const handlePay = () => {
    if (!user) {
      router.push(`/auth/login?redirect=/courses/${course.id}/payment`);
      return;
    }
    setWaveError(null);
    setShowWaveButton(true);
  };

  /* ─── Vue après clic / retour Wave ─────────────────────────── */
  if (showWaveButton) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">

        {/* Retour (uniquement si l'utilisateur a cliqué, pas sur un retour auto depuis Wave) */}
        {!isWaveReturn && (
          <button
            onClick={() => { setShowWaveButton(false); setWaveError(null); }}
            className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
          >
            ← Retour
          </button>
        )}

        {/* Récap commande */}
        <div className="p-4 rounded-xl bg-gray-50 border border-gray-100 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-500">Cours</span>
            <span className="font-medium text-gray-900 line-clamp-1 ml-3 text-right">{course.title}</span>
          </div>
          <div className="flex justify-between mt-2">
            <span className="text-gray-500">Total</span>
            <span className="font-bold text-gray-900">{effectivePrice.toLocaleString('fr-FR')} FCFA</span>
          </div>
        </div>

        {/* Erreur inline */}
        {waveError && (
          <div className="flex items-start gap-3 p-4 rounded-xl bg-red-50 border border-red-200 text-sm text-red-800">
            <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
            <p>{waveError}</p>
          </div>
        )}

        <WaveButton
          course={{ id: course.id, title: course.title, price: effectivePrice }}
          onSuccess={handleWaveSuccess}
          onError={handleWaveError}
        />
      </div>
    );
  }

  /* ─── Vue principale ────────────────────────────────────────── */
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">

      {/* En-tête */}
      <div>
        <h2 className="text-xl font-bold text-gray-900">Paiement sécurisé</h2>
        <p className="text-sm text-gray-500 mt-0.5">Paiez en quelques secondes avec Wave</p>
      </div>

      {/* Récap commande */}
      <div className="p-4 rounded-xl bg-gray-50 border border-gray-100 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-500">Cours</span>
          <span className="font-medium text-gray-900 line-clamp-1 ml-3 text-right">{course.title}</span>
        </div>
        {course.originalPrice && course.originalPrice > course.price && (
          <div className="flex justify-between mt-1.5">
            <span className="text-gray-400">Prix habituel</span>
            <span className="text-gray-400 line-through">{course.originalPrice.toLocaleString('fr-FR')} FCFA</span>
          </div>
        )}
        <div className="flex justify-between mt-2 pt-2 border-t border-gray-200">
          <span className="font-semibold text-gray-700">Total</span>
          <span className="font-bold text-blue-600 text-base">{effectivePrice.toLocaleString('fr-FR')} FCFA</span>
        </div>
      </div>

      {/* Bouton Wave avec vrai logo */}
      <button
        onClick={handlePay}
        className="w-full flex items-center justify-center gap-3 bg-[#1DC1F5] hover:bg-[#18aed9] active:bg-[#14a0c8] text-white font-semibold py-4 px-6 rounded-xl transition-colors shadow-md hover:shadow-lg"
      >
        <span className="bg-white rounded-md px-1.5 py-1 flex items-center">
          <Image
            src="/logo-wave.png"
            alt="Wave"
            width={26}
            height={26}
            className="object-contain"
          />
        </span>
        <span className="text-lg">Payer {effectivePrice.toLocaleString('fr-FR')} FCFA</span>
      </button>

      {/* Garanties */}
      <div className="grid grid-cols-3 gap-2 text-[11px] text-gray-500">
        <div className="flex items-center gap-1">
          <ShieldCheck className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />
          <span>Paiement chiffré</span>
        </div>
        <div className="flex items-center gap-1 justify-center">
          <CheckCircle className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />
          <span>Accès immédiat</span>
        </div>
        <div className="flex items-center gap-1 justify-end">
          <ShieldCheck className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />
          <span>Garantie 30j</span>
        </div>
      </div>

    </div>
  );
}

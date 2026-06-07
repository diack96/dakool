'use client';

import { useState } from 'react';
import { UserCircle, Phone, MapPin, FileText, ArrowRight, Loader2 } from 'lucide-react';

interface ProfileCompletionProps {
  onComplete: () => void;
  onSkip: () => void;
  totalSteps: number;
  currentStep: number;
}

export default function ProfileCompletion({ onComplete, onSkip, totalSteps, currentStep }: ProfileCompletionProps) {
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState('');
  const [bio, setBio] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const hasData = phone.trim() || location.trim() || bio.trim();
    if (!hasData) { onSkip(); return; }

    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ phone, location, bio }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || 'Erreur lors de la sauvegarde.');
        return;
      }
      onComplete();
    } catch {
      setError('Erreur réseau. Vous pouvez passer cette étape.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl max-w-md w-full p-6 sm:p-8 relative animate-fade-in">

        {/* Icône */}
        <div className="mx-auto w-16 h-16 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg mb-5">
          <UserCircle className="w-8 h-8 text-white" />
        </div>

        <h2 className="text-xl font-bold text-gray-900 text-center mb-1">
          Personnalisez votre profil
        </h2>
        <p className="text-sm text-gray-500 text-center mb-6">
          Ces informations sont optionnelles — vous pouvez les renseigner plus tard dans vos paramètres.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Téléphone */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">Numéro de téléphone</label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="tel"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder="+221 77 000 00 00"
                maxLength={20}
                className="w-full pl-9 pr-3 py-2.5 text-sm border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-violet-500 focus:border-violet-500 outline-none transition-all"
              />
            </div>
          </div>

          {/* Localisation */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">Ville / Pays</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={location}
                onChange={e => setLocation(e.target.value)}
                placeholder="Dakar, Sénégal"
                maxLength={100}
                className="w-full pl-9 pr-3 py-2.5 text-sm border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-violet-500 focus:border-violet-500 outline-none transition-all"
              />
            </div>
          </div>

          {/* Bio */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
              Bio courte
              <span className="text-gray-400 font-normal ml-1">({bio.length}/160)</span>
            </label>
            <div className="relative">
              <FileText className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
              <textarea
                value={bio}
                onChange={e => setBio(e.target.value.slice(0, 160))}
                placeholder="Ex : Passionné de développement web, entrepreneur basé à Abidjan…"
                rows={3}
                className="w-full pl-9 pr-3 py-2.5 text-sm border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-violet-500 focus:border-violet-500 outline-none transition-all resize-none"
              />
            </div>
          </div>

          {error && (
            <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>
          )}

          {/* Boutons */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onSkip}
              disabled={isLoading}
              className="flex-1 px-4 py-3 border border-gray-200 text-gray-500 rounded-xl hover:bg-gray-50 transition-colors text-sm font-medium disabled:opacity-50"
            >
              Passer
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-xl hover:from-violet-700 hover:to-purple-700 transition-all font-semibold shadow-md flex items-center justify-center gap-2 text-sm disabled:opacity-50"
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
              {isLoading ? 'Sauvegarde...' : 'Continuer'}
            </button>
          </div>
        </form>

        {/* Indicateur de progression */}
        <div className="flex justify-center gap-1.5 mt-6">
          {Array.from({ length: totalSteps }).map((_, i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all ${
                i + 1 === currentStep ? 'w-6 bg-violet-500' :
                i + 1 < currentStep  ? 'w-2 bg-violet-300' :
                'w-2 bg-gray-200'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

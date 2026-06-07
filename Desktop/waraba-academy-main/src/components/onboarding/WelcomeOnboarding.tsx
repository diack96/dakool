'use client';

import { useState } from 'react';
import { Sparkles, ArrowRight, BookOpen, GraduationCap, UserCircle } from 'lucide-react';
import CourseSelection from './CourseSelection';
import ProfileCompletion from './ProfileCompletion';

interface WelcomeOnboardingProps {
  onComplete: () => void;
  onSkip?: () => void;
}

const TOTAL_STEPS = 4;

const STEP_META = [
  {
    icon: Sparkles,
    title: 'Bienvenue sur Waraba Academy ! 🎉',
    description: 'Vous êtes maintenant membre de notre communauté d\'apprenants. Commençons votre parcours !',
    color: 'from-blue-500 to-blue-600',
  },
  {
    icon: UserCircle,
    title: 'Personnalisez votre profil',
    description: 'Ajoutez quelques informations pour que vos certifs et votre espace soient bien à votre image.',
    color: 'from-violet-500 to-purple-600',
  },
  {
    icon: BookOpen,
    title: 'Choisissez votre premier cours',
    description: 'Sélectionnez un cours gratuit pour commencer votre apprentissage dès maintenant.',
    color: 'from-orange-500 to-orange-600',
  },
  {
    icon: GraduationCap,
    title: 'Vous êtes prêt !',
    description: 'Vous êtes inscrit à votre premier cours. Suivez les leçons, passez les quiz et obtenez des certificats reconnus.',
    color: 'from-purple-500 to-purple-600',
  },
];

export default function WelcomeOnboarding({ onComplete }: WelcomeOnboardingProps) {
  const [step, setStep] = useState(1);

  const next = () => setStep(s => s + 1);

  // Étape 2 : complétion de profil (modal déléguée)
  if (step === 2) {
    return (
      <ProfileCompletion
        onComplete={next}
        onSkip={next}
        totalSteps={TOTAL_STEPS}
        currentStep={2}
      />
    );
  }

  // Étape 3 : sélection de cours
  if (step === 3) {
    return (
      <CourseSelection
        onSelect={next}
      />
    );
  }

  const meta = STEP_META[step - 1];
  if (!meta) return null;
  const Icon = meta.icon;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl max-w-md w-full p-6 sm:p-8 relative animate-fade-in">
        <div className="text-center space-y-6">
          {/* Icône */}
          <div className={`mx-auto w-20 h-20 rounded-full bg-gradient-to-br ${meta.color} flex items-center justify-center shadow-lg`}>
            <Icon className="w-10 h-10 text-white" />
          </div>

          <h2 className="text-2xl font-bold text-gray-900">{meta.title}</h2>

          <p className="text-gray-600">{meta.description}</p>

          {/* Indicateur de progression */}
          <div className="flex justify-center gap-1.5">
            {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
              <div
                key={i}
                className={`h-2 rounded-full transition-all ${
                  i + 1 === step ? 'w-8 bg-blue-600' :
                  i + 1 < step   ? 'w-2 bg-blue-300' :
                  'w-2 bg-gray-300'
                }`}
              />
            ))}
          </div>

          {/* Bouton */}
          <div className="pt-4">
            <button
              onClick={step < TOTAL_STEPS ? next : onComplete}
              className="w-full px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all font-semibold shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
            >
              {step === TOTAL_STEPS ? 'Accéder au dashboard' : 'Suivant'}
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

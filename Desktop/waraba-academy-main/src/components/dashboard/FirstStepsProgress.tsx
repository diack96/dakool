'use client';

import { useState, useEffect } from 'react';
import { UserCheck, BookOpen, PlayCircle, Award, ChevronDown, ChevronUp, Check } from 'lucide-react';
import Link from 'next/link';

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  icon: string;
}

interface OnboardingStatus {
  steps: OnboardingStep[];
  completedCount: number;
  totalSteps: number;
  allCompleted: boolean;
  percentComplete: number;
}

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  UserCheck,
  BookOpen,
  PlayCircle,
  Award,
};

const stepLinks: Record<string, string> = {
  profile: '/profile',
  enrollment: '/courses',
  lesson: '/dashboard',
  certificate: '/dashboard/certificates',
};

export default function FirstStepsProgress() {
  const [status, setStatus] = useState<OnboardingStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isExpanded, setIsExpanded] = useState(true);
  const [isHidden, setIsHidden] = useState(false);

  useEffect(() => {
    const fetchOnboardingStatus = async () => {
      try {
        const response = await fetch('/api/onboarding/status', {
          credentials: 'include',
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success && data.status) {
            setStatus(data.status);
            // Masquer automatiquement si tout est complété
            if (data.status.allCompleted) {
              setIsHidden(true);
            }
          }
        }
      } catch (error) {
        console.error('Erreur chargement onboarding status:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOnboardingStatus();
  }, []);

  // Ne pas afficher si caché ou en chargement initial
  if (isHidden || isLoading) {
    return null;
  }

  // Ne pas afficher si pas de données
  if (!status) {
    return null;
  }

  // Ne pas afficher si tout est complété
  if (status.allCompleted) {
    return null;
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden transition-colors mb-8">
      {/* Header cliquable */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
      >
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🚀</span>
            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">
              Premiers pas
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-32 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-500"
                style={{ width: `${status.percentComplete}%` }}
              />
            </div>
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
              {status.completedCount}/{status.totalSteps}
            </span>
          </div>
        </div>
        {isExpanded ? (
          <ChevronUp className="w-5 h-5 text-gray-400" />
        ) : (
          <ChevronDown className="w-5 h-5 text-gray-400" />
        )}
      </button>

      {/* Contenu expandable */}
      {isExpanded && (
        <div className="px-6 pb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {status.steps.map((step, index) => {
              const IconComponent = iconMap[step.icon] || UserCheck;
              const stepLink = stepLinks[step.id] || '/dashboard';

              return (
                <Link
                  key={step.id}
                  href={stepLink}
                  className={`relative p-4 rounded-xl border-2 transition-all ${
                    step.completed
                      ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                      : 'bg-gray-50 dark:bg-gray-700/50 border-gray-200 dark:border-gray-600 hover:border-blue-300 dark:hover:border-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20'
                  }`}
                >
                  {/* Numéro d'étape */}
                  <div
                    className={`absolute -top-2 -left-2 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                      step.completed
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-300 dark:bg-gray-600 text-gray-600 dark:text-gray-300'
                    }`}
                  >
                    {step.completed ? <Check className="w-3 h-3" /> : index + 1}
                  </div>

                  <div className="flex flex-col items-center text-center gap-2">
                    {/* Icône */}
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center ${
                        step.completed
                          ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
                          : 'bg-gray-200 dark:bg-gray-600 text-gray-500 dark:text-gray-400'
                      }`}
                    >
                      <IconComponent className="w-6 h-6" />
                    </div>

                    {/* Titre */}
                    <h3
                      className={`font-semibold text-sm ${
                        step.completed
                          ? 'text-green-700 dark:text-green-400'
                          : 'text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      {step.title}
                    </h3>

                    {/* Description */}
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {step.completed ? 'Complété !' : step.description}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>

          {/* Bouton pour masquer */}
          <div className="mt-4 text-center">
            <button
              onClick={() => setIsHidden(true)}
              className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
            >
              Masquer cette section
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Trophy, Star, Target, Users, BookOpen, Zap, Award, Crown } from 'lucide-react';
import { trackEvent, CONVERSION_EVENTS } from '@/lib/analytics';

interface Badge {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  gradient: string;
  isUnlocked: boolean;
  progress: number;
  maxProgress: number;
  category: 'learning' | 'social' | 'achievement' | 'premium';
}

const AchievementBadges: React.FC = () => {
  const [badges, setBadges] = useState<Badge[]>([]);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    // Simulation des badges (en production, cela viendrait de l'API)
    const mockBadges: Badge[] = [
      {
        id: 'first-course',
        name: 'Premier Pas',
        description: 'Complétez votre premier cours',
        icon: <BookOpen className="w-6 h-6" />,
        color: 'blue',
        gradient: 'from-blue-500 to-blue-600',
        isUnlocked: true,
        progress: 1,
        maxProgress: 1,
        category: 'learning',
      },
      {
        id: 'streak-7',
        name: 'Streak de 7 jours',
        description: 'Apprenez 7 jours de suite',
        icon: <Zap className="w-6 h-6" />,
        color: 'yellow',
        gradient: 'from-yellow-500 to-orange-500',
        isUnlocked: false,
        progress: 4,
        maxProgress: 7,
        category: 'learning',
      },
      {
        id: 'community-help',
        name: 'Aide la Communauté',
        description: 'Aidez 5 autres étudiants',
        icon: <Users className="w-6 h-6" />,
        color: 'green',
        gradient: 'from-green-500 to-green-600',
        isUnlocked: false,
        progress: 2,
        maxProgress: 5,
        category: 'social',
      },
      {
        id: 'certification',
        name: 'Certifié',
        description: 'Obtenez votre première certification',
        icon: <Award className="w-6 h-6" />,
        color: 'orange',
        gradient: 'from-orange-500 to-orange-600',
        isUnlocked: false,
        progress: 0,
        maxProgress: 1,
        category: 'achievement',
      },
      {
        id: 'premium-member',
        name: 'Membre Premium',
        description: 'Rejoignez le programme premium',
        icon: <Crown className="w-6 h-6" />,
        color: 'gold',
        gradient: 'from-yellow-400 to-yellow-600',
        isUnlocked: false,
        progress: 0,
        maxProgress: 1,
        category: 'premium',
      },
    ];

    setBadges(mockBadges);
  }, []);

  const unlockedBadges = badges.filter(badge => badge.isUnlocked);
  const lockedBadges = badges.filter(badge => !badge.isUnlocked);
  const displayedBadges = showAll ? badges : unlockedBadges;

  const getProgressColor = (badge: Badge) => {
    if (badge.isUnlocked) return 'text-green-600';
    const percentage = (badge.progress / badge.maxProgress) * 100;
    if (percentage >= 80) return 'text-yellow-600';
    if (percentage >= 50) return 'text-orange-600';
    return 'text-gray-400';
  };

  const getProgressBarColor = (badge: Badge) => {
    if (badge.isUnlocked) return 'bg-green-500';
    const percentage = (badge.progress / badge.maxProgress) * 100;
    if (percentage >= 80) return 'bg-yellow-500';
    if (percentage >= 50) return 'bg-orange-500';
    return 'bg-gray-300';
  };

  return (
    <section className="py-16 bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="inline-flex items-center px-4 py-2 bg-yellow-100 text-yellow-800 text-sm font-medium rounded-full mb-6">
            <Trophy className="w-4 h-4 mr-2" />
            Vos Réalisations
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Débloquez vos
            <span className="text-transparent bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text">
              {' '}badges de réussite
            </span>
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Suivez vos progrès et célébrez vos accomplissements avec notre système de badges gamifié
          </p>
        </div>

        {/* Statistiques globales */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
          <div className="text-center p-6 bg-white rounded-2xl shadow-lg">
            <div className="w-16 h-16 rounded-full overflow-hidden ring-2 ring-blue-200 mx-auto mb-4">
              <Image
                src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&h=100&fit=crop&crop=faces"
                alt="Badges débloqués"
                width={64}
                height={64}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="text-3xl font-bold text-blue-600 mb-2">{unlockedBadges.length}</div>
            <div className="text-sm text-gray-600">Badges débloqués</div>
          </div>
          <div className="text-center p-6 bg-white rounded-2xl shadow-lg">
            <div className="w-16 h-16 rounded-full overflow-hidden ring-2 ring-green-200 mx-auto mb-4">
              <Image
                src="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&h=100&fit=crop&crop=faces"
                alt="Progression"
                width={64}
                height={64}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="text-3xl font-bold text-green-600 mb-2">
              {Math.round((unlockedBadges.length / badges.length) * 100)}%
            </div>
            <div className="text-sm text-gray-600">Progression</div>
          </div>
          <div className="text-center p-6 bg-white rounded-2xl shadow-lg">
            <div className="w-16 h-16 rounded-full overflow-hidden ring-2 ring-blue-200 mx-auto mb-4">
              <Image
                src="https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=100&h=100&fit=crop&crop=faces"
                alt="Apprentissage"
                width={64}
                height={64}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="text-3xl font-bold text-blue-600 mb-2">
              {badges.filter(b => b.category === 'learning').length}
            </div>
            <div className="text-sm text-gray-600">Badges d'apprentissage</div>
          </div>
          <div className="text-center p-6 bg-white rounded-2xl shadow-lg">
            <div className="w-16 h-16 rounded-full overflow-hidden ring-2 ring-orange-200 mx-auto mb-4">
              <Image
                src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=100&h=100&fit=crop&crop=faces"
                alt="Communauté"
                width={64}
                height={64}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="text-3xl font-bold text-orange-600 mb-2">
              {badges.filter(b => b.category === 'social').length}
            </div>
            <div className="text-sm text-gray-600">Badges sociaux</div>
          </div>
        </div>

        {/* Grille des badges */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayedBadges.map((badge) => (
            <div
              key={badge.id}
              className={`group p-6 rounded-2xl transition-all duration-300 ${
                badge.isUnlocked
                  ? 'bg-white shadow-lg hover:shadow-xl transform hover:-translate-y-1'
                  : 'bg-gray-100 opacity-75'
              }`}
            >
              <div className="flex items-start space-x-4">
                <div className={`p-3 rounded-xl ${badge.gradient} text-white`}>
                  {badge.icon}
                </div>
                <div className="flex-1">
                  <h3 className={`font-semibold text-lg mb-2 ${
                    badge.isUnlocked ? 'text-gray-900' : 'text-gray-600'
                  }`}>
                    {badge.name}
                  </h3>
                  <p className="text-sm text-gray-600 mb-3">
                    {badge.description}
                  </p>

                  {/* Barre de progression */}
                  <div className="mb-2">
                    <div className="flex justify-between text-xs mb-1">
                      <span className={getProgressColor(badge)}>
                        {badge.progress}/{badge.maxProgress}
                      </span>
                      <span className="text-gray-500">
                        {Math.round((badge.progress / badge.maxProgress) * 100)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all duration-500 ${getProgressBarColor(badge)}`}
                        style={{
                          width: `${(badge.progress / badge.maxProgress) * 100}%`,
                        }}
                      ></div>
                    </div>
                  </div>

                  {/* Statut du badge */}
                  <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    badge.isUnlocked
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    {badge.isUnlocked ? (
                      <>
                        <Star className="w-3 h-3 mr-1 fill-current" />
                        Débloqué
                      </>
                    ) : (
                      <>
                        <Target className="w-3 h-3 mr-1" />
                        En cours
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bouton pour voir tous les badges */}
        {!showAll && lockedBadges.length > 0 && (
          <div className="text-center mt-8">
            <button
              onClick={() => {
                setShowAll(true);
                trackEvent({
                  event: CONVERSION_EVENTS.FEATURES_VIEW,
                  category: 'engagement',
                  label: 'badges_view_all',
                  value: 1,
                });
              }}
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-300 font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              <Target className="mr-2 w-4 h-4" />
              Voir tous les badges ({badges.length})
            </button>
          </div>
        )}

        {/* Bouton pour revenir aux badges débloqués */}
        {showAll && (
          <div className="text-center mt-8">
            <button
              onClick={() => setShowAll(false)}
              className="inline-flex items-center px-6 py-3 bg-gray-600 text-white rounded-xl hover:bg-gray-700 transition-all duration-300 font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              <Star className="mr-2 w-4 h-4" />
              Voir mes badges débloqués ({unlockedBadges.length})
            </button>
          </div>
        )}
      </div>
    </section>
  );
};

export default AchievementBadges;

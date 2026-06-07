'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight, Rocket, Play, Star, Zap, Target } from 'lucide-react';
import { trackABTest, trackEvent, CONVERSION_EVENTS } from '@/lib/analytics';

interface CTAVariant {
  id: string;
  text: string;
  subtext: string;
  icon: React.ReactNode;
  color: string;
  gradient: string;
  testWeight: number; // Poids pour l'A/B testing
}

const CTAVariants: React.FC = () => {
  const [selectedVariant, setSelectedVariant] = useState<CTAVariant | null>(null);
  const [isHovered, setIsHovered] = useState(false);

  const ctaVariants: CTAVariant[] = [
    {
      id: 'variant-1',
      text: 'Commencer gratuitement',
      subtext: 'Accès immédiat à 3 cours premium',
      icon: <Rocket className="mr-3 w-6 h-6 group-hover:animate-bounce" />,
      color: 'blue',
      gradient: 'bg-blue-600 hover:bg-blue-700',
      testWeight: 25,
    },
    {
      id: 'variant-2',
      text: 'Démarrer ma formation',
      subtext: 'Parcours personnalisé gratuit',
      icon: <Target className="mr-3 w-6 h-6 group-hover:animate-pulse" />,
      color: 'green',
      gradient: 'bg-green-600 hover:bg-green-700',
      testWeight: 25,
    },
    {
      id: 'variant-3',
      text: 'Transformer ma carrière',
      subtext: '50% de réduction - Offre limitée',
      icon: <Zap className="mr-3 w-6 h-6 group-hover:animate-ping" />,
      color: 'orange',
      gradient: 'bg-orange-600 hover:bg-orange-700',
      testWeight: 25,
    },
    {
      id: 'variant-4',
      text: 'Rejoindre l\'élite tech',
      subtext: 'Communauté exclusive + mentorat',
      icon: <Star className="mr-3 w-6 h-6 group-hover:animate-spin" />,
      color: 'purple',
      gradient: 'bg-purple-600 hover:bg-purple-700',
      testWeight: 25,
    },
  ];

  // Sélection aléatoire basée sur les poids (A/B testing)
  useEffect(() => {
    const random = Math.random() * 100;
    let cumulativeWeight = 0;

    for (const variant of ctaVariants) {
      cumulativeWeight += variant.testWeight;
      if (random <= cumulativeWeight) {
        setSelectedVariant(variant);
        // Tracking de l'impression A/B
        trackABTest.impression(variant.id);
        break;
      }
    }
  }, []);

  // Tracking des clics pour analytics
  const handleCTAClick = (variantId: string) => {
    // Tracking A/B Testing
    trackABTest.click(variantId);

    // Tracking de conversion
    trackEvent({
      event: CONVERSION_EVENTS.HERO_CTA_CLICK,
      category: 'conversion',
      label: variantId,
      value: 1,
    });
  };

  if (!selectedVariant) return null;

  return (
    <div className="text-center mb-16 animate-fade-in-up stagger-4">
      {/* CTA Principal avec A/B Testing */}
      <div className="mb-6">
        <Link
          href="/auth/register"
          onClick={() => handleCTAClick(selectedVariant.id)}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          className={`group inline-flex items-center px-8 py-4 ${selectedVariant.gradient} text-white rounded-2xl transition-all duration-500 font-semibold text-lg shadow-2xl transform hover:-translate-y-2 hover:shadow-${selectedVariant.color}-500/25`}
        >
          {selectedVariant.icon}
          {selectedVariant.text}
          <ArrowRight className="ml-3 w-5 h-5 group-hover:translate-x-2 transition-transform duration-300" />
        </Link>

        {/* Sous-texte avec animation */}
        <p className={`mt-3 text-sm text-gray-600 transition-all duration-300 ${isHovered ? 'scale-105 text-gray-700' : ''}`}>
          {selectedVariant.subtext}
        </p>
      </div>

      {/* CTA Secondaire */}
      <Link
        href="/courses"
        className="group inline-flex items-center px-6 py-3 border-2 border-orange-300 text-orange-700 rounded-xl hover:border-orange-500 hover:text-orange-600 hover:bg-orange-50 transition-all duration-300 font-medium backdrop-blur-sm hover:scale-105"
      >
        <Play className="mr-2 w-4 h-4 group-hover:scale-110" />
        Explorer les cours
      </Link>

      {/* Indicateur de test A/B (visible seulement en développement) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mt-4 p-2 bg-gray-100 rounded-lg text-xs text-gray-500">
          🧪 A/B Test: Variant {selectedVariant.id} (Poids: {selectedVariant.testWeight}%)
        </div>
      )}
    </div>
  );
};

export default CTAVariants;

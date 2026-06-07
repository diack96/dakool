import Link from 'next/link';
import { Award, Users, GraduationCap, Smartphone, ArrowRight } from 'lucide-react';

const FEATURES = [
  {
    icon: Award,
    title: 'Cours de Qualité Premium',
    description: 'Conçus par des experts africains en activité, nos cours intègrent les réalités du marché de l\'emploi local et international pour une montée en compétences immédiatement applicable.',
    gradientClass: 'bg-blue-50 dark:bg-gray-800',
    iconBg: 'bg-blue-600',
  },
  {
    icon: Users,
    title: 'Communauté Panafricaine',
    description: 'Rejoignez des apprenants répartis dans 7 pays africains, partagez vos projets et accédez à un réseau de mentors professionnels qui comprennent vos enjeux de carrière.',
    gradientClass: 'bg-orange-50 dark:bg-gray-800',
    iconBg: 'bg-orange-600',
  },
  {
    icon: GraduationCap,
    title: 'Certifications Reconnues',
    description: 'Vos certificats Waraba Academy valorisent vos candidatures et sont reconnus par des recruteurs en Afrique francophone et dans les entreprises internationales.',
    gradientClass: 'bg-blue-50 dark:bg-gray-800',
    iconBg: 'bg-blue-600',
  },
  {
    icon: Smartphone,
    title: 'Optimisé pour l\'Afrique',
    description: 'Interface mobile-first, consommation de données réduite et paiement via Mobile Money (Wave, Orange Money, MTN) pour un accès sans friction depuis n\'importe où.',
    gradientClass: 'bg-orange-50 dark:bg-gray-800',
    iconBg: 'bg-orange-600',
  },
] as const;

const Features: React.FC = () => {
  return (
    <section
      className="py-12 md:py-16 lg:py-20 bg-white dark:bg-gray-900 relative transition-colors"
      aria-labelledby="features-heading"
    >
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-5 dark:opacity-10" aria-hidden="true">
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(circle at 25% 25%, #3b82f6 2px, transparent 2px), radial-gradient(circle at 75% 75%, #f97316 2px, transparent 2px)',
          backgroundSize: '50px 50px',
        }} />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <header className="text-center mb-12 sm:mb-16 lg:mb-20">
          <div className="inline-flex items-center px-3 sm:px-4 py-1.5 sm:py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-900 dark:text-blue-300 text-xs sm:text-sm font-medium rounded-full mb-4 sm:mb-6">
            <svg className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Pourquoi nous choisir ?
          </div>
          <h2
            id="features-heading"
            className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-gray-100 mb-4 sm:mb-6 px-2"
          >
            Conçu pour les apprenants
            <span className="text-blue-600 dark:text-blue-400"> africains</span>
          </h2>
          <p className="text-base sm:text-lg lg:text-xl text-gray-700 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed px-2">
            Waraba Academy est la première plateforme EdTech pensée pour les réalités et les ambitions du continent africain
          </p>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 lg:gap-8" role="list">
          {FEATURES.map((feature, index) => (
            <article
              key={index}
              role="listitem"
              className={`group p-6 lg:p-8 ${feature.gradientClass} rounded-2xl transition-all duration-300 border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-xl transform hover:-translate-y-1`}
            >
              <div className={`w-14 h-14 sm:w-16 sm:h-16 ${feature.iconBg} rounded-xl flex items-center justify-center mb-4 sm:mb-6 group-hover:scale-105 transition-transform duration-300 shadow-lg`}>
                <feature.icon className="w-7 h-7 sm:w-8 sm:h-8 text-white" aria-hidden="true" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-gray-100 mb-3 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                {feature.title}
              </h3>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 leading-relaxed">
                {feature.description}
              </p>
            </article>
          ))}
        </div>

        {/* CTA dans la section */}
        <div className="text-center mt-12 lg:mt-16">
          <Link
            href="/about"
            className="group inline-flex items-center px-6 sm:px-8 py-3 sm:py-4 bg-blue-600 text-white rounded-xl sm:rounded-2xl hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 transition-all duration-300 font-semibold text-base sm:text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1"
          >
            En savoir plus sur Waraba Academy
            <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default Features;

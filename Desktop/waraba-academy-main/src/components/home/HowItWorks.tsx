'use client';


import { UserPlus, BookOpen, GraduationCap, Award } from 'lucide-react';

const HowItWorks: React.FC = () => {
  const steps = [
    {
      number: '01',
      icon: UserPlus,
      title: 'Créez votre compte',
      description: 'Inscription gratuite en moins de 2 minutes. Accédez immédiatement à votre espace d\'apprentissage.',
      color: 'from-earth-500 to-earth-600',
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600',
    },
    {
      number: '02',
      icon: BookOpen,
      title: 'Choisissez votre formation',
      description: 'Explorez notre catalogue de 50+ cours dans tous les domaines du numérique. Cours gratuits et premium disponibles.',
      color: 'from-blue-500 to-blue-600',
      iconBg: 'bg-orange-100',
      iconColor: 'text-orange-600',
    },
    {
      number: '03',
      icon: GraduationCap,
      title: 'Apprenez à votre rythme',
      description: 'Vidéos, exercices pratiques, quiz interactifs. Suivez votre progression et obtenez des certificats reconnus.',
      color: 'from-earth-500 to-earth-600',
      iconBg: 'bg-teal-100',
      iconColor: 'text-teal-600',
    },
    {
      number: '04',
      icon: Award,
      title: 'Obtenez votre certification',
      description: 'Validez vos compétences avec des certificats reconnus par les entreprises. Boostez votre carrière !',
      color: 'from-gold-500 to-earth-600',
      iconBg: 'bg-green-100',
      iconColor: 'text-green-600',
    },
  ];

  return (
    <section className="py-12 md:py-16 lg:py-20 bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-800 dark:to-gray-900 relative overflow-hidden transition-colors">
      {/* Pattern adinkra en overlay discret */}
      <div className="absolute inset-0 pattern-adinkra opacity-[0.045] dark:opacity-[0.08] pointer-events-none" aria-hidden="true" />

      {/* Background décoratif */}
      <div className="absolute inset-0 opacity-5 dark:opacity-10">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-400 rounded-full filter blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-orange-400 rounded-full filter blur-3xl"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8 sm:mb-12 lg:mb-16">
          <div className="inline-flex items-center px-4 py-2 bg-earth-100 dark:bg-earth-900/30 text-earth-800 dark:text-earth-300 text-sm font-medium rounded-full mb-4 sm:mb-6 border border-earth-200 dark:border-earth-700/40">
            {/* Losange adinkra miniature */}
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="mr-2 shrink-0" aria-hidden="true">
              <path d="M7 1 L13 7 L7 13 L1 7 Z" stroke="currentColor" strokeWidth="1.5" fill="none"/>
              <circle cx="7" cy="7" r="1.5" fill="currentColor"/>
            </svg>
            Processus simple
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 dark:text-gray-100 mb-4 sm:mb-6">
            Comment ça marche ?
          </h2>
          <p className="text-base sm:text-lg lg:text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto px-2">
            Transformez votre carrière en 4 étapes simples. Inscrivez-vous gratuitement et commencez dès aujourd'hui.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8 mb-12">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div
                key={index}
                className="relative group"
              >
                {/* Ligne de connexion (sauf dernier élément) */}
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-12 left-[100%] w-full h-0.5 bg-gradient-to-r from-gray-300 to-transparent z-0">
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white border-2 border-gray-300 rounded-full"></div>
                  </div>
                )}

                <div className="relative bg-white dark:bg-gray-800 rounded-2xl p-6 sm:p-8 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100 dark:border-gray-700">
                  {/* Numéro */}
                  <div className={`absolute -top-3 -left-3 sm:-top-4 sm:-left-4 w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br ${step.color} rounded-full flex items-center justify-center text-white font-bold text-sm sm:text-lg shadow-lg`}>
                    {step.number}
                  </div>

                  {/* Icône */}
                  <div className={`w-16 h-16 ${step.iconBg} dark:bg-gray-700 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className={`w-8 h-8 ${step.iconColor} dark:text-gray-300`} />
                  </div>

                  {/* Contenu */}
                  <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-3">
                    {step.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};

export default HowItWorks;


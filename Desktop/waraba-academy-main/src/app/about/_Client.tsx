'use client';

import Link from 'next/link';
import { Users, Target, Award, Globe, BookOpen, ArrowRight } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-50 pt-24">
      {/* Hero Section */}
      <section className="bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              À propos de Waraba Academy
            </h1>
            <p className="text-xl text-gray-700 max-w-3xl mx-auto">
              Nous sommes une plateforme d&apos;apprentissage en ligne dédiée à l&apos;excellence
              et à l&apos;épanouissement professionnel en Afrique et dans le monde.
            </p>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Notre Mission</h2>
              <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                Rendre l&apos;éducation de qualité accessible à tous, en proposant des formations
                professionnelles adaptées aux besoins du marché africain et international.
              </p>
              <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                Nous croyons que chaque individu mérite d&apos;avoir accès aux connaissances
                et compétences nécessaires pour réussir dans sa carrière.
              </p>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Target className="w-6 h-6 text-orange-500" />
                  <span className="text-gray-700 font-medium">Excellence</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-6 h-6 text-blue-600" />
                  <span className="text-gray-700 font-medium">Communauté</span>
                </div>
                <div className="flex items-center gap-2">
                  <Globe className="w-6 h-6 text-green-600" />
                  <span className="text-gray-700 font-medium">Innovation</span>
                </div>
              </div>
            </div>

            <div className="bg-blue-600 rounded-3xl p-12 text-white text-center">
              <BookOpen className="w-20 h-20 mx-auto mb-6 opacity-90" aria-hidden="true" />
              <h3 className="text-2xl font-bold mb-4">Notre Vision</h3>
              <p className="text-lg text-white/90">
                Devenir la référence en matière de formation en ligne en Afrique,
                en connectant talents et opportunités pour un avenir meilleur.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Chiffres clés</h2>
            <p className="text-lg text-gray-600">Notre impact en quelques chiffres</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: Users, value: '5000+', label: 'Étudiants formés', color: 'text-blue-600' },
              { icon: BookOpen, value: '100+', label: 'Cours disponibles', color: 'text-orange-500' },
              { icon: Award, value: '95%', label: 'Taux de satisfaction', color: 'text-green-600' },
              { icon: Globe, value: '25+', label: 'Pays couverts', color: 'text-purple-600' },
            ].map((stat, index) => (
              <div key={index} className="text-center">
                <div
                  className={`w-16 h-16 ${stat.color} bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg`}
                >
                  <stat.icon className="w-8 h-8" />
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-2">{stat.value}</div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Nos Valeurs</h2>
            <p className="text-lg text-gray-600">Les principes qui guident nos actions</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                title: 'Excellence',
                description:
                  "Nous visons l'excellence dans tout ce que nous faisons, de la qualité de nos cours à l'expérience utilisateur.",
                icon: Award,
                color: 'bg-blue-600',
              },
              {
                title: 'Innovation',
                description:
                  "Nous adoptons les dernières technologies et méthodes d'apprentissage pour offrir une expérience unique.",
                icon: BookOpen,
                color: 'bg-orange-500',
              },
              {
                title: 'Communauté',
                description:
                  "Nous croyons en la force du partage et de l'entraide pour favoriser l'apprentissage collectif.",
                icon: Users,
                color: 'bg-green-600',
              },
              {
                title: 'Accessibilité',
                description:
                  "L'éducation doit être accessible à tous, peu importe la situation géographique ou financière.",
                icon: Globe,
                color: 'bg-purple-600',
              },
              {
                title: 'Qualité',
                description:
                  "Chaque cours est rigoureusement sélectionné et validé par nos experts pour garantir la qualité.",
                icon: Target,
                color: 'bg-red-600',
              },
              {
                title: 'Impact',
                description:
                  "Nous mesurons notre succès par l'impact positif sur la carrière de nos étudiants.",
                icon: Award,
                color: 'bg-indigo-600',
              },
            ].map((value, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl p-8 border border-gray-100 hover:border-orange-200 transition-all duration-300 hover:shadow-xl"
              >
                <div
                  className={`w-16 h-16 ${value.color} rounded-2xl flex items-center justify-center text-white text-2xl mb-6`}
                >
                  <value.icon className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">{value.title}</h3>
                <p className="text-gray-600 leading-relaxed">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-blue-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-white mb-6">
            Rejoignez l'aventure Waraba Academy
          </h2>
          <p className="text-xl text-blue-100 mb-10 leading-relaxed">
            Découvrez nos formations et commencez votre transformation professionnelle dès aujourd'hui
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/courses"
              className="inline-flex items-center px-8 py-4 bg-white text-blue-600 font-semibold rounded-xl hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-blue-600 transition-all duration-300 transform hover:scale-105 shadow-lg"
              aria-label="Découvrir tous nos cours disponibles"
            >
              Découvrir nos cours
              <ArrowRight className="ml-2 w-5 h-5" aria-hidden="true" />
            </Link>

            <Link
              href="/contact"
              className="inline-flex items-center px-8 py-4 bg-orange-500 text-white font-semibold rounded-xl hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-blue-600 transition-all duration-300 transform hover:scale-105 shadow-lg"
              aria-label="Nous contacter"
            >
              Nous contacter
              <ArrowRight className="ml-2 w-5 h-5" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

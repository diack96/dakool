'use client';


import Link from 'next/link';
import Image from 'next/image';
import {
  BookOpen,
  FolderOpen,
  Settings,
  Users,
  BarChart3,
  Plus,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

export default function SystemOverview () {
  const systemFeatures = [
    {
      icon: BookOpen,
      title: 'Gestion des cours',
      description: 'Créez, modifiez et organisez vos formations avec une interface intuitive',
      href: '/admin/courses',
      color: 'bg-blue-600',
      stats: '0 cours créés',
    },
    {
      icon: FolderOpen,
      title: 'Organisation par catégories',
      description: 'Structurez vos formations par domaines d\'expertise pour une navigation claire',
      href: '/admin/categories',
      color: 'bg-orange-500',
      stats: '0 catégories',
    },
    {
      icon: Users,
      title: 'Gestion des utilisateurs',
      description: 'Administrez les étudiants, instructeurs et administrateurs de votre plateforme',
      href: '/admin/users',
      color: 'bg-green-600',
      stats: '0 utilisateurs',
    },
    {
      icon: BarChart3,
      title: 'Analytics et rapports',
      description: 'Suivez les performances de vos formations et la progression des apprenants',
      href: '/admin/reports',
      color: 'bg-purple-600',
      stats: '0 rapports',
    },
  ];

  const quickActions = [
    {
      name: 'Créer votre premier cours',
      description: 'Commencez par créer une formation complète',
      href: '/admin/courses/new',
      icon: Plus,
      color: 'bg-orange-500 hover:bg-orange-600',
      priority: 'high',
    },
    {
      name: 'Organiser vos catégories',
      description: 'Structurez vos formations par domaines',
      href: '/admin/categories/new',
      icon: FolderOpen,
      color: 'bg-blue-600 hover:bg-blue-700',
      priority: 'medium',
    },
    {
      name: 'Configurer la plateforme',
      description: 'Personnalisez l\'apparence et les paramètres',
      href: '/admin/settings',
      icon: Settings,
      color: 'bg-gray-600 hover:bg-gray-700',
      priority: 'low',
    },
  ];

  return (
    <section className="py-20 bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-blue-100 text-blue-800 text-sm font-medium mb-6">
            <Sparkles className="w-4 h-4 mr-2" />
            Vue d'ensemble du système
          </div>

          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Gérez votre plateforme de formation
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            WARABA ACADEMY vous offre tous les outils nécessaires pour créer, organiser et gérer vos formations professionnelles
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {systemFeatures.map((feature, index) => {
            const featureImages: string[] = [
              'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=100&h=100&fit=crop&crop=faces',
              'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=100&h=100&fit=crop&crop=faces',
              'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&h=100&fit=crop&crop=faces',
              'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&h=100&fit=crop&crop=faces',
            ];
            const imageIndex = index % featureImages.length;
            const imageSrc: string = featureImages[imageIndex] ?? featureImages[0]!;
            return (
              <div key={index} className="group bg-white rounded-2xl p-6 border border-gray-100 hover:border-blue-200 transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
                <div className={`w-16 h-16 ${feature.color} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 overflow-hidden ring-2 ring-white/50`}>
                  <Image
                    src={imageSrc}
                    alt={feature.title}
                    width={64}
                    height={64}
                    className="w-full h-full object-cover"
                  />
                </div>

                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>

                <p className="text-gray-600 text-sm mb-4 leading-relaxed">
                  {feature.description}
                </p>

                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500 font-medium">
                    {feature.stats}
                  </span>
                  <Link
                    href={feature.href}
                    className="text-blue-600 hover:text-blue-700 text-sm font-medium group-hover:translate-x-1 transition-transform"
                  >
                  Accéder
                    <ArrowRight className="w-3 h-3 inline ml-1" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-2xl border border-gray-100 p-8 mb-16">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              Actions rapides recommandées
            </h3>
            <p className="text-gray-600">
              Commencez par ces étapes essentielles pour configurer votre plateforme
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {quickActions.map((action, index) => (
              <div key={index} className="group">
                <Link
                  href={action.href}
                  className={`block ${action.color} text-white p-6 rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-lg`}
                >
                  <div className="flex items-center mb-4">
                    <action.icon className="w-8 h-8 mr-3" />
                    <span className="text-lg font-semibold">{action.name}</span>
                  </div>

                  <p className="text-blue-100 text-sm leading-relaxed mb-4">
                    {action.description}
                  </p>

                  <div className="flex items-center justify-between">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      action.priority === 'high' ? 'bg-orange-200 text-orange-800' :
                        action.priority === 'medium' ? 'bg-blue-200 text-blue-800' :
                          'bg-gray-200 text-gray-800'
                    }`}>
                      {action.priority === 'high' ? 'Priorité haute' :
                        action.priority === 'medium' ? 'Priorité moyenne' : 'Priorité basse'}
                    </span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
              </div>
            ))}
          </div>
        </div>

        {/* System Benefits */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <div className="text-center">
            <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center mx-auto mb-4 overflow-hidden ring-2 ring-orange-200">
              <Image
                src="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&h=100&fit=crop&crop=faces"
                alt="Objectifs"
                width={64}
                height={64}
                className="w-full h-full object-cover"
              />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Objectifs clairs</h3>
            <p className="text-gray-600">
              Chaque fonctionnalité est conçue pour vous aider à atteindre vos objectifs de formation
            </p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4 overflow-hidden ring-2 ring-blue-200">
              <Image
                src="https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=100&h=100&fit=crop&crop=faces"
                alt="Rapidité"
                width={64}
                height={64}
                className="w-full h-full object-cover"
              />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Rapidité d'exécution</h3>
            <p className="text-gray-600">
              Interface intuitive qui vous permet de créer et gérer vos formations rapidement
            </p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4 overflow-hidden ring-2 ring-green-200">
              <Image
                src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&h=100&fit=crop&crop=faces"
                alt="Qualité"
                width={64}
                height={64}
                className="w-full h-full object-cover"
              />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Qualité garantie</h3>
            <p className="text-gray-600">
              Outils professionnels pour créer des formations de qualité exceptionnelle
            </p>
          </div>
        </div>

        {/* CTA Final */}
        <div className="text-center">
          <div className="bg-gradient-to-r from-blue-600 to-orange-500 rounded-2xl p-8 text-white">
            <h3 className="text-2xl font-bold mb-4">
              Prêt à transformer votre approche de la formation ?
            </h3>
            <p className="text-blue-100 mb-8 max-w-2xl mx-auto">
              Rejoignez des milliers d'instructeurs qui utilisent WARABA ACADEMY pour créer des formations exceptionnelles
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/admin"
                className="inline-flex items-center px-8 py-4 bg-white text-blue-600 font-semibold rounded-xl hover:bg-gray-50 transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                <Settings className="w-5 h-5 mr-2" />
                Accéder à l'admin
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>

              <Link
                href="/courses"
                className="inline-flex items-center px-8 py-4 bg-orange-500 text-white font-semibold rounded-xl hover:bg-orange-600 transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                <BookOpen className="w-5 h-5 mr-2" />
                Voir les formations
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

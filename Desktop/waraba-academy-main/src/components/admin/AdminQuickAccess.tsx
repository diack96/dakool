'use client';


import Link from 'next/link';
import { Settings, Plus, BookOpen, FolderOpen, BarChart3, Users, ArrowRight } from 'lucide-react';

interface AdminQuickAccessProps {
  type: 'courses' | 'categories' | 'general';
  className?: string;
}

export default function AdminQuickAccess ({ type, className = '' }: AdminQuickAccessProps) {
  const getContent = () => {
    switch (type) {
    case 'courses':
      return {
        title: 'Gérer vos formations',
        description: 'Créez, modifiez et organisez vos cours depuis l\'interface d\'administration',
        icon: BookOpen,
        primaryAction: {
          href: '/admin/courses/new',
          label: 'Créer un cours',
          icon: Plus,
        },
        secondaryAction: {
          href: '/admin/courses',
          label: 'Voir tous les cours',
          icon: BookOpen,
        },
      };
    case 'categories':
      return {
        title: 'Organiser vos catégories',
        description: 'Structurez vos formations par domaines d\'expertise',
        icon: FolderOpen,
        primaryAction: {
          href: '/admin/categories/new',
          label: 'Créer une catégorie',
          icon: Plus,
        },
        secondaryAction: {
          href: '/admin/categories',
          label: 'Gérer les catégories',
          icon: FolderOpen,
        },
      };
    default:
      return {
        title: 'Accéder à l\'administration',
        description: 'Gérez votre plateforme de formation depuis l\'interface d\'administration',
        icon: Settings,
        primaryAction: {
          href: '/admin',
          label: 'Tableau de bord',
          icon: BarChart3,
        },
        secondaryAction: {
          href: '/admin/courses',
          label: 'Gérer les cours',
          icon: BookOpen,
        },
      };
    }
  };

  const content = getContent();

  return (
    <div className={`bg-gradient-to-br from-blue-50 to-orange-50 border border-blue-200 rounded-2xl p-8 ${className}`}>
      <div className="text-center mb-6">
        <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <content.icon className="w-8 h-8 text-white" />
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-2">
          {content.title}
        </h3>
        <p className="text-gray-600 max-w-md mx-auto">
          {content.description}
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 justify-center mb-6">
        <Link
          href={content.primaryAction.href}
          className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-all duration-300 transform hover:scale-105 shadow-lg"
        >
          <content.primaryAction.icon className="w-5 h-5 mr-2" />
          {content.primaryAction.label}
        </Link>

        <Link
          href={content.secondaryAction.href}
          className="inline-flex items-center px-6 py-3 bg-white text-blue-600 font-semibold rounded-xl border border-blue-200 hover:bg-blue-50 transition-all duration-300"
        >
          <content.secondaryAction.icon className="w-5 h-5 mr-2" />
          {content.secondaryAction.label}
        </Link>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
        <div className="bg-white rounded-xl p-4 border border-blue-100">
          <div className="text-2xl font-bold text-blue-600">0</div>
          <div className="text-sm text-gray-600">Cours créés</div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-orange-100">
          <div className="text-2xl font-bold text-orange-600">0</div>
          <div className="text-sm text-gray-600">Catégories</div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-green-100">
          <div className="text-2xl font-bold text-green-600">0</div>
          <div className="text-sm text-gray-600">Étudiants</div>
        </div>
      </div>

      {/* Additional Links */}
      <div className="mt-6 pt-6 border-t border-blue-200">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link
            href="/admin/users"
            className="flex items-center justify-between p-3 bg-white rounded-lg border border-blue-100 hover:border-blue-300 transition-colors group"
          >
            <div className="flex items-center">
              <Users className="w-5 h-5 text-blue-600 mr-3" />
              <span className="text-gray-700 group-hover:text-blue-600 transition-colors">Gérer les utilisateurs</span>
            </div>
            <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-blue-600 transition-colors" />
          </Link>

          <Link
            href="/admin/reports"
            className="flex items-center justify-between p-3 bg-white rounded-lg border border-blue-100 hover:border-blue-300 transition-colors group"
          >
            <div className="flex items-center">
              <BarChart3 className="w-5 h-5 text-blue-600 mr-3" />
              <span className="text-gray-700 group-hover:text-blue-600 transition-colors">Voir les rapports</span>
            </div>
            <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-blue-600 transition-colors" />
          </Link>
        </div>
      </div>
    </div>
  );
}

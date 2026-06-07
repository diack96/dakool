'use client';

import Image from 'next/image';
import { useState } from 'react';
import Link from 'next/link';
import {
  BookOpen,
  FolderOpen,
  Settings,
  Home,
  Users,
  BarChart3,
  Plus,
  ChevronDown,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

interface SmartNavigationProps {
  currentPage: 'home' | 'courses' | 'categories' | 'admin';
  className?: string;
}

export default function SmartNavigation ({ currentPage, className = '' }: SmartNavigationProps) {
  const [isOpen, setIsOpen] = useState(false);

  const navigationItems = [
    {
      name: 'Accueil',
      href: '/',
      icon: Home,
      description: 'Page principale de WARABA ACADEMY',
      isActive: currentPage === 'home',
    },
    {
      name: 'Formations',
      href: '/courses',
      icon: BookOpen,
      description: 'Découvrez nos cours et formations',
      isActive: currentPage === 'courses',
      subItems: [
        { name: 'Tous les cours', href: '/courses', icon: BookOpen },
        { name: 'Par catégorie', href: '/categories', icon: FolderOpen },
        { name: 'Créer un cours', href: '/admin/courses/new', icon: Plus, admin: true },
      ],
    },
    {
      name: 'Catégories',
      href: '/categories',
      icon: FolderOpen,
      description: 'Explorez par domaine d\'expertise',
      isActive: currentPage === 'categories',
      subItems: [
        { name: 'Toutes les catégories', href: '/categories', icon: FolderOpen },
        { name: 'Créer une catégorie', href: '/admin/categories/new', icon: Plus, admin: true },
      ],
    },
    {
      name: 'Administration',
      href: '/admin',
      icon: Settings,
      description: 'Gérez votre plateforme',
      isActive: currentPage === 'admin',
      admin: true,
      subItems: [
        { name: 'Tableau de bord', href: '/admin', icon: BarChart3 },
        { name: 'Gérer les cours', href: '/admin/courses', icon: BookOpen },
        { name: 'Gérer les catégories', href: '/admin/categories', icon: FolderOpen },
        { name: 'Utilisateurs', href: '/admin/users', icon: Users },
        { name: 'Rapports', href: '/admin/reports', icon: BarChart3 },
      ],
    },
  ];

  const getQuickActions = () => {
    switch (currentPage) {
    case 'courses':
      return [
        { name: 'Créer un cours', href: '/admin/courses/new', icon: Plus, color: 'bg-orange-500' },
        { name: 'Gérer les cours', href: '/admin/courses', icon: BookOpen, color: 'bg-blue-600' },
      ];
    case 'categories':
      return [
        { name: 'Créer une catégorie', href: '/admin/categories/new', icon: Plus, color: 'bg-orange-500' },
        { name: 'Gérer les catégories', href: '/admin/categories', icon: FolderOpen, color: 'bg-blue-600' },
      ];
    case 'home':
      return [
        { name: 'Voir les cours', href: '/courses', icon: BookOpen, color: 'bg-blue-600' },
        { name: 'Explorer les catégories', href: '/categories', icon: FolderOpen, color: 'bg-orange-500' },
      ];
    default:
      return [
        { name: 'Tableau de bord', href: '/admin', icon: BarChart3, color: 'bg-blue-600' },
        { name: 'Gérer les cours', href: '/admin/courses', icon: BookOpen, color: 'bg-orange-500' },
      ];
    }
  };

  const quickActions = getQuickActions();

  return (
    <div className={`bg-white border-b border-gray-200 shadow-sm ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo et navigation principale */}
          <div className="flex items-center space-x-8">
            <Link href="/" className="flex items-center space-x-3">
              <Image
                src="/waraba-academy-gradient.svg"
                alt="WARABA ACADEMY"
                width={120}
                height={32}
                className="h-8 w-auto"
              />
            </Link>

            {/* Navigation principale */}
            <nav className="hidden md:flex items-center space-x-1">
              {navigationItems.map((item) => (
                <div key={item.name} className="relative group">
                  <Link
                    href={item.href}
                    className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      item.isActive
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                    }`}
                  >
                    <item.icon className="w-4 h-4 mr-2" />
                    {item.name}
                    {item.subItems && (
                      <ChevronDown className="w-4 h-4 ml-1 transition-transform group-hover:rotate-180" />
                    )}
                  </Link>

                  {/* Dropdown pour les sous-éléments */}
                  {item.subItems && (
                    <div className="absolute left-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                      <div className="py-2">
                        {item.subItems.map((subItem) => (
                          <Link
                            key={subItem.name}
                            href={subItem.href}
                            className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-blue-600 transition-colors"
                          >
                            <subItem.icon className="w-4 h-4 mr-3" />
                            {subItem.name}
                            {(subItem as any).admin && (
                              <span className="ml-auto px-2 py-1 text-xs bg-orange-100 text-orange-700 rounded-full">
                                Admin
                              </span>
                            )}
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </nav>
          </div>

          {/* Actions rapides */}
          <div className="flex items-center space-x-4">
            {/* Actions rapides contextuelles */}
            <div className="hidden lg:flex items-center space-x-2">
              {quickActions.map((action) => (
                <Link
                  key={action.name}
                  href={action.href}
                  className={`inline-flex items-center px-3 py-2 text-sm font-medium text-white rounded-lg transition-all duration-200 hover:scale-105 ${action.color}`}
                >
                  <action.icon className="w-4 h-4 mr-2" />
                  {action.name}
                </Link>
              ))}
            </div>

            {/* Bouton admin mobile */}
            <Link
              href="/admin"
              className="md:hidden inline-flex items-center px-3 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Settings className="w-4 h-4 mr-2" />
              Admin
            </Link>

            {/* Menu mobile */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden inline-flex items-center justify-center p-2 rounded-lg text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>

        {/* Menu mobile */}
        {isOpen && (
          <div className="md:hidden border-t border-gray-200 py-4">
            <nav className="space-y-2">
              {navigationItems.map((item) => (
                <div key={item.name}>
                  <Link
                    href={item.href}
                    className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      item.isActive
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                    }`}
                    onClick={() => setIsOpen(false)}
                  >
                    <item.icon className="w-4 h-4 mr-3" />
                    {item.name}
                  </Link>

                  {/* Sous-éléments mobiles */}
                  {item.subItems && (
                    <div className="ml-6 mt-2 space-y-1">
                      {item.subItems.map((subItem) => (
                        <Link
                          key={subItem.name}
                          href={subItem.href}
                          className="flex items-center px-3 py-2 text-sm text-gray-600 hover:text-blue-600 transition-colors"
                          onClick={() => setIsOpen(false)}
                        >
                          <subItem.icon className="w-4 h-4 mr-3" />
                          {subItem.name}
                          {(subItem as any).admin && (
                            <span className="ml-auto px-2 py-1 text-xs bg-orange-100 text-orange-700 rounded-full">
                              Admin
                            </span>
                          )}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </nav>

            {/* Actions rapides mobiles */}
            <div className="pt-4 border-t border-gray-200">
              <div className="space-y-2">
                {quickActions.map((action) => (
                  <Link
                    key={action.name}
                    href={action.href}
                    className={`flex items-center px-3 py-2 text-sm font-medium text-white rounded-lg transition-colors ${action.color}`}
                    onClick={() => setIsOpen(false)}
                  >
                    <action.icon className="w-4 h-4 mr-3" />
                    {action.name}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Barre de progression contextuelle */}
      <div className="bg-gradient-to-r from-blue-50 to-orange-50 border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-4">
              <span className="text-gray-600">
                <Sparkles className="w-4 h-4 inline mr-1 text-orange-500" />
                Navigation intelligente
              </span>
              <span className="text-gray-500">
                {currentPage === 'home' && 'Découvrez nos formations'}
                {currentPage === 'courses' && 'Gérez vos cours depuis l\'admin'}
                {currentPage === 'categories' && 'Organisez vos catégories'}
                {currentPage === 'admin' && 'Gérez votre plateforme'}
              </span>
            </div>

            <div className="flex items-center space-x-2">
              <Link
                href="/admin"
                className="inline-flex items-center text-xs text-blue-600 hover:text-blue-700 transition-colors"
              >
                <Settings className="w-3 h-3 mr-1" />
                Admin
                <ArrowRight className="w-3 h-3 ml-1" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

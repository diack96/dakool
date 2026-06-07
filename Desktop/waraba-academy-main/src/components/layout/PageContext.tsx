'use client';


import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import {
  BookOpen,
  FolderOpen,
  Settings,
  Home,
  Plus,
  UserPlus,
  GraduationCap,
  Play,
} from 'lucide-react';

export default function PageContext () {
  const pathname = usePathname();
  const { user } = useAuth();
  const isAuthenticated = !!user;

  // Contexte simplifié selon le protocole e-learning
  const getPageContext = () => {
    if (pathname === '/') {
      if (isAuthenticated && user?.role === 'admin') {
        return {
          title: 'Administration - WARABA ACADEMY',
          description: 'Gérez votre plateforme de formation',
          actions: [
            { name: 'Gérer les cours', href: '/admin/courses', icon: BookOpen, color: 'bg-blue-600' },
            { name: 'Gérer les catégories', href: '/admin/categories', icon: FolderOpen, color: 'bg-orange-500' },
          ],
        };
      } else if (isAuthenticated) {
        return {
          title: 'Mon espace d\'apprentissage',
          description: 'Continuez votre formation',
          actions: [
            { name: 'Mes cours', href: '/dashboard', icon: Play, color: 'bg-blue-600' },
            { name: 'Ma progression', href: '/dashboard', icon: GraduationCap, color: 'bg-orange-500' },
          ],
        };
      } else {
        return {
          title: 'Découvrez nos formations',
          description: 'Transformez votre carrière avec nos programmes certifiés',
          actions: [
            { name: 'Voir nos programmes', href: '/courses', icon: BookOpen, color: 'bg-blue-600' },
            { name: 'Commencer gratuitement', href: '/register', icon: UserPlus, color: 'bg-orange-500' },
          ],
        };
      }
    }

    if (pathname.startsWith('/courses')) {
      if (isAuthenticated && user?.role === 'admin') {
        return {
          title: 'Gestion des formations',
          description: 'Administrez votre catalogue',
          actions: [
            { name: 'Créer un cours', href: '/admin/courses/new', icon: Plus, color: 'bg-orange-500' },
          ],
        };
      } else if (isAuthenticated) {
        return {
          title: 'Catalogue des formations',
          description: 'Découvrez de nouveaux programmes',
          actions: [
            { name: 'Mes cours', href: '/dashboard', icon: Play, color: 'bg-blue-600' },
          ],
        };
      } else {
        return {
          title: 'Nos programmes de formation',
          description: 'Découvrez nos formations professionnelles',
          actions: [
            { name: 'Commencer gratuitement', href: '/register', icon: UserPlus, color: 'bg-blue-600' },
          ],
        };
      }
    }

    if (pathname.startsWith('/categories')) {
      if (isAuthenticated && user?.role === 'admin') {
        return {
          title: 'Gestion des catégories',
          description: 'Organisez vos formations',
          actions: [
            { name: 'Créer une catégorie', href: '/admin/categories/new', icon: Plus, color: 'bg-orange-500' },
          ],
        };
      } else if (isAuthenticated) {
        return {
          title: 'Domaines d\'expertise',
          description: 'Explorez nos spécialités',
          actions: [
            { name: 'Mes cours', href: '/dashboard', icon: Play, color: 'bg-blue-600' },
          ],
        };
      } else {
        return {
          title: 'Nos spécialités',
          description: 'Choisissez votre domaine d\'expertise',
          actions: [
            { name: 'Commencer gratuitement', href: '/register', icon: UserPlus, color: 'bg-blue-600' },
          ],
        };
      }
    }

    if (pathname.startsWith('/admin')) {
      if (isAuthenticated && user?.role === 'admin') {
        return {
          title: 'Administration',
          description: 'Gérez votre plateforme',
          actions: [
            { name: 'Nouveau cours', href: '/admin/courses/new', icon: Plus, color: 'bg-orange-500' },
            { name: 'Tableau de bord', href: '/admin', icon: Settings, color: 'bg-blue-600' },
          ],
        };
      } else {
        return {
          title: 'Accès refusé',
          description: 'Vous devez être administrateur',
          actions: [
            { name: 'Retour à l\'accueil', href: '/', icon: Home, color: 'bg-blue-600' },
          ],
        };
      }
    }

    // Page par défaut
    return {
      title: 'WARABA ACADEMY',
      description: 'Transformez votre avenir professionnel',
      actions: [
        { name: 'Découvrir nos programmes', href: '/courses', icon: BookOpen, color: 'bg-blue-600' },
        { name: 'Commencer gratuitement', href: '/register', icon: UserPlus, color: 'bg-orange-500' },
      ],
    };
  };

  const context = getPageContext();

  return (
    <div className="bg-gradient-to-r from-blue-50 to-orange-50 border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          {/* Contexte de la page - Simplifié */}
          <div className="flex-1">
            <h1 className="text-xl font-bold text-gray-900 mb-2">
              {context.title}
            </h1>
            <p className="text-gray-600">
              {context.description}
            </p>
          </div>

          {/* Actions rapides - Simplifiées */}
          <div className="flex flex-wrap gap-3">
            {context.actions.map((action, index) => (
              <Link
                key={index}
                href={action.href}
                className={`${action.color} text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:scale-105 hover:shadow-lg inline-flex items-center`}
              >
                <action.icon className="w-4 h-4 mr-2" />
                {action.name}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

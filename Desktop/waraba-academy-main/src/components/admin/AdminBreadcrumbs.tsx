'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';
import { useEffect, useState } from 'react';

const routeLabels: Record<string, string> = {
  '/admin': 'Dashboard',
  '/admin/users': 'Utilisateurs',
  '/admin/courses': 'Cours',
  '/admin/categories': 'Catégories',
  '/admin/enrollments': 'Inscriptions',
  '/admin/reports': 'Rapports',
  '/admin/settings': 'Paramètres',
  '/admin/courses/new': 'Nouveau cours',
  '/admin/categories/new': 'Nouvelle catégorie',
  '/admin/courses/[id]/edit': 'Modifier',
};

// Fonction pour vérifier si une chaîne est un UUID
function isUUID(str: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
}

// Fonction pour charger le titre d'un cours depuis son UUID
async function loadCourseTitle(courseId: string): Promise<string | null> {
  try {
    const response = await fetch(`/api/admin/courses/${courseId}`, {
      cache: 'no-store',
      credentials: 'include',
    });
    
    if (response.ok) {
      const text = await response.text();
      if (text && text.trim() !== '') {
        try {
          const data = JSON.parse(text);
          if (data.success && data.course?.title) {
            return data.course.title;
          }
        } catch (parseError) {
          console.warn('Erreur parsing JSON AdminBreadcrumbs:', parseError);
        }
      }
    }
  } catch (error) {
    console.warn('Erreur lors du chargement du titre du cours:', error);
  }
  return null;
}

export default function AdminBreadcrumbs() {
  const pathname = usePathname();
  const [courseTitles, setCourseTitles] = useState<Record<string, string>>({});
  const [loadingTitles, setLoadingTitles] = useState<Set<string>>(new Set());

  const paths = pathname.split('/').filter(Boolean);

  // Charger les titres des cours pour les UUIDs détectés
  useEffect(() => {
    // Ne rien faire sur le dashboard principal
    if (pathname === '/admin') {
      return;
    }

    const loadTitles = async () => {
      for (let i = 0; i < paths.length; i++) {
        const path = paths[i];
        // Si c'est un UUID et qu'on est dans la section courses
        if (path && isUUID(path) && paths[i - 1] === 'courses' && !courseTitles[path] && !loadingTitles.has(path)) {
          setLoadingTitles(prev => new Set(prev).add(path));
          const title = await loadCourseTitle(path);
          if (title) {
            setCourseTitles(prev => ({ ...prev, [path]: title }));
          }
          setLoadingTitles(prev => {
            const next = new Set(prev);
            next.delete(path);
            return next;
          });
        }
      }
    };

    loadTitles();
  }, [pathname]); // eslint-disable-line react-hooks/exhaustive-deps

  // Pas de breadcrumbs sur le dashboard principal (après les hooks)
  if (pathname === '/admin') {
    return null;
  }

  const breadcrumbs = paths.map((path, index) => {
    const href = '/' + paths.slice(0, index + 1).join('/');
    
    // Déterminer le label
    let label: string;
    
    // Si c'est un UUID dans la section courses, utiliser le titre chargé
    if (isUUID(path) && paths[index - 1] === 'courses') {
      label = courseTitles[path] || (loadingTitles.has(path) ? 'Chargement...' : path.substring(0, 8) + '...');
    } else if (routeLabels[href]) {
      label = routeLabels[href];
    } else if (path === 'edit') {
      label = 'Modifier';
    } else {
      label = path.charAt(0).toUpperCase() + path.slice(1);
    }
    
    return { href, label };
  });

  return (
    <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-6" aria-label="Breadcrumb">
      <Link
        href="/admin"
        className="flex items-center hover:text-blue-600 transition-colors"
      >
        <Home className="w-4 h-4" />
      </Link>
      {breadcrumbs.map((crumb, index) => (
        <div key={crumb.href} className="flex items-center space-x-2">
          <ChevronRight className="w-4 h-4 text-gray-400" />
          {index === breadcrumbs.length - 1 ? (
            <span className="text-gray-900 font-medium">{crumb.label}</span>
          ) : (
            <Link
              href={crumb.href}
              className="hover:text-blue-600 transition-colors"
            >
              {crumb.label}
            </Link>
          )}
        </div>
      ))}
    </nav>
  );
}


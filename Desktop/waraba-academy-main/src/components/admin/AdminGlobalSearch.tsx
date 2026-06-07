'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Search, X, BookOpen, Users, FolderOpen, Loader2, ArrowRight } from 'lucide-react';

interface SearchResult {
  id: string;
  title: string;
  type: 'course' | 'user' | 'category';
  url: string;
  subtitle?: string;
}

export default function AdminGlobalSearch() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Raccourci clavier Ctrl+K
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
        event.preventDefault();
        setIsOpen(true);
      }
      if (event.key === 'Escape' && isOpen) {
        setIsOpen(false);
        setQuery('');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // Focus sur l'input quand le modal s'ouvre
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  // Fermer le menu si on clique en dehors
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setQuery('');
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
    return undefined;
  }, [isOpen]);

  // Recherche avec debounce
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    setIsLoading(true);
    const timeoutId = setTimeout(async () => {
      try {
        const searchQuery = encodeURIComponent(query.trim());
        const [coursesRes, usersRes, categoriesRes] = await Promise.all([
          fetch(`/api/admin/courses?search=${searchQuery}&limit=5`, { credentials: 'include' }),
          fetch(`/api/admin/users?search=${searchQuery}&limit=5`, { credentials: 'include' }),
          fetch(`/api/admin/categories?search=${searchQuery}&limit=5`, { credentials: 'include' }),
        ]);

        const allResults: SearchResult[] = [];

        // Cours
        if (coursesRes.ok) {
          const coursesData = await coursesRes.json();
          if (coursesData.success && Array.isArray(coursesData.courses)) {
            coursesData.courses.forEach((course: any) => {
              allResults.push({
                id: course.id,
                title: course.title,
                type: 'course',
                url: `/admin/courses/${course.id}`,
                subtitle: course.category?.name || 'Cours',
              });
            });
          }
        }

        // Utilisateurs
        if (usersRes.ok) {
          const usersData = await usersRes.json();
          if (usersData.success && Array.isArray(usersData.users)) {
            usersData.users.forEach((user: any) => {
              allResults.push({
                id: user.id,
                title: `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.email,
                type: 'user',
                url: `/admin/users?userId=${user.id}`,
                subtitle: user.email || user.role,
              });
            });
          }
        }

        // Catégories
        if (categoriesRes.ok) {
          const categoriesData = await categoriesRes.json();
          if (categoriesData.success && Array.isArray(categoriesData.categories)) {
            categoriesData.categories.forEach((category: any) => {
              allResults.push({
                id: category.id,
                title: category.name,
                type: 'category',
                url: `/admin/categories?categoryId=${category.id}`,
                subtitle: `${category.course_count || 0} cours`,
              });
            });
          }
        }

        setResults(allResults);
      } catch (error) {
        console.error('Erreur lors de la recherche:', error);
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [query]);

  const handleResultClick = (url: string) => {
    setIsOpen(false);
    setQuery('');
    router.push(url);
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
    case 'course':
      return BookOpen;
    case 'user':
      return Users;
    case 'category':
      return FolderOpen;
    default:
      return Search;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
    case 'course':
      return 'Cours';
    case 'user':
      return 'Utilisateur';
    case 'category':
      return 'Catégorie';
    default:
      return '';
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors text-gray-600 text-sm font-medium"
        title="Recherche globale (Ctrl+K)"
      >
        <Search className="w-4 h-4" />
        <span className="hidden md:inline">Rechercher...</span>
        <span className="hidden lg:inline text-xs text-gray-400 bg-gray-200 px-2 py-0.5 rounded">Ctrl+K</span>
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-start justify-center pt-20 px-4">
      <div ref={searchRef} className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full animate-fade-in">
        {/* Barre de recherche */}
        <div className="flex items-center gap-4 p-4 border-b border-gray-200">
          <Search className="w-5 h-5 text-gray-400" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Rechercher cours, utilisateurs, catégories..."
            className="flex-1 outline-none text-gray-900 placeholder-gray-400 text-lg"
            autoFocus
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 hover:bg-gray-100 rounded transition-colors"
            >
              <X className="w-4 h-4 text-gray-400" />
            </button>
          )}
          <button
            onClick={() => {
              setIsOpen(false);
              setQuery('');
            }}
            className="px-3 py-1 text-sm text-gray-600 hover:bg-gray-100 rounded transition-colors"
          >
            Échap
          </button>
        </div>

        {/* Résultats */}
        <div className="max-h-96 overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
            </div>
          ) : query.trim() && results.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <p>Aucun résultat trouvé pour "{query}"</p>
            </div>
          ) : !query.trim() ? (
            <div className="p-6">
              <p className="text-sm text-gray-500 mb-4">Tapez pour rechercher...</p>
              <div className="space-y-2 text-sm text-gray-400">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4" />
                  <span>Rechercher des cours</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  <span>Rechercher des utilisateurs</span>
                </div>
                <div className="flex items-center gap-2">
                  <FolderOpen className="w-4 h-4" />
                  <span>Rechercher des catégories</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {results.map((result) => {
                const Icon = getTypeIcon(result.type);
                return (
                  <button
                    key={`${result.type}-${result.id}`}
                    onClick={() => handleResultClick(result.url)}
                    className="w-full text-left p-4 hover:bg-gray-50 transition-colors flex items-center gap-4 group"
                  >
                    <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Icon className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-semibold text-gray-900 truncate">{result.title}</p>
                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                          {getTypeLabel(result.type)}
                        </span>
                      </div>
                      {result.subtitle && (
                        <p className="text-sm text-gray-600 truncate">{result.subtitle}</p>
                      )}
                    </div>
                    <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all flex-shrink-0" />
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer avec raccourcis */}
        <div className="border-t border-gray-200 p-3 flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-gray-100 rounded">↑↓</kbd>
              <span>Naviguer</span>
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-gray-100 rounded">Entrée</kbd>
              <span>Ouvrir</span>
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-gray-100 rounded">Esc</kbd>
              <span>Fermer</span>
            </span>
          </div>
          <span>{results.length} résultat{results.length > 1 ? 's' : ''}</span>
        </div>
      </div>
    </div>
  );
}


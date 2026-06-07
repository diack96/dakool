'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Search, X, BookOpen, Loader2 } from 'lucide-react';
import Link from 'next/link';

interface SearchResult {
  id: string;
  title: string;
  type: 'course' | 'category';
  url: string;
}

export default function GlobalSearch() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Fermer le menu si on clique en dehors
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
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

    const timeoutId = setTimeout(async () => {
      setIsLoading(true);
      try {
        // Rechercher dans les cours
        const coursesResponse = await fetch(`/api/courses?search=${encodeURIComponent(query)}&limit=5`, {
          credentials: 'include',
          cache: 'no-store',
        });

        const searchResults: SearchResult[] = [];

        if (coursesResponse.ok) {
          const coursesData = await coursesResponse.json();
          if (coursesData.success && Array.isArray(coursesData.courses)) {
            coursesData.courses.forEach((course: any) => {
              searchResults.push({
                id: course.id,
                title: course.title,
                type: 'course',
                url: course.slug ? `/courses/${course.slug}` : `/courses/${course.id}`,
              });
            });
          }
        }

        setResults(searchResults);
      } catch (error) {
        console.error('Erreur lors de la recherche:', error);
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [query]);

  // Raccourci clavier (Ctrl+K ou Cmd+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(true);
        setTimeout(() => inputRef.current?.focus(), 100);
      }
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleResultClick = (url: string) => {
    setIsOpen(false);
    setQuery('');
    router.push(url);
  };

  return (
    <div ref={searchRef} className="relative">
      {/* Bouton de recherche */}
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors text-gray-600"
      >
        <Search className="w-4 h-4" />
        <span className="hidden md:inline text-sm">Rechercher...</span>
        <span className="hidden lg:inline text-xs text-gray-400">Ctrl+K</span>
      </button>

      {/* Modal de recherche */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-start justify-center pt-20 px-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full animate-fade-in">
            {/* Barre de recherche */}
            <div className="flex items-center gap-4 p-4 border-b border-gray-200">
              <Search className="w-5 h-5 text-gray-400" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Rechercher un cours..."
                className="flex-1 outline-none text-gray-900 placeholder-gray-400"
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
                onClick={() => setIsOpen(false)}
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
                <div className="text-center py-12">
                  <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-600">Aucun résultat trouvé</p>
                </div>
              ) : results.length > 0 ? (
                <div className="p-2">
                  {results.map((result) => (
                    <button
                      key={result.id}
                      onClick={() => handleResultClick(result.url)}
                      className="w-full flex items-center gap-4 p-4 hover:bg-gray-50 rounded-lg transition-colors text-left"
                    >
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        result.type === 'course' ? 'bg-blue-100' : 'bg-orange-100'
                      }`}>
                        <BookOpen className={`w-5 h-5 ${
                          result.type === 'course' ? 'text-blue-600' : 'text-orange-600'
                        }`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900 truncate">{result.title}</p>
                        <p className="text-sm text-gray-500">
                          {result.type === 'course' ? 'Cours' : 'Catégorie'}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="p-6 text-center text-gray-500">
                  <p>Tapez pour rechercher...</p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-gray-200 bg-gray-50 rounded-b-2xl">
              <div className="flex items-center justify-between text-xs text-gray-500">
                <div className="flex items-center gap-4">
                  <span>↑↓ Naviguer</span>
                  <span>↵ Ouvrir</span>
                  <span>Esc Fermer</span>
                </div>
                <Link href="/courses" className="text-blue-600 hover:text-blue-700 font-semibold">
                  Voir tous les cours →
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


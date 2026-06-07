'use client';

import { Moon, Sun } from 'lucide-react';
import { useContext, useEffect, useState } from 'react';
import { ThemeContext } from '@/contexts/ThemeContext';

export default function ThemeToggle() {
  const themeContext = useContext(ThemeContext);
  const toggleTheme = themeContext?.toggleTheme || (() => {});

  // Évite le mismatch SSR/client : on ne lit le thème réel qu'après hydration
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  const isDark = mounted ? themeContext?.resolvedTheme === 'dark' : false;

  return (
    <button
      onClick={toggleTheme}
      className="flex items-center space-x-2 px-3 py-2 rounded-lg text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
      aria-label={mounted ? `Basculer vers le mode ${isDark ? 'clair' : 'sombre'}` : 'Basculer le thème'}
      title={mounted ? `Thème actuel: ${isDark ? 'Sombre' : 'Clair'}` : undefined}
      suppressHydrationWarning
    >
      {/* Icône stable au SSR, remplacée côté client après mount */}
      {mounted && isDark ? (
        <Moon className="w-4 h-4" aria-hidden="true" />
      ) : (
        <Sun className="w-4 h-4" aria-hidden="true" />
      )}
      <span className="hidden sm:inline text-sm font-medium" suppressHydrationWarning>
        {mounted ? (isDark ? 'Sombre' : 'Clair') : ''}
      </span>
    </button>
  );
}


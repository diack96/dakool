'use client';

import { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark' | 'system';

interface ThemeContextType {
  theme: Theme;
  resolvedTheme: 'light' | 'dark';
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

export const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // SSR-safe: always start 'light' on both server and client.
  // The useEffect below reads localStorage and syncs after mount.
  const [theme, setThemeState] = useState<Theme>('light');
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('light');
  const [mounted, setMounted] = useState(false);

  // Initialiser le thème au montage
  useEffect(() => {
    setMounted(true);
    
    // Récupérer le thème depuis localStorage
    const savedTheme = localStorage.getItem('theme') as Theme | null;
    // Si l'utilisateur avait "system", convertir en light ou dark selon préférence système
    if (savedTheme === 'system' || !savedTheme) {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      const convertedTheme = prefersDark ? 'dark' : 'light';
      setThemeState(convertedTheme);
      applyTheme(convertedTheme);
    } else if (savedTheme === 'light' || savedTheme === 'dark') {
      setThemeState(savedTheme);
      applyTheme(savedTheme);
    }
  }, []);

  // Appliquer le thème au document
  const applyTheme = (newTheme: Theme) => {
    const root = document.documentElement;
    
    let actualTheme: 'light' | 'dark';
    
    if (newTheme === 'system') {
      actualTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    } else {
      actualTheme = newTheme;
    }

    setResolvedTheme(actualTheme);

    if (actualTheme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  };

  // Écouter les changements de préférence système
  useEffect(() => {
    if (theme !== 'system') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      applyTheme('system');
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme]);

  // Mettre à jour le thème quand il change
  useEffect(() => {
    if (!mounted) return;
    applyTheme(theme);
    localStorage.setItem('theme', theme);
  }, [theme, mounted]);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
  };

  const toggleTheme = () => {
    // Basculer uniquement entre light et dark
    if (theme === 'light' || theme === 'system') {
      setTheme('dark');
    } else {
      setTheme('light');
    }
  };

  // Toujours rendre le provider, même si pas monté (pour éviter les erreurs SSR)
  // Les valeurs par défaut seront utilisées jusqu'à ce que le composant soit monté
  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}


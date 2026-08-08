'use client';

import { useSyncExternalStore } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSun, faMoon } from '@fortawesome/free-solid-svg-icons';

export type Theme = 'light' | 'dark';

export const THEME_STORAGE_KEY = 'dakool_theme';
const THEME_EVENT = 'dakool:themechange';

/**
 * Script injecté avant le premier rendu : il applique le thème enregistré
 * sur <html> pour éviter que la page clignote en clair avant de passer en
 * sombre. Doit rester synchrone et sans dépendance.
 */
export const themeInitScript = `
(function () {
  try {
    var t = localStorage.getItem('${THEME_STORAGE_KEY}');
    if (!t) t = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    document.documentElement.dataset.theme = t;
  } catch (e) {
    document.documentElement.dataset.theme = 'light';
  }
})();
`;

/* Le thème vit sur <html>, posé par le script ci-dessus. On le lit comme une
   source externe : React gère alors proprement l'écart entre le rendu serveur
   et la valeur réelle du navigateur, sans avertissement d'hydratation. */
function subscribe(onChange: () => void) {
  window.addEventListener(THEME_EVENT, onChange);
  return () => window.removeEventListener(THEME_EVENT, onChange);
}

function getSnapshot(): Theme {
  return document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light';
}

function getServerSnapshot(): Theme {
  return 'light';
}

export default function ThemeToggle() {
  const theme = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const isDark = theme === 'dark';

  const toggle = () => {
    const next: Theme = isDark ? 'light' : 'dark';
    document.documentElement.dataset.theme = next;
    try {
      localStorage.setItem(THEME_STORAGE_KEY, next);
    } catch {
      /* Navigation privée : le choix ne vaudra que pour cette session. */
    }
    window.dispatchEvent(new Event(THEME_EVENT));
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={isDark ? 'Passer en thème clair' : 'Passer en thème sombre'}
      title={isDark ? 'Thème clair' : 'Thème sombre'}
      className="flex h-9 w-9 items-center justify-center border border-line text-mute transition-colors hover:border-line-strong hover:text-fg"
    >
      <FontAwesomeIcon icon={isDark ? faSun : faMoon} className="h-4 w-4" />
    </button>
  );
}

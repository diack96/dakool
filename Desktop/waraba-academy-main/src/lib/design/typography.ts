/**
 * Système de typographie cohérent pour toute l'application
 */

export const typography = {
  // Titres
  h1: 'text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold leading-tight',
  h2: 'text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight',
  h3: 'text-2xl sm:text-3xl font-semibold leading-snug',
  h4: 'text-xl sm:text-2xl font-semibold leading-snug',
  h5: 'text-lg sm:text-xl font-semibold leading-normal',
  h6: 'text-base sm:text-lg font-semibold leading-normal',

  // Corps de texte
  body: {
    large: 'text-base sm:text-lg lg:text-xl leading-relaxed',
    default: 'text-base sm:text-lg leading-relaxed',
    small: 'text-sm sm:text-base leading-normal',
  },

  // Textes utilitaires
  caption: 'text-xs sm:text-sm leading-normal',
  label: 'text-sm sm:text-base font-medium leading-normal',

  // Couleurs de texte
  colors: {
    primary: 'text-gray-900',
    secondary: 'text-gray-700',
    muted: 'text-gray-600',
    accent: 'text-blue-600',
    accentOrange: 'text-orange-600',
    white: 'text-white',
  },
};


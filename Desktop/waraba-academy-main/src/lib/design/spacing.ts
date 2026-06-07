/**
 * Système d'espacement standardisé - Waraba Academy
 */

export const spacing = {
  // Sections verticales
  section: {
    sm: 'py-8 md:py-12',
    md: 'py-12 md:py-16 lg:py-20',
    lg: 'py-16 md:py-20 lg:py-24',
  },
  
  // Conteneurs horizontaux
  container: {
    default: 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8',
    narrow: 'max-w-4xl mx-auto px-4 sm:px-6 lg:px-8',
    wide: 'max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8',
  },
  
  // Grilles
  grid: {
    default: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 lg:gap-8',
    tight: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6',
    wide: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 lg:gap-10',
  },
  
  // Padding interne
  padding: {
    card: 'p-4 sm:p-6 lg:p-8',
    button: 'px-6 sm:px-8 py-3 sm:py-4',
    buttonSmall: 'px-4 sm:px-6 py-2 sm:py-3',
    input: 'px-4 py-2 sm:py-3',
  },
  
  // Marges
  margin: {
    sectionTitle: 'mb-12 sm:mb-16 lg:mb-20',
    card: 'mb-4 sm:mb-6',
    element: 'mb-2 sm:mb-3',
  },
} as const;

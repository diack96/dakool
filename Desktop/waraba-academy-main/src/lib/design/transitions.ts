/**
 * Système de transitions cohérent pour toute l'application
 */

export const transitions = {
  // Durées standardisées
  fast: 'transition-all duration-200',
  normal: 'transition-all duration-300',
  slow: 'transition-all duration-500',

  // Transitions spécifiques
  colors: 'transition-colors duration-300',
  transform: 'transition-transform duration-300',
  opacity: 'transition-opacity duration-300',
  shadow: 'transition-shadow duration-300',

  // Easing functions
  easeIn: 'transition-all duration-300 ease-in',
  easeOut: 'transition-all duration-300 ease-out',
  easeInOut: 'transition-all duration-300 ease-in-out',

  // Hover effects standardisés
  hover: {
    lift: 'transform hover:-translate-y-1 transition-transform duration-300',
    liftLarge: 'transform hover:-translate-y-2 transition-transform duration-300',
    scale: 'transform hover:scale-105 transition-transform duration-300',
    shadow: 'shadow-lg hover:shadow-xl transition-shadow duration-300',
  },
};


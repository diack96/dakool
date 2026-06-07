// Configuration des animations et optimisations
export const animationConfig = {
  // Délais d'animation stagger
  stagger: {
    1: '0.1s',
    2: '0.2s',
    3: '0.3s',
    4: '0.4s',
    5: '0.5s',
  },

  // Durées d'animation
  duration: {
    fast: '200ms',
    normal: '300ms',
    slow: '500ms',
    slower: '800ms',
  },

  // Easing functions
  easing: {
    ease: 'cubic-bezier(0.4, 0, 0.2, 1)',
    bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
    elastic: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
  },
};

// Classes CSS pour les animations
export const animationClasses = {
  fadeInUp: 'animate-fade-in-up',
  stagger1: 'stagger-1',
  stagger2: 'stagger-2',
  stagger3: 'stagger-3',
  stagger4: 'stagger-4',
  stagger5: 'stagger-5',
  pulseSlow: 'animate-pulse-slow',
  blob: 'animate-blob',
  delay2000: 'animation-delay-2000',
  delay4000: 'animation-delay-4000',
};

// Configuration des performances
export const performanceConfig = {
  // Lazy loading
  lazyLoading: {
    threshold: 0.1,
    rootMargin: '50px',
  },

  // Intersection Observer
  intersectionObserver: {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px',
  },

  // Debounce pour les animations
  debounce: {
    scroll: 16, // ~60fps
    resize: 100,
    input: 300,
  },
};

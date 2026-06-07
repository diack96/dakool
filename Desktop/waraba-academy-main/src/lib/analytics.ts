// Configuration des analytics et métriques de conversion
export interface ConversionEvent {
  event: string;
  category: string;
  label: string;
  value?: number;
  custom_parameters?: Record<string, any>;
}

export interface ABTestResult {
  variantId: string;
  impressions: number;
  clicks: number;
  conversions: number;
  ctr: number;
  conversionRate: number;
}

// Configuration des événements de conversion
export const CONVERSION_EVENTS = {
  // Page d'accueil
  HERO_CTA_CLICK: 'hero_cta_click',
  FEATURES_VIEW: 'features_view',
  COURSES_VIEW: 'courses_view',
  TESTIMONIALS_VIEW: 'testimonials_view',

  // A/B Testing
  AB_TEST_IMPRESSION: 'ab_test_impression',
  AB_TEST_CLICK: 'ab_test_click',
  AB_TEST_CONVERSION: 'ab_test_conversion',

  // Engagement
  BADGE_UNLOCKED: 'badge_unlocked',
  AI_CHAT_OPENED: 'ai_chat_opened',
  AI_CHAT_MESSAGE: 'ai_chat_message',

  // Navigation
  COURSE_EXPLORE: 'course_explore',
  REGISTRATION_START: 'registration_start',
  REGISTRATION_COMPLETE: 'registration_complete',
} as const;

// Configuration des objectifs de conversion
export const CONVERSION_GOALS = {
  // Objectifs primaires
  PRIMARY: {
    REGISTRATION: {
      target: 15, // 15% des visiteurs s'inscrivent
      weight: 100,
    },
    COURSE_ENROLLMENT: {
      target: 8, // 8% s'inscrivent à un cours
      weight: 80,
    },
  },

  // Objectifs secondaires
  SECONDARY: {
    FEATURES_ENGAGEMENT: {
      target: 25, // 25% interagissent avec les features
      weight: 40,
    },
    TESTIMONIALS_VIEW: {
      target: 30, // 30% regardent les témoignages
      weight: 30,
    },
    AI_CHAT_USAGE: {
      target: 20, // 20% utilisent le chat IA
      weight: 50,
    },
  },
} as const;

// Configuration des métriques de performance
export const PERFORMANCE_METRICS = {
  // Temps de chargement
  LOADING: {
    FIRST_CONTENTFUL_PAINT: 1.5, // 1.5s
    LARGEST_CONTENTFUL_PAINT: 2.5, // 2.5s
    CUMULATIVE_LAYOUT_SHIFT: 0.1, // 0.1
    FIRST_INPUT_DELAY: 100, // 100ms
  },

  // Engagement
  ENGAGEMENT: {
    TIME_ON_PAGE: 180, // 3 minutes
    SCROLL_DEPTH: 70, // 70% de la page
    BOUNCE_RATE: 40, // 40% maximum
  },
} as const;

// Fonction pour envoyer les événements analytics
export const trackEvent = (event: ConversionEvent): void => {
  // Google Analytics 4
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', event.event, {
      event_category: event.category,
      event_label: event.label,
      value: event.value,
      ...event.custom_parameters,
    });
  }

  // Facebook Pixel
  if (typeof window !== 'undefined' && (window as any).fbq) {
    (window as any).fbq('track', event.event, {
      content_category: event.category,
      content_name: event.label,
      value: event.value,
      ...event.custom_parameters,
    });
  }

  // Local storage pour tracking offline
  const events = JSON.parse(localStorage.getItem('conversion_events') || '[]');
  events.push({
    ...event,
    timestamp: new Date().toISOString(),
  });
  localStorage.setItem('conversion_events', JSON.stringify(events));

  // Console en développement
  if (process.env.NODE_ENV === 'development') {
    console.log('📊 Analytics Event:', event);
  }
};

// Fonction pour calculer les métriques de conversion
export const calculateConversionMetrics = (): Record<string, number> => {
  if (typeof window === 'undefined') return { totalEvents: 0, registrations: 0, courseEnrollments: 0, aiChatUsage: 0, badgeUnlocks: 0 };

  const events = JSON.parse(localStorage.getItem('conversion_events') || '[]');

  const metrics = {
    totalEvents: events.length,
    registrations: events.filter((e: ConversionEvent) => e.event === 'registration_complete').length,
    courseEnrollments: events.filter((e: ConversionEvent) => e.event === 'course_enrollment').length,
    aiChatUsage: events.filter((e: ConversionEvent) => e.event === CONVERSION_EVENTS.AI_CHAT_OPENED).length,
    badgeUnlocks: events.filter((e: ConversionEvent) => e.event === CONVERSION_EVENTS.BADGE_UNLOCKED).length,
  };

  return metrics;
};

// Fonction pour A/B Testing
export const trackABTest = {
  impression: (variantId: string): void => {
    trackEvent({
      event: CONVERSION_EVENTS.AB_TEST_IMPRESSION,
      category: 'ab_testing',
      label: variantId,
    });
  },

  click: (variantId: string): void => {
    trackEvent({
      event: CONVERSION_EVENTS.AB_TEST_CLICK,
      category: 'ab_testing',
      label: variantId,
    });
  },

  conversion: (variantId: string): void => {
    trackEvent({
      event: CONVERSION_EVENTS.AB_TEST_CONVERSION,
      category: 'ab_testing',
      label: variantId,
    });
  },
};

// Fonction pour calculer les résultats A/B Testing
export const calculateABTestResults = (): ABTestResult[] => {
  if (typeof window === 'undefined') return [];

  const events = JSON.parse(localStorage.getItem('conversion_events') || '[]');
  const variants = ['variant-1', 'variant-2', 'variant-3', 'variant-4'];

  return variants.map(variantId => {
    const impressions = events.filter((e: ConversionEvent) =>
      e.event === CONVERSION_EVENTS.AB_TEST_IMPRESSION && e.label === variantId,
    ).length;

    const clicks = events.filter((e: ConversionEvent) =>
      e.event === CONVERSION_EVENTS.AB_TEST_CLICK && e.label === variantId,
    ).length;

    const conversions = events.filter((e: ConversionEvent) =>
      e.event === CONVERSION_EVENTS.AB_TEST_CONVERSION && e.label === variantId,
    ).length;

    const ctr = impressions > 0 ? (clicks / impressions) * 100 : 0;
    const conversionRate = clicks > 0 ? (conversions / clicks) * 100 : 0;

    return {
      variantId,
      impressions,
      clicks,
      conversions,
      ctr: Math.round(ctr * 100) / 100,
      conversionRate: Math.round(conversionRate * 100) / 100,
    };
  });
};

// Fonction pour générer un rapport de performance
export const generatePerformanceReport = (): string => {
  if (typeof window === 'undefined') return '📊 Rapport de Performance - Waraba Academy\n\nRapport non disponible côté serveur';

  const metrics = calculateConversionMetrics();
  const abResults = calculateABTestResults();

  let report = '📊 Rapport de Performance - Waraba Academy\n\n';

  // Métriques générales
  report += '🎯 Métriques de Conversion:\n';
  report += `• Total d'événements: ${metrics.totalEvents}\n`;
  report += `• Inscriptions: ${metrics.registrations}\n`;
  report += `• Inscriptions aux cours: ${metrics.courseEnrollments}\n`;
  report += `• Utilisation du chat IA: ${metrics.aiChatUsage}\n`;
  report += `• Badges débloqués: ${metrics.badgeUnlocks}\n\n`;

  // Résultats A/B Testing
  report += '🧪 Résultats A/B Testing:\n';
  abResults.forEach(result => {
    report += `• ${result.variantId}:\n`;
    report += `  - Impressions: ${result.impressions}\n`;
    report += `  - Clics: ${result.clicks}\n`;
    report += `  - CTR: ${result.ctr}%\n`;
    report += `  - Taux de conversion: ${result.conversionRate}%\n`;
  });

  return report;
};

// Configuration des alertes de performance
export const PERFORMANCE_ALERTS = {
  LOW_CONVERSION: {
    threshold: 5, // 5%
    message: '⚠️ Taux de conversion faible détecté',
    action: 'Revoir les CTA et l\'expérience utilisateur',
  },
  HIGH_BOUNCE_RATE: {
    threshold: 70, // 70%
    message: '⚠️ Taux de rebond élevé détecté',
    action: 'Optimiser le contenu et la navigation',
  },
  SLOW_LOADING: {
    threshold: 3, // 3s
    message: '⚠️ Temps de chargement lent détecté',
    action: 'Optimiser les images et le code',
  },
};

// Fonction pour vérifier les alertes de performance
export const checkPerformanceAlerts = (): Array<{type: string, message: string, action: string}> => {
  const alerts = [];
  const metrics = calculateConversionMetrics();

  // Vérifier le taux de conversion
  const conversionRate = (metrics.registrations || 0) / Math.max(metrics.totalEvents || 0, 1) * 100;
  if (conversionRate < PERFORMANCE_ALERTS.LOW_CONVERSION.threshold) {
    alerts.push({
      type: 'LOW_CONVERSION',
      message: PERFORMANCE_ALERTS.LOW_CONVERSION.message,
      action: PERFORMANCE_ALERTS.LOW_CONVERSION.action,
    });
  }

  return alerts;
};

// Export des types pour TypeScript
export type ConversionEventType = typeof CONVERSION_EVENTS[keyof typeof CONVERSION_EVENTS];
export type ConversionGoalType = keyof typeof CONVERSION_GOALS;
export type PerformanceMetricType = keyof typeof PERFORMANCE_METRICS;

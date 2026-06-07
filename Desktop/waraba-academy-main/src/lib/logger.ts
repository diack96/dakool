/**
 * Logger conditionnel — silencieux en production, verbeux en développement.
 * Remplace les console.log/warn/error dispersés dans le code.
 */

const isDev = process.env.NODE_ENV !== 'production';

export const logger = {
  debug: (...args: unknown[]) => {
    if (isDev) console.debug(...args);
  },
  log: (...args: unknown[]) => {
    if (isDev) console.log(...args);
  },
  info: (...args: unknown[]) => {
    if (isDev) console.info(...args);
  },
  warn: (...args: unknown[]) => {
    if (isDev) console.warn(...args);
  },
  // Les erreurs restent visibles en production (utile pour Sentry/monitoring futur)
  error: (...args: unknown[]) => {
    console.error(...args);
  },
};

// Alias pour compatibilité avec les routes API existantes
export const apiLogger = logger;

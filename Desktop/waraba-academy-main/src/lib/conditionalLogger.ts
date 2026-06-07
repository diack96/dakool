/**
 * Logger conditionnel qui utilise console en développement et secureLogger en production
 * Utilise console.log/error/warn uniquement si NODE_ENV !== 'production'
 */

const isDevelopment = process.env.NODE_ENV !== 'production';

// Import lazy de secureLogger pour éviter les problèmes Edge Runtime
let secureLogger: any = null;

async function getSecureLogger() {
  if (!secureLogger && !isDevelopment) {
    try {
      const { secureLogger: logger } = await import('./security/secureLogger');
      secureLogger = logger;
    } catch (error) {
      // Fallback vers console si secureLogger n'est pas disponible
      return null;
    }
  }
  return secureLogger;
}

export const conditionalLogger = {
  log: async (...args: any[]) => {
    if (isDevelopment) {
      console.log(...args);
    } else {
      const logger = await getSecureLogger();
      if (logger) {
        logger.info(...args);
      }
    }
  },

  error: async (...args: any[]) => {
    if (isDevelopment) {
      console.error(...args);
    } else {
      const logger = await getSecureLogger();
      if (logger) {
        logger.error(...args);
      } else {
        // Fallback vers console.error en production si secureLogger n'est pas disponible
        console.error(...args);
      }
    }
  },

  warn: async (...args: any[]) => {
    if (isDevelopment) {
      console.warn(...args);
    } else {
      const logger = await getSecureLogger();
      if (logger) {
        logger.warn(...args);
      }
    }
  },

  info: async (...args: any[]) => {
    if (isDevelopment) {
      console.info(...args);
    } else {
      const logger = await getSecureLogger();
      if (logger) {
        logger.info(...args);
      }
    }
  },

  debug: async (...args: any[]) => {
    if (isDevelopment) {
      console.debug(...args);
    }
    // En production, on ignore les logs debug
  },
};

// Export synchrone pour compatibilité (utilise console en dev, secureLogger en prod)
export const log = isDevelopment ? console.log : (() => {
  // En production, on utilise secureLogger de manière asynchrone
  return (...args: any[]) => {
    getSecureLogger().then(logger => {
      if (logger) logger.info(...args);
    });
  };
})();

export const logError = isDevelopment ? console.error : (() => {
  return (...args: any[]) => {
    getSecureLogger().then(logger => {
      if (logger) logger.error(...args);
      else console.error(...args); // Fallback
    });
  };
})();

export const logWarn = isDevelopment ? console.warn : (() => {
  return (...args: any[]) => {
    getSecureLogger().then(logger => {
      if (logger) logger.warn(...args);
    });
  };
})();


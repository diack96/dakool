/**
 * Logger sécurisé qui ne expose pas d'informations sensibles en production
 */

interface LogContext {
  [key: string]: any;
}

const isProduction = process.env.NODE_ENV === 'production';

/**
 * Sanitize les données sensibles des logs
 */
function sanitizeLogData (data: any): any {
  if (!data || typeof data !== 'object') {
    return data;
  }

  const sensitiveKeys = [
    'password',
    'token',
    'secret',
    'key',
    'authorization',
    'cookie',
    'session',
    'email',
    'phone',
    'credit_card',
    'ssn',
    'details', // Supabase error details peut contenir des infos sensibles
    'hint',    // Supabase error hint peut contenir des infos sensibles
    'message', // Supabase error message peut contenir des infos sensibles
  ];

  const sanitized: any = Array.isArray(data) ? [] : {};

  for (const [key, value] of Object.entries(data)) {
    const lowerKey = key.toLowerCase();
    const isSensitive = sensitiveKeys.some(sk => lowerKey.includes(sk));

    if (isSensitive && isProduction) {
      sanitized[key] = '[REDACTED]';
    } else if (typeof value === 'object' && value !== null) {
      sanitized[key] = sanitizeLogData(value);
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized;
}

/**
 * Logger sécurisé
 */
export const secureLogger = {
  info: (message: string, context?: LogContext) => {
    const sanitizedContext = context ? sanitizeLogData(context) : undefined;
    console.log(`[INFO] ${message}`, sanitizedContext || '');
  },

  warn: (message: string, context?: LogContext) => {
    const sanitizedContext = context ? sanitizeLogData(context) : undefined;
    console.warn(`[WARN] ${message}`, sanitizedContext || '');
  },

  error: (message: string, error?: Error | any, context?: LogContext) => {
    const sanitizedContext = context ? sanitizeLogData(context) : undefined;

    if (isProduction) {
      // En production, ne logger que les informations essentielles
      console.error(`[ERROR] ${message}`, {
        name: error?.name,
        code: error?.code,
        status: error?.status,
        ...sanitizedContext,
      });
    } else {
      // En développement, logger toutes les informations
      console.error(`[ERROR] ${message}`, error, sanitizedContext);
    }
  },

  debug: (message: string, context?: LogContext) => {
    if (!isProduction) {
      const sanitizedContext = context ? sanitizeLogData(context) : undefined;
      console.debug(`[DEBUG] ${message}`, sanitizedContext || '');
    }
  },
};


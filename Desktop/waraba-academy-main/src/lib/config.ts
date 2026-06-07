import { z } from 'zod';

// Schéma de validation pour la configuration
const configSchema = z.object({
  // Base de données
  DATABASE_URL: z.string().min(1, 'DATABASE_URL est requis'),

  // JWT (optionnel - Supabase gère l'auth)
  JWT_SECRET: z.string().default(''),
  JWT_EXPIRES_IN: z.string().default('15m'),
  REFRESH_TOKEN_EXPIRES_IN: z.string().default('7d'),

  // Application
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  NEXT_PUBLIC_APP_URL: z.string().default('http://localhost:3000'),

  // Sécurité
  BCRYPT_SALT_ROUNDS: z.string().transform(Number).pipe(z.number().min(10).max(16)).default('12'),
  CORS_ORIGIN: z.string().default('http://localhost:3000'),

  // Rate Limiting
  RATE_LIMIT_WINDOW_MS: z.string().transform(Number).pipe(z.number().positive()).default('900000'), // 15 minutes
  RATE_LIMIT_MAX_REQUESTS: z.string().transform(Number).pipe(z.number().positive()).default('100'),

  // Admin
  ADMIN_EMAILS: z.string().transform(emails =>
    emails.split(',').map(email => email.trim()).filter(Boolean),
  ).default('admin@waraba-academy.com'),

  // Stripe (optionnel)
  STRIPE_SECRET_KEY: z.string().optional(),
  STRIPE_PUBLISHABLE_KEY: z.string().optional(),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),

  // Email (optionnel)
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.string().transform(Number).pipe(z.number().positive()).optional(),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  SMTP_FROM: z.string().email().optional(),

  // Logging
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).default('info'),

  // Features
  ENABLE_REGISTRATION: z.string().transform(val => val === 'true').default('true'),
  ENABLE_PAYMENTS: z.string().transform(val => val === 'true').default('false'),
  ENABLE_ANALYTICS: z.string().transform(val => val === 'true').default('false'),
  ENABLE_NOTIFICATIONS: z.string().transform(val => val === 'true').default('true'),
});

// Configuration avec variables d'environnement (plus de fallback secrets)
const defaultConfig = {
  DATABASE_URL: process.env.DATABASE_URL || '',
  JWT_SECRET: process.env.JWT_SECRET || '',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '15m',
  REFRESH_TOKEN_EXPIRES_IN: process.env.REFRESH_TOKEN_EXPIRES_IN || '7d',
  NODE_ENV: (process.env.NODE_ENV as any) || 'development',
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  BCRYPT_SALT_ROUNDS: process.env.BCRYPT_SALT_ROUNDS || '12',
  CORS_ORIGIN: process.env.CORS_ORIGIN || 'http://localhost:3000',
  RATE_LIMIT_WINDOW_MS: process.env.RATE_LIMIT_WINDOW_MS || '900000',
  RATE_LIMIT_MAX_REQUESTS: process.env.RATE_LIMIT_MAX_REQUESTS || '100',
  ADMIN_EMAILS: process.env.ADMIN_EMAILS || 'admin@waraba-academy.com',
  STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
  STRIPE_PUBLISHABLE_KEY: process.env.STRIPE_PUBLISHABLE_KEY,
  STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,
  SMTP_HOST: process.env.SMTP_HOST,
  SMTP_PORT: process.env.SMTP_PORT,
  SMTP_USER: process.env.SMTP_USER,
  SMTP_PASS: process.env.SMTP_PASS,
  SMTP_FROM: process.env.SMTP_FROM,
  LOG_LEVEL: (process.env.LOG_LEVEL as any) || 'info',
  ENABLE_REGISTRATION: process.env.ENABLE_REGISTRATION || 'true',
  ENABLE_PAYMENTS: process.env.ENABLE_PAYMENTS || 'false',
  ENABLE_ANALYTICS: process.env.ENABLE_ANALYTICS || 'false',
  ENABLE_NOTIFICATIONS: process.env.ENABLE_NOTIFICATIONS || 'true',
};

// Validation et transformation de la configuration
function loadConfig () {
  try {
    return configSchema.parse(defaultConfig);
  } catch (validationError) {
    // En développement ou pendant le build, fallback gracieux
    if (process.env.NODE_ENV !== 'production' || process.env.NEXT_PHASE) {
      console.warn('⚠️  Configuration validation failed - using defaults. Some features may not work.');
      console.warn('⚠️  Assurez-vous que DATABASE_URL et JWT_SECRET sont définis dans .env.local');
      return defaultConfig;
    }

    // En production, log l'erreur mais ne pas crash le process
    console.error('⚠️ Configuration validation failed in production. Using defaults.');
    console.error(validationError);
    return defaultConfig as any;
  }
}

// Configuration exportée
export const config = loadConfig();

// Types TypeScript dérivés des schémas
export type Config = z.infer<typeof configSchema>

// Fonctions utilitaires de configuration
export const isDevelopment = config.NODE_ENV === 'development';
export const isProduction = config.NODE_ENV === 'production';
export const isTest = config.NODE_ENV === 'test';

export const isFeatureEnabled = (feature: keyof Pick<Config, 'ENABLE_REGISTRATION' | 'ENABLE_PAYMENTS' | 'ENABLE_ANALYTICS' | 'ENABLE_NOTIFICATIONS'>) => {
  return config[feature];
};

// Configuration de sécurité
export const securityConfig = {
  jwt: {
    secret: config.JWT_SECRET,
    expiresIn: config.JWT_EXPIRES_IN,
    refreshExpiresIn: config.REFRESH_TOKEN_EXPIRES_IN,
  },
  bcrypt: {
    saltRounds: config.BCRYPT_SALT_ROUNDS,
  },
  cors: {
    origin: config.CORS_ORIGIN,
  },
  rateLimit: {
    windowMs: config.RATE_LIMIT_WINDOW_MS,
    max: config.RATE_LIMIT_MAX_REQUESTS,
  },
} as const;


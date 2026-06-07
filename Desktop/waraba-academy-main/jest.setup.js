/**
 * Configuration de setup pour Jest
 * S'exécute avant chaque fichier de test
 */

// Mock des variables d'environnement
process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key';
process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-role-key';
process.env.NODE_ENV = 'test';

// Mock de Next.js
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
  }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
}));

// Mock de Winston (logger)
jest.mock('@/lib/logger', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
  },
  apiLogger: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
  },
  authLogger: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    loginAttempt: jest.fn(),
  },
  dbLogger: {
    info: jest.fn(),
    error: jest.fn(),
    query: jest.fn(),
  },
}));

// Supprimer les warnings de console en tests
global.console = {
  ...console,
  warn: jest.fn(),
  error: jest.fn(),
};


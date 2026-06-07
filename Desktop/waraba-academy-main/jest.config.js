/**
 * Configuration Jest pour les tests
 */

const nextJest = require('next/jest');

const createJestConfig = nextJest({
  // Chemin vers votre application Next.js pour charger next.config.js et .env
  dir: './',
});

// Configuration Jest personnalisée
const customJestConfig = {
  // Environnement de test
  testEnvironment: 'jest-environment-jsdom',

  // Chemins de recherche des modules
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },

  // Fichiers à ignorer
  testPathIgnorePatterns: ['<rootDir>/.next/', '<rootDir>/node_modules/'],

  // Setup files
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],

  // Coverage
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.stories.{js,jsx,ts,tsx}',
    '!src/**/__tests__/**',
  ],

  // Seuils de couverture (objectifs)
  coverageThreshold: {
    global: {
      branches: 50,
      functions: 50,
      lines: 50,
      statements: 50,
    },
  },

  // Transformateurs
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': ['babel-jest', { presets: ['next/babel'] }],
  },

  // Extensions de fichiers de test
  testMatch: [
    '**/__tests__/**/*.[jt]s?(x)',
    '**/?(*.)+(spec|test).[jt]s?(x)',
  ],
};

module.exports = createJestConfig(customJestConfig);


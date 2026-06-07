/**
 * Configuration ESLint pour Waraba Academy
 *
 * Cette configuration assure la qualité du code, la sécurité et la cohérence
 * du style de programmation pour la plateforme de formation en ligne.
 *
 * @author Waraba Academy Team
 * @version 1.0.0
 * @since 2024
 */

import { dirname } from 'path';
import { fileURLToPath } from 'url';
import { FlatCompat } from '@eslint/eslintrc';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends('next/core-web-vitals', 'next/typescript'),

  // === RÈGLES PERSONNALISÉES ===
  {
    rules: {
      // === SÉCURITÉ ===
      'no-console': process.env.NODE_ENV === 'production' ? 'error' : 'warn',
      'no-debugger': 'error',
      'no-alert': 'error',
      'no-eval': 'error',
      'no-implied-eval': 'error',
      'no-new-func': 'error',
      'no-script-url': 'error',

      // === QUALITÉ ===
      'no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
        },
      ],
      'no-undef': 'error',
      'no-unreachable': 'error',
      'no-constant-condition': 'error',
      'no-dupe-keys': 'error',
      'no-dupe-args': 'error',
      'no-dupe-class-members': 'error',
      'no-dupe-else-if': 'error',
      'no-duplicate-case': 'error',
      'no-empty': 'error',
      'no-extra-boolean-cast': 'error',
      'no-extra-semi': 'error',
      'no-func-assign': 'error',
      'no-import-assign': 'error',
      'no-invalid-regexp': 'error',
      'no-irregular-whitespace': 'error',
      'no-misleading-character-class': 'error',
      'no-obj-calls': 'error',
      'no-prototype-builtins': 'error',
      'no-redeclare': 'error',
      'no-regex-spaces': 'error',
      'no-self-assign': 'error',
      'no-setter-return': 'error',
      'no-sparse-arrays': 'error',
      'no-this-before-super': 'error',
      'no-unsafe-finally': 'error',
      'no-unsafe-negation': 'error',
      'no-unsafe-optional-chaining': 'error',
      'use-isnan': 'error',
      'valid-typeof': 'error',

      // === STYLE ===
      indent: ['error', 2],
      quotes: ['error', 'single'],
      semi: ['error', 'always'],
      'comma-dangle': ['error', 'always-multiline'],
      'object-curly-spacing': ['error', 'always'],
      'array-bracket-spacing': ['error', 'never'],
      'space-before-function-paren': ['error', 'always'],
      'space-before-blocks': 'error',
      'keyword-spacing': 'error',
      'space-infix-ops': 'error',
      'eol-last': 'error',
      'no-trailing-spaces': 'error',
      'no-multiple-empty-lines': ['error', { max: 1 }],
      'padded-blocks': ['error', 'never'],
      'brace-style': ['error', '1tbs'],
      camelcase: 'error',
      'new-cap': 'error',
      'no-new-object': 'error',
      'no-array-constructor': 'error',
      'no-new-wrappers': 'error',
      'no-new-symbol': 'error',
      'no-const-assign': 'error',
      'no-duplicate-imports': 'error',
      'no-useless-constructor': 'error',
      'prefer-destructuring': 'error',
      'prefer-template': 'error',
      'template-curly-spacing': 'error',
    },
  },

  // === CONFIGURATION SPÉCIFIQUE POUR LES FICHIERS DE CONFIGURATION ===
  {
    files: ['*.config.{js,ts,mjs}', 'next.config.{js,ts}'],
    rules: {
      'no-console': 'off',
      '@typescript-eslint/no-var-requires': 'off',
    },
  },

  // === CONFIGURATION POUR LES TESTS ===
  {
    files: ['**/*.test.{js,jsx,ts,tsx}', '**/*.spec.{js,jsx,ts,tsx}'],
    rules: {
      'no-console': 'off',
      'no-unused-expressions': 'off',
    },
  },

  // === IGNORE GLOBAL ===
  {
    ignores: [
      'node_modules/**',
      '.next/**',
      'out/**',
      'dist/**',
      'build/**',
      'coverage/**',
      '*.min.js',
      'public/**',
    ],
  },
];

export default eslintConfig;

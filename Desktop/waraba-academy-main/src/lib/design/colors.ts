/**
 * Palette de couleurs standardisée - Waraba Academy
 * Toutes les couleurs doivent être importées depuis ce fichier
 */

export const colors = {
  // Primary (Bleu)
  primary: {
    50: '#eff6ff',
    100: '#dbeafe',
    200: '#bfdbfe',
    300: '#93c5fd',
    400: '#60a5fa',
    500: '#3b82f6', // Principal
    600: '#2563eb', // Hover
    700: '#1d4ed8', // Pressed
    800: '#1e40af',
    900: '#1e3a8a',
  },
  
  // Secondary (Orange)
  secondary: {
    50: '#fff7ed',
    100: '#ffedd5',
    200: '#fed7aa',
    300: '#fdba74',
    400: '#fb923c',
    500: '#f97316', // Principal
    600: '#ea580c', // Hover
    700: '#c2410c', // Pressed
    800: '#9a3412',
    900: '#7c2d12',
  },
  
  // Success (Vert)
  success: {
    50: '#f0fdf4',
    100: '#dcfce7',
    200: '#bbf7d0',
    300: '#86efac',
    400: '#4ade80',
    500: '#22c55e', // Principal
    600: '#16a34a', // Hover
    700: '#15803d', // Pressed
    800: '#166534',
    900: '#14532d',
  },
  
  // Neutres (Gris)
  neutral: {
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280',
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937',
    900: '#111827',
  },
} as const;

/**
 * Classes Tailwind pour les couleurs principales
 */
export const colorClasses = {
  // Primary
  primary: {
    bg: 'bg-blue-600',
    bgHover: 'hover:bg-blue-700',
    bgPressed: 'active:bg-blue-700',
    text: 'text-blue-600',
    textHover: 'hover:text-blue-700',
    border: 'border-blue-600',
    ring: 'ring-blue-600',
    light: 'bg-blue-100 text-blue-900',
  },
  
  // Secondary
  secondary: {
    bg: 'bg-orange-600',
    bgHover: 'hover:bg-orange-700',
    bgPressed: 'active:bg-orange-700',
    text: 'text-orange-600',
    textHover: 'hover:text-orange-700',
    border: 'border-orange-600',
    ring: 'ring-orange-600',
    light: 'bg-orange-100 text-orange-900',
  },
  
  // Success
  success: {
    bg: 'bg-green-600',
    bgHover: 'hover:bg-green-700',
    bgPressed: 'active:bg-green-700',
    text: 'text-green-600',
    textHover: 'hover:text-green-700',
    border: 'border-green-600',
    ring: 'ring-green-600',
    light: 'bg-green-100 text-green-900',
    gradient: 'bg-gradient-to-r from-green-500 to-emerald-600',
  },
  
  // Neutral
  neutral: {
    bg: 'bg-gray-50',
    text: 'text-gray-900',
    textSecondary: 'text-gray-700',
    textMuted: 'text-gray-600',
    border: 'border-gray-200',
  },
} as const;

/**
 * Gradients autorisés
 */
export const gradients = {
  freeCourse: 'bg-gradient-to-r from-green-500 to-emerald-600',
  sectionLight: 'bg-gradient-to-b from-green-50 to-white',
  sectionAccent: 'bg-gradient-to-r from-blue-50 to-orange-50',
} as const;


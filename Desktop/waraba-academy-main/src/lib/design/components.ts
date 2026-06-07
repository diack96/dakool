/**
 * Classes standardisées pour les composants UI - Waraba Academy
 * Importez ces classes pour garantir la cohérence
 */

import { colorClasses, gradients } from './colors';
import { spacing } from './spacing';

/**
 * Classes pour les boutons
 */
export const buttonClasses = {
  // Bouton Primary (Bleu)
  primary: [
    'inline-flex items-center justify-center',
    spacing.padding.button,
    colorClasses.primary.bg,
    'text-white',
    'rounded-xl sm:rounded-2xl',
    colorClasses.primary.bgHover,
    'focus:outline-none focus:ring-2 focus:ring-offset-2',
    colorClasses.primary.ring,
    'transition-all duration-300',
    'font-semibold text-base sm:text-lg',
    'shadow-lg hover:shadow-xl',
    'transform hover:-translate-y-1',
    'disabled:opacity-50 disabled:cursor-not-allowed',
  ].join(' '),
  
  // Bouton Secondary (Orange - CTA)
  secondary: [
    'inline-flex items-center justify-center',
    spacing.padding.button,
    colorClasses.secondary.bg,
    'text-white',
    'rounded-xl sm:rounded-2xl',
    colorClasses.secondary.bgHover,
    'focus:outline-none focus:ring-2 focus:ring-offset-2',
    colorClasses.secondary.ring,
    'transition-all duration-300',
    'font-semibold text-base sm:text-lg',
    'shadow-lg hover:shadow-xl',
    'transform hover:-translate-y-1',
    'disabled:opacity-50 disabled:cursor-not-allowed',
  ].join(' '),
  
  // Bouton Success (Vert - Cours gratuits)
  success: [
    'inline-flex items-center justify-center',
    spacing.padding.button,
    colorClasses.success.bg,
    'text-white',
    'rounded-xl sm:rounded-2xl',
    colorClasses.success.bgHover,
    'focus:outline-none focus:ring-2 focus:ring-offset-2',
    colorClasses.success.ring,
    'transition-all duration-300',
    'font-semibold text-base sm:text-lg',
    'shadow-lg hover:shadow-xl',
    'transform hover:-translate-y-1',
    'disabled:opacity-50 disabled:cursor-not-allowed',
  ].join(' '),
  
  // Bouton Outline
  outline: [
    'inline-flex items-center justify-center',
    spacing.padding.button,
    'bg-white text-gray-900',
    'border-2 border-gray-300',
    'rounded-xl sm:rounded-2xl',
    'hover:bg-gray-50 hover:border-gray-400',
    'focus:outline-none focus:ring-2 focus:ring-offset-2',
    'focus:ring-gray-600',
    'transition-all duration-300',
    'font-semibold text-base sm:text-lg',
    'disabled:opacity-50 disabled:cursor-not-allowed',
  ].join(' '),
  
  // Bouton Ghost (Lien stylisé)
  ghost: [
    'inline-flex items-center',
    colorClasses.primary.text,
    colorClasses.primary.textHover,
    'focus:outline-none focus:ring-2 focus:ring-offset-2',
    colorClasses.primary.ring,
    'rounded font-semibold text-sm sm:text-base',
    'transition-all duration-300',
  ].join(' '),
} as const;

/**
 * Classes pour les cards
 */
export const cardClasses = {
  // Card standard
  default: [
    'bg-white',
    'rounded-2xl sm:rounded-3xl',
    'shadow-lg',
    'overflow-hidden',
    'hover:shadow-2xl',
    'transition-all duration-500',
    'transform hover:-translate-y-1 sm:hover:-translate-y-2',
    'border border-gray-100',
    'hover:border-blue-200',
  ].join(' '),
  
  // Card cours gratuit
  free: [
    'bg-white',
    'rounded-2xl sm:rounded-3xl',
    'shadow-lg',
    'overflow-hidden',
    'hover:shadow-2xl',
    'transition-all duration-500',
    'transform hover:-translate-y-2',
    'border-2 border-green-200',
    'hover:border-green-400',
  ].join(' '),
} as const;

/**
 * Classes pour les badges
 */
export const badgeClasses = {
  // Badge niveau (Débutant, Intermédiaire, Avancé)
  level: [
    colorClasses.primary.light,
    'text-xs font-semibold',
    'px-2 sm:px-3 py-1',
    'rounded-full',
  ].join(' '),
  
  // Badge gratuit
  free: [
    gradients.freeCourse,
    'text-white text-xs sm:text-sm font-bold',
    'px-3 sm:px-4 py-1.5 sm:py-2',
    'rounded-full',
    'shadow-xl ring-2 ring-white/50',
    'animate-pulse',
  ].join(' '),
  
  // Badge populaire
  popular: [
    colorClasses.secondary.light,
    'text-xs sm:text-sm font-medium',
    'px-3 sm:px-4 py-1.5 sm:py-2',
    'rounded-full',
  ].join(' '),
  
  // Badge starter
  starter: [
    colorClasses.primary.bg,
    'text-white text-xs font-bold',
    'px-2 sm:px-3 py-1',
    'rounded-full',
    'shadow-lg',
  ].join(' '),
} as const;

/**
 * Classes pour les sections
 */
export const sectionClasses = {
  // Section standard
  default: [
    spacing.section.md,
    'bg-gray-50',
    'relative overflow-hidden',
  ].join(' '),
  
  // Section avec gradient
  gradient: [
    spacing.section.md,
    gradients.sectionLight,
    'relative overflow-hidden',
  ].join(' '),
  
  // Conteneur de section
  container: spacing.container.default,
  
  // Titre de section
  title: [
    'text-center',
    spacing.margin.sectionTitle,
  ].join(' '),
} as const;


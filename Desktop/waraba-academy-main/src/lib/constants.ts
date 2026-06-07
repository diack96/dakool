/**
 * Constantes pour éviter les magic strings
 */

export const USER_ROLES = {
  ADMIN: 'admin',
  INSTRUCTOR: 'instructor',
  STUDENT: 'student',
} as const;

export type UserRole = typeof USER_ROLES[keyof typeof USER_ROLES];

export const ADMIN_ROLES = {
  SUPER_ADMIN: 'super_admin',
  ADMIN: 'admin',
  MODERATOR: 'moderator',
} as const;

export type AdminRole = typeof ADMIN_ROLES[keyof typeof ADMIN_ROLES];

export const PERMISSIONS = {
  // Users
  USERS_READ: 'users.read',
  USERS_WRITE: 'users.write',
  USERS_DELETE: 'users.delete',

  // Courses
  COURSES_MANAGE: 'courses.manage',
  COURSES_CREATE: 'courses.create',
  COURSES_EDIT: 'courses.edit',
  COURSES_DELETE: 'courses.delete',

  // System
  SYSTEM_MONITOR: 'system.monitor',
  SYSTEM_BACKUP: 'system.backup',

  // Logs
  LOGS_VIEW: 'logs.view',

  // Roles
  ROLES_MANAGE: 'roles.manage',

  // All permissions
  ALL: '*',
} as const;

export const ENROLLMENT_STATUS = {
  PENDING: 'pending',
  ACTIVE: 'active',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
} as const;

export const PAYMENT_STATUS = {
  PENDING: 'pending',
  COMPLETED: 'completed',
  FAILED: 'failed',
  REFUNDED: 'refunded',
} as const;

// Durées de cache (en secondes)
export const CACHE_TTL = {
  USER_ROLE: 300, // 5 minutes
  ADMIN_PERMISSIONS: 600, // 10 minutes
  STATS: 60, // 1 minute
} as const;

// Rate limiting
export const RATE_LIMIT = {
  LOGIN: { maxRequests: 5, windowMs: 15 * 60 * 1000 }, // 5 tentatives / 15min
  ADMIN_API: { maxRequests: 100, windowMs: 15 * 60 * 1000 }, // 100 requêtes / 15min
  API: { maxRequests: 1000, windowMs: 60 * 1000 }, // 1000 requêtes / minute
} as const;

// NOTE: L'accès admin est désormais géré uniquement via le rôle en base de données
// Ne JAMAIS utiliser d'email hardcodé pour l'authentification admin

// Statistiques affichées sur la page d'accueil (Hero + StatsSection)
export const SITE_STATS = {
  students: '2K+',
  courses: '20+',
  satisfaction: '95%',
  countries: '7',
} as const;


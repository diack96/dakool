/**
 * Schémas de validation Zod pour les routes admin
 */

import { z } from 'zod';
import { USER_ROLES } from '../constants';

// Validation création utilisateur
export const createUserSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(8, 'Le mot de passe doit contenir au moins 8 caractères').max(128),
  first_name: z.string().min(1, 'Le prénom est requis').max(100),
  last_name: z.string().min(1, 'Le nom est requis').max(100),
  role: z.enum([USER_ROLES.ADMIN, USER_ROLES.INSTRUCTOR, USER_ROLES.STUDENT]),
  admin_role_id: z.string().uuid().optional().nullable(),
});

// Validation mise à jour utilisateur
export const updateUserSchema = z.object({
  email: z.string().email().optional(),
  first_name: z.string().min(1).max(100).optional(),
  last_name: z.string().min(1).max(100).optional(),
  role: z.enum([USER_ROLES.ADMIN, USER_ROLES.INSTRUCTOR, USER_ROLES.STUDENT]).optional(),
  admin_role_id: z.string().uuid().optional().nullable(),
});

// Validation création cours
export const createCourseSchema = z.object({
  title: z.string().min(1, 'Le titre est requis').max(200),
  description: z.string().min(10, 'La description doit contenir au moins 10 caractères'),
  category_id: z.string().uuid(),
  instructor_id: z.string().uuid().optional(),
  price: z.number().min(0, 'Le prix doit être positif'),
  is_published: z.boolean().optional(),
  thumbnail_url: z.string().url().optional().nullable(),
  video_url: z.string().url().optional().nullable(),
});

// Validation mise à jour cours
export const updateCourseSchema = createCourseSchema.partial();

// Validation pagination - Schéma robuste avec gestion des valeurs null/undefined
export const paginationSchema = z.object({
  page: z.preprocess(
    (val) => {
      if (val === null || val === undefined || val === '') return 1;
      if (typeof val === 'string') {
        const num = parseInt(val, 10);
        return isNaN(num) || num < 1 ? 1 : num;
      }
      if (typeof val === 'number') {
        return val < 1 ? 1 : Math.floor(val);
      }
      return 1;
    },
    z.number().int().min(1),
  ).default(1),
  limit: z.preprocess(
    (val) => {
      if (val === null || val === undefined || val === '') return 20;
      if (typeof val === 'string') {
        const num = parseInt(val, 10);
        if (isNaN(num) || num < 1) return 20;
        return num > 100 ? 100 : num;
      }
      if (typeof val === 'number') {
        const num = Math.floor(val);
        if (num < 1) return 20;
        return num > 100 ? 100 : num;
      }
      return 20;
    },
    z.number().int().min(1).max(100),
  ).default(20),
  search: z.preprocess(
    (val) => {
      if (val === null || val === undefined || val === '') return undefined;
      return typeof val === 'string' ? val : undefined;
    },
    z.string().optional(),
  ),
  role: z.preprocess(
    (val) => {
      if (val === null || val === undefined || val === '') return undefined;
      const validRoles = [USER_ROLES.ADMIN, USER_ROLES.INSTRUCTOR, USER_ROLES.STUDENT];
      if (typeof val === 'string' && validRoles.includes(val as any)) {
        return val as 'student' | 'instructor' | 'admin';
      }
      return undefined;
    },
    z.enum([USER_ROLES.ADMIN, USER_ROLES.INSTRUCTOR, USER_ROLES.STUDENT]).optional(),
  ),
  status: z.preprocess(
    (val) => {
      if (val === null || val === undefined || val === '') return undefined;
      const validStatuses = ['active', 'inactive'];
      if (typeof val === 'string' && validStatuses.includes(val)) {
        return val;
      }
      return undefined;
    },
    z.enum(['active', 'inactive']).optional(),
  ),
});

// Validation permissions check
export const checkPermissionsSchema = z.object({
  permissions: z.array(z.string()).min(1, 'Au moins une permission est requise'),
});

// Validation création rôle admin
export const createAdminRoleSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().optional(),
  permissions: z.array(z.string().uuid()).optional(),
});

// Validation création catégorie
export const createCategorySchema = z.object({
  name: z.string().min(1, 'Le nom est requis').max(100),
  description: z.string().optional(),
  slug: z.string().min(1).max(100).regex(/^[a-z0-9-]+$/, 'Le slug doit être en minuscules avec des tirets'),
  icon: z.string().optional(),
});

// Fonction utilitaire pour valider et parser
export function validateAndParse<T> (schema: z.ZodSchema<T>, data: unknown): T {
  return schema.parse(data);
}

// Fonction pour valider avec gestion d'erreurs
export function safeValidate<T> (schema: z.ZodSchema<T>, data: unknown): { success: boolean; data?: T; error?: string } {
  try {
    const validated = schema.parse(data);
    return { success: true, data: validated };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', '),
      };
    }
    return { success: false, error: 'Erreur de validation' };
  }
}


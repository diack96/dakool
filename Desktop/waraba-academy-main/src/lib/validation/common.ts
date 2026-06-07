/**
 * Schémas de validation Zod communs et réutilisables
 */

import { z } from 'zod';

// Schéma pour les UUIDs
export const uuidSchema = z.string().uuid('ID invalide');

// Schéma pour les emails
export const emailSchema = z.string().email('Email invalide');

// Schéma pour les URLs
export const urlSchema = z.string().url('URL invalide').optional().nullable();

// Schéma pour les montants (prix)
export const amountSchema = z.number().min(0, 'Le montant doit être positif');

// Schéma pour les devises
export const currencySchema = z.string().length(3, 'La devise doit être au format ISO 4217 (3 caractères)').default('eur');

// Schéma pour les paginations
export const paginationQuerySchema = z.object({
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
      return typeof val === 'string' ? val.trim() : undefined;
    },
    z.string().optional(),
  ),
});

// Schéma pour les réponses de quiz
export const quizAnswerSchema = z.object({
  questionId: z.string().uuid('ID de question invalide'),
  answerId: z.string().uuid('ID de réponse invalide'),
});

// Schéma pour soumettre un quiz
export const submitQuizSchema = z.object({
  quizId: z.string().uuid('ID de quiz invalide'),
  answers: z.array(quizAnswerSchema).min(1, 'Au moins une réponse est requise'),
  timeTaken: z.number().int().min(0).optional().nullable(),
});

// Schéma pour créer une notification
export const createNotificationSchema = z.object({
  user_id: z.string().uuid('ID utilisateur invalide'),
  title: z.string().min(1, 'Le titre est requis').max(255, 'Le titre est trop long'),
  message: z.string().min(1, 'Le message est requis').max(1000, 'Le message est trop long'),
  type: z.enum(['info', 'success', 'warning', 'error']).default('info'),
  action_url: z.string().url('URL d\'action invalide').optional().nullable(),
});

// Schéma pour créer une intention de paiement
export const createPaymentIntentSchema = z.object({
  amount: z.number().positive('Le montant doit être positif'),
  currency: currencySchema,
  metadata: z.record(z.string(), z.string()).optional().default({}),
});

// Schéma pour s'inscrire à un cours
export const enrollCourseSchema = z.object({
  courseId: z.string().uuid('ID de cours invalide'),
});

// Fonction utilitaire pour valider les paramètres de requête
export function validateQueryParams<T extends z.ZodSchema> (schema: T, searchParams: URLSearchParams) {
  const params: Record<string, string | undefined> = {};
  for (const [key, value] of searchParams.entries()) {
    params[key] = value;
  }
  return schema.parse(params);
}

// Fonction utilitaire pour valider le body d'une requête
export function validateBody<T extends z.ZodSchema> (schema: T, body: unknown) {
  return schema.parse(body);
}

// Fonction pour valider avec gestion d'erreurs
export function safeValidate<T extends z.ZodSchema> (schema: T, data: unknown) {
  return schema.safeParse(data);
}


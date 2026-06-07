/**
 * Schémas de validation Zod pour les routes courses
 */

import { z } from 'zod';

// Validation création leçon
export const createLessonSchema = z.object({
  title: z.string().min(1, 'Le titre est requis').max(200),
  description: z.string().min(1, 'La description est requise').max(1000),
  content: z.string().min(1, 'Le contenu est requis'),
  videoUrl: z.string().url().optional().nullable(),
  duration: z.number().int().min(0).optional().nullable(),
  order: z.number().int().min(0).default(0),
});

// Validation progression leçon
export const lessonProgressSchema = z.object({
  progress: z.number().min(0).max(1).optional(), // 0-1 pour le pourcentage
  lastPlayedTime: z.number().min(0).optional(), // Temps en secondes
  isCompleted: z.boolean().optional().default(false),
});

// Validation mise à jour progression
export const updateProgressSchema = z.object({
  progress: z.number().min(0).max(1).optional(),
  lastPlayedTime: z.number().min(0).optional().default(0),
  isCompleted: z.boolean().default(false),
});

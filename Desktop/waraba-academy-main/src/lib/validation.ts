import { z } from 'zod';

// Schémas de validation pour l'authentification
export const loginSchema = z.object({
  email: z.string()
    .email('Format d\'email invalide')
    .min(1, 'Email requis')
    .max(255, 'Email trop long')
    .transform(email => email.toLowerCase().trim()),
  password: z.string()
    .min(8, 'Le mot de passe doit contenir au moins 8 caractères')
    .max(128, 'Le mot de passe est trop long'),
});

export const registerSchema = z.object({
  email: z.string()
    .email('Format d\'email invalide')
    .min(1, 'Email requis')
    .max(255, 'Email trop long')
    .transform(email => email.toLowerCase().trim()),
  password: z.string()
    .min(8, 'Le mot de passe doit contenir au moins 8 caractères')
    .max(128, 'Le mot de passe est trop long'),
  firstName: z.string()
    .min(2, 'Le prénom doit contenir au moins 2 caractères')
    .max(50, 'Le prénom est trop long')
    .transform(name => name.trim())
    .optional(),
  lastName: z.string()
    .min(2, 'Le nom doit contenir au moins 2 caractères')
    .max(50, 'Le nom est trop long')
    .transform(name => name.trim())
    .optional(),
  role: z.enum(['student', 'instructor'], {
    message: 'Rôle invalide',
  }).optional().default('student'),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string()
    .min(1, 'Mot de passe actuel requis'),
  newPassword: z.string()
    .min(8, 'Le nouveau mot de passe doit contenir au moins 8 caractères')
    .max(128, 'Le nouveau mot de passe est trop long')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
      'Le nouveau mot de passe doit contenir au moins une minuscule, une majuscule, un chiffre et un caractère spécial',
    ),
});

export const forgotPasswordSchema = z.object({
  email: z.string()
    .email('Format d\'email invalide')
    .min(1, 'Email requis')
    .transform(email => email.toLowerCase().trim()),
});

export const resetPasswordSchema = z.object({
  token: z.string()
    .min(1, 'Token de réinitialisation requis'),
  newPassword: z.string()
    .min(8, 'Le nouveau mot de passe doit contenir au moins 8 caractères')
    .max(128, 'Le nouveau mot de passe est trop long')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
      'Le nouveau mot de passe doit contenir au moins une minuscule, une majuscule, un chiffre et un caractère spécial',
    ),
});

// Schémas de validation pour les cours
export const courseEnrollmentSchema = z.object({
  courseId: z.string()
    .min(1, 'ID du cours requis'),
  userId: z.string()
    .min(1, 'ID de l\'utilisateur requis'),
});

export const lessonCompletionSchema = z.object({
  lessonId: z.string()
    .min(1, 'ID de la leçon requis'),
  completed: z.boolean(),
});

// Schémas de validation pour les quiz
export const quizSubmissionSchema = z.object({
  quizId: z.string()
    .min(1, 'ID du quiz requis'),
  answers: z.array(z.string())
    .min(1, 'Au moins une réponse requise'),
  timeSpent: z.number()
    .min(0, 'Temps passé invalide')
    .optional(),
});

// Types TypeScript dérivés des schémas
export type LoginInput = z.infer<typeof loginSchema>
export type RegisterInput = z.infer<typeof registerSchema>
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>
export type CourseEnrollmentInput = z.infer<typeof courseEnrollmentSchema>
export type LessonCompletionInput = z.infer<typeof lessonCompletionSchema>
export type QuizSubmissionInput = z.infer<typeof quizSubmissionSchema>

// Fonction utilitaire pour valider et transformer les données
export function validateAndTransform<T> (schema: z.ZodSchema<T>, data: unknown): T {
  try {
    return schema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new Error(`Validation failed: ${error.errors.map(e => e.message).join(', ')}`);
    }
    throw error;
  }
}

// Validation centralisée pour l'authentification

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export const validateEmail = (email: string): string | null => {
  if (!email.trim()) {
    return 'L\'email est requis';
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return 'Format d\'email invalide';
  }

  return null;
};

export const validatePassword = (password: string): string | null => {
  if (!password) {
    return 'Le mot de passe est requis';
  }

  if (password.length < 8) {
    return 'Le mot de passe doit contenir au moins 8 caractères';
  }

  if (password.length > 128) {
    return 'Le mot de passe est trop long (max 128 caractères)';
  }

  return null;
};

export const validateName = (name: string, fieldName: string): string | null => {
  if (!name.trim()) {
    return `Le ${fieldName} est requis`;
  }

  if (name.trim().length < 2) {
    return `Le ${fieldName} doit contenir au moins 2 caractères`;
  }

  if (name.trim().length > 50) {
    return `Le ${fieldName} est trop long (max 50 caractères)`;
  }

  // Vérifier que le nom ne contient que des lettres, espaces et tirets
  const nameRegex = /^[a-zA-ZÀ-ÿ\s\-']+$/;
  if (!nameRegex.test(name.trim())) {
    return `Le ${fieldName} ne peut contenir que des lettres, espaces et tirets`;
  }

  return null;
};

export const validateRegistrationForm = (formData: {
  email: string;
  password: string;
}): ValidationResult => {
  const errors: string[] = [];

  // Validation de l'email
  const emailError = validateEmail(formData.email);
  if (emailError) errors.push(emailError);

  // Validation du mot de passe (minimum 8 caractères)
  const passwordError = validatePassword(formData.password);
  if (passwordError) {
    // Ajuster le message pour minimum 8 caractères
    if (formData.password.length < 8) {
      errors.push('Le mot de passe doit contenir au moins 8 caractères');
    } else {
      errors.push(passwordError);
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

export const validateLoginForm = (formData: {
  email: string;
  password: string;
}): ValidationResult => {
  const errors: string[] = [];

  // Validation de l'email
  const emailError = validateEmail(formData.email);
  if (emailError) errors.push(emailError);

  // Validation du mot de passe
  if (!formData.password) {
    errors.push('Le mot de passe est requis');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

export const validateForgotPasswordForm = (email: string): ValidationResult => {
  const errors: string[] = [];

  // Validation de l'email
  const emailError = validateEmail(email);
  if (emailError) errors.push(emailError);

  return {
    isValid: errors.length === 0,
    errors,
  };
};

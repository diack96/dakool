/**
 * Tests unitaires pour src/lib/validation.ts
 * @jest-environment node
 */

import {
  // Zod schemas
  loginSchema,
  registerSchema,
  changePasswordSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  courseEnrollmentSchema,
  lessonCompletionSchema,
  quizSubmissionSchema,
  // Utility functions
  validateAndTransform,
  validateEmail,
  validatePassword,
  validateName,
  validateLoginForm,
  validateRegistrationForm,
  validateForgotPasswordForm,
} from '@/lib/validation';

// ──────────────────────────────────────────────────────────────────────────────
// validateEmail
// ──────────────────────────────────────────────────────────────────────────────

describe('validateEmail', () => {
  it('retourne null pour un email valide', () => {
    expect(validateEmail('user@example.com')).toBeNull();
    expect(validateEmail('test.email+alias@domain.co')).toBeNull();
  });

  it('retourne une erreur si l\'email est vide', () => {
    expect(validateEmail('')).toBe('L\'email est requis');
    expect(validateEmail('   ')).toBe('L\'email est requis');
  });

  it('retourne une erreur si le format est invalide', () => {
    expect(validateEmail('not-an-email')).toBe('Format d\'email invalide');
    expect(validateEmail('missing@')).toBe('Format d\'email invalide');
    expect(validateEmail('@nodomain.com')).toBe('Format d\'email invalide');
    expect(validateEmail('no spaces @email.com')).toBe('Format d\'email invalide');
  });
});

// ──────────────────────────────────────────────────────────────────────────────
// validatePassword
// ──────────────────────────────────────────────────────────────────────────────

describe('validatePassword', () => {
  it('retourne null pour un mot de passe valide', () => {
    expect(validatePassword('password123')).toBeNull();
    expect(validatePassword('abcdefgh')).toBeNull();
  });

  it('retourne une erreur si le mot de passe est vide', () => {
    expect(validatePassword('')).toBe('Le mot de passe est requis');
  });

  it('retourne une erreur si trop court (< 8 caractères)', () => {
    expect(validatePassword('abc')).toBe('Le mot de passe doit contenir au moins 8 caractères');
    expect(validatePassword('1234567')).toBe('Le mot de passe doit contenir au moins 8 caractères');
  });

  it('retourne une erreur si trop long (> 128 caractères)', () => {
    const longPwd = 'a'.repeat(129);
    expect(validatePassword(longPwd)).toBe('Le mot de passe est trop long (max 128 caractères)');
  });

  it('accepte exactement 8 caractères', () => {
    expect(validatePassword('12345678')).toBeNull();
  });

  it('accepte exactement 128 caractères', () => {
    expect(validatePassword('a'.repeat(128))).toBeNull();
  });
});

// ──────────────────────────────────────────────────────────────────────────────
// validateName
// ──────────────────────────────────────────────────────────────────────────────

describe('validateName', () => {
  it('retourne null pour un nom valide', () => {
    expect(validateName('Mamadou', 'prénom')).toBeNull();
    expect(validateName('Jean-Pierre', 'prénom')).toBeNull();
    expect(validateName('Aïssatou', 'nom')).toBeNull();
  });

  it('retourne une erreur si vide', () => {
    expect(validateName('', 'prénom')).toBe('Le prénom est requis');
    expect(validateName('   ', 'nom')).toBe('Le nom est requis');
  });

  it('retourne une erreur si trop court (< 2 caractères)', () => {
    expect(validateName('A', 'prénom')).toBe('Le prénom doit contenir au moins 2 caractères');
  });

  it('retourne une erreur si trop long (> 50 caractères)', () => {
    const longName = 'A'.repeat(51);
    expect(validateName(longName, 'prénom')).toBe('Le prénom est trop long (max 50 caractères)');
  });

  it('retourne une erreur si contient des chiffres ou caractères spéciaux non autorisés', () => {
    expect(validateName('Jean123', 'prénom')).toContain('ne peut contenir que des lettres');
    expect(validateName('Test!', 'prénom')).toContain('ne peut contenir que des lettres');
  });

  it('accepte les noms avec espaces et apostrophes', () => {
    expect(validateName("N'Diaye", 'nom')).toBeNull();
    expect(validateName('Jean Pierre', 'prénom')).toBeNull();
  });
});

// ──────────────────────────────────────────────────────────────────────────────
// validateLoginForm
// ──────────────────────────────────────────────────────────────────────────────

describe('validateLoginForm', () => {
  it('valide un formulaire correct', () => {
    const result = validateLoginForm({ email: 'user@test.com', password: 'password123' });
    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('invalide avec email manquant', () => {
    const result = validateLoginForm({ email: '', password: 'password123' });
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('L\'email est requis');
  });

  it('invalide avec mot de passe manquant', () => {
    const result = validateLoginForm({ email: 'user@test.com', password: '' });
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Le mot de passe est requis');
  });

  it('invalide avec email et mot de passe manquants', () => {
    const result = validateLoginForm({ email: '', password: '' });
    expect(result.isValid).toBe(false);
    expect(result.errors).toHaveLength(2);
  });

  it('invalide avec email mal formaté', () => {
    const result = validateLoginForm({ email: 'invalidemail', password: 'password123' });
    expect(result.isValid).toBe(false);
    expect(result.errors[0]).toBe('Format d\'email invalide');
  });
});

// ──────────────────────────────────────────────────────────────────────────────
// validateRegistrationForm
// ──────────────────────────────────────────────────────────────────────────────

describe('validateRegistrationForm', () => {
  it('valide un formulaire correct', () => {
    const result = validateRegistrationForm({ email: 'user@test.com', password: 'password123' });
    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('invalide avec email invalide', () => {
    const result = validateRegistrationForm({ email: 'not-email', password: 'password123' });
    expect(result.isValid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });

  it('invalide avec mot de passe trop court', () => {
    const result = validateRegistrationForm({ email: 'user@test.com', password: 'short' });
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Le mot de passe doit contenir au moins 8 caractères');
  });

  it('invalide avec les deux champs invalides', () => {
    const result = validateRegistrationForm({ email: '', password: '' });
    expect(result.isValid).toBe(false);
    expect(result.errors.length).toBeGreaterThanOrEqual(2);
  });
});

// ──────────────────────────────────────────────────────────────────────────────
// validateForgotPasswordForm
// ──────────────────────────────────────────────────────────────────────────────

describe('validateForgotPasswordForm', () => {
  it('valide un email correct', () => {
    const result = validateForgotPasswordForm('user@test.com');
    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('invalide avec email vide', () => {
    const result = validateForgotPasswordForm('');
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('L\'email est requis');
  });

  it('invalide avec email mal formaté', () => {
    const result = validateForgotPasswordForm('bad-email');
    expect(result.isValid).toBe(false);
    expect(result.errors[0]).toBe('Format d\'email invalide');
  });
});

// ──────────────────────────────────────────────────────────────────────────────
// Zod schemas
// ──────────────────────────────────────────────────────────────────────────────

describe('loginSchema (Zod)', () => {
  it('valide et normalise l\'email en minuscules', () => {
    const result = loginSchema.parse({ email: 'USER@EXAMPLE.COM', password: 'password123' });
    expect(result.email).toBe('user@example.com');
  });

  it('rejette un email invalide', () => {
    expect(() => loginSchema.parse({ email: 'bad', password: 'password123' })).toThrow();
  });

  it('rejette un mot de passe trop court', () => {
    expect(() => loginSchema.parse({ email: 'user@test.com', password: '1234567' })).toThrow();
  });
});

describe('registerSchema (Zod)', () => {
  it('valide avec role par défaut "student"', () => {
    const result = registerSchema.parse({ email: 'user@test.com', password: 'password123' });
    expect(result.role).toBe('student');
  });

  it('valide avec role "instructor"', () => {
    const result = registerSchema.parse({
      email: 'user@test.com',
      password: 'password123',
      role: 'instructor',
    });
    expect(result.role).toBe('instructor');
  });

  it('rejette un role invalide', () => {
    expect(() => registerSchema.parse({
      email: 'user@test.com',
      password: 'password123',
      role: 'superadmin',
    })).toThrow();
  });

  it('trim le firstName et lastName', () => {
    const result = registerSchema.parse({
      email: 'user@test.com',
      password: 'password123',
      firstName: '  Jean  ',
      lastName: '  Dupont  ',
    });
    expect(result.firstName).toBe('Jean');
    expect(result.lastName).toBe('Dupont');
  });
});

describe('changePasswordSchema (Zod)', () => {
  it('valide un changement de mot de passe sécurisé', () => {
    const data = {
      currentPassword: 'ancienmdp',
      newPassword: 'Nouveau@123',
    };
    expect(() => changePasswordSchema.parse(data)).not.toThrow();
  });

  it('rejette un nouveau mot de passe sans majuscule', () => {
    expect(() => changePasswordSchema.parse({
      currentPassword: 'old',
      newPassword: 'newpassword@1',
    })).toThrow();
  });

  it('rejette un nouveau mot de passe sans caractère spécial', () => {
    expect(() => changePasswordSchema.parse({
      currentPassword: 'old',
      newPassword: 'NewPassword1',
    })).toThrow();
  });

  it('rejette si currentPassword vide', () => {
    expect(() => changePasswordSchema.parse({
      currentPassword: '',
      newPassword: 'New@Pass1',
    })).toThrow();
  });
});

describe('courseEnrollmentSchema (Zod)', () => {
  it('valide une inscription valide', () => {
    const result = courseEnrollmentSchema.parse({
      courseId: 'course-123',
      userId: 'user-456',
    });
    expect(result.courseId).toBe('course-123');
    expect(result.userId).toBe('user-456');
  });

  it('rejette des IDs vides', () => {
    expect(() => courseEnrollmentSchema.parse({ courseId: '', userId: '' })).toThrow();
  });
});

describe('lessonCompletionSchema (Zod)', () => {
  it('valide une complétion de leçon', () => {
    const result = lessonCompletionSchema.parse({ lessonId: 'lesson-1', completed: true });
    expect(result.completed).toBe(true);
  });

  it('rejette si completed n\'est pas un boolean', () => {
    expect(() => lessonCompletionSchema.parse({ lessonId: 'lesson-1', completed: 'yes' })).toThrow();
  });
});

describe('quizSubmissionSchema (Zod)', () => {
  it('valide une soumission de quiz', () => {
    const result = quizSubmissionSchema.parse({
      quizId: 'quiz-1',
      answers: ['answer-a', 'answer-b'],
      timeSpent: 120,
    });
    expect(result.answers).toHaveLength(2);
  });

  it('rejette si answers est vide', () => {
    expect(() => quizSubmissionSchema.parse({
      quizId: 'quiz-1',
      answers: [],
    })).toThrow();
  });

  it('accepte sans timeSpent (optionnel)', () => {
    const result = quizSubmissionSchema.parse({
      quizId: 'quiz-1',
      answers: ['a'],
    });
    expect(result.timeSpent).toBeUndefined();
  });

  it('rejette un timeSpent négatif', () => {
    expect(() => quizSubmissionSchema.parse({
      quizId: 'quiz-1',
      answers: ['a'],
      timeSpent: -1,
    })).toThrow();
  });
});

// ──────────────────────────────────────────────────────────────────────────────
// validateAndTransform
// ──────────────────────────────────────────────────────────────────────────────

describe('validateAndTransform', () => {
  it('retourne les données validées', () => {
    const result = validateAndTransform(loginSchema, {
      email: 'user@test.com',
      password: 'password123',
    });
    expect(result.email).toBe('user@test.com');
  });

  it('lance une erreur avec message lisible si la validation échoue', () => {
    expect(() => validateAndTransform(loginSchema, { email: 'bad', password: '' }))
      .toThrow('Validation failed:');
  });
});

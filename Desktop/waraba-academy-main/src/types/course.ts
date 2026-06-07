export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  avatar?: string;
  bio?: string;
  role: 'STUDENT' | 'INSTRUCTOR' | 'ADMIN';
}

export interface Category {
  id: string;
  name: string;
  description: string;
  slug: string;
  icon?: string;
  color?: string;
  isActive: boolean;
}

export interface Lesson {
  id: string;
  title: string;
  description?: string;
  content?: string;
  videoUrl?: string;
  duration: number; // en minutes
  type: 'VIDEO' | 'TEXT' | 'QUIZ' | 'ASSIGNMENT';
  order: number;
  isFree: boolean;
  isCompleted?: boolean;
  isCurrent?: boolean;
}

export interface Module {
  id: string;
  title: string;
  description?: string;
  order: number;
  lessons: Lesson[];
}

export interface Review {
  id: string;
  user: User;
  rating: number; // 1-5
  comment: string;
  date: string;
  helpful: number;
}

export interface Enrollment {
  id: string;
  userId: string;
  courseId: string;
  status: 'ACTIVE' | 'COMPLETED' | 'CANCELLED' | 'PAUSED';
  enrolledAt: string;
  completedAt?: string;
  progress: number; // 0-100
  currentLessonId?: string;
}

export interface CourseProgress {
  totalLessons: number;
  completedLessons: number;
  percentage: number;
  currentLesson: Lesson | null;
  timeSpent: number; // en minutes
  lastAccessed: string;
}

export type CourseLevel = 'DÉBUTANT' | 'INTERMÉDIAIRE' | 'AVANCÉ';
export type CourseStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';

export interface Course {
  // Informations de base
  id: string;
  slug?: string; // Slug pour les URLs lisibles (ex: "marketing-digital")
  title: string;
  description: string;
  longDescription: string;

  // Métadonnées
  instructor: User;
  category: Category;
  level: CourseLevel;
  status: CourseStatus;
  language: string;

  // Contenu
  modules: Module[];
  totalLessons: number;
  totalDuration: number; // en minutes

  // Prix et accès
  price: number;
  originalPrice?: number;
  isFree: boolean;
  certificate: boolean;
  lifetimeAccess: boolean;

  // Statistiques
  rating: number;
  totalStudents: number;
  totalReviews: number;

  // Fonctionnalités
  features: string[];
  requirements: string[];
  objectives: string[];

  // Médias
  thumbnail?: string;
  image?: string;
  videoPreview?: string;

  // Métadonnées système
  tags: string[];
  isFeatured: boolean;
  isPopular: boolean;
  isStarterCourse?: boolean; // Cours gratuit de démarrage (courte durée)
  isComingSoon?: boolean; // Cours bientôt disponible (inscription possible, contenu bloqué)
  lastUpdated: string;
  createdAt: string;
  updatedAt: string;
}

export interface CourseResource {
  id: string;
  courseId: string;
  title: string;
  type: 'file' | 'link';
  url: string;
  fileName?: string;
  fileSize?: number;
  mimeType?: string;
  order: number;
  createdAt: string;
}

export interface CourseFilters {
  category?: string;
  level?: CourseLevel;
  price?: 'free' | 'paid' | 'all';
  duration?: 'short' | 'medium' | 'long';
  rating?: number;
  search?: string;
  sortBy?: 'popular' | 'rating' | 'newest' | 'price';
  sortOrder?: 'asc' | 'desc';
}

export interface CourseFormData {
  title: string;
  description: string;
  longDescription: string;
  categoryId: string;
  level: CourseLevel;
  price: number;
  originalPrice?: number;
  language: string;
  certificate: boolean;
  lifetimeAccess: boolean;
  features: string[];
  requirements: string[];
  objectives: string[];
  tags: string[];
  isFeatured: boolean;
  isPopular: boolean;
}

// Types pour l'administration, catégories et cours

import type { Course } from './course';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'student' | 'instructor' | 'admin';
  status: 'active' | 'inactive';
  avatar?: string;
  bio?: string;
  phone?: string;
  location?: string;
  website?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Category {
  id: string;
  name: string;
  description: string;
  slug: string;
  imageUrl?: string;
  color?: string;
  courseCount: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface AdminCourse {
  id: string;
  title: string;
  description: string;
  shortDescription: string;
  categoryId: string;
  instructorId: string;
  price: number;
  originalPrice?: number;
  duration: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  status: 'draft' | 'published' | 'archived';
  thumbnail?: string;
  videoUrl?: string;
  syllabus: string; // JSON string contenant le programme détaillé
  requirements: string[];
  objectives: string[];
  materials: string[];
  enrollmentCount: number;
  rating: number;
  reviewCount: number;
  isFeatured: boolean;
  isPopular: boolean;
  isComingSoon?: boolean;
  createdAt: Date;
  updatedAt: Date;

  // Relations
  category?: Category;
  instructor?: User;
}

export interface Lesson {
  id: string;
  courseId: string;
  title: string;
  description: string;
  content: string;
  videoUrl?: string;
  duration: number; // en minutes
  order: number;
  isFree: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Enrollment {
  id: string;
  userId: string;
  courseId: string;
  progress: number; // 0-100
  completedAt?: Date;
  enrolledAt: Date;

  // Relations
  user?: User;
  course?: AdminCourse;
}

export interface AdminCourseFormData {
  title: string;
  description: string;
  shortDescription: string;
  categoryId: string;
  instructorId: string;
  price: number;
  originalPrice?: number;
  duration: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  status: 'draft' | 'published' | 'archived';
  thumbnail?: string;
  videoUrl?: string;
  syllabus: string;
  requirements: string[];
  objectives: string[];
  materials: string[];
  isFeatured: boolean;
  isPopular: boolean;
}

export interface CategoryFormData {
  name: string;
  description: string;
  slug: string;
  imageUrl?: string;
  color?: string;
  isActive: boolean;
}

export interface UserFormData {
  email: string;
  firstName: string;
  lastName: string;
  role: 'student' | 'instructor' | 'admin';
  status: 'active' | 'inactive';
  avatar?: string;
  bio?: string;
  phone?: string;
  location?: string;
  website?: string;
}

export interface AdminStats {
  totalUsers: number;
  totalCourses: number;
  totalCategories: number;
  totalEnrollments: number;
  recentEnrollments: Enrollment[];
  popularCourses: Course[];
  revenue: {
    monthly: number;
    total: number;
  };
}

import { Course } from '@/types/course';
import { generateSlug } from './slug';

/**
 * Génère l'URL d'un cours en utilisant le slug s'il existe, sinon l'ID
 * Exemple: 
 * - Avec slug: "/courses/marketing-digital"
 * - Sans slug: "/courses/05e56f93-6e53-464c-b045-82f00c800464"
 */
export function getCourseUrl(course: Course | { id: string; slug?: string; title?: string }): string {
  // Si le cours a un slug, l'utiliser
  if (course.slug) {
    return `/courses/${course.slug}`;
  }
  
  // Sinon, utiliser l'ID
  return `/courses/${course.id}`;
}

/**
 * Génère un slug à partir d'un titre de cours
 * Utilisé lors de la création/mise à jour d'un cours
 */
export function generateCourseSlug(title: string): string {
  return generateSlug(title);
}

/**
 * Génère l'URL de la page learn d'un cours en utilisant le slug s'il existe, sinon l'ID
 * Exemple: 
 * - Avec slug: "/courses/marketing-digital/learn"
 * - Sans slug: "/courses/05e56f93-6e53-464c-b045-82f00c800464/learn"
 */
export function getCourseLearnUrl(course: { id: string; slug?: string } | string): string {
  // Si c'est une string, c'est probablement un ID ou slug direct
  if (typeof course === 'string') {
    return `/courses/${course}/learn`;
  }
  
  // Si le cours a un slug, l'utiliser
  if (course.slug) {
    return `/courses/${course.slug}/learn`;
  }
  
  // Sinon, utiliser l'ID
  return `/courses/${course.id}/learn`;
}


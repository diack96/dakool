import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Fonction utilitaire pour combiner les classes CSS de manière optimisée
 * Utilise clsx pour la logique conditionnelle et tailwind-merge pour dédupliquer les classes Tailwind
 */
export function cn (...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Fonction utilitaire pour formater les dates avec Intl.DateTimeFormat (API native, performante)
 * Format: "15 janvier 2025" ou "Il y a 2 jours" pour les dates récentes
 */
export function formatDate (date: Date | string | null | undefined): string {
  if (!date) return 'Date inconnue';

  try {
    const d = typeof date === 'string' ? new Date(date) : date;

    // Vérifier si la date est valide
    if (isNaN(d.getTime())) {
      return 'Date invalide';
    }

    // Utiliser Intl.DateTimeFormat pour un formatage robuste et localisé
    const formatter = new Intl.DateTimeFormat('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      timeZone: 'UTC',
    });

    return formatter.format(d);
  } catch (error) {
    console.error('Erreur lors du formatage de la date:', error);
    return 'Date invalide';
  }
}

/**
 * Format de date court: "15/01/2025"
 */
export function formatDateShort (date: Date | string | null | undefined): string {
  if (!date) return 'N/A';

  try {
    const d = typeof date === 'string' ? new Date(date) : date;

    if (isNaN(d.getTime())) {
      return 'N/A';
    }

    const formatter = new Intl.DateTimeFormat('fr-FR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      timeZone: 'UTC',
    });

    return formatter.format(d);
  } catch (error) {
    return 'N/A';
  }
}

/**
 * Format de date avec heure: "15 janvier 2025 à 14:30"
 */
export function formatDateTime (date: Date | string | null | undefined): string {
  if (!date) return 'Date inconnue';

  try {
    const d = typeof date === 'string' ? new Date(date) : date;

    if (isNaN(d.getTime())) {
      return 'Date invalide';
    }

    const dateFormatter = new Intl.DateTimeFormat('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      timeZone: 'UTC',
    });

    const timeFormatter = new Intl.DateTimeFormat('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'UTC',
    });

    return `${dateFormatter.format(d)} à ${timeFormatter.format(d)}`;
  } catch (error) {
    return 'Date invalide';
  }
}

/**
 * Format relatif: "Il y a 2 jours", "Il y a 1 mois"
 */
export function formatDateRelative (date: Date | string | null | undefined): string {
  if (!date) return 'Date inconnue';

  try {
    const d = typeof date === 'string' ? new Date(date) : date;

    if (isNaN(d.getTime())) {
      return 'Date invalide';
    }

    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays < 1) {
      return 'Aujourd\'hui';
    } else if (diffDays === 1) {
      return 'Hier';
    } else if (diffDays < 7) {
      return `Il y a ${diffDays} jours`;
    } else if (diffDays < 30) {
      const weeks = Math.floor(diffDays / 7);
      return `Il y a ${weeks} semaine${weeks > 1 ? 's' : ''}`;
    } else if (diffDays < 365) {
      const months = Math.floor(diffDays / 30);
      return `Il y a ${months} mois`;
    } else {
      const years = Math.floor(diffDays / 365);
      return `Il y a ${years} an${years > 1 ? 's' : ''}`;
    }
  } catch (error) {
    return 'Date invalide';
  }
}

/**
 * Fonction utilitaire pour formater les nombres
 */
export function formatNumber (num: number): string {
  return new Intl.NumberFormat('fr-FR').format(num);
}

/**
 * Formate un nom complet à partir de first_name et last_name
 * Gère les cas où les noms sont vides ou null
 */
export function formatFullName (
  firstName: string | null | undefined,
  lastName: string | null | undefined,
  fallback?: string,
): string {
  const first = (firstName || '').trim();
  const last = (lastName || '').trim();

  if (first && last) {
    return `${first} ${last}`;
  } else if (first) {
    return first;
  } else if (last) {
    return last;
  } else if (fallback) {
    return fallback;
  } else {
    return 'Utilisateur sans nom';
  }
}

/**
 * Formate un nom avec initiales pour les avatars
 */
export function formatInitials (
  firstName: string | null | undefined,
  lastName: string | null | undefined,
): string {
  const first = (firstName || '').trim();
  const last = (lastName || '').trim();

  if (first && last) {
    return `${first[0]?.toUpperCase() || ''}${last[0]?.toUpperCase() || ''}`;
  } else if (first) {
    return first[0]?.toUpperCase() || '';
  } else if (last) {
    return last[0]?.toUpperCase() || '';
  } else {
    return 'U';
  }
}

/**
 * Fonction utilitaire pour tronquer le texte
 */
export function truncateText (text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength)}...`;
}

/**
 * Fonction utilitaire pour générer un slug
 */
export function generateSlug (text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

/**
 * Fonction utilitaire pour valider un email
 */
export function isValidEmail (email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Fonction utilitaire pour valider un mot de passe
 */
export function isValidPassword (password: string): boolean {
  // Au moins 8 caractères, 1 majuscule, 1 minuscule, 1 chiffre
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/;
  return passwordRegex.test(password);
}

/**
 * Fonction utilitaire pour formater la durée
 */
export function formatDuration (minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  if (hours === 0) {
    return `${mins}min`;
  }

  if (mins === 0) {
    return `${hours}h`;
  }

  return `${hours}h ${mins}min`;
}

/**
 * Fonction utilitaire pour formater le prix
 */
export function formatPrice (price: number, currency: string = 'EUR'): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency,
  }).format(price);
}

/**
 * Fonction utilitaire pour calculer le pourcentage
 */
export function calculatePercentage (value: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((value / total) * 100);
}

/**
 * Fonction utilitaire pour générer un ID unique
 */
export function generateId (): string {
  return Math.random().toString(36).substr(2, 9);
}

/**
 * Fonction utilitaire pour débouncer une fonction
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number,
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;

  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

/**
 * Fonction utilitaire pour throttler une fonction
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number,
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;

  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

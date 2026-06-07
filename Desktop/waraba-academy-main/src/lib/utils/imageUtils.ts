/**
 * Utilitaires pour la gestion sécurisée des images
 * - Validation des URLs
 * - Fallback automatique
 * - Prévention des erreurs 400
 */

/**
 * Valide qu'une URL d'image est valide
 */
export function isValidImageUrl(url: string | null | undefined): boolean {
  if (!url || typeof url !== 'string') return false;
  
  // Vérifier que ce n'est pas "undefined", "null", ou vide
  if (url === 'undefined' || url === 'null' || url.trim() === '') return false;
  
  // Vérifier que c'est une URL valide
  try {
    const urlObj = new URL(url, window.location.origin);
    return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
  } catch {
    // Si ce n'est pas une URL absolue, vérifier que c'est un chemin relatif valide
    return url.startsWith('/') || url.startsWith('./') || url.startsWith('../');
  }
}

/**
 * Génère une URL d'image de placeholder
 */
export function getPlaceholderImageUrl(text?: string): string {
  const encodedText = text ? encodeURIComponent(text.substring(0, 20)) : 'Course';
  return `data:image/svg+xml,${encodeURIComponent(`
    <svg width="400" height="200" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#3b82f6;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#1e40af;stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect width="400" height="200" fill="url(#grad)"/>
      <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="24" fill="white" text-anchor="middle" dominant-baseline="middle">${encodedText}</text>
    </svg>
  `)}`;
}

/**
 * Obtient une URL d'image sécurisée avec fallback
 */
export function getSafeImageUrl(
  imageUrl: string | null | undefined,
  fallbackText?: string
): string {
  if (isValidImageUrl(imageUrl)) {
    return imageUrl!;
  }
  
  return getPlaceholderImageUrl(fallbackText);
}

/**
 * Handler d'erreur pour les images
 * Remplace l'image par un placeholder si elle échoue à charger
 */
export function createImageErrorHandler(fallbackText?: string) {
  return (event: React.SyntheticEvent<HTMLImageElement, Event>) => {
    const target = event.target as HTMLImageElement;
    
    // Si l'image a déjà été remplacée, ne rien faire
    if (target.dataset.fallback === 'true') return;
    
    // Remplacer par le placeholder
    target.src = getPlaceholderImageUrl(fallbackText);
    target.dataset.fallback = 'true';
    
    // Optionnel: masquer l'image et afficher un placeholder
    if (target.parentElement) {
      target.style.display = 'none';
      const placeholder = document.createElement('div');
      placeholder.className = 'w-full h-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center';
      placeholder.innerHTML = `
        <svg class="w-16 h-16 text-white opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
        </svg>
      `;
      target.parentElement.appendChild(placeholder);
    }
  };
}

/**
 * Note: Pour un composant React sécurisé, créez un fichier séparé:
 * src/components/ui/SafeImage.tsx
 * 
 * Exemple d'utilisation:
 * import { getSafeImageUrl, createImageErrorHandler } from '@/lib/utils/imageUtils';
 * 
 * <img
 *   src={getSafeImageUrl(course.image, course.title)}
 *   alt={course.title}
 *   onError={createImageErrorHandler(course.title)}
 * />
 */

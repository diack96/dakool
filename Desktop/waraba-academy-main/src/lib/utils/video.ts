/**
 * Utilitaires pour la gestion des videos
 */

/**
 * Detecte si une URL est une URL YouTube
 */
export function isYouTubeUrl(url: string): boolean {
  if (!url) return false;

  const youtubePatterns = [
    /youtube\.com\/watch\?v=([^&]+)/,
    /youtu\.be\/([^?]+)/,
    /youtube\.com\/embed\/([^?]+)/,
    /youtube\.com\/shorts\/([^?]+)/,
  ];

  return youtubePatterns.some(pattern => pattern.test(url));
}

/**
 * Extrait l'ID YouTube depuis une URL
 */
export function extractYouTubeId(input: string): string | null {
  if (!input) return null;

  const patterns = [
    /youtube\.com\/watch\?v=([^&]+)/,
    /youtu\.be\/([^?]+)/,
    /youtube\.com\/embed\/([^?]+)/,
    /youtube\.com\/shorts\/([^?]+)/,
  ];

  for (const pattern of patterns) {
    const match = input.match(pattern);
    if (match && match[1]) return match[1];
  }

  return null;
}

/**
 * Detecte le type de video depuis l'URL
 */
export type VideoType = 'youtube' | 'loom' | 'vimeo' | 'direct' | 'unknown';

export function isLoomUrl(url: string): boolean {
  return !!url && /loom\.com\/(share|embed)\/[a-zA-Z0-9]+/.test(url);
}

export function detectVideoType(url: string): VideoType {
  if (!url) return 'unknown';

  if (isYouTubeUrl(url)) return 'youtube';
  if (isLoomUrl(url)) return 'loom';
  if (/vimeo\.com\/(video\/)?[\d]+/.test(url)) return 'vimeo';
  if (url.startsWith('http') && /\.(mp4|webm|ogg)(\?|$)/i.test(url)) {
    return 'direct';
  }

  // Supabase signed URLs for direct video
  if (url.includes('supabase.co/storage')) return 'direct';

  return 'unknown';
}

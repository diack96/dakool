/**
 * Génère un slug à partir d'un texte
 * Exemple: "Marketing Digital" -> "marketing-digital"
 */
export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD') // Normaliser les caractères accentués
    .replace(/[\u0300-\u036f]/g, '') // Supprimer les accents
    .replace(/[^a-z0-9]+/g, '-') // Remplacer les caractères non alphanumériques par des tirets
    .replace(/^-+|-+$/g, '') // Supprimer les tirets en début et fin
    .substring(0, 100); // Limiter à 100 caractères
}

/**
 * Vérifie si une chaîne est un UUID
 */
export function isUUID(str: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
}


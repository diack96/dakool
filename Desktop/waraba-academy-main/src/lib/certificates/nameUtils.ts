/**
 * nameUtils.ts — Résolution fiable du nom réel d'un étudiant.
 *
 * Garantit qu'aucun certificat ne reçoit :
 *   - un préfixe d'e-mail ("julesmendy26")
 *   - un e-mail complet ("julesmendy26@gmail.com")
 *   - un placeholder ("Etudiant", "user", …)
 *   - un identifiant technique à chiffres ("user123")
 */

/** Valeurs connues qui ne désignent pas une vraie personne */
const PLACEHOLDER_SET = new Set([
  '', 'etudiant', 'étudiant', 'student', 'utilisateur', 'user',
  'unknown', 'inconnu', 'n/a', 'na', '-', 'test', 'admin', 'null', 'undefined',
]);

/** Un vrai prénom/nom ne contient pas @ et n'est pas majoritairement des chiffres */
const EMAIL_RE    = /@/;
const DIGIT_END_RE = /\d{2,}$/;         // "julesmendy26"
const ALL_DIGITS_RE = /^\d+$/;

/**
 * Retourne true si la chaîne ressemble à un e-mail, username ou placeholder —
 * donc ne doit PAS figurer sur un certificat.
 */
export function isNameSuspicious(name: string): boolean {
  const t = name.trim();
  if (!t) return true;
  if (PLACEHOLDER_SET.has(t.toLowerCase())) return true;
  if (EMAIL_RE.test(t)) return true;         // contient @
  if (ALL_DIGITS_RE.test(t)) return true;    // que des chiffres

  const words = t.split(/\s+/);

  // Un seul mot : suspect sauf s'il ne se termine pas par des chiffres
  if (words.length < 2) {
    if (DIGIT_END_RE.test(t.toLowerCase())) return true;  // "julesmendy26"
    // Monyme accepté uniquement comme prénom seul (pas pour un nom complet)
    return true; // on exige toujours prénom + nom pour un certificat
  }

  // Plusieurs mots : rejeter si l'un d'eux ressemble à un identifiant
  for (const w of words) {
    if (DIGIT_END_RE.test(w.toLowerCase())) return true;
  }

  return false;
}

/**
 * Découpe un nom affiché en prénom + nom de famille.
 *
 * "Jules Mendy"       → { firstName: "Jules",      lastName: "Mendy" }
 * "Marie Anne Dupont" → { firstName: "Marie Anne",  lastName: "Dupont" }
 *
 * Retourne null si le nom est suspect ou non analysable.
 */
export function parseDisplayName(
  displayName: string,
): { firstName: string; lastName: string } | null {
  const t = displayName.trim();
  if (isNameSuspicious(t)) return null;

  const parts = t.split(/\s+/);
  if (parts.length < 2) return null;

  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const lastName  = parts[parts.length - 1]!;  // safe: checked parts.length >= 2 above
  const firstName = parts.slice(0, -1).join(' ');
  return { firstName, lastName };
}

interface ProfileData {
  first_name?: string | null;
  last_name?: string | null;
  full_name?: string | null;
}

interface OAuthMetadata {
  full_name?: string | null;
  name?: string | null;
  given_name?: string | null;
  family_name?: string | null;
}

/**
 * Résout le meilleur nom disponible pour l'étudiant.
 *
 * Ordre de priorité (du plus fiable au moins fiable) :
 *   1. profile.first_name + profile.last_name   (les deux non-vides)
 *   2. Parsing de profile.full_name
 *   3. OAuth given_name + family_name            (Google, GitHub…)
 *   4. Parsing de OAuth full_name / name
 *
 * Retourne null si aucune source ne donne un nom valide.
 * Le caller doit alors bloquer la génération et demander la mise à jour du profil.
 */
export function resolveStudentName(
  profile: ProfileData | null | undefined,
  oauthMeta?: OAuthMetadata | null,
): string | null {
  // 1. Prénom + Nom explicites dans le profil (source de vérité idéale)
  const fn = (profile?.first_name ?? '').trim();
  const ln = (profile?.last_name  ?? '').trim();
  if (fn && ln) {
    const full = `${fn} ${ln}`;
    if (!isNameSuspicious(full)) return full;
  }

  // 2. full_name dans le profil
  const profileFull = (profile?.full_name ?? '').trim();
  if (profileFull) {
    const parsed = parseDisplayName(profileFull);
    if (parsed) return `${parsed.firstName} ${parsed.lastName}`;
  }

  // 3. given_name + family_name OAuth (Google retourne ces champs séparément)
  const given  = (oauthMeta?.given_name  ?? '').trim();
  const family = (oauthMeta?.family_name ?? '').trim();
  if (given && family) {
    const full = `${given} ${family}`;
    if (!isNameSuspicious(full)) return full;
  }

  // 4. full_name / name OAuth
  const oauthFull = (oauthMeta?.full_name ?? oauthMeta?.name ?? '').trim();
  if (oauthFull) {
    const parsed = parseDisplayName(oauthFull);
    if (parsed) return `${parsed.firstName} ${parsed.lastName}`;
  }

  // Aucune source valide
  return null;
}

/**
 * Tests unitaires pour src/lib/utils.ts
 * @jest-environment node
 */

import {
  cn,
  formatDate,
  formatDateShort,
  formatDateTime,
  formatDateRelative,
  formatNumber,
  formatFullName,
  formatInitials,
  truncateText,
  generateSlug,
  isValidEmail,
  isValidPassword,
  formatDuration,
  formatPrice,
  calculatePercentage,
  generateId,
  debounce,
  throttle,
} from '@/lib/utils';

// ──────────────────────────────────────────────────────────────────────────────
// cn (class merging)
// ──────────────────────────────────────────────────────────────────────────────

describe('cn', () => {
  it('combine des classes simples', () => {
    expect(cn('foo', 'bar')).toBe('foo bar');
  });

  it('ignore les valeurs falsy', () => {
    expect(cn('foo', undefined, null, false, 'bar')).toBe('foo bar');
  });

  it('résout les conflits Tailwind', () => {
    // tailwind-merge doit garder la dernière classe en cas de conflit
    const result = cn('p-4', 'p-8');
    expect(result).toBe('p-8');
  });

  it('gère les classes conditionnelles', () => {
    const isActive = true;
    expect(cn('base', isActive && 'active')).toBe('base active');
    expect(cn('base', !isActive && 'active')).toBe('base');
  });

  it('retourne une chaîne vide si aucune classe', () => {
    expect(cn()).toBe('');
  });
});

// ──────────────────────────────────────────────────────────────────────────────
// formatDate
// ──────────────────────────────────────────────────────────────────────────────

describe('formatDate', () => {
  it('formate une date ISO en français', () => {
    const result = formatDate('2025-01-15T00:00:00.000Z');
    expect(result).toContain('15');
    expect(result).toContain('2025');
    // janvier en français
    expect(result.toLowerCase()).toContain('janvier');
  });

  it('retourne "Date inconnue" pour null', () => {
    expect(formatDate(null)).toBe('Date inconnue');
  });

  it('retourne "Date inconnue" pour undefined', () => {
    expect(formatDate(undefined)).toBe('Date inconnue');
  });

  it('retourne "Date invalide" pour une chaîne non-date', () => {
    expect(formatDate('not-a-date')).toBe('Date invalide');
  });

  it('accepte un objet Date', () => {
    const result = formatDate(new Date('2025-06-20T00:00:00.000Z'));
    expect(result).toContain('2025');
  });
});

// ──────────────────────────────────────────────────────────────────────────────
// formatDateShort
// ──────────────────────────────────────────────────────────────────────────────

describe('formatDateShort', () => {
  it('formate une date en format court jj/mm/aaaa', () => {
    const result = formatDateShort('2025-01-15T00:00:00.000Z');
    expect(result).toMatch(/\d{2}\/\d{2}\/\d{4}/);
    expect(result).toContain('2025');
  });

  it('retourne "N/A" pour null', () => {
    expect(formatDateShort(null)).toBe('N/A');
  });

  it('retourne "N/A" pour une chaîne invalide', () => {
    expect(formatDateShort('invalid')).toBe('N/A');
  });
});

// ──────────────────────────────────────────────────────────────────────────────
// formatDateTime
// ──────────────────────────────────────────────────────────────────────────────

describe('formatDateTime', () => {
  it('inclut l\'heure dans le format', () => {
    const result = formatDateTime('2025-01-15T14:30:00.000Z');
    expect(result).toContain('à');
    expect(result).toContain('2025');
  });

  it('retourne "Date inconnue" pour null', () => {
    expect(formatDateTime(null)).toBe('Date inconnue');
  });

  it('retourne "Date invalide" pour une chaîne invalide', () => {
    expect(formatDateTime('bad-date')).toBe('Date invalide');
  });
});

// ──────────────────────────────────────────────────────────────────────────────
// formatDateRelative
// ──────────────────────────────────────────────────────────────────────────────

describe('formatDateRelative', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2025-06-15T12:00:00.000Z'));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('retourne "Aujourd\'hui" pour une date du jour', () => {
    expect(formatDateRelative(new Date('2025-06-15T08:00:00.000Z'))).toBe('Aujourd\'hui');
  });

  it('retourne "Hier" pour une date d\'hier', () => {
    expect(formatDateRelative(new Date('2025-06-14T12:00:00.000Z'))).toBe('Hier');
  });

  it('retourne "Il y a N jours" pour < 7 jours', () => {
    expect(formatDateRelative(new Date('2025-06-10T12:00:00.000Z'))).toBe('Il y a 5 jours');
  });

  it('retourne "Il y a N semaine(s)" pour < 30 jours', () => {
    const result = formatDateRelative(new Date('2025-06-01T12:00:00.000Z'));
    expect(result).toMatch(/Il y a \d+ semaines?/);
  });

  it('retourne "Il y a N mois" pour < 365 jours', () => {
    const result = formatDateRelative(new Date('2025-01-15T12:00:00.000Z'));
    expect(result).toMatch(/Il y a \d+ mois/);
  });

  it('retourne "Il y a N an(s)" pour > 365 jours', () => {
    const result = formatDateRelative(new Date('2022-06-15T12:00:00.000Z'));
    expect(result).toMatch(/Il y a \d+ ans?/);
  });

  it('retourne "Date inconnue" pour null', () => {
    expect(formatDateRelative(null)).toBe('Date inconnue');
  });
});

// ──────────────────────────────────────────────────────────────────────────────
// formatNumber
// ──────────────────────────────────────────────────────────────────────────────

describe('formatNumber', () => {
  it('formate les nombres avec séparateurs français', () => {
    const result = formatNumber(1000);
    // En fr-FR, le séparateur de milliers est une espace fine ou un espace non-sécable
    expect(result).toMatch(/1.000|1 000/);
  });

  it('formate zéro correctement', () => {
    expect(formatNumber(0)).toBe('0');
  });

  it('formate les grands nombres', () => {
    const result = formatNumber(1000000);
    expect(result).toContain('000');
  });
});

// ──────────────────────────────────────────────────────────────────────────────
// formatFullName
// ──────────────────────────────────────────────────────────────────────────────

describe('formatFullName', () => {
  it('retourne "Prénom Nom" quand les deux sont présents', () => {
    expect(formatFullName('Mamadou', 'Diallo')).toBe('Mamadou Diallo');
  });

  it('retourne seulement le prénom si pas de nom', () => {
    expect(formatFullName('Mamadou', null)).toBe('Mamadou');
  });

  it('retourne seulement le nom si pas de prénom', () => {
    expect(formatFullName(null, 'Diallo')).toBe('Diallo');
  });

  it('retourne le fallback si les deux sont vides', () => {
    expect(formatFullName(null, null, 'Inconnu')).toBe('Inconnu');
  });

  it('retourne "Utilisateur sans nom" par défaut', () => {
    expect(formatFullName(null, null)).toBe('Utilisateur sans nom');
    expect(formatFullName('', '')).toBe('Utilisateur sans nom');
  });

  it('trim les espaces', () => {
    expect(formatFullName('  Mamadou  ', '  Diallo  ')).toBe('Mamadou Diallo');
  });
});

// ──────────────────────────────────────────────────────────────────────────────
// formatInitials
// ──────────────────────────────────────────────────────────────────────────────

describe('formatInitials', () => {
  it('retourne les deux initiales en majuscules', () => {
    expect(formatInitials('Mamadou', 'Diallo')).toBe('MD');
  });

  it('retourne la première initiale si pas de nom', () => {
    expect(formatInitials('Mamadou', null)).toBe('M');
  });

  it('retourne la première initiale du nom si pas de prénom', () => {
    expect(formatInitials(null, 'Diallo')).toBe('D');
  });

  it('retourne "U" si les deux sont vides', () => {
    expect(formatInitials(null, null)).toBe('U');
    expect(formatInitials('', '')).toBe('U');
  });

  it('met en majuscules les initiales minuscules', () => {
    expect(formatInitials('mamadou', 'diallo')).toBe('MD');
  });
});

// ──────────────────────────────────────────────────────────────────────────────
// truncateText
// ──────────────────────────────────────────────────────────────────────────────

describe('truncateText', () => {
  it('ne tronque pas si le texte est plus court', () => {
    expect(truncateText('Hello', 10)).toBe('Hello');
  });

  it('ne tronque pas si le texte a exactement la bonne longueur', () => {
    expect(truncateText('Hello', 5)).toBe('Hello');
  });

  it('tronque et ajoute "..." si trop long', () => {
    expect(truncateText('Hello World', 5)).toBe('Hello...');
  });

  it('gère les textes vides', () => {
    expect(truncateText('', 10)).toBe('');
  });
});

// ──────────────────────────────────────────────────────────────────────────────
// generateSlug (depuis utils.ts)
// ──────────────────────────────────────────────────────────────────────────────

describe('generateSlug (utils)', () => {
  it('convertit en minuscules et remplace les espaces', () => {
    expect(generateSlug('Marketing Digital')).toBe('marketing-digital');
  });

  it('supprime les accents', () => {
    expect(generateSlug('Développement Web')).toBe('developpement-web');
  });

  it('supprime les tirets en début et fin', () => {
    expect(generateSlug('  Test  ')).toBe('test');
  });

  it('gère les caractères spéciaux', () => {
    const result = generateSlug('C++ & Java!');
    expect(result).not.toContain('+');
    expect(result).not.toContain('&');
    expect(result).not.toContain('!');
  });
});

// ──────────────────────────────────────────────────────────────────────────────
// isValidEmail
// ──────────────────────────────────────────────────────────────────────────────

describe('isValidEmail', () => {
  it('retourne true pour un email valide', () => {
    expect(isValidEmail('user@example.com')).toBe(true);
    expect(isValidEmail('test+alias@domain.co')).toBe(true);
  });

  it('retourne false pour un email invalide', () => {
    expect(isValidEmail('not-email')).toBe(false);
    expect(isValidEmail('@domain.com')).toBe(false);
    expect(isValidEmail('user@')).toBe(false);
    expect(isValidEmail('')).toBe(false);
  });
});

// ──────────────────────────────────────────────────────────────────────────────
// isValidPassword
// ──────────────────────────────────────────────────────────────────────────────

describe('isValidPassword', () => {
  it('valide un mot de passe fort', () => {
    expect(isValidPassword('Password1')).toBe(true);
    expect(isValidPassword('Admin123!')).toBe(true);
  });

  it('invalide un mot de passe sans majuscule', () => {
    expect(isValidPassword('password1')).toBe(false);
  });

  it('invalide un mot de passe sans chiffre', () => {
    expect(isValidPassword('Password')).toBe(false);
  });

  it('invalide un mot de passe trop court', () => {
    expect(isValidPassword('Abc1')).toBe(false);
  });
});

// ──────────────────────────────────────────────────────────────────────────────
// formatDuration
// ──────────────────────────────────────────────────────────────────────────────

describe('formatDuration', () => {
  it('formate les minutes seules', () => {
    expect(formatDuration(45)).toBe('45min');
    expect(formatDuration(0)).toBe('0min');
  });

  it('formate les heures seules (minutes = 0)', () => {
    expect(formatDuration(60)).toBe('1h');
    expect(formatDuration(120)).toBe('2h');
  });

  it('formate heures et minutes', () => {
    expect(formatDuration(90)).toBe('1h 30min');
    expect(formatDuration(135)).toBe('2h 15min');
  });
});

// ──────────────────────────────────────────────────────────────────────────────
// formatPrice
// ──────────────────────────────────────────────────────────────────────────────

describe('formatPrice', () => {
  it('formate un prix en EUR par défaut', () => {
    const result = formatPrice(29.99);
    expect(result).toContain('29');
    expect(result).toContain('€');
  });

  it('formate un prix en USD', () => {
    const result = formatPrice(19.99, 'USD');
    expect(result).toContain('19');
    expect(result).toMatch(/\$|USD/);
  });

  it('formate zéro', () => {
    const result = formatPrice(0);
    expect(result).toContain('0');
  });
});

// ──────────────────────────────────────────────────────────────────────────────
// calculatePercentage
// ──────────────────────────────────────────────────────────────────────────────

describe('calculatePercentage', () => {
  it('calcule le pourcentage correctement', () => {
    expect(calculatePercentage(1, 4)).toBe(25);
    expect(calculatePercentage(3, 4)).toBe(75);
    expect(calculatePercentage(1, 3)).toBe(33);
  });

  it('retourne 0 si total est 0', () => {
    expect(calculatePercentage(5, 0)).toBe(0);
  });

  it('retourne 100 pour valeur = total', () => {
    expect(calculatePercentage(5, 5)).toBe(100);
  });

  it('arrondit à l\'entier le plus proche', () => {
    expect(calculatePercentage(1, 3)).toBe(33);
    expect(calculatePercentage(2, 3)).toBe(67);
  });
});

// ──────────────────────────────────────────────────────────────────────────────
// generateId
// ──────────────────────────────────────────────────────────────────────────────

describe('generateId', () => {
  it('retourne une chaîne non vide', () => {
    const id = generateId();
    expect(typeof id).toBe('string');
    expect(id.length).toBeGreaterThan(0);
  });

  it('génère des IDs différents à chaque appel', () => {
    const ids = new Set(Array.from({ length: 10 }, () => generateId()));
    expect(ids.size).toBeGreaterThan(1);
  });
});

// ──────────────────────────────────────────────────────────────────────────────
// debounce
// ──────────────────────────────────────────────────────────────────────────────

describe('debounce', () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  it('retarde l\'exécution de la fonction', () => {
    const fn = jest.fn();
    const debouncedFn = debounce(fn, 100);

    debouncedFn();
    expect(fn).not.toHaveBeenCalled();

    jest.advanceTimersByTime(100);
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('n\'appelle la fonction qu\'une seule fois après des appels rapides', () => {
    const fn = jest.fn();
    const debouncedFn = debounce(fn, 100);

    debouncedFn();
    debouncedFn();
    debouncedFn();
    jest.advanceTimersByTime(100);

    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('transmet les arguments correctement', () => {
    const fn = jest.fn();
    const debouncedFn = debounce(fn, 100);

    debouncedFn('arg1', 'arg2');
    jest.advanceTimersByTime(100);

    expect(fn).toHaveBeenCalledWith('arg1', 'arg2');
  });
});

// ──────────────────────────────────────────────────────────────────────────────
// throttle
// ──────────────────────────────────────────────────────────────────────────────

describe('throttle', () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  it('exécute la fonction immédiatement au premier appel', () => {
    const fn = jest.fn();
    const throttledFn = throttle(fn, 100);

    throttledFn();
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('ignore les appels pendant la période de throttle', () => {
    const fn = jest.fn();
    const throttledFn = throttle(fn, 100);

    throttledFn(); // exécuté
    throttledFn(); // ignoré
    throttledFn(); // ignoré

    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('autorise un nouvel appel après la période de throttle', () => {
    const fn = jest.fn();
    const throttledFn = throttle(fn, 100);

    throttledFn();
    jest.advanceTimersByTime(101);
    throttledFn();

    expect(fn).toHaveBeenCalledTimes(2);
  });
});

/**
 * Tests unitaires pour src/lib/certificates/nameUtils.ts
 * Couvre : isNameSuspicious, parseDisplayName, resolveStudentName
 * @jest-environment node
 */

import {
  isNameSuspicious,
  parseDisplayName,
  resolveStudentName,
} from '../nameUtils';

// ──────────────────────────────────────────────────────────────────────────────
// isNameSuspicious
// ──────────────────────────────────────────────────────────────────────────────

describe('isNameSuspicious', () => {
  describe('valeurs rejetées', () => {
    test.each([
      ['chaîne vide', ''],
      ['espaces seulement', '   '],
      ['placeholder: etudiant', 'etudiant'],
      ['placeholder: étudiant', 'étudiant'],
      ['placeholder: student', 'student'],
      ['placeholder: utilisateur', 'utilisateur'],
      ['placeholder: user', 'user'],
      ['placeholder: unknown', 'unknown'],
      ['placeholder: inconnu', 'inconnu'],
      ['placeholder: n/a', 'n/a'],
      ['placeholder: na', 'na'],
      ['placeholder: test', 'test'],
      ['placeholder: admin', 'admin'],
      ['placeholder: null', 'null'],
      ['placeholder: undefined', 'undefined'],
      ['email complet', 'user@example.com'],
      ['que des chiffres', '123456'],
      ['username avec chiffres en fin', 'julesmendy26'],
      ['mot unique sans chiffres (mono-nom)', 'Mamadou'],
    ])('retourne true pour: %s', (_label, input) => {
      expect(isNameSuspicious(input)).toBe(true);
    });
  });

  describe('valeurs acceptées', () => {
    test.each([
      ['prénom + nom simple', 'Mamadou Diallo'],
      ['prénom + nom avec tiret', 'Jean-Pierre Ndiaye'],
      ['plusieurs mots', 'Marie Anne Dupont'],
      ['accents', 'Aïssatou Ba'],
    ])('retourne false pour: %s', (_label, input) => {
      expect(isNameSuspicious(input)).toBe(false);
    });
  });

  it('est insensible à la casse pour les placeholders', () => {
    expect(isNameSuspicious('STUDENT')).toBe(true);
    expect(isNameSuspicious('Utilisateur')).toBe(true);
    expect(isNameSuspicious('USER')).toBe(true);
  });

  it('rejette les noms multi-mots où un mot finit par des chiffres', () => {
    expect(isNameSuspicious('Jules Mendy26')).toBe(true);
    expect(isNameSuspicious('Jean123 Dupont')).toBe(true);
  });
});

// ──────────────────────────────────────────────────────────────────────────────
// parseDisplayName
// ──────────────────────────────────────────────────────────────────────────────

describe('parseDisplayName', () => {
  it('découpe un nom simple en prénom + nom', () => {
    const result = parseDisplayName('Mamadou Diallo');
    expect(result).toEqual({ firstName: 'Mamadou', lastName: 'Diallo' });
  });

  it('attribue le dernier mot comme nom de famille', () => {
    const result = parseDisplayName('Marie Anne Dupont');
    expect(result).toEqual({ firstName: 'Marie Anne', lastName: 'Dupont' });
  });

  it('retourne null pour un nom suspect (email)', () => {
    expect(parseDisplayName('user@example.com')).toBeNull();
  });

  it('retourne null pour un nom suspect (placeholder)', () => {
    expect(parseDisplayName('student')).toBeNull();
  });

  it('retourne null pour un seul mot', () => {
    expect(parseDisplayName('Mamadou')).toBeNull();
  });

  it('retourne null pour une chaîne vide', () => {
    expect(parseDisplayName('')).toBeNull();
  });

  it('gère les noms avec accents et caractères spéciaux', () => {
    const result = parseDisplayName('Ibrahïma Sène');
    expect(result).toEqual({ firstName: 'Ibrahïma', lastName: 'Sène' });
  });
});

// ──────────────────────────────────────────────────────────────────────────────
// resolveStudentName
// ──────────────────────────────────────────────────────────────────────────────

describe('resolveStudentName', () => {
  describe('priorité 1 : profile.first_name + profile.last_name', () => {
    it('retourne le nom complet depuis le profil', () => {
      const result = resolveStudentName({ first_name: 'Fatou', last_name: 'Diop' });
      expect(result).toBe('Fatou Diop');
    });

    it('ignore si l\'un des deux est manquant', () => {
      // Passe à la priorité suivante
      const result = resolveStudentName({ first_name: 'Fatou', last_name: '' });
      expect(result).toBeNull(); // aucune autre source
    });
  });

  describe('priorité 2 : profile.full_name', () => {
    it('parse le full_name du profil', () => {
      const result = resolveStudentName({ full_name: 'Ousmane Diallo' });
      expect(result).toBe('Ousmane Diallo');
    });

    it('retourne null si full_name est un placeholder', () => {
      const result = resolveStudentName({ full_name: 'student' });
      expect(result).toBeNull();
    });
  });

  describe('priorité 3 : OAuth given_name + family_name', () => {
    it('retourne le nom depuis les données OAuth', () => {
      const result = resolveStudentName(null, { given_name: 'Aminata', family_name: 'Coulibaly' });
      expect(result).toBe('Aminata Coulibaly');
    });

    it('ignore si l\'un des deux champs OAuth est manquant', () => {
      const result = resolveStudentName(null, { given_name: 'Aminata' });
      expect(result).toBeNull();
    });
  });

  describe('priorité 4 : OAuth full_name / name', () => {
    it('parse le full_name OAuth', () => {
      const result = resolveStudentName(null, { full_name: 'Ibrahim Traoré' });
      expect(result).toBe('Ibrahim Traoré');
    });

    it('parse le name OAuth en fallback', () => {
      const result = resolveStudentName(null, { name: 'Binta Keita' });
      expect(result).toBe('Binta Keita');
    });
  });

  it('retourne null si aucune source valide', () => {
    expect(resolveStudentName(null)).toBeNull();
    expect(resolveStudentName(undefined, undefined)).toBeNull();
    expect(resolveStudentName({}, {})).toBeNull();
  });

  it('préfère les champs explicites du profil aux données OAuth', () => {
    const result = resolveStudentName(
      { first_name: 'Profil', last_name: 'Correct' },
      { given_name: 'OAuth', family_name: 'Ignoré' },
    );
    expect(result).toBe('Profil Correct');
  });

  it('tombe en fallback OAuth si le profil est incomplet', () => {
    const result = resolveStudentName(
      { first_name: 'Seulement' }, // pas de last_name
      { given_name: 'OAuth', family_name: 'Valide' },
    );
    expect(result).toBe('OAuth Valide');
  });
});

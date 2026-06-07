/**
 * Unit tests for validateStudentName()
 * Ensures that placeholder names and empty values are rejected,
 * and that real names pass through trimmed and intact.
 * @jest-environment node
 */

// Mock heavy dependencies so we only load the pure validation logic
jest.mock('@/lib/supabase-server', () => ({
  createAdminSupabaseClient: jest.fn(),
}));
jest.mock('../generatePdf', () => ({
  generateCertificatePdf: jest.fn(),
}));
jest.mock('../logo', () => ({
  LOGO_PNG_BASE64: '',
}));

import { validateStudentName } from '../issueCertificate';

describe('validateStudentName', () => {
  // ── Rejection cases ─────────────────────────────────────────────────────

  test.each([
    ['null',      null],
    ['undefined', undefined],
    ['empty string', ''],
    ['whitespace only', '   '],
    // French placeholders
    ['etudiant',      'etudiant'],
    ['étudiant',      'étudiant'],
    ['ÉTUDIANT (uppercase)', 'ÉTUDIANT'],
    ['utilisateur',   'utilisateur'],
    ['UTILISATEUR',   'UTILISATEUR'],
    // English placeholders
    ['student',       'student'],
    ['STUDENT',       'STUDENT'],
    ['user',          'user'],
    ['USER',          'USER'],
    ['unknown',       'unknown'],
    ['inconnu',       'inconnu'],
    ['n/a',           'n/a'],
    ['N/A',           'N/A'],
    ['na',            'na'],
    ['dash',          '-'],
    // With surrounding whitespace (should still be caught)
    ['padded etudiant', '  etudiant  '],
    ['padded student',  '  student  '],
  ])('throws for placeholder: %s', (_label, input) => {
    expect(() => validateStudentName(input as string | null | undefined)).toThrow(
      /Nom d'étudiant invalide/,
    );
  });

  // ── Acceptance cases ─────────────────────────────────────────────────────

  test.each([
    ['simple first+last',        'Mamadou Diallo',     'Mamadou Diallo'],
    ['first name only',          'Fatou',              'Fatou'],
    ['hyphenated name',          'Jean-Pierre Ndiaye', 'Jean-Pierre Ndiaye'],
    ['leading/trailing spaces',  '  Aïssatou Ba  ',   'Aïssatou Ba'],
    ['accented characters',      'Ibrahïma Sène',      'Ibrahïma Sène'],
    ['single uppercase letter',  'A',                  'A'],
  ])('accepts valid name: %s', (_label, input, expected) => {
    expect(validateStudentName(input)).toBe(expected);
  });

  // ── Return value ──────────────────────────────────────────────────────────

  it('trims surrounding whitespace from valid names', () => {
    expect(validateStudentName('  Ousmane Diop  ')).toBe('Ousmane Diop');
  });

  it('preserves internal spaces and special characters', () => {
    const name = 'Binta-Mariama N\'Diaye';
    expect(validateStudentName(name)).toBe(name);
  });
});

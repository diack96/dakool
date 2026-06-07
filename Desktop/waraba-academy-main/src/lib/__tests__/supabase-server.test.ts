/**
 * Tests unitaires pour les helpers Supabase côté serveur
 */

import { createAdminSupabaseClient } from '@/lib/supabase-server';

// Mock des variables d'environnement
process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-role-key';
process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';

describe('createAdminSupabaseClient', () => {
  it('devrait créer un client admin si les variables sont définies', () => {
    const client = createAdminSupabaseClient();
    expect(client).toBeDefined();
  });

  it('devrait lever une erreur si SUPABASE_SERVICE_ROLE_KEY est manquant', () => {
    const originalKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    delete process.env.SUPABASE_SERVICE_ROLE_KEY;

    expect(() => createAdminSupabaseClient()).toThrow(
      'SUPABASE_SERVICE_ROLE_KEY is not set'
    );

    process.env.SUPABASE_SERVICE_ROLE_KEY = originalKey;
  });

  it('devrait lever une erreur si NEXT_PUBLIC_SUPABASE_URL est manquant', () => {
    const originalUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;

    expect(() => createAdminSupabaseClient()).toThrow(
      'NEXT_PUBLIC_SUPABASE_URL is not set'
    );

    process.env.NEXT_PUBLIC_SUPABASE_URL = originalUrl;
  });
});


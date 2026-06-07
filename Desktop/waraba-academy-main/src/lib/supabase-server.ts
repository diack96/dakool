/**
 * Helpers Supabase côté serveur uniquement
 * À utiliser dans les Server Components, API Routes, et Middleware
 */

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import type { NextRequest, NextResponse } from 'next/server';
import { Database } from '@/types/supabase';
import { USER_ROLES } from './constants';

/**
 * Crée un client Supabase côté serveur de manière sécurisée
 * ⚠️ À utiliser uniquement dans les Server Components, API Routes
 */
export async function createServerSupabaseClient () {
  
  try {
    const cookieStore = await cookies();
    

    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      
      throw new Error('Missing Supabase environment variables');
    }

    const client = createServerClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll () {
            return cookieStore.getAll();
          },
          setAll (cookiesToSet: Array<{ name: string; value: string; options?: any }>) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options),
              );
            } catch {
              // Ignorer les erreurs de cookies côté serveur
            }
          },
        },
      },
    );
    
    return client;
  } catch (error: any) {
    
    throw error;
  }
}

/**
 * Crée un client Supabase pour le middleware
 * Utilise request.cookies au lieu de cookies() de next/headers
 * ⚠️ Nécessite une NextResponse pour gérer les cookies correctement
 */
export function createMiddlewareSupabaseClient (request: NextRequest, response?: NextResponse) {
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll () {
          return request.cookies.getAll();
        },
        setAll (cookiesToSet: Array<{ name: string; value: string; options?: any }>) {
          // Dans le middleware, les cookies doivent être mis à jour dans la réponse
          if (response) {
            cookiesToSet.forEach(({ name, value, options }) => {
              request.cookies.set(name, value);
              response.cookies.set(name, value, options);
            });
          }
        },
      },
    },
  );
}

/**
 * Vérifie si un utilisateur est admin
 */
export async function checkIsAdmin (userId: string): Promise<boolean> {
  const supabase = await createServerSupabaseClient();

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', userId)
    .single();

  if (error || !profile) {
    return false;
  }

  return (profile as { id: string; role: string; email?: string } | null)?.role === USER_ROLES.ADMIN;
}

/**
 * Récupère le profil utilisateur avec cache
 */
export async function getUserProfile (userId: string) {
  const supabase = await createServerSupabaseClient();

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('id, email, role, first_name, last_name, full_name, permissions, admin_role_id')
    .eq('id', userId)
    .single();

  if (error || !profile) {
    return null;
  }

  return profile;
}

// createAdminSupabaseClient / getAdminSupabaseClient sont dans @/lib/supabase-admin
// pour éviter d'inclure @supabase/supabase-js dans le bundle Edge Runtime.
export { createAdminSupabaseClient, getAdminSupabaseClient } from '@/lib/supabase-admin';


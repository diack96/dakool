import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { validateAdminAccess } from '@/middleware/adminAuth';

export async function middleware (request: NextRequest) {
  const url = request.nextUrl.pathname;

  // Protection des routes admin
  if (url.startsWith('/admin') && url !== '/admin/login') {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      console.error('[Middleware] Variables d\'environnement Supabase manquantes');
      const loginUrl = new URL('/admin/login', request.url);
      loginUrl.searchParams.set('redirect', url);
      return NextResponse.redirect(loginUrl);
    }

    try {
      // Une seule réponse partagée — validateAdminAccess peut y écrire les cookies
      // rafraîchis (ex : renouvellement de session). Plus besoin d'un getSession()
      // séparé : validateAdminAccess appelle getUser() en interne, ce qui valide
      // le JWT côté serveur Auth et couvre entièrement le check d'authentification.
      const response = NextResponse.next({ request: { headers: request.headers } });
      const { isAdmin } = await validateAdminAccess(request, response);

      if (!isAdmin) {
        const loginUrl = new URL('/admin/login', request.url);
        loginUrl.searchParams.set('redirect', url);
        loginUrl.searchParams.set('error', 'unauthorized');
        return NextResponse.redirect(loginUrl);
      }

      return response;
    } catch (error) {
      console.error('[Middleware] Erreur dans le middleware admin:', error);
      const loginUrl = new URL('/admin/login', request.url);
      loginUrl.searchParams.set('redirect', url);
      loginUrl.searchParams.set('error', 'middleware_error');
      return NextResponse.redirect(loginUrl);
    }
  }

  // Protection des routes dashboard (utilisateurs authentifiés)
  // getUser() vérifie directement le token JWT auprès de Supabase — plus sûr que getSession()
  if (url.startsWith('/dashboard')) {
    const response = NextResponse.next({ request: { headers: request.headers } });

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll: () => request.cookies.getAll(),
          setAll: (cookiesToSet: Array<{ name: string; value: string; options?: any }>) => {
            cookiesToSet.forEach(({ name, value, options }) => {
              request.cookies.set(name, value);
              response.cookies.set(name, value, options);
            });
          },
        },
      },
    );

    // getSession() valide le JWT depuis le cookie localement (pas d'appel réseau Auth)
    // suffisant pour la protection de route — getUser() n'est nécessaire que si on
    // veut vérifier la révocation côté serveur en temps réel
    const { data: { session }, error: authError } = await supabase.auth.getSession();

    if (authError || !session) {
      const loginUrl = new URL('/auth/login', request.url);
      loginUrl.searchParams.set('redirect', url);
      return NextResponse.redirect(loginUrl);
    }

    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/admin/:path*',
  ],
};

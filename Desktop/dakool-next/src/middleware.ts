import { NextResponse, type NextRequest } from 'next/server';
import { LOCK_PATH, SITE_LOCKED } from '@/lib/site-lock';

/**
 * Tant que le site est fermé, toute adresse rend la page d'attente.
 *
 * On réécrit plutôt qu'on ne redirige : l'adresse demandée reste dans la
 * barre du navigateur, et aucune page réelle n'est servie — le catalogue
 * n'est atteignable par aucune URL, même devinée.
 */
export function middleware(request: NextRequest) {
  if (!SITE_LOCKED) return NextResponse.next();
  if (request.nextUrl.pathname === LOCK_PATH) return NextResponse.next();

  const response = NextResponse.rewrite(new URL(LOCK_PATH, request.url));
  response.headers.set('x-robots-tag', 'noindex, nofollow');
  return response;
}

export const config = {
  /* Les fichiers du build restent servis : sans eux la page d'attente
     n'aurait ni styles ni logo. */
  matcher: ['/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)'],
};

'use client';

/**
 * AdminGuard — pass-through.
 * La protection réelle est assurée par :
 *  - middleware.ts (server-side, toutes les routes /admin/*)
 *  - useAdminAuth() dans AdminLayout (client-side redirect)
 * Ce composant n'a pas besoin de refaire une vérification DB côté client.
 */
export default function AdminGuard({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

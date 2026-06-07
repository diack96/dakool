'use client';

import { usePathname } from 'next/navigation';
import Header from './Header';

export default function ConditionalHeader () {
  const pathname = usePathname();

  // Ne pas afficher le header sur les routes dashboard, admin, et learn (ils ont leurs propres headers)
  if (
    pathname?.startsWith('/dashboard') ||
    pathname?.startsWith('/admin') ||
    pathname?.includes('/learn')
  ) {
    return null;
  }

  // Afficher le header sur toutes les autres pages
  return <Header />;
}

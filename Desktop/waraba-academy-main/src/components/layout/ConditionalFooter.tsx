'use client';

import { usePathname } from 'next/navigation';
import Footer from './footer';

export default function ConditionalFooter() {
  const pathname = usePathname();

  // Ne pas afficher le footer sur les routes admin et learn (expérience immersive)
  if (
    pathname?.startsWith('/admin') ||
    pathname?.includes('/learn')
  ) {
    return null;
  }

  // Afficher le footer sur toutes les autres pages
  return <Footer />;
}

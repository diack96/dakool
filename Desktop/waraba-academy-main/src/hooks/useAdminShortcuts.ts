'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';

export function useAdminShortcuts() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Ignorer si on est dans un input, textarea, ou si une modale est ouverte
      const target = event.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable ||
        document.querySelector('[role="dialog"]')
      ) {
        // Permettre Ctrl+K même dans les inputs (recherche globale)
        if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
          event.preventDefault();
          // La recherche globale gère déjà Ctrl+K
          return;
        }
        return;
      }

      // Raccourcis globaux
      if ((event.ctrlKey || event.metaKey) && event.key === 'n') {
        event.preventDefault();
        if (pathname.startsWith('/admin/courses')) {
          router.push('/admin/courses/new');
        } else if (pathname.startsWith('/admin/categories')) {
          router.push('/admin/categories/new');
        } else {
          router.push('/admin/courses/new');
        }
        return;
      }

      if ((event.ctrlKey || event.metaKey) && event.key === 's') {
        event.preventDefault();
        // Trouver le bouton de sauvegarde dans la page
        try {
          // Fix: Utiliser un sélecteur CSS valide au lieu de :has-text()
          const saveButton = document.querySelector('button[type="submit"]') || 
            Array.from(document.querySelectorAll('button')).find(btn => 
              btn.textContent?.includes('Sauvegarder') || btn.textContent?.includes('Enregistrer')
            );
          if (saveButton) {
            (saveButton as HTMLButtonElement).click();
          }
        } catch (error) {
          // Ignorer les erreurs silencieusement
        }
        return;
      }

      // Navigation rapide
      if (event.key === 'g' && (event.ctrlKey || event.metaKey)) {
        event.preventDefault();
        router.push('/admin');
        return;
      }

      // Échap pour fermer les modals
      if (event.key === 'Escape') {
        const modal = document.querySelector('[role="dialog"]');
        if (modal) {
          // Fix: Utiliser un sélecteur CSS valide au lieu de :has-text()
          const closeButton = modal.querySelector('button[aria-label*="fermer"], button[aria-label*="Fermer"]') ||
            Array.from(modal.querySelectorAll('button')).find(btn => 
              btn.textContent?.includes('Fermer') || btn.textContent?.includes('fermer')
            );
          if (closeButton) {
            (closeButton as HTMLButtonElement).click();
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [router, pathname]);
}

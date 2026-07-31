'use client';

import { usePathname } from 'next/navigation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faWhatsapp } from '@fortawesome/free-brands-svg-icons';
import { whatsappUrl } from '@/lib/whatsapp';

/* Pages où le bouton ferait doublon avec un CTA WhatsApp déjà présent. */
const HIDDEN_ON = ['/contact'];

export default function FloatingWhatsApp() {
  const pathname = usePathname();

  if (HIDDEN_ON.some((path) => pathname.startsWith(path))) return null;

  return (
    <a
      href={whatsappUrl('Bonjour DAKOOL, j’aurais une question.')}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Nous écrire sur WhatsApp"
      /* z-30 : passe sous le panier et le menu plein écran (z-40/50).
         Bordure noire épaisse : le bouton blanc reste détouré quand il
         flotte au-dessus d'un bandeau CTA lui aussi blanc. */
      className="group fixed right-5 bottom-5 z-30 flex items-center gap-0 border-2 border-ink bg-white text-black shadow-lg shadow-black/50 transition-[gap] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:gap-2.5 sm:right-6 sm:bottom-6"
    >
      <span className="flex h-14 w-14 shrink-0 items-center justify-center">
        <FontAwesomeIcon icon={faWhatsapp} className="h-7 w-7" />
      </span>
      {/* Le libellé se déplie au survol ; sur mobile le bouton reste carré. */}
      <span className="max-w-0 overflow-hidden text-xs font-black whitespace-nowrap uppercase tracking-cta transition-[max-width,padding] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:max-w-52 group-hover:pr-5 group-focus-visible:max-w-52 group-focus-visible:pr-5">
        Nous écrire
      </span>
    </a>
  );
}

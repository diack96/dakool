import type { CartItem } from '@/context/CartContext';
import { formatPrice } from './format';

/** Numéro WhatsApp Business, au format international sans espaces ni « + ». */
export const WHATSAPP_NUMBER = '221761234567';

/** Même numéro, mis en forme pour l'affichage. */
export const WHATSAPP_DISPLAY = '+221 76 123 45 67';

/** Lien wa.me avec message pré-rempli. */
export function whatsappUrl(message: string): string {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

/**
 * Message d'intérêt pour un seul article, depuis sa fiche produit.
 * Le séparateur de variante est « · » : les coloris peuvent contenir un slash.
 */
export function buildProductMessage(params: {
  name: string;
  size?: string;
  color?: string;
  qty: number;
  price: number;
}): string {
  const lines = ['Bonjour DAKOOL, je suis intéressé(e) par cet article :', '', params.name];

  const variant = [params.size, params.color].filter(Boolean).join(' · ');
  if (variant) lines.push(variant);

  lines.push(
    `Quantité : ${params.qty}`,
    `Prix : ${formatPrice(params.price * params.qty)}`,
    '',
    'Est-il disponible ?',
  );

  return lines.join('\n');
}

/**
 * Message de commande à partir du panier.
 *
 * Il n'y a pas de tunnel de commande : l'adresse et le mode de paiement se
 * règlent dans la conversation. Le message reste donc court.
 */
export function buildCartMessage(items: CartItem[], total: number): string {
  const lines = ['Bonjour DAKOOL, je voudrais commander :', ''];

  for (const item of items) {
    const variant = [item.size, item.color].filter(Boolean).join(' · ');
    lines.push(
      `- ${item.name}${variant ? ` (${variant})` : ''} x${item.qty} — ${formatPrice(item.price * item.qty)}`,
    );
  }

  lines.push('', `TOTAL : ${formatPrice(total)}`, '', 'Comment procède-t-on ?');

  return lines.join('\n');
}

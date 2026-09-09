import type { CartItem } from '@/context/CartContext';

/** Numéro WhatsApp Business, au format international sans espaces ni « + ». */
export const WHATSAPP_NUMBER = '221761234567';

/** Même numéro, mis en forme pour l'affichage. */
export const WHATSAPP_DISPLAY = '+221 76 123 45 67';

/** Lien wa.me avec message pré-rempli. */
export function whatsappUrl(message: string): string {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

/**
 * Demande de tarif pour un seul article, depuis sa fiche produit.
 *
 * Le message ne porte aucun montant : les articles sont fabriqués à la
 * demande et le tarif dépend de la quantité et de la personnalisation. Il
 * s'établit dans la conversation.
 *
 * Le séparateur de variante est « · » : les coloris peuvent contenir un slash.
 */
export function buildProductMessage(params: {
  name: string;
  size?: string;
  color?: string;
  qty: number;
}): string {
  const lines = ['Bonjour DAKOOL, je voudrais un tarif pour cet article :', '', params.name];

  const variant = [params.size, params.color].filter(Boolean).join(' · ');
  if (variant) lines.push(variant);

  lines.push(`Quantité souhaitée : ${params.qty}`, '', 'Quel est le prix ?');

  return lines.join('\n');
}

/**
 * Demande de devis à partir de la sélection.
 *
 * Il n'y a pas de tunnel de commande : la quantité, la personnalisation et le
 * paiement se règlent dans la conversation. Le message reste donc court.
 */
export function buildCartMessage(items: CartItem[]): string {
  const lines = ['Bonjour DAKOOL, je voudrais un devis pour :', ''];

  for (const item of items) {
    const variant = [item.size, item.color].filter(Boolean).join(' · ');
    lines.push(`- ${item.name}${variant ? ` (${variant})` : ''} x${item.qty}`);
  }

  lines.push('', 'Quel est le tarif pour cet ensemble ?');

  return lines.join('\n');
}

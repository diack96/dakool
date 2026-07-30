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

export type OrderDetails = {
  reference: string;
  items: CartItem[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  customer: {
    prenom: string;
    nom: string;
    email: string;
    telephone: string;
  };
  delivery: {
    adresse: string;
    ville: string;
    region: string;
    note?: string;
  };
  payment: string;
};

/**
 * Compose le récapitulatif de commande envoyé sur WhatsApp.
 *
 * Le message voyage dans l'URL : on reste compact pour ne pas s'approcher
 * des limites de longueur des navigateurs sur les gros paniers.
 */
export function buildOrderMessage(order: OrderDetails): string {
  const lines: string[] = [
    `Bonjour DAKOOL, je souhaite passer la commande ${order.reference}.`,
    '',
    'ARTICLES',
  ];

  for (const item of order.items) {
    /* Séparateur « · » et non « / » : les coloris contiennent déjà des
       slashs (« Noir / Vert »), la ligne deviendrait illisible. */
    const variant = [item.size, item.color].filter(Boolean).join(' · ');
    lines.push(
      `- ${item.name}${variant ? ` (${variant})` : ''} x${item.qty} — ${formatPrice(item.price * item.qty)}`,
    );
  }

  lines.push(
    '',
    `Sous-total : ${formatPrice(order.subtotal)}`,
    `Livraison : ${order.deliveryFee === 0 ? 'offerte' : formatPrice(order.deliveryFee)}`,
    `TOTAL : ${formatPrice(order.total)}`,
    '',
    'CLIENT',
    `${order.customer.prenom} ${order.customer.nom}`,
    order.customer.telephone,
    order.customer.email,
    '',
    'LIVRAISON',
    order.delivery.adresse,
    `${order.delivery.ville}, ${order.delivery.region}`,
  );

  if (order.delivery.note?.trim()) {
    lines.push(`Note : ${order.delivery.note.trim()}`);
  }

  lines.push('', `PAIEMENT SOUHAITÉ : ${order.payment}`);

  return lines.join('\n');
}

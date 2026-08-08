import type { Metadata } from 'next';
import LegalPage, { type LegalSection } from '@/components/LegalPage';

export const metadata: Metadata = {
  title: 'Mentions légales',
  description:
    'Éditeur du site, conditions de vente, livraison, retours et protection des données — DAKOOL.',
  alternates: { canonical: '/mentions-legales' },
};

/*
 * ⚠️ À COMPLÉTER AVANT MISE EN LIGNE
 *
 * Les champs marqués « [À COMPLÉTER] » sont juridiquement obligatoires et ne
 * peuvent pas être devinés : raison sociale exacte, adresse du siège, numéro
 * d'immatriculation, pays de rattachement et juridiction compétente. Ils
 * dépendent du pays d'établissement de la société, à trancher avec un
 * conseil juridique. Le reste du document est rédigé et prêt.
 */
const sections: LegalSection[] = [
  {
    heading: 'Éditeur du site',
    body: [
      'Ce site est édité par DAKOOL. Les informations d’immatriculation et l’adresse du siège social figurent ci-dessous.',
    ],
    bullets: [
      'Raison sociale : DAKOOL — [À COMPLÉTER : forme juridique]',
      'Siège social : [À COMPLÉTER : adresse complète]',
      'Immatriculation : [À COMPLÉTER : numéro et registre]',
      'Email : contact@dakool.com',
      'Hébergement : prestataire cloud, coordonnées communiquées sur demande',
    ],
  },
  {
    heading: 'Commandes et paiement',
    body: [
      "Les commandes se passent par WhatsApp ou par email. Aucun paiement n'est prélevé sur ce site : le prix, la disponibilité et les modalités sont confirmés par notre équipe avant tout règlement.",
      'Les prix sont indiqués en euros toutes taxes comprises et ne comprennent pas les frais de livraison. Ils peuvent être modifiés sans préavis ; le tarif applicable est celui confirmé lors de la commande.',
    ],
    bullets: [
      'Moyens acceptés : virement bancaire et paiement mobile',
      'Personnalisation (flocage nom + numéro) : 3 € par article',
      'Tarifs préférentiels pour les clubs à partir de 10 pièces',
      'Droits de douane et taxes d’importation éventuels à la charge du destinataire',
    ],
  },
  {
    heading: 'Livraison',
    body: [
      "Les commandes quittent notre atelier sous quarante-huit heures ouvrées. Le délai d'acheminement dépend ensuite de la destination et du transporteur retenu ; il est communiqué lors de la confirmation de commande.",
      'Les délais sont donnés à titre indicatif. Un retard ne peut donner lieu à annulation de la vente ni à indemnité, sauf faute lourde de notre part.',
    ],
    bullets: [
      'Expédition sous 48 heures ouvrées',
      'Livraison internationale',
      'Articles personnalisés : 7 à 10 jours ouvrables supplémentaires',
    ],
  },
  {
    heading: 'Retours et garantie',
    body: [
      "Un article non porté peut être retourné sous quatorze jours à compter de la réception, dans son emballage d'origine. Les articles personnalisés ne sont ni repris ni échangés, sauf défaut de fabrication.",
      "Tous nos produits sont garantis trente jours contre les défauts de fabrication. La garantie ne couvre pas l'usure normale liée à la pratique sportive ni un usage inadapté.",
    ],
  },
  {
    heading: 'Données personnelles',
    body: [
      "Nous ne collectons que les données nécessaires au traitement de votre demande : nom, téléphone, email et adresse de livraison. Elles ne sont ni vendues ni cédées à des tiers, et ne sont transmises qu'à nos prestataires de livraison, pour la seule exécution de votre commande.",
      "Votre panier est enregistré dans le stockage local de votre navigateur, sur votre appareil ; il n'est transmis nulle part tant que vous ne nous écrivez pas. Votre préférence de thème clair ou sombre y est également conservée.",
      "Vous disposez d'un droit d'accès, de rectification et de suppression de vos données. Écrivez à contact@dakool.com : nous répondons sous trente jours. [À COMPLÉTER : mention du régime de protection des données applicable au pays d'établissement.]",
    ],
  },
  {
    heading: 'Propriété intellectuelle et droit applicable',
    body: [
      'La marque DAKOOL, le logo, les textes et les visuels de ce site sont protégés et ne peuvent être reproduits sans autorisation écrite. Les noms et logos des clubs partenaires restent la propriété de leurs détenteurs.',
      'Les présentes conditions sont soumises au droit du pays d’établissement de la société. [À COMPLÉTER : droit applicable et juridiction compétente.] En cas de litige, les parties recherchent une solution amiable avant toute action contentieuse.',
    ],
  },
];

export default function MentionsLegalesPage() {
  return (
    <LegalPage
      tag="Informations légales"
      title="Mentions"
      highlight="Légales"
      subtitle="Éditeur, commandes, livraison, retours et protection des données."
      updatedAt="1 août 2026"
      sections={sections}
    />
  );
}

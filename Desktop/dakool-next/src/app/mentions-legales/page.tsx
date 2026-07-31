import type { Metadata } from 'next';
import LegalPage, { type LegalSection } from '@/components/LegalPage';

export const metadata: Metadata = {
  title: 'Mentions légales',
  description:
    'Éditeur du site, conditions de vente, livraison, retours et protection des données — DAKOOL, Dakar, Sénégal.',
  alternates: { canonical: '/mentions-legales' },
};

/* Page légale unique : à ce stade le site ne prend aucun paiement en ligne,
   les conditions tiennent donc sur une seule page plutôt que trois. */
const sections: LegalSection[] = [
  {
    heading: 'Éditeur du site',
    body: [
      'Ce site est édité par DAKOOL SARL, société de droit sénégalais dont le siège est situé Zone Industrielle de Dakar, Route de Rufisque, Dakar 11000, Sénégal.',
    ],
    bullets: [
      'DAKOOL SARL — Zone Industrielle, Route de Rufisque, Dakar 11000',
      'Téléphone : +221 76 123 45 67',
      'Email : contact@dakool.sn',
      'Hébergement : prestataire cloud, coordonnées communiquées sur demande',
    ],
  },
  {
    heading: 'Commandes et paiement',
    body: [
      "Les commandes se passent par WhatsApp ou par téléphone. Aucun paiement n'est prélevé sur ce site : le prix, la disponibilité et les modalités sont confirmés par notre équipe avant tout règlement.",
      'Les prix sont indiqués en francs CFA toutes taxes comprises et ne comprennent pas les frais de livraison. Ils peuvent être modifiés sans préavis ; le tarif applicable est celui confirmé lors de la commande.',
    ],
    bullets: [
      'Moyens acceptés : Wave, Orange Money, Free Money, virement, espèces à Dakar',
      'Personnalisation (flocage nom + numéro) : 2 000 FCFA par article',
      'Tarifs préférentiels pour les clubs à partir de 10 pièces',
    ],
  },
  {
    heading: 'Livraison',
    bullets: [
      'Région de Dakar : 24 à 48 heures, livraison offerte',
      'Autres régions du Sénégal : 3 à 5 jours ouvrables',
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
      "Votre panier est enregistré dans le stockage local de votre navigateur, sur votre appareil ; il n'est transmis nulle part tant que vous ne nous écrivez pas.",
      "Conformément à la loi n° 2008-12 du 25 janvier 2008, vous disposez d'un droit d'accès, de rectification et de suppression de vos données. Écrivez à contact@dakool.sn : nous répondons sous trente jours.",
    ],
  },
  {
    heading: 'Propriété intellectuelle et droit applicable',
    body: [
      "La marque DAKOOL, le logo, les textes et les visuels de ce site sont protégés et ne peuvent être reproduits sans autorisation écrite. Les noms et logos des clubs partenaires restent la propriété de leurs détenteurs.",
      "Les présentes conditions sont soumises au droit sénégalais. En cas de litige, les parties recherchent une solution amiable avant toute action ; à défaut, les tribunaux de Dakar sont compétents.",
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
      updatedAt="31 juillet 2026"
      sections={sections}
    />
  );
}

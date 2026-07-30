import type { Metadata } from 'next';
import LegalPage, { type LegalSection } from '@/components/LegalPage';

export const metadata: Metadata = {
  title: 'Conditions générales de vente',
  description:
    'CGV DAKOOL : commande, prix, paiement Wave et Orange Money, livraison au Sénégal, retours et garantie.',
  alternates: { canonical: '/cgv' },
};

const sections: LegalSection[] = [
  {
    heading: 'Objet et champ d’application',
    body: [
      "Les présentes conditions générales de vente régissent les ventes d'équipements sportifs conclues entre DAKOOL SARL et tout client, particulier ou club, passant commande sur le site dakool.sn.",
      "Toute commande implique l'acceptation sans réserve des présentes conditions. DAKOOL se réserve le droit de les modifier à tout moment ; les conditions applicables sont celles en vigueur à la date de la commande.",
    ],
  },
  {
    heading: 'Produits',
    body: [
      "Les produits proposés sont ceux figurant sur le site au jour de la consultation, dans la limite des stocks disponibles. Les visuels sont des représentations de nos articles ; de légères variations de teinte peuvent exister entre le visuel et le produit livré.",
      "Les articles personnalisés — flocage d'un nom, d'un numéro ou broderie d'un blason — sont fabriqués à la demande.",
    ],
  },
  {
    heading: 'Prix',
    body: [
      "Les prix sont indiqués en francs CFA (FCFA), toutes taxes comprises pour le Sénégal. Ils ne comprennent pas les frais de livraison, indiqués séparément avant la validation de la commande.",
      "DAKOOL se réserve le droit de modifier ses prix à tout moment. Les produits sont facturés au tarif en vigueur au moment de l'enregistrement de la commande.",
    ],
    bullets: [
      'Personnalisation flocage nom + numéro : 2 000 FCFA par article',
      'Tarifs préférentiels applicables aux commandes groupées à partir de 10 pièces',
      'Devis club sur demande, sous 48 heures ouvrées',
    ],
  },
  {
    heading: 'Commande',
    body: [
      "La commande est enregistrée lorsque le client valide le récapitulatif après avoir renseigné ses coordonnées et son mode de paiement. Une référence de commande lui est alors attribuée.",
      "Nos équipes contactent systématiquement le client par téléphone ou WhatsApp afin de confirmer la commande et les modalités de paiement avant toute exécution. La vente n'est définitive qu'après cette confirmation.",
      "DAKOOL se réserve le droit de refuser ou d'annuler toute commande présentant un motif légitime, notamment en cas d'indisponibilité du produit ou de litige antérieur avec le client.",
    ],
  },
  {
    heading: 'Paiement',
    body: ['Les moyens de paiement acceptés sont les suivants :'],
    bullets: [
      'Wave',
      'Orange Money',
      'Free Money',
      'Virement bancaire (commandes clubs et commandes groupées)',
      'Espèces à la livraison, dans la région de Dakar uniquement',
    ],
  },
  {
    heading: 'Livraison',
    body: [
      "Les livraisons sont assurées sur l'ensemble du territoire sénégalais, à l'adresse renseignée lors de la commande.",
      "Les délais sont donnés à titre indicatif et courent à compter de la confirmation de la commande. Un retard de livraison ne peut donner lieu à annulation de la vente ni à indemnité, sauf faute lourde de DAKOOL.",
    ],
    bullets: [
      'Région de Dakar : 24 à 48 heures, livraison offerte',
      'Autres régions : 3 à 5 jours ouvrables, forfait de 3 000 FCFA',
      'Articles personnalisés : 7 à 10 jours ouvrables supplémentaires',
    ],
  },
  {
    heading: 'Retours et remboursement',
    body: [
      "Le client dispose de quatorze jours à compter de la réception pour retourner un article non porté, dans son emballage d'origine et accompagné de sa référence de commande.",
      "Les articles personnalisés — flocage, broderie, numérotation — ne sont ni repris ni échangés, sauf défaut de fabrication avéré.",
      "Les frais de retour sont à la charge du client, sauf en cas d'erreur de notre part ou de produit défectueux. Le remboursement intervient dans les quatorze jours suivant la réception du retour, par le moyen de paiement initial.",
    ],
  },
  {
    heading: 'Garantie',
    body: [
      "Tous nos produits bénéficient d'une garantie de trente jours contre les défauts de fabrication à compter de la date de livraison.",
      "Cette garantie ne couvre pas l'usure normale liée à la pratique sportive, les dommages résultant d'un usage inadapté, d'un défaut d'entretien ou d'une modification de l'article.",
    ],
  },
  {
    heading: 'Réclamations',
    body: [
      "Toute réclamation doit être adressée à contact@dakool.sn ou au +221 76 123 45 67, en précisant la référence de commande. Nous accusons réception sous 48 heures ouvrées.",
    ],
  },
  {
    heading: 'Droit applicable et litiges',
    body: [
      "Les présentes conditions sont soumises au droit sénégalais. En cas de litige, les parties s'engagent à rechercher une solution amiable préalablement à toute action contentieuse. À défaut d'accord, les tribunaux de Dakar sont seuls compétents.",
    ],
  },
];

export default function CgvPage() {
  return (
    <LegalPage
      tag="Conditions de vente"
      title="Conditions"
      highlight="Générales"
      subtitle="Commande, prix, paiement, livraison, retours et garantie. Tout ce qui encadre nos ventes."
      updatedAt="30 juillet 2026"
      sections={sections}
    />
  );
}

import type { Metadata } from 'next';
import LegalPage, { type LegalSection } from '@/components/LegalPage';

export const metadata: Metadata = {
  title: 'Politique de confidentialité',
  description:
    'Comment DAKOOL collecte, utilise et protège vos données personnelles. Conformité à la loi sénégalaise n° 2008-12 sur la protection des données à caractère personnel.',
  alternates: { canonical: '/confidentialite' },
};

const sections: LegalSection[] = [
  {
    heading: 'Notre engagement',
    body: [
      "DAKOOL SARL attache une importance particulière à la protection de vos données personnelles. Cette politique décrit les données que nous collectons, l'usage que nous en faisons et les droits dont vous disposez.",
      "Nous traitons vos données conformément à la loi sénégalaise n° 2008-12 du 25 janvier 2008 portant sur la protection des données à caractère personnel.",
    ],
  },
  {
    heading: 'Données collectées',
    body: [
      'Nous ne collectons que les données nécessaires au traitement de votre demande ou de votre commande.',
    ],
    bullets: [
      'Identité et contact : prénom, nom, adresse email, numéro de téléphone',
      'Livraison : adresse postale, ville, région, note de livraison',
      'Commande : articles choisis, tailles, coloris, montants et mode de paiement retenu',
      'Formulaire de contact : sujet et contenu de votre message',
      'Newsletter : adresse email uniquement, si vous vous y inscrivez',
    ],
  },
  {
    heading: 'Finalités du traitement',
    body: ['Vos données sont utilisées exclusivement pour les finalités suivantes :'],
    bullets: [
      'Traiter, préparer et livrer vos commandes',
      'Vous contacter pour confirmer une commande ou répondre à une demande',
      'Assurer le service après-vente et la gestion des retours',
      "Vous envoyer nos actualités, uniquement si vous y avez consenti",
      'Respecter nos obligations comptables et légales',
    ],
  },
  {
    heading: 'Panier et stockage local',
    body: [
      "Votre panier est enregistré dans le stockage local de votre navigateur (localStorage), sur votre appareil. Cette donnée ne quitte pas votre navigateur tant que vous n'avez pas validé de commande, et n'est associée à aucun identifiant publicitaire.",
      "Vous pouvez l'effacer à tout moment en vidant les données de site de votre navigateur.",
    ],
  },
  {
    heading: 'Partage des données',
    body: [
      "Vos données ne sont ni vendues, ni louées, ni cédées à des tiers à des fins commerciales.",
      "Elles peuvent être communiquées à nos prestataires de livraison et de paiement, strictement dans la mesure nécessaire à l'exécution de votre commande, ainsi qu'aux autorités compétentes lorsque la loi l'exige.",
    ],
  },
  {
    heading: 'Durée de conservation',
    bullets: [
      'Données de commande : 5 ans à compter de la commande, au titre de nos obligations comptables',
      'Demandes via le formulaire de contact : 12 mois après le dernier échange',
      'Inscription à la newsletter : jusqu’à votre désinscription',
    ],
  },
  {
    heading: 'Vos droits',
    body: [
      "Vous disposez d'un droit d'accès, de rectification, d'opposition et de suppression de vos données personnelles, ainsi que d'un droit à la limitation du traitement.",
      "Pour exercer ces droits, écrivez à contact@dakool.sn en précisant votre demande. Nous répondons dans un délai maximum de trente jours. Vous pouvez également saisir la Commission de protection des données personnelles (CDP) du Sénégal.",
    ],
  },
  {
    heading: 'Sécurité',
    body: [
      "Nous mettons en œuvre des mesures techniques et organisationnelles pour protéger vos données contre la perte, l'accès non autorisé et la divulgation. Les échanges avec le site sont chiffrés.",
    ],
  },
  {
    heading: 'Modifications',
    body: [
      "Cette politique peut être mise à jour. La date de dernière modification figure en tête de page. En cas de changement substantiel, nous en informons les personnes concernées par email lorsque cela est possible.",
    ],
  },
];

export default function ConfidentialitePage() {
  return (
    <LegalPage
      tag="Vos données"
      title="Politique de"
      highlight="Confidentialité"
      subtitle="Ce que nous collectons, pourquoi, combien de temps nous le gardons et comment exercer vos droits."
      updatedAt="30 juillet 2026"
      sections={sections}
    />
  );
}

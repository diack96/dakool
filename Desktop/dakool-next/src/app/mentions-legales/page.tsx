import type { Metadata } from 'next';
import LegalPage, { type LegalSection } from '@/components/LegalPage';

export const metadata: Metadata = {
  title: 'Mentions légales',
  description: 'Informations légales relatives au site et à la société DAKOOL, Dakar, Sénégal.',
  alternates: { canonical: '/mentions-legales' },
};

const sections: LegalSection[] = [
  {
    heading: "Éditeur du site",
    body: [
      "Le présent site est édité par DAKOOL SARL, société à responsabilité limitée de droit sénégalais, dont le siège social est situé Zone Industrielle de Dakar, Route de Rufisque, Dakar 11000, Sénégal.",
    ],
    bullets: [
      'Dénomination sociale : DAKOOL SARL',
      'Siège social : Zone Industrielle, Route de Rufisque, Dakar 11000, Sénégal',
      'Téléphone : +221 76 123 45 67',
      'Email : contact@dakool.sn',
    ],
  },
  {
    heading: 'Directeur de la publication',
    body: [
      "Le directeur de la publication est le gérant de DAKOOL SARL. Toute demande relative au contenu éditorial du site peut être adressée à contact@dakool.sn.",
    ],
  },
  {
    heading: 'Hébergement',
    body: [
      "Le site est hébergé par un prestataire d'hébergement cloud. Les coordonnées complètes de l'hébergeur sont communiquées sur simple demande écrite adressée à contact@dakool.sn.",
    ],
  },
  {
    heading: 'Propriété intellectuelle',
    body: [
      "L'ensemble des éléments composant le site — marque DAKOOL, logo, textes, visuels, illustrations et mise en page — est protégé par le droit de la propriété intellectuelle et demeure la propriété exclusive de DAKOOL SARL ou de ses partenaires.",
      "Toute reproduction, représentation, adaptation ou exploitation, totale ou partielle, sans autorisation écrite préalable est interdite. Les dénominations et logos des clubs partenaires restent la propriété de leurs détenteurs respectifs et sont utilisés dans le cadre des accords de partenariat en vigueur.",
    ],
  },
  {
    heading: 'Responsabilité',
    body: [
      "DAKOOL s'efforce d'assurer l'exactitude des informations publiées sur le site. Des erreurs ou omissions peuvent néanmoins subsister, notamment concernant les prix, la disponibilité des articles et les dates de compétitions. Ces informations sont fournies à titre indicatif et peuvent être modifiées sans préavis.",
      "DAKOOL ne saurait être tenue responsable des dommages résultant d'une interruption du service, de la présence d'un virus ou de l'utilisation faite des informations mises à disposition sur le site.",
    ],
  },
  {
    heading: 'Liens externes',
    body: [
      "Le site peut contenir des liens vers des sites tiers, notamment les réseaux sociaux de la marque. DAKOOL n'exerce aucun contrôle sur ces sites et décline toute responsabilité quant à leur contenu.",
    ],
  },
  {
    heading: 'Droit applicable',
    body: [
      "Les présentes mentions légales sont régies par le droit sénégalais. Tout litige relatif à leur interprétation ou à leur exécution relève de la compétence des tribunaux de Dakar, à défaut de résolution amiable.",
    ],
  },
];

export default function MentionsLegalesPage() {
  return (
    <LegalPage
      tag="Informations légales"
      title="Mentions"
      highlight="Légales"
      subtitle="Identité de l'éditeur, hébergement, propriété intellectuelle et responsabilité."
      updatedAt="30 juillet 2026"
      sections={sections}
    />
  );
}

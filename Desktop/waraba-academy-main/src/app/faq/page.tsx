import type { Metadata } from 'next';
import { generatePageMetadata } from '@/lib/seo';
import FaqClient from './_Client';

export const revalidate = 3600;

export const metadata: Metadata = generatePageMetadata(
  'FAQ — Questions fréquentes',
  'Toutes les réponses à vos questions sur Waraba Academy : inscriptions, paiements, certificats, accès aux cours et support technique.',
  '/faq'
);

// FAQPage Schema (JSON-LD) — améliore l'apparence dans les résultats Google (rich snippets)
const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: "Qu'est-ce que Waraba Academy ?",
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Waraba Academy est une plateforme de formation en ligne spécialisée dans les compétences numériques : marketing digital, développement web, IA, entrepreneuriat et plus encore.',
      },
    },
    {
      '@type': 'Question',
      name: 'Les certificats sont-ils reconnus ?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Oui, nos certificats sont reconnus par les entreprises partenaires et les institutions. Ils peuvent être ajoutés à votre CV ou profil LinkedIn.',
      },
    },
    {
      '@type': 'Question',
      name: 'Quels sont les moyens de paiement acceptés ?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Nous acceptons les cartes bancaires (Visa, Mastercard), Orange Money, Wave, MTN MoMo, Moov et les virements bancaires.',
      },
    },
    {
      '@type': 'Question',
      name: 'Les cours sont-ils accessibles à vie ?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Oui, une fois inscrit à un cours vous y avez accès à vie et pouvez le suivre à votre rythme.',
      },
    },
    {
      '@type': 'Question',
      name: 'Puis-je obtenir un remboursement ?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Oui, nous offrons une garantie de remboursement de 30 jours. Contactez notre support pour un remboursement complet si vous n\'êtes pas satisfait.',
      },
    },
    {
      '@type': 'Question',
      name: 'Comment obtenir mon certificat ?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Votre certificat est automatiquement généré une fois que vous avez terminé 100% du cours et réussi l\'évaluation finale.',
      },
    },
  ],
};

export default function FaqPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <FaqClient />
    </>
  );
}

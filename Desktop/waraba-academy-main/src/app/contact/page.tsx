import type { Metadata } from 'next';
import { generatePageMetadata } from '@/lib/seo';
import ContactClient from './_Client';

export const metadata: Metadata = generatePageMetadata(
  'Contactez-nous',
  "Une question sur nos formations ? Contactez l'équipe Waraba Academy. Nous répondons sous 24h à 48h ouvrables.",
  '/contact'
);

export default function ContactPage() {
  return <ContactClient />;
}
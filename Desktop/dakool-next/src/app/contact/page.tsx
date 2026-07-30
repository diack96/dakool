import type { Metadata } from 'next';
import PageHero from '@/components/PageHero';
import ContactClient from './ContactClient';

export const metadata: Metadata = {
  title: 'Contact',
  description:
    'Contactez DAKOOL à Dakar — commandes groupées, partenariats clubs, sponsoring de tournois et service après-vente. Réponse sous 24 heures.',
  alternates: { canonical: '/contact' },
};

export default function ContactPage() {
  return (
    <>
      <PageHero
        tag="Nous parler"
        highlight="Contact"
        subtitle="Une question, une commande groupée, un partenariat ? Nous sommes à votre écoute."
        index="07"
        meta={[
          { value: '24h', label: 'Délai de réponse' },
          { value: '7j/7', label: 'WhatsApp' },
          { value: '48h', label: 'Devis club' },
          { value: 'Dakar', label: 'Atelier' },
        ]}
      />
      <ContactClient />
    </>
  );
}

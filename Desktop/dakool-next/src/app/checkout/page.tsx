import type { Metadata } from 'next';
import PageHero from '@/components/PageHero';
import CheckoutClient from './CheckoutClient';

export const metadata: Metadata = {
  title: 'Commande',
  description: 'Finalise ta commande DAKOOL — livraison partout au Sénégal.',
  robots: { index: false, follow: false },
};

export default function CheckoutPage() {
  return (
    <>
      <PageHero
        tag="Étape finale"
        title="Ta"
        highlight="Commande"
        subtitle="Renseigne tes coordonnées : ta commande part sur WhatsApp, déjà remplie. Aucun paiement en ligne — on confirme tout avec toi."
        index="06"
      />
      <div className="bg-ink">
        <CheckoutClient />
      </div>
    </>
  );
}

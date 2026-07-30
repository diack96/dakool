import type { Metadata } from 'next';
import PageHero from '@/components/PageHero';
import CheckoutClient from './CheckoutClient';

export const metadata: Metadata = {
  title: 'Commande',
  description: 'Finalisez votre commande DAKOOL — livraison partout au Sénégal.',
  robots: { index: false, follow: false },
};

export default function CheckoutPage() {
  return (
    <>
      <PageHero
        tag="Étape finale"
        title="Votre"
        highlight="Commande"
        subtitle="Renseignez vos coordonnées et votre mode de paiement. Nous vous appelons pour confirmer avant tout prélèvement."
        index="06"
      />
      <div className="bg-ink">
        <CheckoutClient />
      </div>
    </>
  );
}

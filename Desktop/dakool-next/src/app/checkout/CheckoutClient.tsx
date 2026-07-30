'use client';

import Link from 'next/link';
import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLock, faCheck, faCartShopping, faArrowRight } from '@fortawesome/free-solid-svg-icons';
import { useCart } from '@/context/CartContext';
import { formatPrice } from '@/lib/format';
import Container from '@/components/Container';
import ProductVisual from '@/components/ProductVisual';

/* Livraison offerte dans la capitale, forfait unique ailleurs. */
const DAKAR_REGIONS = ['Dakar'];
const DELIVERY_FEE = 3000;

const regions = [
  'Dakar',
  'Thiès',
  'Diourbel',
  'Saint-Louis',
  'Ziguinchor',
  'Kaolack',
  'Louga',
  'Fatick',
  'Kolda',
  'Matam',
  'Tambacounda',
  'Kaffrine',
  'Kédougou',
  'Sédhiou',
];

const paymentMethods = [
  { id: 'wave', label: 'Wave', hint: 'Paiement mobile — confirmation immédiate' },
  { id: 'orange-money', label: 'Orange Money', hint: 'Paiement mobile' },
  { id: 'free-money', label: 'Free Money', hint: 'Paiement mobile' },
  { id: 'especes', label: 'Espèces à la livraison', hint: 'Dakar uniquement' },
];

const inputClass =
  'w-full border border-line bg-elevated px-4 py-3.5 text-sm text-white placeholder-mute-dim transition-colors focus:border-teranga focus:outline-none';
const labelClass = 'mb-1.5 block text-[10px] font-black uppercase tracking-label text-mute-dim';

export default function CheckoutClient() {
  const { cart, cartTotal, isReady, clearCart } = useCart();

  const [region, setRegion] = useState('Dakar');
  const [payment, setPayment] = useState('wave');
  const [submitting, setSubmitting] = useState(false);
  const [orderRef, setOrderRef] = useState<string | null>(null);

  const deliveryFee = DAKAR_REGIONS.includes(region) ? 0 : DELIVERY_FEE;
  const total = cartTotal + deliveryFee;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    /* Pas encore de backend de paiement : on simule la prise de commande,
       on génère une référence et on vide le panier. */
    setTimeout(() => {
      const ref = `DK-${Date.now().toString().slice(-6)}`;
      setOrderRef(ref);
      clearCart();
      setSubmitting(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 1200);
  };

  /* ── Confirmation ── */
  if (orderRef) {
    return (
      <Container className="py-20 sm:py-28">
        <div className="mx-auto max-w-xl border border-teranga/25 bg-teranga/5 p-10 text-center">
          <span className="mx-auto mb-6 flex h-14 w-14 items-center justify-center bg-teranga">
            <FontAwesomeIcon icon={faCheck} className="h-6 w-6 text-white" />
          </span>
          <h1 className="mb-3 font-display text-title text-white">Commande enregistrée</h1>
          <p className="mb-6 text-sm leading-relaxed text-mute">
            Votre référence est <strong className="text-teranga">{orderRef}</strong>. Notre équipe
            vous contacte dans les deux heures ouvrées pour confirmer le paiement et la livraison.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link
              href="/produits"
              className="bg-white px-7 py-3.5 text-xs font-black uppercase tracking-cta text-black transition-colors hover:bg-teranga hover:text-white"
            >
              Continuer mes achats
            </Link>
            <Link
              href="/"
              className="border border-line-strong px-7 py-3.5 text-xs font-black uppercase tracking-cta text-white transition-colors hover:border-white"
            >
              Retour à l&apos;accueil
            </Link>
          </div>
        </div>
      </Container>
    );
  }

  /* ── Panier en cours de restauration ── */
  if (!isReady) {
    return (
      <Container className="py-24">
        <p className="text-center text-sm uppercase tracking-label text-mute-dim">
          Chargement du panier…
        </p>
      </Container>
    );
  }

  /* ── Panier vide ── */
  if (cart.length === 0) {
    return (
      <Container className="py-20 sm:py-28">
        <div className="mx-auto max-w-md border border-line p-12 text-center">
          <FontAwesomeIcon icon={faCartShopping} className="mb-5 h-10 w-10 text-white/15" />
          <h1 className="mb-3 font-display text-title text-white">Votre panier est vide</h1>
          <p className="mb-7 text-sm text-mute">
            Ajoutez des articles avant de passer commande.
          </p>
          <Link
            href="/produits"
            className="inline-flex items-center gap-2 bg-white px-7 py-3.5 text-xs font-black uppercase tracking-cta text-black transition-colors hover:bg-teranga hover:text-white"
          >
            Voir les produits
            <FontAwesomeIcon icon={faArrowRight} className="h-3 w-3" />
          </Link>
        </div>
      </Container>
    );
  }

  /* ── Tunnel de commande ── */
  return (
    <Container className="py-12 sm:py-16">
      <form onSubmit={handleSubmit} className="grid gap-12 lg:grid-cols-[1fr_24rem] lg:gap-16">
        {/* Coordonnées */}
        <div>
          <section className="mb-12">
            <h2 className="mb-6 flex items-baseline gap-3 font-display text-heading text-white">
              <span className="text-teranga">01</span> Vos coordonnées
            </h2>

            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label htmlFor="prenom" className={labelClass}>
                  Prénom *
                </label>
                <input id="prenom" name="prenom" required autoComplete="given-name" className={inputClass} />
              </div>
              <div>
                <label htmlFor="nom" className={labelClass}>
                  Nom *
                </label>
                <input id="nom" name="nom" required autoComplete="family-name" className={inputClass} />
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="email" className={labelClass}>
                  Email *
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  placeholder="vous@example.sn"
                  className={inputClass}
                />
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="telephone" className={labelClass}>
                  Téléphone / WhatsApp *
                </label>
                <input
                  id="telephone"
                  name="telephone"
                  type="tel"
                  required
                  autoComplete="tel"
                  placeholder="+221 76 000 00 00"
                  className={inputClass}
                />
              </div>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="mb-6 flex items-baseline gap-3 font-display text-heading text-white">
              <span className="text-teranga">02</span> Livraison
            </h2>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label htmlFor="adresse" className={labelClass}>
                  Adresse *
                </label>
                <input
                  id="adresse"
                  name="adresse"
                  required
                  autoComplete="street-address"
                  placeholder="Quartier, rue, numéro"
                  className={inputClass}
                />
              </div>
              <div>
                <label htmlFor="ville" className={labelClass}>
                  Ville *
                </label>
                <input
                  id="ville"
                  name="ville"
                  required
                  autoComplete="address-level2"
                  className={inputClass}
                />
              </div>
              <div>
                <label htmlFor="region" className={labelClass}>
                  Région *
                </label>
                <select
                  id="region"
                  name="region"
                  required
                  value={region}
                  onChange={(e) => setRegion(e.target.value)}
                  className={`${inputClass} pr-10`}
                >
                  {regions.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="note" className={labelClass}>
                  Note pour le livreur
                </label>
                <textarea
                  id="note"
                  name="note"
                  rows={3}
                  placeholder="Point de repère, horaire préféré…"
                  className={`${inputClass} resize-none`}
                />
              </div>
            </div>

            <p className="mt-4 border border-line px-4 py-3 text-xs text-mute">
              {deliveryFee === 0
                ? 'Livraison offerte à Dakar, sous 24 à 48 heures.'
                : `Livraison ${formatPrice(DELIVERY_FEE)} en région, sous 3 à 5 jours ouvrables.`}
            </p>
          </section>

          <section>
            <h2 className="mb-6 flex items-baseline gap-3 font-display text-heading text-white">
              <span className="text-teranga">03</span> Paiement
            </h2>

            <fieldset className="grid gap-2 sm:grid-cols-2">
              <legend className="sr-only">Mode de paiement</legend>
              {paymentMethods.map((method) => {
                const disabled = method.id === 'especes' && !DAKAR_REGIONS.includes(region);
                return (
                  <label
                    key={method.id}
                    className={`flex cursor-pointer items-start gap-3 border p-4 transition-colors ${
                      payment === method.id
                        ? 'border-teranga bg-teranga/5'
                        : 'border-line hover:border-line-strong'
                    } ${disabled ? 'pointer-events-none opacity-35' : ''}`}
                  >
                    <input
                      type="radio"
                      name="paiement"
                      value={method.id}
                      checked={payment === method.id}
                      disabled={disabled}
                      onChange={() => setPayment(method.id)}
                      className="mt-1 accent-[#00853F]"
                    />
                    <span>
                      <span className="block text-sm font-bold text-white">{method.label}</span>
                      <span className="mt-0.5 block text-xs text-mute-dim">{method.hint}</span>
                    </span>
                  </label>
                );
              })}
            </fieldset>
          </section>
        </div>

        {/* Récapitulatif */}
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="border border-line bg-surface">
            <h2 className="border-b border-line px-6 py-5 font-display text-2xl text-white">
              Votre commande
            </h2>

            <ul className="divide-y divide-line px-6">
              {cart.map((item) => (
                <li key={item.key} className="flex items-start gap-3 py-4">
                  <span className="h-12 w-12 shrink-0 border border-line bg-ink p-1">
                    <ProductVisual category={item.category} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold text-white">
                      {item.name}
                    </span>
                    <span className="block text-xs text-mute-dim">
                      {[item.size, item.color].filter(Boolean).join(' · ')} — ×{item.qty}
                    </span>
                  </span>
                  <span className="shrink-0 text-sm text-white">
                    {formatPrice(item.price * item.qty)}
                  </span>
                </li>
              ))}
            </ul>

            <dl className="space-y-2.5 border-t border-line px-6 py-5 text-sm">
              <div className="flex justify-between text-mute">
                <dt>Sous-total</dt>
                <dd>{formatPrice(cartTotal)}</dd>
              </div>
              <div className="flex justify-between text-mute">
                <dt>Livraison</dt>
                <dd>{deliveryFee === 0 ? 'Offerte' : formatPrice(deliveryFee)}</dd>
              </div>
              <div className="flex items-baseline justify-between border-t border-line pt-3.5">
                <dt className="text-xs uppercase tracking-label text-mute">Total</dt>
                <dd className="font-display text-3xl text-white">{formatPrice(total)}</dd>
              </div>
            </dl>

            <div className="border-t border-line px-6 py-5">
              <button
                type="submit"
                disabled={submitting}
                className="flex w-full items-center justify-center gap-2.5 bg-white py-4 text-sm font-black uppercase tracking-cta text-black transition-colors hover:bg-teranga hover:text-white disabled:pointer-events-none disabled:opacity-50"
              >
                <FontAwesomeIcon icon={faLock} className="h-3.5 w-3.5" />
                {submitting ? 'Validation…' : 'Valider la commande'}
              </button>
              <p className="mt-3 text-center text-xs text-mute-dim">
                Nous vous appelons pour confirmer avant tout prélèvement.
              </p>
            </div>
          </div>
        </aside>
      </form>
    </Container>
  );
}

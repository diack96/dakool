import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getProduct, getRelatedProducts, products } from '@/data/products';
import { formatPrice } from '@/lib/format';
import Container from '@/components/Container';
import ProductVisual from '@/components/ProductVisual';
import ProductCard from '@/components/ProductCard';
import SectionHeading from '@/components/SectionHeading';
import FlagBar from '@/components/FlagBar';
import Reveal from '@/components/Reveal';
import BuyPanel from './BuyPanel';

type Params = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return products.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const product = getProduct(slug);

  if (!product) return { title: 'Produit introuvable' };

  return {
    title: product.name,
    description: `${product.tagline} ${product.description.slice(0, 120)}…`,
    alternates: { canonical: `/produits/${product.slug}` },
    openGraph: {
      title: `${product.name} — DAKOOL`,
      description: product.tagline,
      type: 'website',
    },
  };
}

export default async function ProduitPage({ params }: Params) {
  const { slug } = await params;
  const product = getProduct(slug);

  if (!product) notFound();

  const related = getRelatedProducts(product);
  const productIndex = products.findIndex((p) => p.id === product.id) + 1;

  return (
    <>
      <div className="border-b border-line bg-ink pt-24">
        <Container>
          <nav aria-label="Fil d'Ariane" className="py-5 text-xs text-mute-dim">
            <ol className="flex flex-wrap items-center gap-2">
              <li>
                <Link href="/" className="transition-colors hover:text-white">
                  Accueil
                </Link>
              </li>
              <li aria-hidden>/</li>
              <li>
                <Link href="/produits" className="transition-colors hover:text-white">
                  Produits
                </Link>
              </li>
              <li aria-hidden>/</li>
              <li>
                <Link
                  href={`/produits?categorie=${encodeURIComponent(product.category)}`}
                  className="transition-colors hover:text-white"
                >
                  {product.category}
                </Link>
              </li>
              <li aria-hidden>/</li>
              <li className="text-white">{product.name}</li>
            </ol>
          </nav>
        </Container>
      </div>

      {/* Visuel + achat */}
      <section className="bg-ink">
        <Container className="grid gap-12 py-12 lg:grid-cols-2 lg:gap-16 lg:py-16">
          <div className="relative">
            <div className="grain relative flex aspect-square items-center justify-center overflow-hidden border border-line bg-elevated">
              <ProductVisual category={product.category} index={productIndex} />
              {product.badge && (
                <span className="absolute top-5 left-5 bg-teranga px-2.5 py-1.5 text-[10px] font-black uppercase tracking-cta text-white">
                  {product.badge.label}
                </span>
              )}
              <FlagBar className="absolute inset-x-0 bottom-0" />
            </div>

            {/* Nuancier des coloris disponibles. */}
            <ul className="mt-3 grid gap-px bg-line sm:grid-cols-3">
              {product.colors.map((c) => (
                <li key={c.name} className="flex items-center gap-3 bg-elevated px-4 py-3.5">
                  <span
                    aria-hidden
                    className="h-6 w-6 shrink-0 border border-line-strong"
                    style={{ backgroundColor: c.hex }}
                  />
                  <span className="text-xs text-mute">{c.name}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:sticky lg:top-24 lg:self-start">
            <BuyPanel product={product} />
          </div>
        </Container>
      </section>

      {/* Description + caractéristiques */}
      <section className="border-y border-line bg-surface py-16 sm:py-20">
        <Container className="grid gap-12 lg:grid-cols-2 lg:gap-20">
          <Reveal>
            <span className="mb-4 block text-[11px] font-bold uppercase tracking-brand text-teranga">
              Le produit
            </span>
            <h2 className="mb-5 font-display text-heading text-white">Description</h2>
            <p className="text-base leading-relaxed text-mute">{product.description}</p>
          </Reveal>

          <Reveal delay={100}>
            <span className="mb-4 block text-[11px] font-bold uppercase tracking-brand text-teranga">
              Fiche technique
            </span>
            <h2 className="mb-5 font-display text-heading text-white">Caractéristiques</h2>
            <ul className="divide-y divide-line border-y border-line">
              {product.details.map((detail) => (
                <li key={detail} className="flex items-start gap-3 py-3.5 text-sm text-mute">
                  <span aria-hidden className="mt-1 text-xs text-teranga">
                    ▸
                  </span>
                  {detail}
                </li>
              ))}
            </ul>

            <dl className="mt-8 grid grid-cols-2 gap-px border border-line bg-line">
              <div className="bg-surface px-5 py-4">
                <dt className="text-[10px] uppercase tracking-label text-mute-dim">Prix</dt>
                <dd className="mt-1 font-display text-2xl text-white">
                  {formatPrice(product.price)}
                </dd>
              </div>
              <div className="bg-surface px-5 py-4">
                <dt className="text-[10px] uppercase tracking-label text-mute-dim">
                  {product.sizes.length > 1 ? 'Tailles' : 'Format'}
                </dt>
                <dd className="mt-1 font-display text-2xl text-white">
                  {product.sizes.length > 1 ? product.sizes.join(' · ') : product.sizes[0]}
                </dd>
              </div>
            </dl>
          </Reveal>
        </Container>
      </section>

      {/* Suggestions */}
      <section className="bg-ink py-16 sm:py-20">
        <Container>
          <SectionHeading
            eyebrow="À compléter"
            title="Vous aimerez"
            highlight="aussi"
            link={{ href: '/produits', label: 'Tout voir' }}
          />
          <div className="grid grid-cols-1 gap-px bg-line sm:grid-cols-2 lg:grid-cols-4">
            {related.map((p, i) => (
              <Reveal key={p.id} delay={i * 70}>
                <ProductCard product={p} index={products.findIndex((x) => x.id === p.id) + 1} />
              </Reveal>
            ))}
          </div>
        </Container>
      </section>
    </>
  );
}

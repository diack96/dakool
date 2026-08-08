import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowDown, faArrowRight } from '@fortawesome/free-solid-svg-icons';
import { products } from '@/data/products';
import ProductCard from '@/components/ProductCard';
import Container from '@/components/Container';
import Button from '@/components/Button';
import SectionHeading from '@/components/SectionHeading';
import Reveal from '@/components/Reveal';
import Marquee from '@/components/Marquee';
import FlagBar from '@/components/FlagBar';

const stats = [
  { value: '40', label: 'Clubs équipés' },
  { value: '12', label: 'Tournois sponsorisés' },
  { value: '500+', label: 'Maillots distribués' },
  { value: '2020', label: 'Année de création' },
];

export default function Home() {
  const featured = products.slice(0, 4);

  return (
    <>
      {/* ── HERO ───────────────────────────────────────────── */}
      <section className="grain relative flex min-h-[100svh] items-end overflow-hidden bg-bg">
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <div className="absolute top-0 bottom-0 right-[15%] w-px bg-line" />
          <div className="absolute inset-x-0 top-1/2 h-px bg-line" />
          <span className="absolute right-6 bottom-14 hidden font-display text-[22rem] leading-none text-fg/[0.03] select-none lg:block">
            01
          </span>
        </div>

        <Container className="relative z-10 pt-32 pb-24">
          <div className="mb-8 flex items-center gap-3">
            <span className="h-2 w-2 shrink-0 rounded-full bg-inverse" />
            <span className="text-xs font-bold uppercase tracking-brand text-fg">
              Équipementier sportif — depuis 2020
            </span>
          </div>

          <h1 className="mb-9 font-display text-hero text-fg">
            Équipé
            <br />
            pour
            <br />
            <span className="text-accent">gagner</span>
          </h1>

          <div className="flex flex-col gap-8 sm:flex-row sm:items-end sm:gap-16">
            <p className="max-w-sm text-base leading-relaxed text-mute sm:text-lg">
              Du maillot à la chaussure, on équipe les clubs, les joueurs et les staffs.
              Fabrication contrôlée, testée en compétition.
            </p>
            <div className="flex shrink-0 flex-wrap gap-3">
              <Button href="/produits">
                Acheter
                <FontAwesomeIcon icon={faArrowRight} className="h-3.5 w-3.5" />
              </Button>
              <Button href="/contact" variant="outline">
                Nous écrire
              </Button>
            </div>
          </div>
        </Container>

        <span
          aria-hidden
          className="absolute bottom-8 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 text-mute-dim lg:flex"
        >
          <span className="text-[10px] uppercase tracking-label">Défiler</span>
          <FontAwesomeIcon icon={faArrowDown} className="h-3 w-3 animate-bounce" />
        </span>

        <FlagBar className="absolute inset-x-0 bottom-0" />
      </section>

      <Marquee
        items={[
          'Livraison internationale',
          'Retours sous 14 jours',
          'Flocage nom + numéro',
          'Tarifs clubs dès 10 pièces',
        ]}
      />

      {/* ── CHIFFRES ───────────────────────────────────────── */}
      <section className="border-b border-line bg-bg">
        <Container>
          <dl className="grid grid-cols-2 divide-x divide-y divide-line sm:grid-cols-4 sm:divide-y-0">
            {stats.map((stat, i) => (
              <Reveal key={stat.label} delay={i * 80}>
                <div className="px-4 py-10 text-center sm:px-6">
                  <dt className="sr-only">{stat.label}</dt>
                  <dd>
                    <span className="mb-2 block font-display text-5xl leading-none text-fg sm:text-6xl">
                      {stat.value}
                    </span>
                    <span className="block text-[11px] uppercase tracking-label text-mute-dim">
                      {stat.label}
                    </span>
                  </dd>
                </div>
              </Reveal>
            ))}
          </dl>
        </Container>
      </section>

      {/* ── PRODUITS ───────────────────────────────────────── */}
      <section className="bg-bg py-20 sm:py-24">
        <Container>
          <SectionHeading
            eyebrow="Boutique officielle"
            title="Nouveautés"
            link={{ href: '/produits', label: 'Voir plus' }}
          />

          <div className="grid grid-cols-1 gap-px bg-line sm:grid-cols-2 lg:grid-cols-4">
            {featured.map((p, i) => (
              <Reveal key={p.id} delay={i * 80}>
                <ProductCard product={p} index={i + 1} />
              </Reveal>
            ))}
          </div>

          <div className="mt-10 sm:hidden">
            <Button href="/produits" variant="outline" className="w-full">
              Tout voir
            </Button>
          </div>
        </Container>
      </section>


      {/* ── CTA ────────────────────────────────────────────── */}
      <section className="grain relative overflow-hidden bg-inverse py-24">
        <span
          aria-hidden
          className="absolute top-1/2 right-0 hidden -translate-y-1/2 font-display text-[18rem] leading-none text-on-inverse/10 select-none lg:block"
        >
          DK
        </span>

        <Container className="relative z-10">
          <span className="mb-4 block text-[11px] font-bold uppercase tracking-brand text-on-inverse/50">
            Partenariat
          </span>
          <h2 className="mb-8 max-w-3xl font-display text-display text-on-inverse">
            Ton club mérite le meilleur
          </h2>
          <div className="flex flex-wrap gap-3">
            <Button href="/contact" variant="dark" size="lg">
              Nous écrire
              <FontAwesomeIcon icon={faArrowRight} className="h-3.5 w-3.5" />
            </Button>
            <Button href="/produits" variant="darkOutline" size="lg">
              Voir la collection
            </Button>
          </div>
        </Container>
      </section>

      <Marquee accent items={['Dakool', 'Équipementier', 'Depuis 2020']} />
    </>
  );
}

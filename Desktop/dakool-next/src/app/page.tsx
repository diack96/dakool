import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowDown, faArrowRight } from '@fortawesome/free-solid-svg-icons';
import { products } from '@/data/products';
import { teams } from '@/data/teams';
import ProductCard from '@/components/ProductCard';
import Container from '@/components/Container';
import Button from '@/components/Button';
import SectionHeading from '@/components/SectionHeading';
import Reveal from '@/components/Reveal';
import Marquee from '@/components/Marquee';
import FlagBar from '@/components/FlagBar';

const stats = [
  { value: '8', label: 'Clubs partenaires' },
  { value: '12', label: 'Tournois sponsorisés' },
  { value: '500+', label: 'Maillots distribués' },
  { value: '2020', label: 'Fondée à Dakar' },
];

export default function Home() {
  const featured = products.slice(0, 4);

  return (
    <>
      {/* ── HERO ───────────────────────────────────────────── */}
      <section className="grain relative flex min-h-[100svh] items-end overflow-hidden bg-ink">
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <div className="absolute top-0 bottom-0 right-[15%] w-px bg-line" />
          <div className="absolute inset-x-0 top-1/2 h-px bg-line" />
          <span className="absolute right-6 bottom-14 hidden font-display text-[22rem] leading-none text-white/[0.03] select-none lg:block">
            01
          </span>
        </div>

        <Container className="relative z-10 pt-32 pb-24">
          <div className="mb-8 flex items-center gap-3">
            <span className="h-2 w-2 shrink-0 rounded-full bg-white" />
            <span className="text-xs font-bold uppercase tracking-brand text-white">
              L&apos;Équipementier du Lion · Dakar, Sénégal
            </span>
          </div>

          <h1 className="mb-9 font-display text-hero text-white">
            Équipé
            <br />
            pour
            <br />
            <span className="text-accent">gagner</span>
          </h1>

          <div className="flex flex-col gap-8 sm:flex-row sm:items-end sm:gap-16">
            <p className="max-w-sm text-base leading-relaxed text-mute sm:text-lg">
              La première marque d&apos;équipements sportifs 100% sénégalaise. Du maillot à la
              chaussure, on équipe ceux qui jouent pour gagner.
            </p>
            <div className="flex shrink-0 flex-wrap gap-3">
              <Button href="/produits">
                Acheter
                <FontAwesomeIcon icon={faArrowRight} className="h-3.5 w-3.5" />
              </Button>
              <Button href="/equipes" variant="outline">
                Voir les clubs
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
          'Livraison offerte à Dakar',
          'Retours sous 14 jours',
          'Flocage nom + numéro',
          'Tarifs clubs dès 10 pièces',
        ]}
      />

      {/* ── CHIFFRES ───────────────────────────────────────── */}
      <section className="border-b border-line bg-ink">
        <Container>
          <dl className="grid grid-cols-2 divide-x divide-y divide-line sm:grid-cols-4 sm:divide-y-0">
            {stats.map((stat, i) => (
              <Reveal key={stat.label} delay={i * 80}>
                <div className="px-4 py-10 text-center sm:px-6">
                  <dt className="sr-only">{stat.label}</dt>
                  <dd>
                    <span className="mb-2 block font-display text-5xl leading-none text-white sm:text-6xl">
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
      <section className="bg-ink py-20 sm:py-24">
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

      {/* ── ÉQUIPES ────────────────────────────────────────── */}
      <section className="bg-ink py-20 sm:py-24">
        <Container>
          <SectionHeading
            eyebrow="Partenariats"
            title="Ils portent"
            highlight="DAKOOL"
            link={{ href: '/equipes', label: 'Voir plus' }}
          />

          <div className="grid grid-cols-2 gap-px bg-line sm:grid-cols-4">
            {teams.map((team, i) => (
              <Reveal key={team.id} delay={i * 60}>
                <div className="group flex h-full flex-col bg-ink p-6 sm:p-8">
                  <span className="mb-5 flex h-12 w-12 shrink-0 items-center justify-center border border-line-strong bg-elevated font-display text-sm tracking-wider text-white">
                    {team.acronym.slice(0, 3)}
                  </span>
                  <p className="mb-1 text-sm leading-tight font-bold text-white">{team.name}</p>
                  <p className="mb-4 text-xs text-mute-dim">{team.city}</p>
                  <span className="rule-grow mt-auto" />
                </div>
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      {/* ── CTA ────────────────────────────────────────────── */}
      <section className="grain relative overflow-hidden bg-white py-24">
        <span
          aria-hidden
          className="absolute top-1/2 right-0 hidden -translate-y-1/2 font-display text-[18rem] leading-none text-black/10 select-none lg:block"
        >
          DK
        </span>

        <Container className="relative z-10">
          <span className="mb-4 block text-[11px] font-bold uppercase tracking-brand text-black/50">
            Partenariat
          </span>
          <h2 className="mb-8 max-w-3xl font-display text-display text-black">
            Ton club mérite le meilleur
          </h2>
          <div className="flex flex-wrap gap-3">
            <Button href="/contact" variant="dark" size="lg">
              Nous écrire
              <FontAwesomeIcon icon={faArrowRight} className="h-3.5 w-3.5" />
            </Button>
            <Button href="/equipes" variant="darkOutline" size="lg">
              Voir les clubs
            </Button>
          </div>
        </Container>
      </section>

      <Marquee accent items={['Dakool', 'Dakar', 'Sénégal', 'Téranga']} />
    </>
  );
}

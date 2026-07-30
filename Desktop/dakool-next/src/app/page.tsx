import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowDown, faArrowRight } from '@fortawesome/free-solid-svg-icons';
import { products } from '@/data/products';
import { teams } from '@/data/teams';
import ProductCard from '@/components/ProductCard';
import ProductVisual from '@/components/ProductVisual';
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

const categoryTiles = [
  { name: 'Maillots', count: 3, blurb: 'Domicile, extérieur, gardien.' },
  { name: 'Chaussures', count: 2, blurb: 'Terrain sec et académies.' },
  { name: 'Ballons', count: 2, blurb: 'Match et entraînement.' },
  { name: 'Équipements', count: 4, blurb: 'Sacs, vestes, gants.' },
  { name: 'Accessoires', count: 5, blurb: 'Le reste du kit.' },
];

const manifesto = [
  {
    number: '01',
    title: 'Fabriqué ici',
    text: "Nos ateliers sont à Dakar. Les coupes sont pensées pour le climat et les terrains sénégalais, pas adaptées depuis un cahier des charges européen.",
  },
  {
    number: '02',
    title: 'Testé par les clubs',
    text: 'Chaque pièce passe une saison complète chez un club partenaire avant d’arriver en boutique. Si elle ne tient pas, elle ne sort pas.',
  },
  {
    number: '03',
    title: 'Du quartier à l’élite',
    text: 'Nous équipons la Ligue 1 et les Navétanes avec la même exigence. Le niveau change, la qualité non.',
  },
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
            <span className="h-2 w-2 shrink-0 rounded-full bg-teranga" />
            <span className="text-xs font-bold uppercase tracking-brand text-teranga">
              L&apos;Équipementier du Lion · Dakar, Sénégal
            </span>
          </div>

          <h1 className="mb-9 font-display text-hero text-white">
            Équipé
            <br />
            pour
            <br />
            <span className="text-teranga">gagner</span>
          </h1>

          <div className="flex flex-col gap-8 sm:flex-row sm:items-end sm:gap-16">
            <p className="max-w-sm text-base leading-relaxed text-mute sm:text-lg">
              La première marque d&apos;équipements sportifs 100% sénégalaise. Des maillots aux
              chaussures — DAKOOL équipe les champions.
            </p>
            <div className="flex shrink-0 flex-wrap gap-3">
              <Button href="/produits">
                Découvrir
                <FontAwesomeIcon icon={faArrowRight} className="h-3.5 w-3.5" />
              </Button>
              <Button href="/equipes" variant="outline">
                Nos équipes
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
          'Livraison 24h à Dakar',
          'Flocage personnalisé',
          'Tarifs clubs dès 10 pièces',
          'Wave · Orange Money',
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

      {/* ── MANIFESTE ──────────────────────────────────────── */}
      <section className="border-b border-line bg-surface py-20 sm:py-24">
        <Container>
          <SectionHeading eyebrow="Notre méthode" title="Ce qui nous" highlight="sépare" />
          <div className="grid gap-px bg-line sm:grid-cols-3">
            {manifesto.map((item, i) => (
              <Reveal key={item.number} delay={i * 100}>
                <article className="h-full bg-surface p-8 transition-colors hover:bg-elevated lg:p-10">
                  <span className="mb-6 block font-display text-6xl leading-none text-teranga/25">
                    {item.number}
                  </span>
                  <h3 className="mb-3 font-display text-2xl text-white">{item.title}</h3>
                  <p className="text-sm leading-relaxed text-mute">{item.text}</p>
                </article>
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      {/* ── PRODUITS ───────────────────────────────────────── */}
      <section className="bg-ink py-20 sm:py-24">
        <Container>
          <SectionHeading
            eyebrow="Nouveautés"
            title="Nos"
            highlight="produits"
            link={{ href: '/produits', label: 'Voir tout' }}
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
              Voir tous les produits →
            </Button>
          </div>
        </Container>
      </section>

      {/* ── CATÉGORIES ─────────────────────────────────────── */}
      <section className="border-y border-line bg-surface py-20 sm:py-24">
        <Container>
          <SectionHeading eyebrow="Le catalogue" title="Par" highlight="catégorie" />
          <div className="grid gap-px bg-line sm:grid-cols-2 lg:grid-cols-5">
            {categoryTiles.map((cat, i) => (
              <Reveal key={cat.name} delay={i * 70}>
                <Link
                  href={`/produits?categorie=${encodeURIComponent(cat.name)}`}
                  className="group flex h-full flex-col bg-surface p-7 transition-colors hover:bg-elevated"
                >
                  <div className="mb-5 h-24 w-24 text-white/70">
                    <ProductVisual category={cat.name} />
                  </div>
                  <h3 className="font-display text-2xl text-white">{cat.name}</h3>
                  <p className="mt-1 mb-4 text-sm text-mute">{cat.blurb}</p>
                  <span className="mt-auto text-[11px] uppercase tracking-label text-mute-dim">
                    {cat.count} produits
                  </span>
                  <span className="rule-grow mt-4" />
                </Link>
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      {/* ── ÉQUIPES ────────────────────────────────────────── */}
      <section className="bg-ink py-20 sm:py-24">
        <Container>
          <SectionHeading
            eyebrow="Partenariats"
            title="Nos"
            highlight="équipes"
            link={{ href: '/equipes', label: 'Voir tout' }}
          />

          <div className="grid grid-cols-2 gap-px bg-line sm:grid-cols-4">
            {teams.map((team, i) => (
              <Reveal key={team.id} delay={i * 60}>
                <Link
                  href={`/equipes/${team.slug}`}
                  className="group flex h-full flex-col bg-ink p-6 transition-colors hover:bg-elevated sm:p-8"
                >
                  <span
                    className="mb-5 flex h-12 w-12 shrink-0 items-center justify-center font-display text-sm tracking-wider text-white"
                    style={{ backgroundColor: team.color }}
                  >
                    {team.acronym.slice(0, 3)}
                  </span>
                  <p className="mb-1 text-sm leading-tight font-bold text-white">{team.name}</p>
                  <p className="mb-4 text-xs text-mute-dim">{team.city}</p>
                  <span className="rule-grow mt-auto" />
                </Link>
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      {/* ── TOURNOIS ───────────────────────────────────────── */}
      <section className="border-t border-line bg-surface py-20 sm:py-24">
        <Container>
          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
            <Reveal>
              <span className="mb-4 block text-[11px] font-bold uppercase tracking-brand text-teranga">
                Sponsoring
              </span>
              <h2 className="mb-6 font-display text-title text-white">
                Du quartier au <span className="text-teranga">stade national</span>
              </h2>
              <p className="mb-8 max-w-md text-base leading-relaxed text-mute">
                DAKOOL sponsorise 12 compétitions — de la Ligue 1 sénégalaise aux Navétanes de
                quartier. Mêmes trophées, mêmes équipements, même exigence.
              </p>
              <Button href="/tournois" variant="outline">
                Voir les tournois
                <FontAwesomeIcon icon={faArrowRight} className="h-3.5 w-3.5" />
              </Button>
            </Reveal>

            <Reveal delay={120}>
              <ul className="grid gap-px bg-line">
                {[
                  ['Ligue 1 Sénégalaise', '6 clubs équipés'],
                  ['Coupe du Sénégal', '64+ clubs engagés'],
                  ['Tournoi de la Téranga', 'Notre tournoi signature'],
                  ['Navétanes', '200+ équipes par région'],
                ].map(([name, detail]) => (
                  <li
                    key={name}
                    className="flex items-baseline justify-between gap-4 bg-surface px-6 py-5"
                  >
                    <span className="font-display text-xl text-white">{name}</span>
                    <span className="shrink-0 text-xs text-mute-dim">{detail}</span>
                  </li>
                ))}
              </ul>
            </Reveal>
          </div>
        </Container>
      </section>

      {/* ── CTA ────────────────────────────────────────────── */}
      <section className="grain relative overflow-hidden bg-teranga py-24">
        <span
          aria-hidden
          className="absolute top-1/2 right-0 hidden -translate-y-1/2 font-display text-[18rem] leading-none text-white/10 select-none lg:block"
        >
          DK
        </span>

        <Container className="relative z-10">
          <span className="mb-4 block text-[11px] font-bold uppercase tracking-brand text-white/60">
            Partenariat
          </span>
          <h2 className="mb-8 max-w-3xl font-display text-display text-white">
            Votre club mérite le meilleur
          </h2>
          <div className="flex flex-wrap gap-3">
            <Button href="/contact" variant="dark" size="lg">
              Nous contacter
              <FontAwesomeIcon icon={faArrowRight} className="h-3.5 w-3.5" />
            </Button>
            <Button href="/equipes" variant="outline" size="lg" className="border-white/40">
              Nos clubs partenaires
            </Button>
          </div>
        </Container>
      </section>

      <Marquee accent items={['Dakool', 'Dakar', 'Sénégal', 'Téranga']} />
    </>
  );
}

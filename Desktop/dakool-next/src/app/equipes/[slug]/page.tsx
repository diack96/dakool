import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faLocationDot,
  faTrophy,
  faCheck,
  faArrowRight,
  faCalendarDays,
} from '@fortawesome/free-solid-svg-icons';
import { getTeam, teams } from '@/data/teams';
import Container from '@/components/Container';
import Button from '@/components/Button';
import Reveal from '@/components/Reveal';
import FlagBar from '@/components/FlagBar';

type Params = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return teams.map((t) => ({ slug: t.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const team = getTeam(slug);

  if (!team) return { title: 'Club introuvable' };

  return {
    title: `${team.name} — Club partenaire`,
    description: team.description,
    alternates: { canonical: `/equipes/${team.slug}` },
  };
}

export default async function EquipePage({ params }: Params) {
  const { slug } = await params;
  const team = getTeam(slug);

  if (!team) notFound();

  const others = teams.filter((t) => t.slug !== team.slug).slice(0, 4);

  return (
    <>
      {/* En-tête aux couleurs du club */}
      <header
        className="grain relative overflow-hidden pt-32 pb-16 sm:pt-36 sm:pb-20"
        style={{ backgroundColor: team.color }}
      >
        <div aria-hidden className="absolute inset-0 bg-black/45" />
        <span
          aria-hidden
          className="absolute top-1/2 right-4 hidden -translate-y-1/2 font-display text-[18rem] leading-none text-white/10 select-none lg:block"
        >
          {team.acronym.slice(0, 3)}
        </span>

        <Container className="relative z-10">
          <nav aria-label="Fil d'Ariane" className="mb-8 text-xs text-white/60">
            <ol className="flex flex-wrap items-center gap-2">
              <li>
                <Link href="/" className="transition-colors hover:text-white">
                  Accueil
                </Link>
              </li>
              <li aria-hidden>/</li>
              <li>
                <Link href="/equipes" className="transition-colors hover:text-white">
                  Équipes
                </Link>
              </li>
              <li aria-hidden>/</li>
              <li className="text-white">{team.name}</li>
            </ol>
          </nav>

          <span className="mb-5 flex items-center gap-3 text-[11px] font-bold uppercase tracking-brand text-white/70">
            <span className="h-2 w-2 shrink-0 rounded-full bg-white" />
            Club partenaire depuis {team.since}
          </span>

          <h1 className="mb-5 font-display text-display text-white">{team.name}</h1>

          <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-white/80">
            <span className="flex items-center gap-2">
              <FontAwesomeIcon icon={faLocationDot} className="h-3.5 w-3.5" />
              {team.city}
            </span>
            <span className="flex items-center gap-2">
              <FontAwesomeIcon icon={faCalendarDays} className="h-3.5 w-3.5" />
              Fondé en {team.founded}
            </span>
            <span className="border border-white/30 px-2.5 py-1 text-[10px] font-black uppercase tracking-cta">
              {team.league}
            </span>
          </div>
        </Container>

        <FlagBar className="absolute inset-x-0 bottom-0" />
      </header>

      {/* Repères */}
      <section className="border-b border-line bg-ink">
        <Container>
          <dl className="grid grid-cols-2 divide-x divide-y divide-line sm:grid-cols-4 sm:divide-y-0">
            {[
              { value: team.founded, label: 'Fondation' },
              { value: team.since, label: 'Partenaire depuis' },
              { value: team.league, label: 'Division' },
              { value: String(team.honours.length), label: 'Lignes de palmarès' },
            ].map((item) => (
              <div key={item.label} className="px-4 py-8 text-center sm:px-6">
                <dt className="sr-only">{item.label}</dt>
                <dd>
                  <span className="block font-display text-3xl leading-none text-white sm:text-4xl">
                    {item.value}
                  </span>
                  <span className="mt-2 block text-[10px] uppercase tracking-label text-mute-dim">
                    {item.label}
                  </span>
                </dd>
              </div>
            ))}
          </dl>
        </Container>
      </section>

      {/* Le club */}
      <section className="bg-ink py-16 sm:py-20">
        <Container className="grid gap-12 lg:grid-cols-2 lg:gap-20">
          <Reveal>
            <span className="mb-4 block text-[11px] font-bold uppercase tracking-brand text-teranga">
              Le club
            </span>
            <h2 className="mb-5 font-display text-heading text-white">Notre partenariat</h2>
            <p className="mb-8 text-base leading-relaxed text-mute">{team.description}</p>

            <div className="border border-line p-6">
              <h3 className="mb-2 text-xs font-black uppercase tracking-label text-white">Stade</h3>
              <p className="font-display text-2xl text-teranga">{team.stadium}</p>
              <p className="mt-1 text-sm text-mute">{team.city}</p>
            </div>
          </Reveal>

          <Reveal delay={120}>
            <span className="mb-4 block text-[11px] font-bold uppercase tracking-brand text-teranga">
              Palmarès
            </span>
            <h2 className="mb-5 font-display text-heading text-white">Ce que le club a gagné</h2>
            <ul className="mb-10 divide-y divide-line border-y border-line">
              {team.honours.map((honour) => (
                <li key={honour} className="flex items-start gap-3 py-4 text-sm text-mute">
                  <FontAwesomeIcon icon={faTrophy} className="mt-0.5 h-3.5 w-3.5 shrink-0 text-or" />
                  {honour}
                </li>
              ))}
            </ul>

            <span className="mb-4 block text-[11px] font-bold uppercase tracking-brand text-teranga">
              Dotation DAKOOL
            </span>
            <h2 className="mb-5 font-display text-heading text-white">Ce que nous fournissons</h2>
            <ul className="divide-y divide-line border-y border-line">
              {team.supplies.map((supply) => (
                <li key={supply} className="flex items-start gap-3 py-4 text-sm text-mute">
                  <FontAwesomeIcon
                    icon={faCheck}
                    className="mt-0.5 h-3.5 w-3.5 shrink-0 text-teranga"
                  />
                  {supply}
                </li>
              ))}
            </ul>
          </Reveal>
        </Container>
      </section>

      {/* Autres clubs */}
      <section className="border-t border-line bg-surface py-16 sm:py-20">
        <Container>
          <div className="mb-10 flex items-end justify-between gap-6 border-b border-line pb-6">
            <h2 className="font-display text-title text-white">
              Autres <span className="text-teranga">clubs</span>
            </h2>
            <Link
              href="/equipes"
              className="mb-1 hidden shrink-0 border-b border-line-strong pb-1 text-xs font-black uppercase tracking-label text-white transition-colors hover:border-teranga hover:text-teranga sm:block"
            >
              Tout voir →
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-px bg-line sm:grid-cols-4">
            {others.map((other) => (
              <Link
                key={other.id}
                href={`/equipes/${other.slug}`}
                className="group flex flex-col bg-surface p-6 transition-colors hover:bg-elevated"
              >
                <span
                  className="mb-4 flex h-12 w-12 items-center justify-center font-display text-sm tracking-wider text-white"
                  style={{ backgroundColor: other.color }}
                >
                  {other.acronym.slice(0, 3)}
                </span>
                <p className="text-sm font-bold text-white">{other.name}</p>
                <p className="mt-1 mb-4 text-xs text-mute-dim">{other.city}</p>
                <span className="rule-grow mt-auto" />
              </Link>
            ))}
          </div>
        </Container>
      </section>

      {/* CTA */}
      <section className="grain relative overflow-hidden bg-teranga py-20">
        <Container className="relative z-10 flex flex-col items-start gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <span className="mb-3 block text-[11px] font-bold uppercase tracking-brand text-white/60">
              Partenariat
            </span>
            <h2 className="max-w-xl font-display text-title text-white">
              Votre club aussi peut être équipé
            </h2>
          </div>
          <Button href="/contact" variant="dark" size="lg">
            Nous contacter
            <FontAwesomeIcon icon={faArrowRight} className="h-3.5 w-3.5" />
          </Button>
        </Container>
      </section>
    </>
  );
}

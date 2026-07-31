import type { Metadata } from 'next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faLocationDot,
  faShirt,
  faMedal,
  faHandshake,
  faBullhorn,
  faArrowRight,
} from '@fortawesome/free-solid-svg-icons';
import PageHero from '@/components/PageHero';
import Container from '@/components/Container';
import SectionHeading from '@/components/SectionHeading';
import Button from '@/components/Button';
import Reveal from '@/components/Reveal';
import Marquee from '@/components/Marquee';
import { teams } from '@/data/teams';

export const metadata: Metadata = {
  title: 'Ils portent DAKOOL',
  description:
    'Les 8 clubs du football sénégalais équipés par DAKOOL — Teungueth FC, AS Jaraaf, Génération Foot, Casa Sports et les autres. De la Ligue 1 aux académies.',
  alternates: { canonical: '/equipes' },
};

const impacts = [
  {
    icon: faShirt,
    title: 'Équipements complets',
    desc: 'Maillots domicile et extérieur, survêtements, chaussettes, sacs et accessoires pour toute la saison.',
  },
  {
    icon: faMedal,
    title: 'Qualité professionnelle',
    desc: 'Tissu technique respirant, broderies premium, coupes étudiées avec des professionnels du sport.',
  },
  {
    icon: faHandshake,
    title: 'Support financier',
    desc: 'Sponsoring des déplacements, primes de performance et soutien logistique tout au long de la saison.',
  },
  {
    icon: faBullhorn,
    title: 'Visibilité nationale',
    desc: 'Mise en avant des clubs sur tous les canaux digitaux DAKOOL — Instagram, TikTok, Facebook et YouTube.',
  },
];

export default function EquipesPage() {
  const ligue1 = teams.filter((t) => t.league === 'Ligue 1').length;

  return (
    <>
      <PageHero
        tag="Partenariats officiels"
        title="Ils portent"
        highlight="DAKOOL"
        subtitle="8 clubs du football sénégalais portent nos équipements, de la Ligue 1 jusqu'aux académies de formation."
        index="03"
        meta={[
          { value: String(teams.length), label: 'Clubs partenaires' },
          { value: String(ligue1), label: 'En Ligue 1' },
          { value: '2020', label: 'Premier contrat' },
          { value: '14', label: 'Régions couvertes' },
        ]}
      />

      <Marquee
        items={teams.map((t) => t.name)}
      />

      {/* Clubs */}
      <section className="bg-ink py-16 sm:py-20">
        <Container>
          <SectionHeading
            eyebrow={`${teams.length} clubs partenaires`}
            title="Nos clubs"
            highlight="partenaires"
          />

          <div className="grid grid-cols-1 gap-px bg-line sm:grid-cols-2 lg:grid-cols-4">
            {teams.map((team, i) => (
              <Reveal key={team.id} delay={Math.min(i, 7) * 60}>
                <article className="group flex h-full flex-col bg-ink p-7 transition-colors hover:bg-elevated">
                  <span className="mb-5 flex h-16 w-16 shrink-0 items-center justify-center border border-line-strong bg-elevated font-display text-base tracking-wider text-white">
                    {team.acronym.slice(0, 4)}
                  </span>

                  <h3 className="mb-1.5 font-display text-xl leading-tight text-white">
                    {team.name}
                  </h3>

                  <p className="mb-3 flex items-center gap-1.5 text-xs text-mute-dim">
                    <FontAwesomeIcon icon={faLocationDot} className="h-3 w-3 text-accent" />
                    {team.city}
                  </p>

                  <div className="mb-4 flex flex-wrap gap-2">
                    <span className="border border-white/20 px-2 py-1 text-[10px] font-black uppercase tracking-cta text-accent">
                      {team.league}
                    </span>
                    <span className="border border-line px-2 py-1 text-[10px] font-black uppercase tracking-cta text-mute-dim">
                      Depuis {team.since}
                    </span>
                  </div>

                  <p className="mb-5 line-clamp-4 text-xs leading-relaxed text-mute">
                    {team.description}
                  </p>

                  <span className="rule-grow mt-auto" />
                </article>
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      {/* Ce que DAKOOL apporte */}
      <section className="border-t border-line bg-surface py-16 sm:py-20">
        <Container>
          <SectionHeading eyebrow="Notre engagement" title="Ce qu’on" highlight="apporte" />

          <div className="grid grid-cols-1 gap-px bg-line sm:grid-cols-2 lg:grid-cols-4">
            {impacts.map((item, i) => (
              <Reveal key={item.title} delay={i * 80}>
                <article className="h-full bg-surface p-8 transition-colors hover:bg-elevated">
                  <span className="mb-5 flex h-11 w-11 items-center justify-center border border-line">
                    <FontAwesomeIcon icon={item.icon} className="h-4 w-4 text-white" />
                  </span>
                  <h3 className="mb-3 font-display text-xl text-white">{item.title}</h3>
                  <p className="text-sm leading-relaxed text-mute">{item.desc}</p>
                </article>
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      {/* CTA */}
      <section className="grain relative overflow-hidden bg-white py-24">
        <span
          aria-hidden
          className="absolute top-1/2 right-0 hidden -translate-y-1/2 font-display text-[18rem] leading-none text-black/10 select-none lg:block"
        >
          DK
        </span>
        <Container className="relative z-10">
          <span className="mb-4 block text-[11px] font-bold uppercase tracking-brand text-black/50">
            Rejoignez DAKOOL
          </span>
          <h2 className="mb-8 max-w-2xl font-display text-display text-black">Devenir partenaire</h2>
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
    </>
  );
}

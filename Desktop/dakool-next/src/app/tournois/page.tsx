import type { Metadata } from 'next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCalendar,
  faTrophy,
  faHandshake,
  faCheck,
  faArrowRight,
} from '@fortawesome/free-solid-svg-icons';
import PageHero from '@/components/PageHero';
import Container from '@/components/Container';
import SectionHeading from '@/components/SectionHeading';
import Button from '@/components/Button';
import Reveal from '@/components/Reveal';
import Marquee from '@/components/Marquee';
import { tournaments } from '@/data/tournaments';

export const metadata: Metadata = {
  title: 'Tournois sponsorisés',
  description:
    'DAKOOL sponsorise 12 compétitions au Sénégal — Ligue 1, Coupe du Sénégal, Tournoi de la Téranga et Navétanes. Dotations, trophées et équipements.',
  alternates: { canonical: '/tournois' },
};

/* Site monochrome : une seule pastille, le libellé porte le sens. */
const BADGE = 'border-line-strong text-white';

export default function TournoisPage() {
  return (
    <>
      <PageHero
        tag="Sponsoring sportif"
        title="Nos"
        highlight="Tournois"
        subtitle="On soutient le football à tous les niveaux — du terrain de quartier jusqu'à l'élite nationale."
        index="04"
        meta={[
          { value: '12', label: 'Compétitions' },
          { value: '14', label: 'Régions' },
          { value: '200+', label: 'Équipes par zone' },
          { value: '2020', label: 'Premier tournoi' },
        ]}
      />

      <Marquee items={tournaments.map((t) => t.title)} />

      <section className="bg-ink py-16 sm:py-20">
        <Container size="narrow">
          <SectionHeading eyebrow="12 compétitions" title="Là où on est" highlight="présents" />

          <div className="flex flex-col gap-px bg-line">
            {tournaments.map((t, i) => (
              <Reveal key={t.id} delay={i * 80}>
                <article className="bg-ink transition-colors hover:bg-surface">
                  <header className="border-b border-line p-6 sm:p-8">
                    <div className="flex flex-wrap items-start gap-5 sm:gap-6">
                      <span
                        aria-hidden
                        className="flex h-16 w-16 shrink-0 items-center justify-center border border-line bg-elevated font-display text-3xl leading-none text-white"
                      >
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="mb-3 flex flex-wrap gap-2">
                          {t.badges.map((b) => (
                            <span
                              key={b.label}
                              className={`border px-2 py-1 text-[10px] font-black uppercase tracking-cta ${BADGE}`}
                            >
                              {b.label}
                            </span>
                          ))}
                        </div>
                        <h2 className="mb-2.5 font-display text-3xl text-white sm:text-4xl">
                          {t.title}
                        </h2>
                        <p className="text-sm leading-relaxed text-mute">{t.description}</p>
                      </div>
                    </div>
                  </header>

                  <div className="grid divide-y divide-line sm:grid-cols-3 sm:divide-x sm:divide-y-0">
                    <div className="p-6">
                      <h3 className="mb-4 flex items-center gap-2 text-[10px] font-black uppercase tracking-label text-mute-dim">
                        <FontAwesomeIcon icon={faCalendar} className="h-3 w-3 text-accent" />
                        Calendrier
                      </h3>
                      <ul className="space-y-2">
                        {t.calendar.map((item) => (
                          <li key={item} className="flex items-start gap-2 text-sm text-mute">
                            <span aria-hidden className="mt-0.5 text-xs text-accent">
                              ▸
                            </span>
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="p-6">
                      <h3 className="mb-4 flex items-center gap-2 text-[10px] font-black uppercase tracking-label text-mute-dim">
                        <FontAwesomeIcon icon={faTrophy} className="h-3 w-3 text-white" />
                        Dotations
                      </h3>
                      <ul className="space-y-3">
                        {t.prizes.map((p) => (
                          <li key={p.label}>
                            <span className="block font-display text-2xl leading-none text-white">
                              {p.amount}
                            </span>
                            <span className="mt-1 block text-xs text-mute-dim">{p.label}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="p-6">
                      <h3 className="mb-4 flex items-center gap-2 text-[10px] font-black uppercase tracking-label text-mute-dim">
                        <FontAwesomeIcon icon={faHandshake} className="h-3 w-3 text-accent" />
                        Package DAKOOL
                      </h3>
                      <ul className="space-y-2">
                        {t.package.map((item) => (
                          <li key={item} className="flex items-start gap-2 text-sm text-mute">
                            <FontAwesomeIcon
                              icon={faCheck}
                              className="mt-1 h-3 w-3 shrink-0 text-accent"
                            />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      <section className="grain relative overflow-hidden bg-white py-24">
        <span
          aria-hidden
          className="absolute top-1/2 right-0 hidden -translate-y-1/2 font-display text-[18rem] leading-none text-black/10 select-none lg:block"
        >
          DK
        </span>
        <Container className="relative z-10">
          <span className="mb-4 block text-[11px] font-bold uppercase tracking-brand text-black/50">
            Sponsoring
          </span>
          <h2 className="mb-8 max-w-2xl font-display text-display text-black">
            Ton tournoi avec DAKOOL
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
    </>
  );
}

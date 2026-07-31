import Container from './Container';
import PageHero from './PageHero';

export type LegalSection = {
  heading: string;
  /** Paragraphes du bloc. */
  body?: string[];
  /** Liste à puces optionnelle affichée après les paragraphes. */
  bullets?: string[];
};

type Props = {
  tag: string;
  title: string;
  highlight: string;
  subtitle: string;
  updatedAt: string;
  sections: LegalSection[];
};

/** Gabarit commun aux pages légales — même rythme typographique partout. */
export default function LegalPage({
  tag,
  title,
  highlight,
  subtitle,
  updatedAt,
  sections,
}: Props) {
  return (
    <>
      <PageHero tag={tag} title={title} highlight={highlight} subtitle={subtitle} />

      <article className="bg-ink py-16 sm:py-20">
        <Container size="narrow">
          <p className="mb-12 border-b border-line pb-6 text-xs uppercase tracking-label text-mute-dim">
            Dernière mise à jour : {updatedAt}
          </p>

          <div className="space-y-12">
            {sections.map((section, i) => (
              <section key={section.heading}>
                <h2 className="mb-4 font-display text-heading text-white">
                  <span className="mr-3 text-accent">{String(i + 1).padStart(2, '0')}</span>
                  {section.heading}
                </h2>

                {section.body?.map((paragraph) => (
                  <p key={paragraph} className="mb-4 text-sm leading-relaxed text-mute sm:text-base">
                    {paragraph}
                  </p>
                ))}

                {section.bullets && (
                  <ul className="mt-4 divide-y divide-line border-y border-line">
                    {section.bullets.map((bullet) => (
                      <li key={bullet} className="flex items-start gap-3 py-3.5 text-sm text-mute">
                        <span aria-hidden className="mt-1 text-xs text-accent">
                          ▸
                        </span>
                        {bullet}
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            ))}
          </div>

          <p className="mt-16 border-t border-line pt-8 text-sm text-mute">
            Une question sur ce document ? Écrivez-nous à{' '}
            <a
              href="mailto:contact@dakool.sn"
              className="text-accent transition-colors hover:text-white"
            >
              contact@dakool.sn
            </a>
            .
          </p>
        </Container>
      </article>
    </>
  );
}

import Container from './Container';
import FlagBar from './FlagBar';

type Props = {
  tag: string;
  title?: string;
  highlight: string;
  subtitle: string;
  /** Chiffres clés affichés sous le titre. */
  meta?: { value: string; label: string }[];
  /** Numéro de chapitre en filigrane, comme sur la home. */
  index?: string;
};

export default function PageHero({ tag, title, highlight, subtitle, meta, index }: Props) {
  return (
    <header className="grain relative overflow-hidden border-b border-line bg-bg pt-32 pb-16 sm:pt-36 sm:pb-20">
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute top-0 bottom-0 right-[20%] w-px bg-line" />
        {index && (
          <span className="absolute right-6 -bottom-8 hidden font-display text-[16rem] leading-none text-fg/[0.025] select-none lg:block">
            {index}
          </span>
        )}
      </div>

      <Container className="relative z-10">
        <span className="mb-5 flex items-center gap-3 text-[11px] font-bold uppercase tracking-brand text-fg">
          <span className="h-2 w-2 shrink-0 rounded-full bg-inverse" />
          {tag}
        </span>

        <h1 className="mb-6 font-display text-display text-fg">
          {title && <>{title} </>}
          <span className="text-accent">{highlight}</span>
        </h1>

        <p className="max-w-xl text-base leading-relaxed text-mute sm:text-lg">{subtitle}</p>

        {meta && meta.length > 0 && (
          <dl className="mt-10 grid max-w-2xl grid-cols-2 gap-px border border-line bg-line sm:grid-cols-4">
            {meta.map((item) => (
              <div key={item.label} className="bg-bg px-4 py-5">
                <dt className="sr-only">{item.label}</dt>
                <dd>
                  <span className="block font-display text-3xl leading-none text-fg">
                    {item.value}
                  </span>
                  <span className="mt-1.5 block text-[10px] uppercase tracking-label text-mute-dim">
                    {item.label}
                  </span>
                </dd>
              </div>
            ))}
          </dl>
        )}
      </Container>

      <FlagBar className="absolute inset-x-0 bottom-0" />
    </header>
  );
}

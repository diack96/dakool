import Link from 'next/link';
import Reveal from './Reveal';

type Props = {
  /** Surtitre en petites capitales vertes. */
  eyebrow: string;
  title: string;
  /** Second membre du titre, mis en vert. */
  highlight?: string;
  /** Ajoute un lien « voir tout » aligné en bas à droite. */
  link?: { href: string; label: string };
};

export default function SectionHeading({ eyebrow, title, highlight, link }: Props) {
  return (
    <Reveal>
      <div className="mb-10 flex items-end justify-between gap-8 border-b border-line pb-6 sm:mb-12">
        <div>
          <span className="mb-3 flex items-center gap-3 text-[11px] font-bold uppercase tracking-brand text-white">
            <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-white" />
            {eyebrow}
          </span>
          <h2 className="font-display text-title text-white">
            {title}
            {highlight && <span className="text-accent"> {highlight}</span>}
          </h2>
        </div>

        {link && (
          <Link
            href={link.href}
            className="mb-1 hidden shrink-0 border-b border-line-strong pb-1 text-xs font-black uppercase tracking-label text-white transition-colors hover:border-white hover:text-white sm:block"
          >
            {link.label} →
          </Link>
        )}
      </div>
    </Reveal>
  );
}

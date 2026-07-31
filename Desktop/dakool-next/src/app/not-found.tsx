import Link from 'next/link';
import Container from '@/components/Container';
import Button from '@/components/Button';
import FlagBar from '@/components/FlagBar';

const suggestions = [
  { href: '/produits', label: 'La boutique', desc: '16 références en stock' },
  { href: '/equipes', label: 'Nos clubs', desc: '8 partenaires officiels' },
  { href: '/contact', label: 'Nous écrire', desc: 'Réponse sous 24 heures' },
];

export default function NotFound() {
  return (
    <section className="grain relative flex min-h-[100svh] items-center overflow-hidden bg-ink">
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute top-0 right-[15%] bottom-0 w-px bg-line" />
        <span className="absolute top-1/2 right-4 hidden -translate-y-1/2 font-display text-[26rem] leading-none text-white/[0.03] select-none lg:block">
          404
        </span>
      </div>

      <Container className="relative z-10 py-32">
        <span className="mb-6 flex items-center gap-3 text-[11px] font-bold uppercase tracking-brand text-white">
          <span className="h-2 w-2 shrink-0 rounded-full bg-white" />
          Erreur 404
        </span>

        <h1 className="mb-6 font-display text-hero text-white">
          Hors
          <br />
          <span className="text-accent">jeu</span>
        </h1>

        <p className="mb-10 max-w-md text-base leading-relaxed text-mute sm:text-lg">
          Cette page n&apos;existe pas ou a été déplacée. Le ballon est sorti — on reprend depuis
          la ligne de touche.
        </p>

        <div className="mb-14 flex flex-wrap gap-3">
          <Button href="/">Retour à l&apos;accueil</Button>
          <Button href="/produits" variant="outline">
            Voir la collection
          </Button>
        </div>

        <div className="grid max-w-3xl grid-cols-1 gap-px border border-line bg-line sm:grid-cols-3">
          {suggestions.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="group bg-ink p-5 transition-colors hover:bg-elevated"
            >
              <span className="block font-display text-xl text-white">{item.label}</span>
              <span className="mt-1 mb-3 block text-xs text-mute-dim">{item.desc}</span>
              <span className="rule-grow" />
            </Link>
          ))}
        </div>
      </Container>

      <FlagBar className="absolute inset-x-0 bottom-0" />
    </section>
  );
}

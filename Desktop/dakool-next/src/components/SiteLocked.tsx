import Image from 'next/image';

/**
 * Contenu de la page d'attente, servi tant que SITE_LOCKED vaut true.
 *
 * Partagé par /indisponible et par la page 404 : sans cela, le contenu du
 * 404 — et ses liens vers la boutique — se retrouvait sérialisé dans les
 * données de chaque page servie.
 */
export default function SiteLocked() {
  return (
    <main className="flex min-h-[100svh] flex-col items-center justify-center px-6 py-20 text-center">
      <Image
        src="/dakool-logo.png"
        alt="DAKOOL"
        width={200}
        height={96}
        priority
        className="mb-12"
      />

      <p className="mb-5 text-[11px] font-bold uppercase tracking-brand text-mute-dim">
        Site momentanément hors ligne
      </p>

      {/* text-hero déborderait de l'écran et pousserait le logo hors cadre. */}
      <h1 className="mb-6 max-w-2xl font-display text-display text-fg">
        Contactez votre
        <br />
        développeur
      </h1>

      <p className="max-w-md text-base leading-relaxed text-mute">
        La mise en ligne reprendra dès régularisation. Merci de votre compréhension.
      </p>

      <span aria-hidden className="mt-16 h-px w-16 bg-line-strong" />
    </main>
  );
}

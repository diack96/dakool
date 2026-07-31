import type { Metadata } from 'next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowRight } from '@fortawesome/free-solid-svg-icons';
import PageHero from '@/components/PageHero';
import Container from '@/components/Container';
import SectionHeading from '@/components/SectionHeading';
import Button from '@/components/Button';
import Reveal from '@/components/Reveal';
import Marquee from '@/components/Marquee';

export const metadata: Metadata = {
  title: 'Notre histoire',
  description:
    "Née à Dakar en 2020, DAKOOL est la première marque d'équipements sportifs 100% sénégalaise. L'histoire d'un atelier devenu l'équipementier de la Ligue 1.",
  alternates: { canonical: '/histoire' },
};

const timeline = [
  {
    year: '2020',
    title: 'Un atelier à la Médina',
    text: "DAKOOL naît dans un atelier de quatre machines à coudre à la Médina. Les premières commandes sont des maillots de Navétanes, cousus la nuit, livrés le samedi matin avant le coup d'envoi.",
  },
  {
    year: '2021',
    title: 'Le premier club de Ligue 1',
    text: "Teungueth FC signe. C'est le premier club professionnel à faire confiance à une marque sénégalaise pour l'intégralité de sa saison. Ils sont champions du Sénégal la même année.",
  },
  {
    year: '2022',
    title: "L'usine de la Zone Industrielle",
    text: 'Passage de 4 à 40 machines. Production interne du flocage et de la broderie — plus rien ne part à l’étranger. Trois nouveaux clubs rejoignent le portefeuille.',
  },
  {
    year: '2023',
    title: 'Le Tournoi de la Téranga',
    text: 'Notre tournoi signature réunit huit clubs partenaires à Pikine. 20 millions de FCFA de dotation, kit complet offert à chaque équipe, couverture vidéo intégrale.',
  },
  {
    year: '2024',
    title: 'Huit clubs, quatorze régions',
    text: 'DAKOOL équipe huit clubs professionnels et sponsorise douze compétitions, des Navétanes de quartier à la Coupe du Sénégal.',
  },
  {
    year: '2025',
    title: 'La boutique en ligne',
    text: "Ce que portaient les clubs devient accessible à tous. Livraison 24h à Dakar, 3 à 5 jours partout ailleurs dans le pays.",
  },
];

const values = [
  {
    number: '01',
    title: 'Le Sénégal d’abord',
    text: "Chaque pièce est dessinée, coupée et cousue à Dakar. Nos fournisseurs de tissu sont ouest-africains quand c'est possible. La valeur reste ici.",
  },
  {
    number: '02',
    title: 'La preuve par le terrain',
    text: 'Un produit passe une saison complète en compétition avant d’être commercialisé. Les clubs partenaires sont nos testeurs, pas nos vitrines.',
  },
  {
    number: '03',
    title: 'Le même respect partout',
    text: 'Le maillot d’un club de Ligue 1 et celui d’une équipe de Navétanes sortent de la même chaîne, avec le même tissu et les mêmes finitions.',
  },
  {
    number: '04',
    title: 'Rien de superflu',
    text: 'Pas de collection saisonnière artificielle. On sort une pièce quand elle apporte quelque chose, et on la garde tant qu’elle est la meilleure.',
  },
];

export default function HistoirePage() {
  return (
    <>
      <PageHero
        tag="Depuis 2020 · Dakar"
        title="Notre"
        highlight="Histoire"
        subtitle="Quatre machines à coudre à la Médina. Cinq ans plus tard, l'équipementier de huit clubs professionnels sénégalais."
        index="05"
        meta={[
          { value: '2020', label: 'Année de création' },
          { value: '40', label: 'Machines à l’atelier' },
          { value: '8', label: 'Clubs équipés' },
          { value: '100%', label: 'Fabriqué à Dakar' },
        ]}
      />

      {/* Récit */}
      <section className="bg-ink py-16 sm:py-24">
        <Container size="narrow">
          <Reveal>
            <span className="mb-5 block text-[11px] font-bold uppercase tracking-brand text-white">
              Le début
            </span>
            <h2 className="mb-8 font-display text-title text-white">
              Personne ne fabriquait de maillots <span className="text-accent">ici</span>
            </h2>

            <div className="space-y-6 text-base leading-relaxed text-mute sm:text-lg">
              <p>
                En 2019, un club de Navétanes de la Médina commande cinquante maillots. Le devis
                arrive de Chine : trois mois de délai, des tailles approximatives, un tissu qui ne
                supporte pas la saison des pluies. Le club paie quand même — il n&apos;y a pas
                d&apos;alternative.
              </p>
              <p>
                C&apos;est le constat de départ de DAKOOL. Un pays qui produit certains des meilleurs
                footballeurs du monde et qui n&apos;a pas d&apos;équipementier. Une demande énorme,
                une offre entièrement importée, et une valeur qui part systématiquement ailleurs.
              </p>
              <p>
                Nous avons commencé avec quatre machines et une règle simple : ce que nous vendons,
                nous devons pouvoir le fabriquer nous-mêmes, ici, et le regarder tenir une saison
                entière sur un terrain sénégalais.
              </p>
            </div>
          </Reveal>

          <Reveal delay={120}>
            <blockquote className="my-14 border-l-2 border-white py-2 pl-8">
              <p className="font-display text-heading leading-tight text-white">
                « Le premier club qui nous a fait confiance est devenu champion du Sénégal la même
                année. On n&apos;y est pour rien — mais on n&apos;a jamais oublié. »
              </p>
              <footer className="mt-5 text-xs uppercase tracking-label text-mute-dim">
                L&apos;équipe fondatrice
              </footer>
            </blockquote>
          </Reveal>

          <Reveal>
            <div className="space-y-6 text-base leading-relaxed text-mute sm:text-lg">
              <p>
                Aujourd&apos;hui l&apos;atelier de la Zone Industrielle emploie une trentaine de
                personnes. Le flocage, la broderie et la coupe sont faits sur place. Un club qui
                commande un jeu de maillots le lundi peut le récupérer le vendredi — délai
                impossible à tenir depuis un continent voisin.
              </p>
              <p>
                Nous équipons huit clubs professionnels et sponsorisons douze compétitions. Mais la
                moitié de notre production part toujours vers des équipes de quartier, des académies
                et des tournois de village. C&apos;est là que la marque est née et c&apos;est là
                qu&apos;elle reste utile.
              </p>
            </div>
          </Reveal>
        </Container>
      </section>

      <Marquee accent items={['Coupé à Dakar', 'Cousu à Dakar', 'Testé au Sénégal']} />

      {/* Chronologie */}
      <section className="bg-surface py-16 sm:py-24">
        <Container>
          <SectionHeading eyebrow="Cinq ans" title="La" highlight="chronologie" />

          <ol className="relative border-l border-line pl-8 sm:pl-12">
            {timeline.map((item, i) => (
              <li key={item.year} className="relative pb-12 last:pb-0">
                <Reveal delay={i * 70}>
                  <span
                    aria-hidden
                    className="absolute -left-[calc(2rem+5px)] top-2 h-2.5 w-2.5 rounded-full bg-white ring-4 ring-surface sm:-left-[calc(3rem+5px)]"
                  />
                  <span className="mb-2 block font-display text-4xl leading-none text-accent">
                    {item.year}
                  </span>
                  <h3 className="mb-2.5 font-display text-2xl text-white">{item.title}</h3>
                  <p className="max-w-2xl text-sm leading-relaxed text-mute sm:text-base">
                    {item.text}
                  </p>
                </Reveal>
              </li>
            ))}
          </ol>
        </Container>
      </section>

      {/* Valeurs */}
      <section className="border-y border-line bg-ink py-16 sm:py-24">
        <Container>
          <SectionHeading eyebrow="Nos principes" title="Ce qui ne" highlight="change pas" />

          <div className="grid gap-px bg-line sm:grid-cols-2">
            {values.map((value, i) => (
              <Reveal key={value.number} delay={i * 90}>
                <article className="h-full bg-ink p-8 transition-colors hover:bg-elevated lg:p-10">
                  <span className="mb-6 block font-display text-6xl leading-none text-white/15">
                    {value.number}
                  </span>
                  <h3 className="mb-3 font-display text-2xl text-white">{value.title}</h3>
                  <p className="text-sm leading-relaxed text-mute">{value.text}</p>
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
            La suite
          </span>
          <h2 className="mb-8 max-w-3xl font-display text-display text-black">
            Écrivons le prochain chapitre
          </h2>
          <div className="flex flex-wrap gap-3">
            <Button href="/produits" variant="dark" size="lg">
              Voir la collection
              <FontAwesomeIcon icon={faArrowRight} className="h-3.5 w-3.5" />
            </Button>
            <Button href="/contact" variant="darkOutline" size="lg">
              Devenir partenaire
            </Button>
          </div>
        </Container>
      </section>
    </>
  );
}

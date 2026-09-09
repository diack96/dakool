import Image from 'next/image';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowRight } from '@fortawesome/free-solid-svg-icons';
import { products, productsIn } from '@/data/products';
import ProductCard from '@/components/ProductCard';
import Container from '@/components/Container';
import Button from '@/components/Button';
import SectionHeading from '@/components/SectionHeading';
import Reveal from '@/components/Reveal';
import Marquee from '@/components/Marquee';
import FlagBar from '@/components/FlagBar';

const stats = [
  { value: '40', label: 'Clubs équipés' },
  { value: '12', label: 'Tournois sponsorisés' },
  { value: '500+', label: 'Maillots distribués' },
  { value: '2017', label: 'Année de création' },
];

/** Rayons mis en avant, dans l'ordre où ils apparaissent sur la page. */
const SHOWCASE = ['Basketball', 'Volleyball', 'Yoga', 'Chaussures', 'Handball', 'Accessoires'];

/** Visuel du bloc d'ouverture ; les rayons l'évitent pour ne pas le répéter. */
const HERO_IMAGE = '/produits/chaussures-basket-glacier.jpg';

/**
 * Sélection de la vitrine : uniquement des articles photographiés, deux au
 * plus par rayon. Sans ce filtre la page s'ouvrait sur les quatre premières
 * références du catalogue, qui n'ont pas de photo et tombaient toutes sur le
 * dessin au trait de secours.
 */
function pickFeatured(limit: number) {
  const perCategory = new Map<string, number>();
  const picked = [];

  for (const product of products) {
    if (!product.images?.length) continue;
    const seen = perCategory.get(product.category) ?? 0;
    if (seen >= 2) continue;
    perCategory.set(product.category, seen + 1);
    picked.push(product);
    if (picked.length === limit) break;
  }

  return picked;
}

export default function Home() {
  const featured = pickFeatured(8);

  /* Chaque rayon prend la première photo de son rayon qui ne sert pas déjà
     plus haut, pour qu'aucun visuel n'apparaisse deux fois sur la page. */
  const used = new Set<string>([HERO_IMAGE, ...featured.map((p) => p.images![0])]);

  const shelves = SHOWCASE.map((category) => {
    const inCategory = productsIn(category);
    const covers = inCategory.flatMap((p) => p.images ?? []);
    const cover = covers.find((src) => !used.has(src)) ?? covers[0];
    if (cover) used.add(cover);

    /* Un rayon tenu par un seul modèle décliné se raconte par ses coloris :
       « 1 produit » sous-vendrait cinq tenues de basket différentes. */
    const colorways = inCategory.reduce((n, p) => n + Math.max(p.colors.length, 1), 0);
    const label =
      inCategory.length === 1
        ? `${colorways} coloris`
        : `${inCategory.length} produits`;

    return { category, label, cover };
  }).filter((shelf) => shelf.cover);

  return (
    <>
      {/* ── HERO ───────────────────────────────────────────── */}
      {/* Deux colonnes : le texte n'occupe plus la largeur entière et la
          photo remplit la moitié qui restait vide. */}
      <section className="grain relative overflow-hidden border-b border-line bg-bg">
        <Container className="relative z-10 grid items-center gap-10 pt-28 pb-14 lg:grid-cols-2 lg:gap-14 lg:pt-32 lg:pb-16">
          <div>
            <div className="mb-6 flex items-center gap-3">
              <span className="h-2 w-2 shrink-0 rounded-full bg-inverse" />
              <span className="text-xs font-bold uppercase tracking-brand text-fg">
                Équipementier sportif — depuis 2017
              </span>
            </div>

            <h1 className="mb-6 font-display text-hero text-fg">
              Équipé
              <br />
              pour
              <br />
              <span className="text-accent">gagner</span>
            </h1>

            <p className="mb-8 max-w-md text-base leading-relaxed text-mute sm:text-lg">
              Du maillot à la chaussure, on équipe les clubs, les joueurs et les staffs. Fabrication
              contrôlée, testée en compétition.
            </p>

            <div className="flex flex-wrap gap-3">
              <Button href="/produits">
                Acheter
                <FontAwesomeIcon icon={faArrowRight} className="h-3.5 w-3.5" />
              </Button>
              <Button href="/contact" variant="outline">
                Nous écrire
              </Button>
            </div>
          </div>

          <Link
            href="/produits?categorie=Chaussures"
            className="group relative block aspect-[4/5] overflow-hidden border border-line bg-elevated sm:aspect-[16/10] lg:aspect-square"
          >
            <Image
              src={HERO_IMAGE}
              alt="Chaussure de Basket Low"
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 45vw"
              className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-105"
            />
            <span className="absolute inset-x-0 bottom-0 z-10 flex items-end justify-between gap-4 bg-gradient-to-t from-black/70 to-transparent p-5 pt-14">
              <span>
                <span className="mb-1 block text-[10px] font-bold uppercase tracking-label text-white/70">
                  Chaussures
                </span>
                <span className="font-display text-2xl text-white">Chaussure de Basket Low</span>
              </span>
              <FontAwesomeIcon
                icon={faArrowRight}
                className="mb-1.5 h-4 w-4 shrink-0 text-white transition-transform group-hover:translate-x-1"
              />
            </span>
          </Link>
        </Container>

        <FlagBar className="absolute inset-x-0 bottom-0" />
      </section>

      <Marquee
        items={[
          'Livraison internationale',
          'Retours sous 14 jours',
          'Flocage nom + numéro',
          'Tarifs clubs dès 200 pièces',
        ]}
      />

      {/* ── CHIFFRES ───────────────────────────────────────── */}
      <section className="border-b border-line bg-bg">
        <Container>
          <dl className="grid grid-cols-2 divide-x divide-y divide-line sm:grid-cols-4 sm:divide-y-0">
            {stats.map((stat, i) => (
              <Reveal key={stat.label} delay={i * 80}>
                <div className="px-4 py-7 text-center sm:px-6">
                  <dt className="sr-only">{stat.label}</dt>
                  <dd>
                    <span className="mb-2 block font-display text-5xl leading-none text-fg sm:text-6xl">
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

      {/* ── PRODUITS ───────────────────────────────────────── */}
      <section className="bg-bg py-14 sm:py-16">
        <Container>
          <SectionHeading
            eyebrow="Boutique officielle"
            title="Nouveautés"
            link={{ href: '/produits', label: 'Voir plus' }}
          />

          <div className="grid grid-cols-2 gap-px bg-line lg:grid-cols-4">
            {featured.map((p, i) => (
              <Reveal key={p.id} delay={i * 60}>
                <ProductCard product={p} index={i + 1} />
              </Reveal>
            ))}
          </div>

          <div className="mt-10 sm:hidden">
            <Button href="/produits" variant="outline" className="w-full">
              Tout voir
            </Button>
          </div>
        </Container>
      </section>

      {/* ── RAYONS ─────────────────────────────────────────── */}
      <section className="border-y border-line bg-surface py-14 sm:py-16">
        <Container>
          <SectionHeading
            eyebrow="Par sport"
            title="Les rayons"
            link={{ href: '/produits', label: 'Tout le catalogue' }}
          />

          <div className="grid grid-cols-2 gap-px bg-line lg:grid-cols-3">
            {shelves.map((shelf, i) => (
              <Reveal key={shelf.category} delay={i * 60}>
                <Link
                  href={`/produits?categorie=${encodeURIComponent(shelf.category)}`}
                  className="group relative block aspect-[4/3] overflow-hidden bg-elevated"
                >
                  <Image
                    src={shelf.cover as string}
                    alt=""
                    fill
                    sizes="(max-width: 1024px) 50vw, 33vw"
                    className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-105"
                  />
                  <span className="absolute inset-x-0 bottom-0 z-10 flex items-end justify-between gap-3 bg-gradient-to-t from-black/75 to-transparent p-4 pt-12">
                    <span>
                      <span className="block font-display text-xl text-white sm:text-2xl">
                        {shelf.category}
                      </span>
                      <span className="text-[11px] uppercase tracking-label text-white/70">
                        {shelf.label}
                      </span>
                    </span>
                    <FontAwesomeIcon
                      icon={faArrowRight}
                      className="mb-1.5 h-3.5 w-3.5 shrink-0 text-white transition-transform group-hover:translate-x-1"
                    />
                  </span>
                </Link>
              </Reveal>
            ))}
          </div>
        </Container>
      </section>


      {/* ── CTA ────────────────────────────────────────────── */}
      <section className="grain relative overflow-hidden bg-inverse py-16">
        <span
          aria-hidden
          className="absolute top-1/2 right-0 hidden -translate-y-1/2 font-display text-[18rem] leading-none text-on-inverse/10 select-none lg:block"
        >
          DK
        </span>

        <Container className="relative z-10">
          <span className="mb-4 block text-[11px] font-bold uppercase tracking-brand text-on-inverse/50">
            Partenariat
          </span>
          <h2 className="mb-8 max-w-3xl font-display text-display text-on-inverse">
            Ton club mérite le meilleur
          </h2>
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

      <Marquee accent items={['Dakool', 'Équipementier', 'Depuis 2017']} />
    </>
  );
}

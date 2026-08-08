import Link from 'next/link';
import Image from 'next/image';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faInstagram, faFacebookF, faTiktok, faXTwitter } from '@fortawesome/free-brands-svg-icons';
import { categories } from '@/data/products';
import Container from './Container';
import FlagBar from './FlagBar';
import NewsletterForm from './NewsletterForm';

const socials = [
  { icon: faInstagram, label: 'Instagram', href: 'https://instagram.com/dakool' },
  { icon: faFacebookF, label: 'Facebook', href: 'https://facebook.com/dakool' },
  { icon: faTiktok, label: 'TikTok', href: 'https://tiktok.com/@dakool.official' },
  { icon: faXTwitter, label: 'X', href: 'https://x.com/dakool' },
];

const navigation = [
  ['/', 'Accueil'],
  ['/produits', 'Boutique'],
  ['/contact', 'Contact'],
];

export default function Footer() {
  return (
    <footer className="border-t border-line bg-bg">
      {/* Adhésion Club DAKOOL */}
      <div className="border-b border-line">
        <Container className="flex flex-col gap-8 py-14 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <span className="mb-3 block text-[11px] font-bold uppercase tracking-brand text-fg">
              Club DAKOOL
            </span>
            <h2 className="font-display text-heading text-fg">
              Deviens membre, c&apos;est gratuit
            </h2>
            {/* Bénéfices formulés comme ceux d'un programme d'adhésion
                d'équipementier : accès, exclusivité, avance. */}
            <ul className="mt-3 max-w-md space-y-1.5 text-sm text-mute">
              <li>— Accès anticipé aux nouveautés</li>
              <li>— Produits réservés aux membres</li>
              <li>— Offres réservées aux clubs</li>
            </ul>
          </div>
          <NewsletterForm />
        </Container>
      </div>

      {/* Signature de marque */}
      <div className="border-b border-line">
        <Container className="flex flex-col gap-6 py-14 sm:flex-row sm:items-end sm:justify-between">
          <Link href="/" aria-label="DAKOOL — accueil">
            <Image
              src="/dakool-logo.png"
              alt="DAKOOL"
              width={260}
              height={125}
              className="opacity-90 transition-opacity hover:opacity-100"
            />
          </Link>
          <p className="max-w-xs text-sm leading-relaxed text-mute">
            Équipementier sportif. Maillots, chaussures et équipements pour ceux qui
            jouent.
          </p>
        </Container>
      </div>

      {/* Colonnes */}
      <Container className="py-14">
        <div className="grid grid-cols-2 gap-x-8 gap-y-10 sm:grid-cols-3">
          <div>
            <h3 className="mb-5 text-xs font-black uppercase tracking-label text-fg">
              Navigation
            </h3>
            <ul className="space-y-2.5">
              {navigation.map(([href, label]) => (
                <li key={href}>
                  <Link href={href} className="text-sm text-mute transition-colors hover:text-fg">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="mb-5 text-xs font-black uppercase tracking-label text-fg">
              Collections
            </h3>
            <ul className="space-y-2.5">
              {categories
                .filter((c) => c !== 'Tous')
                .map((cat) => (
                  <li key={cat}>
                    <Link
                      href={`/produits?categorie=${encodeURIComponent(cat)}`}
                      className="text-sm text-mute transition-colors hover:text-fg"
                    >
                      {cat}
                    </Link>
                  </li>
                ))}
            </ul>
          </div>

          <div>
            <h3 className="mb-5 text-xs font-black uppercase tracking-label text-fg">Contact</h3>
            <ul className="space-y-2.5">
              <li>
                <a
                  href="mailto:contact@dakool.com"
                  className="text-sm text-mute transition-colors hover:text-fg"
                >
                  contact@dakool.com
                </a>
              </li>
              <li className="text-sm text-mute">Service client · 7j/7</li>
            </ul>

            <div className="mt-6 flex flex-wrap gap-2">
              {socials.map(({ icon, label, href }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`DAKOOL sur ${label}`}
                  className="flex h-9 w-9 items-center justify-center border border-line text-mute transition-colors hover:border-fg hover:text-fg"
                >
                  <FontAwesomeIcon icon={icon} className="h-3.5 w-3.5" />
                </a>
              ))}
            </div>
          </div>
        </div>
      </Container>

      {/* Barre de bas de page */}
      <div className="border-t border-line py-6">
        <Container className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <p className="text-xs text-mute-dim">
            © {new Date().getFullYear()} DAKOOL. Tous droits réservés.
          </p>
          <Link
            href="/mentions-legales"
            className="text-xs text-mute-dim transition-colors hover:text-mute"
          >
            Mentions légales
          </Link>
        </Container>
      </div>

      <FlagBar />
    </footer>
  );
}

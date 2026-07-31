import Link from 'next/link';
import Image from 'next/image';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faInstagram, faFacebookF, faTiktok, faXTwitter } from '@fortawesome/free-brands-svg-icons';
import { teams } from '@/data/teams';
import { categories } from '@/data/products';
import Container from './Container';
import FlagBar from './FlagBar';
import NewsletterForm from './NewsletterForm';

const socials = [
  { icon: faInstagram, label: 'Instagram', href: 'https://instagram.com/dakool.sn' },
  { icon: faFacebookF, label: 'Facebook', href: 'https://facebook.com/dakool.sn' },
  { icon: faTiktok, label: 'TikTok', href: 'https://tiktok.com/@dakool.official' },
  { icon: faXTwitter, label: 'X', href: 'https://x.com/dakool_sn' },
];

const navigation = [
  ['/', 'Accueil'],
  ['/produits', 'Produits'],
  ['/equipes', 'Équipes'],
  ['/tournois', 'Tournois'],
  ['/histoire', 'Histoire'],
  ['/contact', 'Contact'],
];

const legal = [
  ['/mentions-legales', 'Mentions légales'],
  ['/confidentialite', 'Confidentialité'],
  ['/cgv', 'CGV'],
];

export default function Footer() {
  return (
    <footer className="border-t border-line bg-ink">
      {/* Adhésion Club DAKOOL */}
      <div className="border-b border-line">
        <Container className="flex flex-col gap-8 py-14 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <span className="mb-3 block text-[11px] font-bold uppercase tracking-brand text-white">
              Club DAKOOL
            </span>
            <h2 className="font-display text-heading text-white">
              Deviens membre, c&apos;est gratuit
            </h2>
            {/* Bénéfices formulés comme ceux d'un programme d'adhésion
                d'équipementier : accès, exclusivité, avance. */}
            <ul className="mt-3 max-w-md space-y-1.5 text-sm text-mute">
              <li>— Accès anticipé aux nouveautés</li>
              <li>— Produits réservés aux membres</li>
              <li>— Les dates de tournois avant tout le monde</li>
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
            La première marque d&apos;équipements sportifs 100% sénégalaise. Née à Dakar, faite
            pour ceux qui jouent.
          </p>
        </Container>
      </div>

      {/* Colonnes */}
      <Container className="py-14">
        <div className="grid grid-cols-2 gap-x-8 gap-y-10 sm:grid-cols-4">
          <div>
            <h3 className="mb-5 text-xs font-black uppercase tracking-label text-white">
              Navigation
            </h3>
            <ul className="space-y-2.5">
              {navigation.map(([href, label]) => (
                <li key={href}>
                  <Link href={href} className="text-sm text-mute transition-colors hover:text-white">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="mb-5 text-xs font-black uppercase tracking-label text-white">
              Collections
            </h3>
            <ul className="space-y-2.5">
              {categories
                .filter((c) => c !== 'Tous')
                .map((cat) => (
                  <li key={cat}>
                    <Link
                      href={`/produits?categorie=${encodeURIComponent(cat)}`}
                      className="text-sm text-mute transition-colors hover:text-white"
                    >
                      {cat}
                    </Link>
                  </li>
                ))}
            </ul>
          </div>

          <div>
            <h3 className="mb-5 text-xs font-black uppercase tracking-label text-white">Clubs</h3>
            <ul className="space-y-2.5">
              {teams.slice(0, 5).map((team) => (
                <li key={team.slug}>
                  <Link
                    href={`/equipes/${team.slug}`}
                    className="text-sm text-mute transition-colors hover:text-white"
                  >
                    {team.name}
                  </Link>
                </li>
              ))}
              <li>
                <Link href="/equipes" className="text-sm text-accent transition-colors hover:text-white">
                  Tous les clubs →
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="mb-5 text-xs font-black uppercase tracking-label text-white">Contact</h3>
            <ul className="space-y-2.5">
              <li className="text-sm text-mute">
                Zone Industrielle
                <br />
                Route de Rufisque
                <br />
                Dakar 11000, Sénégal
              </li>
              <li>
                <a
                  href="tel:+221761234567"
                  className="text-sm text-mute transition-colors hover:text-white"
                >
                  +221 76 123 45 67
                </a>
              </li>
              <li>
                <a
                  href="mailto:contact@dakool.sn"
                  className="text-sm text-mute transition-colors hover:text-white"
                >
                  contact@dakool.sn
                </a>
              </li>
            </ul>

            <div className="mt-6 flex flex-wrap gap-2">
              {socials.map(({ icon, label, href }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`DAKOOL sur ${label}`}
                  className="flex h-9 w-9 items-center justify-center border border-line text-mute transition-colors hover:border-white hover:text-white"
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
            © {new Date().getFullYear()} DAKOOL. Tous droits réservés. Fait avec fierté au Sénégal.
          </p>
          <div className="flex flex-wrap justify-center gap-6">
            {legal.map(([href, label]) => (
              <Link
                key={href}
                href={href}
                className="text-xs text-mute-dim transition-colors hover:text-mute"
              >
                {label}
              </Link>
            ))}
          </div>
        </Container>
      </div>

      <FlagBar />
    </footer>
  );
}

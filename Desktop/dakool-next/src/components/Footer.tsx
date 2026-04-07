import Link from 'next/link';
import Image from 'next/image';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faInstagram, faFacebookF, faTiktok, faXTwitter } from '@fortawesome/free-brands-svg-icons';

export default function Footer() {
  return (
    <footer className="bg-black border-t border-white/5">
      {/* Big brand statement */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-16 pb-10 border-b border-white/5">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6">
          <Link href="/">
            <Image
              src="/dakool-logo.png"
              alt="Dakool"
              width={260}
              height={125}
              className="opacity-90 hover:opacity-100 transition-opacity"
            />
          </Link>
          <p className="text-gray-600 font-sans text-sm max-w-xs leading-relaxed">
            La première marque d&apos;équipements sportifs 100% Sénégalaise.
            Né à Dakar, fait pour les champions.
          </p>
        </div>
      </div>

      {/* Links grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-14">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-10">
          {/* Social */}
          <div>
            <h4 className="text-white font-black text-xs uppercase tracking-[0.25em] mb-5 font-sans">Suivez-nous</h4>
            <div className="flex gap-2 flex-wrap">
              {[
                { icon: faInstagram, label: 'Instagram' },
                { icon: faFacebookF, label: 'Facebook' },
                { icon: faTiktok, label: 'TikTok' },
                { icon: faXTwitter, label: 'X' },
              ].map(({ icon, label }) => (
                <a
                  key={label}
                  href="#"
                  aria-label={label}
                  className="w-9 h-9 border border-white/10 hover:border-[#00853F] flex items-center justify-center text-gray-500 hover:text-[#00853F] transition-all duration-200"
                >
                  <FontAwesomeIcon icon={icon} className="w-3.5 h-3.5" />
                </a>
              ))}
            </div>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="text-white font-black text-xs uppercase tracking-[0.25em] mb-5 font-sans">Navigation</h4>
            <ul className="space-y-2.5">
              {[['/', 'Accueil'], ['/produits', 'Produits'], ['/equipes', 'Équipes'], ['/tournois', 'Tournois'], ['/contact', 'Contact']].map(([href, label]) => (
                <li key={href}>
                  <Link href={href} className="text-gray-600 hover:text-white font-sans text-sm transition-colors duration-200">{label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Collections */}
          <div>
            <h4 className="text-white font-black text-xs uppercase tracking-[0.25em] mb-5 font-sans">Collections</h4>
            <ul className="space-y-2.5">
              {['Maillots', 'Chaussures', 'Ballons', 'Équipements', 'Accessoires'].map(cat => (
                <li key={cat}>
                  <Link href="/produits" className="text-gray-600 hover:text-white font-sans text-sm transition-colors duration-200">{cat}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white font-black text-xs uppercase tracking-[0.25em] mb-5 font-sans">Contact</h4>
            <ul className="space-y-2.5">
              <li><span className="text-gray-600 font-sans text-sm">Dakar, Sénégal</span></li>
              <li><a href="tel:+221761234567" className="text-gray-600 hover:text-white font-sans text-sm transition-colors duration-200">+221 76 123 45 67</a></li>
              <li><a href="mailto:contact@dakool.sn" className="text-gray-600 hover:text-white font-sans text-sm transition-colors duration-200">contact@dakool.sn</a></li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/5 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-gray-700 font-sans text-xs">© 2024 DAKOOL. Tous droits réservés. Fait avec fierté au Sénégal 🇸🇳</p>
          <div className="flex gap-6">
            {['Mentions légales', 'Confidentialité', 'CGV'].map(label => (
              <a key={label} href="#" className="text-gray-700 hover:text-gray-400 font-sans text-xs transition-colors duration-200">{label}</a>
            ))}
          </div>
        </div>
      </div>

      {/* Flag bar */}
      <div className="flex h-[3px]">
        <span className="flex-1 bg-[#00853F]" />
        <span className="flex-1 bg-[#FDEF42]" />
        <span className="flex-1 bg-[#E31E24]" />
      </div>
    </footer>
  );
}

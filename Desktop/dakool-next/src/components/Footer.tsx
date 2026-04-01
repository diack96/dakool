import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faInstagram, faFacebookF, faTiktok, faXTwitter } from '@fortawesome/free-brands-svg-icons';
import Logo from './Logo';

export default function Footer() {
  return (
    <footer className="bg-[#080808] border-t border-white/10 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <Logo />
              <span className="font-black text-xl tracking-widest text-white" style={{ fontFamily: "'Bebas Neue', cursive" }}>DAKOOL</span>
            </Link>
            <p className="text-gray-500 font-sans text-sm leading-relaxed mb-6">
              La première marque d&apos;équipements sportifs 100% Sénégalaise. Né à Dakar, fait pour les champions.
            </p>
            <div className="flex gap-3">
              {[faInstagram, faFacebookF, faTiktok, faXTwitter].map((icon, i) => (
                <a key={i} href="#" className="w-9 h-9 rounded-lg bg-white/5 hover:bg-[#00853F]/20 border border-white/10 hover:border-[#00853F]/30 flex items-center justify-center text-gray-400 hover:text-[#00853F] transition-all">
                  <FontAwesomeIcon icon={icon} className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="text-white font-black tracking-widest mb-4 text-sm" style={{ fontFamily: "'Bebas Neue', cursive" }}>Navigation</h4>
            <ul className="space-y-2">
              {[['/', 'Accueil'], ['/produits', 'Produits'], ['/equipes', 'Équipes'], ['/tournois', 'Tournois'], ['/contact', 'Contact']].map(([href, label]) => (
                <li key={href}>
                  <Link href={href} className="text-gray-500 hover:text-[#00853F] font-sans text-sm transition-colors">{label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Collections */}
          <div>
            <h4 className="text-white font-black tracking-widest mb-4 text-sm" style={{ fontFamily: "'Bebas Neue', cursive" }}>Collections</h4>
            <ul className="space-y-2">
              {['Maillots', 'Chaussures', 'Ballons', 'Équipements', 'Accessoires'].map(cat => (
                <li key={cat}>
                  <Link href="/produits" className="text-gray-500 hover:text-[#00853F] font-sans text-sm transition-colors">{cat}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white font-black tracking-widest mb-4 text-sm" style={{ fontFamily: "'Bebas Neue', cursive" }}>Contact</h4>
            <ul className="space-y-2">
              <li><span className="text-gray-500 font-sans text-sm">Dakar, Sénégal</span></li>
              <li><a href="tel:+221761234567" className="text-gray-500 hover:text-[#00853F] font-sans text-sm transition-colors">+221 76 123 45 67</a></li>
              <li><a href="mailto:contact@dakool.sn" className="text-gray-500 hover:text-[#00853F] font-sans text-sm transition-colors">contact@dakool.sn</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-gray-600 font-sans text-sm">© 2024 DAKOOL. Tous droits réservés. Fait avec fierté au Sénégal 🇸🇳</p>
          <div className="flex gap-6">
            {['Mentions légales', 'Confidentialité', 'CGV'].map(label => (
              <a key={label} href="#" className="text-gray-600 hover:text-gray-400 font-sans text-xs transition-colors">{label}</a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

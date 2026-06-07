'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Mail,
  Phone,
  MapPin,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Youtube,
  ArrowUp,
} from 'lucide-react';

export default function Footer () {
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <footer className="relative bg-blue-600 dark:bg-gray-800 text-white dark:text-gray-100 transition-colors">
      {/* Bande décorative ocre — signature ouest-africaine */}
      <div className="h-1 w-full bg-gradient-to-r from-earth-500 via-gold-500 to-earth-600" aria-hidden="true" />

      {/* Pattern bogolan en overlay discret */}
      <div className="absolute inset-0 pattern-bogolan opacity-[0.055] pointer-events-none" aria-hidden="true" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Footer Content */}
        <div className="py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Company Info */}
            <div className="lg:col-span-1">
              <Link href="/" className="flex items-center mb-4 group">
                <Image
                  src="/waraba-academy.svg"
                  alt="Waraba Academy"
                  width={48}
                  height={48}
                  className="w-12 h-12"
                />
              </Link>
              <p className="text-white/95 mb-6 leading-relaxed text-sm">
                La plateforme de formation #1 en Afrique pour maîtriser les technologies du futur.
              </p>

              {/* Social Media */}
              <div className="flex space-x-3">
                <a
                  href="https://facebook.com/warabaacademy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 bg-white/20 hover:bg-white/30 rounded-lg flex items-center justify-center transition-colors"
                  aria-label="Facebook"
                >
                  <Facebook className="w-4 h-4" />
                </a>
                <a
                  href="https://twitter.com/warabaacademy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 bg-white/20 hover:bg-white/30 rounded-lg flex items-center justify-center transition-colors"
                  aria-label="Twitter"
                >
                  <Twitter className="w-4 h-4" />
                </a>
                <a
                  href="https://instagram.com/warabaacademy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 bg-white/20 hover:bg-white/30 rounded-lg flex items-center justify-center transition-colors"
                  aria-label="Instagram"
                >
                  <Instagram className="w-4 h-4" />
                </a>
                <a
                  href="https://linkedin.com/company/waraba-academy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 bg-white/20 hover:bg-white/30 rounded-lg flex items-center justify-center transition-colors"
                  aria-label="LinkedIn"
                >
                  <Linkedin className="w-4 h-4" />
                </a>
                <a
                  href="https://youtube.com/@warabaacademy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 bg-white/20 hover:bg-white/30 rounded-lg flex items-center justify-center transition-colors"
                  aria-label="YouTube"
                >
                  <Youtube className="w-4 h-4" />
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="text-base font-semibold mb-4 text-white">
                Navigation
              </h3>
              <ul className="space-y-2">
                <li>
                  <Link
                    href="/"
                    className="text-white/95 hover:text-white transition-colors text-sm"
                  >
                    Accueil
                  </Link>
                </li>
                <li>
                  <Link
                    href="/courses"
                    className="text-white/95 hover:text-white transition-colors text-sm"
                  >
                    Tous nos cours
                  </Link>
                </li>
                <li>
                  <Link
                    href="/categories"
                    className="text-white/95 hover:text-white transition-colors text-sm"
                  >
                    Catégories
                  </Link>
                </li>
                <li>
                  <Link
                    href="/blog"
                    className="text-white/95 hover:text-white transition-colors text-sm"
                  >
                    Blog
                  </Link>
                </li>
                <li>
                  <Link
                    href="/about"
                    className="text-white/95 hover:text-white transition-colors text-sm"
                  >
                    À propos
                  </Link>
                </li>
                <li>
                  <Link
                    href="/contact"
                    className="text-white/95 hover:text-white transition-colors text-sm"
                  >
                    Contact
                  </Link>
                </li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h3 className="text-base font-semibold mb-4 text-white">
                Légal
              </h3>
              <ul className="space-y-2">
                <li>
                  <Link
                    href="/terms"
                    className="text-white/95 hover:text-white transition-colors text-sm"
                  >
                    Conditions d'utilisation
                  </Link>
                </li>
                <li>
                  <Link
                    href="/privacy"
                    className="text-white/95 hover:text-white transition-colors text-sm"
                  >
                    Politique de confidentialité
                  </Link>
                </li>
                <li>
                  <Link
                    href="/faq"
                    className="text-white/95 hover:text-white transition-colors text-sm"
                  >
                    FAQ
                  </Link>
                </li>
              </ul>
            </div>

            {/* Contact Info */}
            <div>
              <h3 className="text-base font-semibold mb-4 text-white">
                Contact
              </h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Mail className="w-4 h-4 text-orange-400" />
                  <a href="mailto:contact@waraba-academy.com" className="text-sm text-white/95 hover:text-white transition-colors">
                    contact@waraba-academy.com
                  </a>
                </div>
                <div className="flex items-center space-x-2">
                  <Phone className="w-4 h-4 text-orange-400" />
                  <a href="tel:+221772271093" className="text-sm text-white/95 hover:text-white transition-colors">
                    +221 77 227 10 93
                  </a>
                </div>
                <div className="flex items-center space-x-2">
                  <MapPin className="w-4 h-4 text-orange-400" />
                  <span className="text-sm text-white/95">Dakar, Sénégal</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Footer */}
        <div className="border-t border-white/20 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-white/95 text-sm">
              © {new Date().getFullYear()} Waraba Academy. Tous droits réservés.
            </div>
            <div className="flex items-center gap-2 text-sm text-white/95">
              <span>by</span>
              <a
                href="https://waraba-digital.vercel.app"
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-white hover:text-orange-400 transition-colors"
              >
                Waraba Digital
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll to Top Button - visible uniquement après scroll */}
      <button
        onClick={scrollToTop}
        className={`fixed bottom-20 right-8 w-12 h-12 bg-blue-700 hover:bg-blue-800 text-white rounded-full shadow-lg transition-all duration-300 transform hover:-translate-y-1 z-40 flex items-center justify-center ${
          showScrollTop ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
        }`}
        aria-label="Retour en haut"
        aria-hidden={!showScrollTop}
        tabIndex={showScrollTop ? 0 : -1}
      >
        <ArrowUp className="w-5 h-5" />
      </button>
    </footer>
  );
}

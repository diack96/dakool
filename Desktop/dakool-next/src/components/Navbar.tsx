'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCartShopping } from '@fortawesome/free-solid-svg-icons';
import { useCart } from '@/context/CartContext';
import Logo from './Logo';

const navLinks = [
  { href: '/', label: 'Accueil' },
  { href: '/produits', label: 'Produits' },
  { href: '/equipes', label: 'Équipes' },
  { href: '/tournois', label: 'Tournois' },
  { href: '/contact', label: 'Contact' },
];

export default function Navbar() {
  const pathname = usePathname();
  const { cartCount, openCart } = useCart();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  return (
    <>
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-black/98 backdrop-blur-md border-b border-white/5' : 'bg-transparent'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center group">
            <Logo height={38} />
          </Link>

          {/* Desktop Nav */}
          <ul className="hidden md:flex items-center gap-0">
            {navLinks.map(link => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={`px-4 py-2 text-xs font-bold uppercase tracking-[0.15em] transition-colors duration-200 font-sans ${
                    pathname === link.href
                      ? 'text-white'
                      : 'text-gray-500 hover:text-white'
                  }`}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <Link
              href="/produits"
              className="hidden md:flex items-center gap-2 bg-white hover:bg-[#00853F] text-black hover:text-white text-xs font-black uppercase tracking-[0.15em] px-5 py-2.5 transition-colors duration-200 font-sans"
            >
              Boutique
            </Link>
            <button
              onClick={openCart}
              className="relative p-2 text-gray-400 hover:text-white transition-colors"
              aria-label="Panier"
            >
              <FontAwesomeIcon icon={faCartShopping} className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-[#00853F] text-white text-[10px] w-4 h-4 flex items-center justify-center font-bold font-sans leading-none">
                  {cartCount}
                </span>
              )}
            </button>
            {/* Hamburger */}
            <button
              className="md:hidden flex flex-col gap-[5px] p-2"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Menu"
            >
              <span className={`block w-6 h-[1.5px] bg-white transition-all duration-300 ${menuOpen ? 'rotate-45 translate-y-[6.5px]' : ''}`} />
              <span className={`block w-6 h-[1.5px] bg-white transition-all duration-300 ${menuOpen ? 'opacity-0 scale-x-0' : ''}`} />
              <span className={`block w-6 h-[1.5px] bg-white transition-all duration-300 ${menuOpen ? '-rotate-45 -translate-y-[6.5px]' : ''}`} />
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      <div className={`fixed inset-0 z-40 bg-black flex flex-col items-start justify-center px-8 gap-8 transition-all duration-500 md:hidden ${menuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
        {/* Decorative */}
        <div className="absolute top-0 right-0 w-px h-full bg-white/5" />
        <div className="absolute right-6 bottom-8 opacity-10 pointer-events-none select-none">
          <Logo height={80} />
        </div>

        {navLinks.map((link, i) => (
          <Link
            key={link.href}
            href={link.href}
            onClick={() => setMenuOpen(false)}
            className={`text-5xl font-black uppercase tracking-widest transition-colors leading-none ${pathname === link.href ? 'text-[#00853F]' : 'text-white hover:text-[#00853F]'}`}
            style={{ fontFamily: "'Bebas Neue', cursive", transitionDelay: `${i * 50}ms` }}
          >
            {link.label}
          </Link>
        ))}

        <Link
          href="/produits"
          onClick={() => setMenuOpen(false)}
          className="mt-4 bg-white text-black font-black uppercase tracking-[0.2em] px-8 py-4 text-sm hover:bg-[#00853F] hover:text-white transition-colors"
        >
          Boutique →
        </Link>
      </div>
    </>
  );
}

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStore, faCartShopping } from '@fortawesome/free-solid-svg-icons';
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
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  return (
    <>
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-[#0a0a0a]/95 backdrop-blur-md shadow-lg shadow-black/30 py-0' : 'bg-[#0a0a0a]/80 backdrop-blur-sm py-0'} border-b border-white/5`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <Logo />
            <span className="font-black text-xl tracking-widest text-white" style={{ fontFamily: "'Bebas Neue', cursive" }}>DAKOOL</span>
          </Link>

          {/* Desktop Nav */}
          <ul className="hidden md:flex items-center gap-1">
            {navLinks.map(link => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 font-sans ${
                    pathname === link.href
                      ? 'text-[#00853F] bg-[#00853F]/10'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <Link href="/produits" className="hidden md:flex items-center gap-2 bg-[#00853F] hover:bg-[#006830] text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors font-sans">
              <FontAwesomeIcon icon={faStore} className="w-4 h-4" />
              Boutique
            </Link>
            <button
              onClick={openCart}
              className="relative p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-all"
              aria-label="Panier"
            >
              <FontAwesomeIcon icon={faCartShopping} className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#E31E24] text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold font-sans">
                  {cartCount}
                </span>
              )}
            </button>
            {/* Hamburger */}
            <button
              className="md:hidden flex flex-col gap-1.5 p-2"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Menu"
            >
              <span className={`block w-5 h-0.5 bg-white transition-all duration-300 ${menuOpen ? 'rotate-45 translate-y-2' : ''}`} />
              <span className={`block w-5 h-0.5 bg-white transition-all duration-300 ${menuOpen ? 'opacity-0' : ''}`} />
              <span className={`block w-5 h-0.5 bg-white transition-all duration-300 ${menuOpen ? '-rotate-45 -translate-y-2' : ''}`} />
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      <div className={`fixed inset-0 z-40 bg-[#0a0a0a]/98 flex flex-col items-center justify-center gap-6 transition-all duration-300 md:hidden ${menuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
        {navLinks.map(link => (
          <Link
            key={link.href}
            href={link.href}
            onClick={() => setMenuOpen(false)}
            className={`text-2xl font-black tracking-widest transition-colors ${pathname === link.href ? 'text-[#00853F]' : 'text-white hover:text-[#00853F]'}`}
            style={{ fontFamily: "'Bebas Neue', cursive" }}
          >
            {link.label}
          </Link>
        ))}
      </div>
    </>
  );
}

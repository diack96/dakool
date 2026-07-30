'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCartShopping } from '@fortawesome/free-solid-svg-icons';
import { useCart } from '@/context/CartContext';
import Logo from './Logo';
import FlagBar from './FlagBar';

const navLinks = [
  { href: '/', label: 'Accueil' },
  { href: '/produits', label: 'Produits' },
  { href: '/equipes', label: 'Équipes' },
  { href: '/tournois', label: 'Tournois' },
  { href: '/histoire', label: 'Histoire' },
  { href: '/contact', label: 'Contact' },
];

export default function Navbar() {
  const pathname = usePathname();
  const { cartCount, openCart } = useCart();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  /* Le menu plein écran bloque le scroll et se ferme avec Échap. */
  useEffect(() => {
    if (!menuOpen) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMenuOpen(false);
    };
    document.addEventListener('keydown', onKeyDown);

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [menuOpen]);

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href);

  return (
    <>
      <nav
        className={`fixed inset-x-0 top-0 z-50 transition-colors duration-300 ${
          scrolled || menuOpen ? 'border-b border-line bg-black/95 backdrop-blur-md' : 'bg-transparent'
        }`}
      >
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 sm:px-6 lg:px-8">
          <Link href="/" aria-label="DAKOOL — accueil" className="relative z-50 flex items-center">
            <Logo height={36} />
          </Link>

          <ul className="hidden items-center md:flex">
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  aria-current={isActive(link.href) ? 'page' : undefined}
                  className={`relative px-3.5 py-2 text-xs font-bold uppercase tracking-cta transition-colors lg:px-4 ${
                    isActive(link.href) ? 'text-white' : 'text-mute hover:text-white'
                  }`}
                >
                  {link.label}
                  {isActive(link.href) && (
                    <span className="absolute inset-x-3.5 -bottom-0.5 h-[2px] bg-teranga lg:inset-x-4" />
                  )}
                </Link>
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              href="/produits"
              className="hidden bg-white px-5 py-2.5 text-xs font-black uppercase tracking-cta text-black transition-colors hover:bg-teranga hover:text-white md:block"
            >
              Boutique
            </Link>

            <button
              type="button"
              onClick={openCart}
              className="relative p-2 text-mute transition-colors hover:text-white"
              aria-label={cartCount > 0 ? `Panier, ${cartCount} article(s)` : 'Panier, vide'}
            >
              <FontAwesomeIcon icon={faCartShopping} className="h-5 w-5" />
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center bg-teranga px-1 text-[10px] leading-none font-bold text-white">
                  {cartCount}
                </span>
              )}
            </button>

            <button
              type="button"
              className="relative z-50 flex flex-col gap-[5px] p-2 md:hidden"
              onClick={() => setMenuOpen((open) => !open)}
              aria-label={menuOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
              aria-expanded={menuOpen}
              aria-controls="menu-mobile"
            >
              <span
                className={`block h-[1.5px] w-6 bg-white transition-transform duration-300 ${menuOpen ? 'translate-y-[6.5px] rotate-45' : ''}`}
              />
              <span
                className={`block h-[1.5px] w-6 bg-white transition-all duration-300 ${menuOpen ? 'scale-x-0 opacity-0' : ''}`}
              />
              <span
                className={`block h-[1.5px] w-6 bg-white transition-transform duration-300 ${menuOpen ? '-translate-y-[6.5px] -rotate-45' : ''}`}
              />
            </button>
          </div>
        </div>
      </nav>

      {/* Menu plein écran mobile */}
      <div
        id="menu-mobile"
        inert={!menuOpen}
        className={`fixed inset-0 z-40 flex flex-col justify-center bg-ink px-7 transition-opacity duration-300 md:hidden ${
          menuOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
      >
        <div aria-hidden className="absolute top-0 right-[18%] bottom-0 w-px bg-line" />
        {/* Filigrane typographique plutôt que le PNG : celui-ci embarque un
            fond opaque qui se verrait à faible opacité. */}
        <span
          aria-hidden
          className="pointer-events-none absolute right-5 bottom-12 font-display text-7xl leading-none text-white/[0.06] select-none"
        >
          Dakool
        </span>

        <ul className="relative flex flex-col gap-3">
          {navLinks.map((link, i) => (
            <li key={link.href}>
              <Link
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className={`block font-display text-5xl tracking-wide transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                  isActive(link.href) ? 'text-teranga' : 'text-white hover:text-teranga'
                } ${menuOpen ? 'translate-y-0 opacity-100' : 'translate-y-5 opacity-0'}`}
                style={{ transitionDelay: menuOpen ? `${80 + i * 55}ms` : '0ms' }}
              >
                <span className="mr-3 align-super text-xs text-mute-dim">0{i + 1}</span>
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        <Link
          href="/produits"
          onClick={() => setMenuOpen(false)}
          className={`relative mt-10 self-start bg-white px-8 py-4 text-sm font-black uppercase tracking-label text-black transition-all duration-500 hover:bg-teranga hover:text-white ${
            menuOpen ? 'translate-y-0 opacity-100' : 'translate-y-5 opacity-0'
          }`}
          style={{ transitionDelay: menuOpen ? `${80 + navLinks.length * 55}ms` : '0ms' }}
        >
          Boutique →
        </Link>

        <FlagBar className="absolute inset-x-0 bottom-0" />
      </div>
    </>
  );
}

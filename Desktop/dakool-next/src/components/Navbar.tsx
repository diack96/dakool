'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCartShopping, faPlus } from '@fortawesome/free-solid-svg-icons';
import { useCart } from '@/context/CartContext';
import { navigation } from '@/data/navigation';
import Logo from './Logo';
import ThemeToggle from './ThemeToggle';

export default function Navbar() {
  const { cartCount, openCart } = useCart();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  /** Rubrique dont le sous-menu est déployé (desktop et mobile). */
  const [openEntry, setOpenEntry] = useState<string | null>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      setOpenEntry(null);
      setMenuOpen(false);
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [menuOpen]);

  const closeAll = () => {
    setMenuOpen(false);
    setOpenEntry(null);
  };

  return (
    <>
      <header
        onMouseLeave={() => setOpenEntry(null)}
        /* surface-light : le header reste blanc quel que soit le thème,
           le logo ne ressortant pas sur un fond sombre. */
        className={`surface-light fixed inset-x-0 top-0 z-50 bg-bg text-fg transition-shadow duration-300 ${
          scrolled || menuOpen || openEntry ? 'border-b border-line shadow-sm' : 'border-b border-line'
        }`}
      >
        <div className="mx-auto flex h-16 max-w-[100rem] items-center justify-between gap-6 px-5 sm:px-6 lg:px-8">
          <Link
            href="/"
            aria-label="DAKOOL — accueil"
            onClick={closeAll}
            className="relative z-50 flex shrink-0 items-center"
          >
            <Logo height={34} />
          </Link>

          {/* Navigation principale */}
          <nav aria-label="Navigation principale" className="hidden lg:block">
            <ul className="flex items-center">
              {navigation.map((entry) => (
                <li key={entry.label} onMouseEnter={() => setOpenEntry(entry.label)}>
                  <Link
                    href={entry.href}
                    onClick={closeAll}
                    onFocus={() => setOpenEntry(entry.label)}
                    aria-expanded={openEntry === entry.label}
                    className={`relative block px-4 py-5 text-xs font-bold uppercase tracking-cta transition-colors ${
                      openEntry === entry.label ? 'text-fg' : 'text-mute hover:text-fg'
                    }`}
                  >
                    {entry.label}
                    {openEntry === entry.label && (
                      <span className="absolute inset-x-4 bottom-3 h-[2px] bg-fg" />
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            <ThemeToggle />

            <button
              type="button"
              onClick={openCart}
              className="relative p-2 text-mute transition-colors hover:text-fg"
              aria-label={cartCount > 0 ? `Panier, ${cartCount} article(s)` : 'Panier, vide'}
            >
              <FontAwesomeIcon icon={faCartShopping} className="h-5 w-5" />
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center bg-inverse px-1 text-[10px] leading-none font-bold text-on-inverse">
                  {cartCount}
                </span>
              )}
            </button>

            <button
              type="button"
              className="relative z-50 flex flex-col gap-[5px] p-2 lg:hidden"
              onClick={() => setMenuOpen((open) => !open)}
              aria-label={menuOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
              aria-expanded={menuOpen}
              aria-controls="menu-mobile"
            >
              <span
                className={`block h-[1.5px] w-6 bg-fg transition-transform duration-300 ${menuOpen ? 'translate-y-[6.5px] rotate-45' : ''}`}
              />
              <span
                className={`block h-[1.5px] w-6 bg-fg transition-all duration-300 ${menuOpen ? 'scale-x-0 opacity-0' : ''}`}
              />
              <span
                className={`block h-[1.5px] w-6 bg-fg transition-transform duration-300 ${menuOpen ? '-translate-y-[6.5px] -rotate-45' : ''}`}
              />
            </button>
          </div>
        </div>

        {/* Sous-menu déployé (desktop) */}
        {navigation.map((entry) => (
          <div
            key={entry.label}
            hidden={openEntry !== entry.label}
            className="absolute inset-x-0 top-16 hidden border-b border-line bg-bg lg:block"
          >
            <div className="mx-auto max-w-[100rem] px-5 py-10 sm:px-6 lg:px-8">
              <p className="mb-5 text-[10px] font-black uppercase tracking-label text-mute-dim">
                {entry.heading}
              </p>
              <ul className="grid grid-cols-2 gap-x-10 gap-y-3 md:grid-cols-3 lg:grid-cols-4">
                {entry.children.map((child) => (
                  <li key={child.label}>
                    <Link
                      href={child.href}
                      onClick={closeAll}
                      className="text-sm text-mute transition-colors hover:text-fg"
                    >
                      {child.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </header>

      {/* Menu plein écran (mobile et tablette) */}
      <div
        id="menu-mobile"
        inert={!menuOpen}
        className={`surface-light fixed inset-0 z-40 overflow-y-auto bg-bg pt-20 pb-10 text-fg transition-opacity duration-300 lg:hidden ${
          menuOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
      >
        <nav aria-label="Navigation mobile" className="mx-auto max-w-2xl px-6">
          <ul className="divide-y divide-line border-y border-line">
            {navigation.map((entry) => {
              const expanded = openEntry === entry.label;
              return (
                <li key={entry.label}>
                  <div className="flex items-center justify-between">
                    <Link
                      href={entry.href}
                      onClick={closeAll}
                      className="flex-1 py-5 font-display text-3xl tracking-wide text-fg"
                    >
                      {entry.label}
                    </Link>
                    <button
                      type="button"
                      onClick={() => setOpenEntry(expanded ? null : entry.label)}
                      aria-expanded={expanded}
                      aria-label={`${expanded ? 'Replier' : 'Déplier'} ${entry.label}`}
                      className="p-3 text-mute transition-colors hover:text-fg"
                    >
                      <FontAwesomeIcon
                        icon={faPlus}
                        className={`h-3.5 w-3.5 transition-transform duration-300 ${expanded ? 'rotate-45' : ''}`}
                      />
                    </button>
                  </div>

                  {/* grid-rows 0fr→1fr : ouverture fluide sans hauteur fixe. */}
                  <div
                    className={`grid transition-[grid-template-rows] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                      expanded ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
                    }`}
                  >
                    <div className="overflow-hidden">
                      <ul className="space-y-2.5 pb-5 pl-1">
                        {entry.children.map((child) => (
                          <li key={child.label}>
                            <Link
                              href={child.href}
                              onClick={closeAll}
                              className="text-sm text-mute transition-colors hover:text-fg"
                            >
                              {child.label}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>

          <Link
            href="/contact"
            onClick={closeAll}
            className="mt-8 inline-block bg-inverse px-8 py-4 text-sm font-black uppercase tracking-label text-on-inverse transition-colors hover:bg-accent"
          >
            Nous écrire
          </Link>
        </nav>
      </div>
    </>
  );
}

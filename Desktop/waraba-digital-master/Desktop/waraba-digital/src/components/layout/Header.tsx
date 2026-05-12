"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Menu, X } from "lucide-react";

const navLinks = [
  { label: "Services", href: "#services" },
  { label: "Processus", href: "#processus" },
  { label: "Réalisations", href: "#realisations" },
  { label: "À Propos", href: "#a-propos" },
  { label: "Contact", href: "#contact" },
];

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleNavClick = (href: string) => {
    setMenuOpen(false);
    document.querySelector(href)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? "glass" : "bg-transparent"}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">

          {/* Logo */}
          <a
            href="#"
            onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: "smooth" }); }}
            className="flex items-center"
          >
            <Image
              src="/waraba-digital.png.png"
              alt="Waraba Digital"
              width={155}
              height={52}
              className="h-9 w-auto object-contain"
              priority
            />
          </a>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <button
                key={link.href}
                onClick={() => handleNavClick(link.href)}
                className="px-4 py-2 text-sm font-medium text-[#94A3B8] hover:text-white transition-colors relative group"
              >
                {link.label}
                <span className="absolute bottom-0 left-4 right-4 h-px bg-primary scale-x-0 group-hover:scale-x-100 transition-transform duration-200 origin-left" />
              </button>
            ))}
          </nav>

          {/* CTA */}
          <div className="hidden md:block">
            <button
              onClick={() => handleNavClick("#contact")}
              className="px-5 py-2.5 text-sm font-bold rounded-lg bg-accent hover:bg-orange-400 text-white transition-colors"
            >
              Devis Gratuit
            </button>
          </div>

          {/* Mobile burger */}
          <button
            className="md:hidden p-2 text-[#94A3B8] hover:text-white transition-colors"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Menu"
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-white/6 bg-[#0B1120]">
          <nav className="max-w-7xl mx-auto px-4 py-4 flex flex-col gap-0.5">
            {navLinks.map((link) => (
              <button
                key={link.href}
                onClick={() => handleNavClick(link.href)}
                className="text-left px-4 py-3 text-sm font-medium text-[#94A3B8] hover:text-white transition-colors"
              >
                {link.label}
              </button>
            ))}
            <button
              onClick={() => handleNavClick("#contact")}
              className="mt-3 px-4 py-3 text-sm font-bold rounded-lg bg-accent hover:bg-orange-400 text-white transition-colors text-center"
            >
              Devis Gratuit
            </button>
          </nav>
        </div>
      )}
    </header>
  );
}

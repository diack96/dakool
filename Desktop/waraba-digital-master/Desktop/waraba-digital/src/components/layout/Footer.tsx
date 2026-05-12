import Image from "next/image";
import { ArrowUpRight } from "lucide-react";

const cols = {
  navigation: [
    { label: "Services", href: "#services" },
    { label: "Processus", href: "#processus" },
    { label: "Réalisations", href: "#realisations" },
    { label: "À Propos", href: "#a-propos" },
    { label: "Contact", href: "#contact" },
  ],
  services: [
    "Développement Web & Mobile",
    "Marketing Digital",
    "Community Management",
    "Branding & Design",
    "Solutions IA",
    "Transformation Digitale",
  ],
  social: ["LinkedIn", "Instagram", "Twitter / X", "YouTube"],
};

export default function Footer() {
  return (
    <footer className="relative bg-[#080E1A] overflow-hidden">
      {/* Kente stripe top border */}
      <div className="h-2 w-full" style={{ backgroundImage: 'repeating-linear-gradient(90deg, #F97316 0, #F97316 6px, #2563EB 6px, #2563EB 12px, rgba(249,115,22,0.45) 12px, rgba(249,115,22,0.45) 16px, transparent 16px, transparent 26px)' }} />
      {/* Adinkra pattern */}
      <div className="absolute inset-0 pattern-adinkra opacity-[0.04] pointer-events-none" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">

          {/* Brand */}
          <div className="lg:col-span-1">
            <Image
              src="/waraba-digital.png.png"
              alt="Waraba Digital"
              width={155}
              height={52}
              className="h-9 w-auto object-contain mb-5"
            />
            <p className="text-[#4B5563] text-sm leading-relaxed mb-6">
              Votre partenaire numérique pour la transformation digitale
              en Afrique de l&apos;Ouest. Basés à Dakar, actifs partout.
            </p>
            <div className="flex flex-wrap gap-2">
              {cols.social.map((name) => (
                <a
                  key={name}
                  href="#"
                  className="px-3 py-1.5 text-xs font-semibold border border-white/8 text-[#4B5563] hover:text-white hover:border-primary/40 hover:bg-primary/8 rounded-lg transition-colors"
                >
                  {name}
                </a>
              ))}
            </div>
          </div>

          {/* Navigation */}
          <div>
            <p className="text-[11px] font-bold text-[#4B5563] uppercase tracking-widest mb-5">
              Navigation
            </p>
            <ul className="space-y-3">
              {cols.navigation.map(({ label, href }) => (
                <li key={label}>
                  <a href={href} className="text-[#94A3B8] hover:text-white text-sm transition-colors">
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <p className="text-[11px] font-bold text-[#4B5563] uppercase tracking-widest mb-5">
              Nos Services
            </p>
            <ul className="space-y-3">
              {cols.services.map((label) => (
                <li key={label}>
                  <a href="#services" className="text-[#94A3B8] hover:text-white text-sm transition-colors">
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Projects + location */}
          <div>
            <p className="text-[11px] font-bold text-[#4B5563] uppercase tracking-widest mb-5">
              Projets
            </p>
            <ul className="space-y-3 mb-8">
              <li>
                <a
                  href="https://waraba-academy.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-[#94A3B8] hover:text-accent text-sm transition-colors group"
                >
                  Waraba Academy
                  <ArrowUpRight size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                </a>
              </li>
              <li>
                <a href="#realisations" className="text-[#94A3B8] hover:text-white text-sm transition-colors">
                  Voir toutes les réalisations
                </a>
              </li>
            </ul>

            <div className="p-4 border border-white/7 rounded-xl">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm">🇸🇳</span>
                <p className="text-sm font-semibold text-white">Dakar, Sénégal</p>
              </div>
              <p className="text-xs text-[#4B5563]">Opérations en Afrique de l&apos;Ouest</p>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-16 pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-[#4B5563] text-sm">
            © {new Date().getFullYear()} Waraba Digital. Tous droits réservés.
          </p>
          <p className="text-[#4B5563] text-xs">Fait avec passion à Dakar 🇸🇳</p>
        </div>
      </div>
    </footer>
  );
}

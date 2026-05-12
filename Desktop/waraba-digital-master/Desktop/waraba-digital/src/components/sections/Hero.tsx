"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { ArrowRight, ChevronDown } from "lucide-react";

const stats = [
  { value: "20+", label: "Projets livrés" },
  { value: "15+", label: "Clients satisfaits" },
  { value: "7 ans", label: "D'expérience" },
  { value: "8", label: "Experts" },
];

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center bg-[#0B1120]">

      {/* Kente diamond pattern background */}
      <div className="absolute inset-0 pattern-kente opacity-[0.022]" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-20 w-full">
        <div className="grid lg:grid-cols-[1fr_420px] gap-16 xl:gap-24 items-center">

          {/* ─── Left ─────────────────────────────── */}
          <div>

            {/* Label */}
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="section-label"
            >
              Agence Digitale · Dakar, Sénégal
            </motion.p>

            {/* H1 */}
            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.08 }}
              className="text-4xl sm:text-5xl xl:text-[3.75rem] font-extrabold text-white leading-[1.1] tracking-tight mb-6"
            >
              Votre Partenaire
              <br />
              <span className="text-accent">Numérique</span>
              <br />
              en Afrique de l&apos;Ouest
            </motion.h1>

            {/* Description */}
            <motion.p
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.16 }}
              className="text-[#94A3B8] text-lg leading-relaxed mb-10 max-w-xl"
            >
              Nous concevons des solutions digitales sur-mesure — du web à
              l&apos;intelligence artificielle — pour accélérer la croissance
              des entreprises et institutions africaines.
            </motion.p>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.22 }}
              className="flex flex-col sm:flex-row gap-3 mb-14"
            >
              <button
                onClick={() => document.querySelector("#services")?.scrollIntoView({ behavior: "smooth" })}
                className="flex items-center justify-center gap-2 w-full sm:w-auto px-6 sm:px-8 py-4 rounded-lg bg-accent hover:bg-orange-400 text-white font-bold text-sm transition-colors group"
              >
                Découvrir nos services
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </button>
              <button
                onClick={() => document.querySelector("#contact")?.scrollIntoView({ behavior: "smooth" })}
                className="flex items-center justify-center gap-2 w-full sm:w-auto px-6 sm:px-8 py-4 rounded-lg border border-white/15 text-white hover:border-white/30 hover:bg-white/4 font-bold text-sm transition-colors"
              >
                Demander un devis
              </button>
            </motion.div>

            {/* Stats strip */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.32 }}
              className="grid grid-cols-2 sm:grid-cols-4 border border-primary/15 rounded-xl overflow-hidden w-full sm:w-auto sm:inline-grid"
            >
              {stats.map(({ value, label }, i) => (
                <div
                  key={label}
                  className={`px-4 py-3.5 text-center border-primary/10
                    ${i % 2 === 0 ? "border-r" : ""}
                    ${i < 2 ? "border-b sm:border-b-0" : ""}
                    ${i < 3 ? "sm:border-r" : ""}
                  `}
                >
                  <p className="text-xl font-extrabold text-primary leading-none">{value}</p>
                  <p className="text-[11px] text-[#94A3B8] mt-1 font-medium">{label}</p>
                </div>
              ))}
            </motion.div>
          </div>

          {/* ─── Right — African tech photo ───────── */}
          <div className="hidden lg:block">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.35 }}
              className="relative w-full aspect-[4/5] rounded-2xl overflow-hidden border border-white/8"
            >
              <Image
                src="https://images.unsplash.com/photo-1573164713988-8665fc963095?w=1200&q=85"
                alt="Tech africaine — professionnelle dans une salle serveurs"
                fill
                className="object-cover"
                priority
              />
              {/* Subtle dark overlay at bottom for legibility */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#0B1120]/70 via-transparent to-transparent" />

              {/* Status badge */}
              <div className="absolute bottom-5 left-5 right-5 flex items-center gap-2.5 px-4 py-3 rounded-xl bg-[#0B1120]/80 backdrop-blur-sm border border-white/8">
                <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0 animate-pulse" />
                <span className="text-white text-xs font-semibold">
                  Disponible pour nouveaux projets
                </span>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        onClick={() => document.querySelector("#clients")?.scrollIntoView({ behavior: "smooth" })}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-[#4B5563] hover:text-[#94A3B8] transition-colors"
      >
        <span className="text-[10px] font-semibold tracking-[0.2em] uppercase">Défiler</span>
        <motion.div animate={{ y: [0, 6, 0] }} transition={{ duration: 1.5, repeat: Infinity }}>
          <ChevronDown size={16} />
        </motion.div>
      </motion.button>
    </section>
  );
}

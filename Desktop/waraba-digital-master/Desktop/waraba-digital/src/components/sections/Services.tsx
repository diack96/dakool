"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

/* ─── Data ───────────────────────────────────────── */

const services = [
  {
    number: "01",
    category: "Développement Digital",
    tagline: "Du concept au code. Nous bâtissons des produits numériques performants, pensés pour convertir et pour durer.",
    items: [
      "Création de sites web professionnels",
      "Développement e-commerce",
      "Applications web et mobiles",
      "Landing pages optimisées",
    ],
  },
  {
    number: "02",
    category: "Marketing Digital",
    tagline: "Stratégies data-driven pour maximiser votre visibilité et transformer votre audience en clients fidèles.",
    items: [
      "SEO — référencement Google durable",
      "Publicité digitale (Google Ads, Meta Ads)",
      "Stratégie marketing & plan d'action",
      "Email marketing et automation",
    ],
  },
  {
    number: "03",
    category: "Community Management",
    tagline: "Construisez une communauté engagée. Transformez vos réseaux sociaux en moteurs de croissance réels.",
    items: [
      "Gestion de réseaux sociaux",
      "Création de contenu visuel et vidéo",
      "Planification et calendrier éditorial",
      "Analyse des performances",
    ],
  },
  {
    number: "04",
    category: "Branding & Design",
    tagline: "Des identités visuelles qui marquent les esprits et positionnent votre marque comme référence.",
    items: [
      "Création de logo",
      "Identité visuelle & charte graphique",
      "Direction artistique",
      "Design graphique print & digital",
    ],
  },
  {
    number: "05",
    category: "Production de Contenu",
    tagline: "Des contenus puissants qui engagent, convertissent et racontent l'histoire de votre marque.",
    items: [
      "Montage vidéo professionnel",
      "Création de Reels et Shorts viraux",
      "Copywriting orienté conversion",
      "Storytelling de marque",
    ],
  },
  {
    number: "06",
    category: "Solutions IA",
    tagline: "Exploitez l'intelligence artificielle pour automatiser, scaler et prendre de l'avance sur la concurrence.",
    items: [
      "Chatbots IA pour entreprises",
      "Automatisation marketing intelligente",
      "Agents IA pour service client 24h/7j",
      "Intégration d'outils IA (GPT-4, Claude)",
    ],
  },
  {
    number: "07",
    category: "Transformation Digitale",
    tagline: "Accompagnement stratégique de bout en bout pour faire de votre organisation un leader de l'ère numérique.",
    items: [
      "Digitalisation des processus internes",
      "Mise en place CRM (HubSpot, Salesforce)",
      "Automatisation des ventes & pipeline",
      "Audit digital & feuille de route 360°",
    ],
  },
];

/* ─── Component ──────────────────────────────────── */

export default function Services() {
  const grid = services.slice(0, 6);
  const wide = services[6];

  return (
    <section id="services" className="py-24 lg:py-32 bg-[#0B1120]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* ─── Header ──────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5 }}
          className="max-w-3xl mb-20"
        >
          <p className="section-label">Nos expertises</p>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white leading-tight mb-5">
            Des Solutions Complètes
            <br />
            pour Dominer{" "}
            <span className="text-accent">Votre Marché</span>
          </h2>
          <p className="text-[#94A3B8] text-lg leading-relaxed">
            De la création de site à l&apos;intelligence artificielle — 7 pôles
            d&apos;expertise pour propulser votre entreprise dans l&apos;ère numérique.
          </p>
        </motion.div>

        {/* ─── 6-card grid ─────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-primary/10 rounded-2xl overflow-hidden mb-px">
          {grid.map((s, i) => (
            <motion.div
              key={s.number}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.4, delay: i * 0.06 }}
              className="group bg-[#0B1120] hover:bg-[#111827] transition-colors duration-200 p-8 flex flex-col"
            >
              {/* Number */}
              <span className="text-4xl font-black text-primary/40 font-mono mb-6 leading-none">
                {s.number}
              </span>

              {/* Category + tagline */}
              <h3 className="text-white font-bold text-lg mb-2 leading-snug">
                {s.category}
              </h3>
              <p className="text-[#94A3B8] text-sm leading-relaxed mb-6">
                {s.tagline}
              </p>

              {/* Divider */}
              <div className="h-px bg-primary/10 mb-6" />

              {/* Items */}
              <ul className="space-y-2.5 mb-8 flex-1">
                {s.items.map((item) => (
                  <li key={item} className="flex items-start gap-2.5">
                    <span className="text-accent text-xs mt-[3px] shrink-0 font-bold">—</span>
                    <span className="text-[#CBD5E1] text-sm leading-snug">{item}</span>
                  </li>
                ))}
              </ul>

              {/* Link */}
              <button
                onClick={() => document.querySelector("#contact")?.scrollIntoView({ behavior: "smooth" })}
                className="flex items-center gap-1.5 text-accent text-sm font-bold group-hover:gap-3 transition-all duration-200 mt-auto"
              >
                Nous contacter
                <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </motion.div>
          ))}
        </div>

        {/* ─── Wide card (07) ──────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.5 }}
          className="group bg-[#111827] border border-white/6 hover:border-white/12 transition-colors duration-200 rounded-2xl p-8 lg:p-10 mt-5 mb-20"
        >
          <div className="flex flex-col lg:flex-row lg:items-start gap-8 lg:gap-16">
            {/* Left */}
            <div className="lg:w-[300px] shrink-0">
              <span className="text-5xl font-black text-primary/40 font-mono block mb-5 leading-none">
                {wide.number}
              </span>
              <h3 className="text-white font-extrabold text-xl mb-3 leading-snug">
                {wide.category}
              </h3>
              <p className="text-[#94A3B8] text-sm leading-relaxed">
                {wide.tagline}
              </p>
            </div>

            {/* Separator */}
            <div className="hidden lg:block w-px self-stretch bg-white/6" />

            {/* Right — 2×2 grid */}
            <div className="flex-1 grid sm:grid-cols-2 gap-5">
              {wide.items.map((item, idx) => (
                <div key={item} className="flex items-start gap-4">
                  <span className="text-primary/50 font-black text-xs font-mono mt-0.5 shrink-0 w-5">
                    0{idx + 1}
                  </span>
                  <span className="text-[#CBD5E1] text-sm leading-relaxed">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* ─── CTA block ───────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5 }}
          className="border border-primary/15 bg-primary/[0.03] rounded-2xl p-10 lg:p-14 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8"
        >
          <div>
            <p className="section-label mb-3">Travaillons ensemble</p>
            <h3 className="text-white font-extrabold text-2xl lg:text-3xl mb-3 leading-tight">
              Prêt à transformer votre entreprise avec le digital ?
            </h3>
            <p className="text-[#94A3B8] text-sm leading-relaxed max-w-lg">
              Nos experts analysent gratuitement votre situation et vous proposent
              les solutions adaptées à vos objectifs et votre budget.
            </p>
            <div className="flex flex-wrap gap-x-8 gap-y-2 mt-5">
              {["Devis gratuit sous 24h", "Sans engagement", "Réponse garantie"].map((item) => (
                <span key={item} className="flex items-center gap-2 text-[#94A3B8] text-sm">
                  <span className="w-1 h-1 rounded-full bg-emerald-400 shrink-0" />
                  {item}
                </span>
              ))}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row lg:flex-col gap-3 shrink-0">
            <button
              onClick={() => document.querySelector("#contact")?.scrollIntoView({ behavior: "smooth" })}
              className="flex items-center justify-center gap-2 px-8 py-4 rounded-lg bg-accent hover:bg-orange-400 text-white font-bold text-sm transition-colors whitespace-nowrap group"
            >
              Demander un devis gratuit
              <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform" />
            </button>
            <a
              href="mailto:contact@waraba-digital.com"
              className="flex items-center justify-center px-8 py-4 rounded-lg border border-white/12 text-[#94A3B8] hover:text-white hover:border-white/24 font-bold text-sm transition-colors whitespace-nowrap"
            >
              Nous contacter
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

"use client";

import { motion } from "framer-motion";

const steps = [
  {
    number: "01",
    title: "Découverte",
    description:
      "Nous analysons vos besoins, votre marché et vos objectifs pour poser des bases stratégiques solides. Aucune solution générique — tout part de votre réalité.",
  },
  {
    number: "02",
    title: "Conception",
    description:
      "Maquettes, prototypes et architecture technique. Chaque détail est pensé et validé avec vous avant le moindre développement.",
  },
  {
    number: "03",
    title: "Développement",
    description:
      "Nos experts construisent votre solution avec les meilleures technologies, en itérant avec vous à chaque étape du sprint.",
  },
  {
    number: "04",
    title: "Livraison & Suivi",
    description:
      "Déploiement, formation de vos équipes et support continu. Votre succès après la mise en ligne est notre responsabilité.",
  },
];

export default function Process() {
  return (
    <section id="processus" className="relative py-24 lg:py-32 bg-[#0D1526] border-y border-white/5 overflow-hidden">
      <div className="absolute inset-0 pattern-adinkra opacity-[0.055]" />
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5 }}
          className="max-w-2xl mb-20"
        >
          <p className="section-label">Notre méthode</p>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white leading-tight mb-5">
            De l&apos;idée au lancement,{" "}
            <span className="text-accent">avec méthode</span>
          </h2>
          <p className="text-[#94A3B8] text-lg leading-relaxed">
            Un processus éprouvé sur 20+ projets, conçu pour livrer dans les délais
            et au-delà de vos attentes.
          </p>
        </motion.div>

        {/* Steps */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-0 border border-primary/12 rounded-2xl overflow-hidden">
          {steps.map(({ number, title, description }, i) => (
            <motion.div
              key={title}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              className="group p-8 bg-[#0D1526] hover:bg-[#111827] transition-colors duration-200 border-r border-b border-primary/8 last:border-r-0 [&:nth-child(2)]:lg:border-r [&:nth-child(3)]:lg:border-r [&:nth-child(4)]:lg:border-r-0 [&:nth-child(3)]:sm:border-r-0 [&:nth-child(3)]:lg:border-r [&:nth-child(2n)]:sm:border-r-0 [&:nth-child(2n)]:lg:border-r"
            >
              {/* Number */}
              <span className="text-5xl font-black text-primary/35 font-mono block mb-8 leading-none">
                {number}
              </span>

              {/* Title */}
              <h3 className="text-white font-bold text-lg mb-3">{title}</h3>

              {/* Description */}
              <p className="text-[#94A3B8] text-sm leading-relaxed">{description}</p>
            </motion.div>
          ))}
        </div>

        {/* Bottom row */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="mt-10 flex flex-col sm:flex-row items-center justify-between gap-6 pt-10 border-t border-white/6"
        >
          <p className="text-[#94A3B8] text-sm">
            Délai moyen de livraison :{" "}
            <span className="text-white font-semibold">2 à 8 semaines</span>{" "}
            selon la complexité du projet.
          </p>
          <button
            onClick={() => document.querySelector("#contact")?.scrollIntoView({ behavior: "smooth" })}
            className="px-7 py-3 rounded-lg bg-accent hover:bg-orange-400 text-white font-bold text-sm transition-colors whitespace-nowrap"
          >
            Lancer mon projet →
          </button>
        </motion.div>
      </div>
    </section>
  );
}


"use client";

import { motion, useInView } from "framer-motion";
import { useRef, useEffect, useState } from "react";

const stats = [
  { value: 20, suffix: "+", label: "Projets livrés" },
  { value: 15, suffix: "+", label: "Clients satisfaits" },
  { value: 7, suffix: " ans", label: "D'expérience" },
  { value: 8, suffix: "", label: "Experts dédiés" },
];

const values = [
  {
    title: "Innovation",
    description: "Nous adoptons les technologies les plus récentes pour concevoir des solutions à l'avant-garde du secteur.",
  },
  {
    title: "Qualité",
    description: "Chaque ligne de code, chaque pixel est pensé avec soin. Nous ne livrons que ce dont nous sommes fiers.",
  },
  {
    title: "Proximité",
    description: "Nous comprenons le contexte africain. Nos solutions sont pensées pour nos réalités locales et nos marchés.",
  },
  {
    title: "Impact",
    description: "Notre succès se mesure à celui de nos clients. Nous construisons des outils qui créent une valeur réelle.",
  },
];

function Counter({ value, suffix }: { value: number; suffix: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });

  useEffect(() => {
    if (!inView) return;
    const steps = 40;
    const inc = value / steps;
    let cur = 0;
    const timer = setInterval(() => {
      cur += inc;
      if (cur >= value) { setCount(value); clearInterval(timer); }
      else setCount(Math.floor(cur));
    }, 1500 / steps);
    return () => clearInterval(timer);
  }, [inView, value]);

  return <span ref={ref}>{count}{suffix}</span>;
}

export default function APropos() {
  return (
    <section id="a-propos" className="relative py-24 lg:py-32 bg-[#0D1526] border-y border-white/5 overflow-hidden">
      {/* Bogolan cross background */}
      <div className="absolute inset-0 pattern-bogolan opacity-[0.05]" />
      {/* Large Adinkrahene filigrane */}
      <svg className="absolute -left-16 top-1/2 -translate-y-1/2 opacity-[0.06] pointer-events-none" width="400" height="400" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="100" cy="100" r="94" stroke="#F97316" strokeWidth="1.5"/>
        <circle cx="100" cy="100" r="70" stroke="#2563EB" strokeWidth="1"/>
        <circle cx="100" cy="100" r="46" stroke="#F97316" strokeWidth="1"/>
        <circle cx="100" cy="100" r="22" stroke="#2563EB" strokeWidth="1"/>
        <circle cx="100" cy="100" r="8" fill="#F97316"/>
      </svg>
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header + mission */}
        <div className="grid lg:grid-cols-2 gap-16 items-start mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.5 }}
          >
            <p className="section-label">Notre histoire</p>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white leading-tight mb-6">
              À <span className="text-accent">Propos</span>
              <br />de Waraba Digital
            </h2>
            <p className="text-[#94A3B8] text-lg leading-relaxed">
              Waraba Digital est une agence numérique sénégalaise fondée avec une
              conviction simple : l&apos;Afrique mérite des solutions digitales de classe
              mondiale, pensées pour ses réalités.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="border-l-2 border-accent pl-8 py-2"
          >
            <p className="text-white text-lg lg:text-xl font-medium leading-relaxed">
              &ldquo;Notre mission est d&apos;accompagner les entrepreneurs, institutions
              et entreprises africaines dans leur transformation numérique, en
              livrant des solutions innovantes, accessibles et durables.&rdquo;
            </p>
            <p className="text-[#94A3B8] text-sm mt-4 font-medium">
              — L&apos;équipe Waraba Digital, Dakar 🇸🇳
            </p>
          </motion.div>
        </div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.5 }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-0 border border-primary/12 rounded-2xl overflow-hidden mb-20"
        >
          {stats.map(({ value, suffix, label }, i) => (
            <div
              key={label}
              className="p-8 text-center border-r border-b border-white/7 last:border-r-0 [&:nth-child(2)]:lg:border-r [&:nth-child(2)]:sm:border-r-0 [&:nth-child(3)]:border-b-0 [&:nth-child(4)]:border-b-0 [&:nth-child(3)]:sm:border-b [&:nth-child(4)]:sm:border-b"
            >
              <p className="text-3xl lg:text-4xl font-extrabold text-primary mb-2">
                <Counter value={value} suffix={suffix} />
              </p>
              <p className="text-[#94A3B8] text-sm">{label}</p>
            </div>
          ))}
        </motion.div>

        {/* Values */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5 }}
          className="mb-20"
        >
          <p className="section-label mb-8">Nos valeurs</p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-0 border border-white/7 rounded-2xl overflow-hidden">
            {values.map(({ title, description }, i) => (
              <div
                key={title}
                className="group p-7 border-r border-b border-white/7 last:border-r-0 [&:nth-child(2)]:sm:border-r-0 [&:nth-child(2)]:lg:border-r [&:nth-child(3)]:border-b-0 [&:nth-child(4)]:border-b-0 [&:nth-child(3)]:sm:border-b [&:nth-child(4)]:sm:border-b hover:bg-[#111827] transition-colors duration-200"
              >
                <span className="text-primary font-black text-2xl font-mono block mb-5 opacity-40">
                  0{i + 1}
                </span>
                <h4 className="text-white font-bold text-base mb-2">{title}</h4>
                <p className="text-[#94A3B8] text-sm leading-relaxed">{description}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Team */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5 }}
          className="border border-white/7 rounded-2xl p-8 lg:p-10 flex flex-col lg:flex-row items-start lg:items-center gap-8 justify-between"
        >
          <div>
            <p className="section-label mb-3">L&apos;équipe</p>
            <h3 className="text-white font-extrabold text-xl mb-2">
              Une équipe pluridisciplinaire basée à Dakar
            </h3>
            <p className="text-[#94A3B8] text-sm leading-relaxed max-w-lg">
              Développeurs, designers, consultants en stratégie et experts marketing —
              nos 8 collaborateurs combinent expertise internationale et connaissance
              approfondie du marché africain.
            </p>
          </div>
          <button
            onClick={() => document.querySelector("#contact")?.scrollIntoView({ behavior: "smooth" })}
            className="shrink-0 px-7 py-3.5 rounded-lg bg-accent hover:bg-orange-400 text-white font-bold text-sm transition-colors"
          >
            Travailler avec nous →
          </button>
        </motion.div>
      </div>
    </section>
  );
}


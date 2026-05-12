"use client";

import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import Image from "next/image";

const projects = [
  {
    id: "jobstage-sante",
    category: "Plateforme Emploi & Santé",
    title: "Job Stage Santé",
    description:
      "Plateforme dédiée aux offres d'emploi et de stage dans le secteur de la santé au Sénégal. Mise en relation entre professionnels de santé et structures hospitalières, cliniques et ONG.",
    url: "https://www.jobstage-sante.com/",
    screenshot: "/screenshots/jobstage-sante.png",
    domain: "jobstage-sante.com",
  },
];

const sideProjects = [
  {
    id: "waraba-academy",
    title: "Waraba Academy",
    category: "E-Learning",
    description:
      "Plateforme de formation en ligne pensée pour l'Afrique de l'Ouest. Cours en vidéo, quiz interactifs et certificats numériques.",
    url: "https://waraba-academy.com",
    screenshot: "/screenshots/waraba-academy.png",
    domain: "waraba-academy.com",
  },
  {
    id: "wewaxtaan",
    title: "Wewaxtaan Coaching",
    category: "Coaching",
    description:
      "Application de coaching personnel et professionnel. Suivi des objectifs, séances en ligne et accompagnement personnalisé.",
    url: "https://nextapp-gules-one.vercel.app/",
    screenshot: "/screenshots/wewaxtaan.png",
    domain: "wewaxtaan.com",
  },
];

export default function Realisations() {
  return (
    <section id="realisations" className="relative py-24 lg:py-32 bg-[#0B1120] overflow-hidden">
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
          <p className="section-label">Notre portfolio</p>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white leading-tight mb-5">
            Des Projets qui{" "}
            <span className="text-accent">Parlent d&apos;Eux-Mêmes</span>
          </h2>
          <p className="text-[#94A3B8] text-lg leading-relaxed">
            Chaque projet est une collaboration étroite avec nos clients.
            Voici quelques-unes de nos réalisations les plus représentatives.
          </p>
        </motion.div>

        {/* Featured project */}
        {projects.map((p) => (
          <motion.div
            key={p.id}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.5 }}
            className="border border-white/7 rounded-2xl overflow-hidden mb-5"
          >
            <div className="grid lg:grid-cols-2">
              {/* Screenshot side */}
              <div className="bg-[#111827] p-8 flex items-center justify-center min-h-[320px] border-b lg:border-b-0 lg:border-r border-white/6">
                <div className="w-full max-w-[380px] rounded-xl overflow-hidden border border-white/10 shadow-2xl">
                  {/* Browser bar */}
                  <div className="flex items-center gap-1.5 px-4 py-3 border-b border-white/6 bg-[#0B1120]">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
                    <div className="w-2.5 h-2.5 rounded-full bg-yellow-400/60" />
                    <div className="w-2.5 h-2.5 rounded-full bg-green-400/60" />
                    <div className="ml-3 flex-1 h-5 rounded-md bg-white/5 flex items-center px-2">
                      <span className="text-[#4B5563] text-xs font-medium">{p.domain}</span>
                    </div>
                  </div>
                  {/* Screenshot */}
                  <div className="relative w-full aspect-[16/10] bg-[#0B1120]">
                    <Image
                      src={p.screenshot}
                      alt={`Capture d'écran ${p.title}`}
                      fill
                      className="object-cover object-top"
                    />
                  </div>
                </div>
              </div>

              {/* Info side */}
              <div className="p-8 lg:p-12 flex flex-col justify-center">
                <span className="section-label mb-4">{p.category}</span>
                <h3 className="text-2xl lg:text-3xl font-extrabold text-white mb-4">{p.title}</h3>
                <p className="text-[#94A3B8] text-sm leading-relaxed mb-8">{p.description}</p>

                {/* CTA */}
                <a
                  href={p.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-accent hover:bg-orange-400 text-white font-bold text-sm transition-colors self-start group"
                >
                  Visiter le projet
                  <ArrowUpRight size={14} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </a>
              </div>
            </div>
          </motion.div>
        ))}

        {/* Side projects */}
        <div className="grid sm:grid-cols-2 gap-5">
          {sideProjects.map((p, i) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              className="group border border-white/7 hover:border-white/14 transition-colors duration-200 rounded-2xl overflow-hidden card-hover"
            >
              {/* Screenshot thumbnail */}
              <div className="relative w-full aspect-[16/8] bg-[#111827] overflow-hidden">
                {/* Browser bar */}
                <div className="absolute top-0 left-0 right-0 z-10 flex items-center gap-1.5 px-3 py-2 bg-[#0B1120]/90 backdrop-blur-sm border-b border-white/6">
                  <div className="w-2 h-2 rounded-full bg-red-500/60" />
                  <div className="w-2 h-2 rounded-full bg-yellow-400/60" />
                  <div className="w-2 h-2 rounded-full bg-green-400/60" />
                  <div className="ml-2 flex-1 h-4 rounded bg-white/5 flex items-center px-2">
                    <span className="text-[#4B5563] text-[10px] font-medium">{p.domain}</span>
                  </div>
                </div>
                <Image
                  src={p.screenshot}
                  alt={`Capture d'écran ${p.title}`}
                  fill
                  className="object-cover object-top pt-8 group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0B1120]/80 via-transparent to-transparent" />
              </div>

              {/* Info */}
              <div className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <span className="section-label mb-0">{p.category}</span>
                  <a
                    href={p.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#94A3B8] hover:text-accent transition-colors"
                    aria-label={`Visiter ${p.title}`}
                  >
                    <ArrowUpRight size={16} />
                  </a>
                </div>

                <h3 className="text-white font-bold text-lg mb-2">{p.title}</h3>
                <p className="text-[#94A3B8] text-sm leading-relaxed">{p.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}


"use client";

import { motion } from "framer-motion";

const clients = [
  "Ministère de l'Éducation",
  "Orange Sénégal",
  "Wave Africa",
  "ONFP",
  "InTouch Group",
  "DER / FJ",
  "GAINDE 2000",
  "StartupSénégal",
  "Expresso Telecom",
  "BCEAO",
];

export default function Clients() {
  return (
    <section id="clients" className="py-14 border-y border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="text-center text-[11px] font-bold text-[#4B5563] uppercase tracking-[0.2em]"
        >
          Ils nous font confiance
        </motion.p>
      </div>

      {/* Marquee */}
      <div className="relative overflow-hidden">
        <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-[#0B1120] to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-[#0B1120] to-transparent z-10 pointer-events-none" />

        <div className="flex animate-marquee">
          {[...clients, ...clients].map((name, i) => (
            <div
              key={i}
              className="mx-6 shrink-0 flex items-center gap-3"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-primary/50 shrink-0" />
              <span className="text-[#4B5563] hover:text-[#94A3B8] font-semibold text-sm whitespace-nowrap transition-colors cursor-default">
                {name}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, CheckCircle, Loader2 } from "lucide-react";

const contactItems = [
  { label: "Email", value: "contact@waraba-digital.com", href: "mailto:contact@waraba-digital.com" },
  { label: "Téléphone", value: "+221 77 000 00 00", href: "tel:+221770000000" },
  { label: "Localisation", value: "Dakar, Sénégal", href: "https://maps.google.com/?q=Dakar,Senegal" },
  { label: "Disponibilité", value: "Lun – Ven, 8h – 18h GMT", href: null },
];

const projectTypes = [
  "Site web / Application web",
  "Application mobile",
  "Design UX/UI",
  "E-Learning / LMS",
  "Marketing digital",
  "Consulting & Stratégie",
  "Autre",
];

type FormData = { name: string; email: string; phone: string; projectType: string; message: string };
const emptyForm: FormData = { name: "", email: "", phone: "", projectType: "", message: "" };

export default function Contact() {
  const [form, setForm] = useState<FormData>(emptyForm);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1600));
    setSubmitted(true);
    setLoading(false);
  };

  return (
    <section id="contact" className="py-24 lg:py-32 bg-[#0B1120]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5 }}
          className="max-w-2xl mb-20"
        >
          <p className="section-label">Parlons de votre projet</p>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white leading-tight mb-5">
            Contactez-<span className="text-accent">nous</span>
          </h2>
          <p className="text-[#94A3B8] text-lg leading-relaxed">
            Prêt à démarrer votre transformation digitale ? Notre équipe est
            disponible pour étudier votre projet et vous proposer la solution idéale.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-[340px_1fr] gap-12 items-start">

          {/* ─── Left — Info ──────────────────────── */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.5 }}
          >
            <p className="text-[11px] font-bold text-[#4B5563] uppercase tracking-widest mb-6">
              Coordonnées
            </p>

            <div className="space-y-0 border border-white/7 rounded-xl overflow-hidden mb-8">
              {contactItems.map(({ label, value, href }) => {
                const inner = (
                  <div className="flex items-start justify-between gap-4 p-5 border-b border-white/6 last:border-b-0 hover:bg-[#111827] transition-colors">
                    <div>
                      <p className="text-[11px] text-[#4B5563] font-semibold uppercase tracking-wide mb-1">{label}</p>
                      <p className="text-white text-sm font-medium">{value}</p>
                    </div>
                    {href && (
                      <ArrowRight size={14} className="text-[#4B5563] mt-1 shrink-0" />
                    )}
                  </div>
                );
                return href ? (
                  <a key={label} href={href} target={href.startsWith("http") ? "_blank" : undefined} rel="noopener noreferrer">
                    {inner}
                  </a>
                ) : (
                  <div key={label}>{inner}</div>
                );
              })}
            </div>

            {/* Availability */}
            <div className="flex items-center gap-3 p-4 border border-primary/15 bg-primary/[0.03] rounded-xl">
              <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
              <p className="text-[#94A3B8] text-sm font-medium">
                Disponible · Réponse sous 24h
              </p>
            </div>

            {/* Social */}
            <div className="mt-8">
              <p className="text-[11px] font-bold text-[#4B5563] uppercase tracking-widest mb-4">
                Suivez-nous
              </p>
              <div className="flex items-center gap-3">
                {["LinkedIn", "Instagram", "Twitter", "YouTube"].map((name) => (
                  <a
                    key={name}
                    href="#"
                    className="px-3 py-2 text-xs font-semibold border border-white/8 text-[#94A3B8] hover:text-white hover:border-white/20 rounded-lg transition-colors"
                  >
                    {name}
                  </a>
                ))}
              </div>
            </div>
          </motion.div>

          {/* ─── Right — Form ─────────────────────── */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.5 }}
          >
            {!submitted ? (
              <form
                onSubmit={handleSubmit}
                className="border border-white/7 rounded-2xl p-8 lg:p-10 bg-[#111827]"
              >
                <h3 className="text-white font-extrabold text-xl mb-1">Demandez un devis gratuit</h3>
                <p className="text-[#94A3B8] text-sm mb-8">Décrivez votre projet — nous revenons sous 24h.</p>

                <div className="grid sm:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-[#94A3B8] text-xs font-semibold uppercase tracking-wide mb-2">
                      Nom complet <span className="text-accent">*</span>
                    </label>
                    <input type="text" name="name" required value={form.name} onChange={handleChange}
                      className="form-input" placeholder="Votre nom" />
                  </div>
                  <div>
                    <label className="block text-[#94A3B8] text-xs font-semibold uppercase tracking-wide mb-2">
                      Email <span className="text-accent">*</span>
                    </label>
                    <input type="email" name="email" required value={form.email} onChange={handleChange}
                      className="form-input" placeholder="email@exemple.com" />
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-[#94A3B8] text-xs font-semibold uppercase tracking-wide mb-2">
                      Téléphone
                    </label>
                    <input type="tel" name="phone" value={form.phone} onChange={handleChange}
                      className="form-input" placeholder="+221 77 000 00 00" />
                  </div>
                  <div>
                    <label className="block text-[#94A3B8] text-xs font-semibold uppercase tracking-wide mb-2">
                      Type de projet
                    </label>
                    <select name="projectType" value={form.projectType} onChange={handleChange}
                      className="form-input">
                      <option value="" disabled>Sélectionner…</option>
                      {projectTypes.map((t) => <option key={t} value={t} className="bg-[#111827]">{t}</option>)}
                    </select>
                  </div>
                </div>

                <div className="mb-7">
                  <label className="block text-[#94A3B8] text-xs font-semibold uppercase tracking-wide mb-2">
                    Message <span className="text-accent">*</span>
                  </label>
                  <textarea name="message" required rows={5} value={form.message} onChange={handleChange}
                    className="form-input resize-none"
                    placeholder="Décrivez votre projet, vos besoins et vos objectifs…" />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center justify-center gap-2 w-full px-6 py-4 rounded-lg bg-accent hover:bg-orange-400 disabled:opacity-60 text-white font-bold text-sm transition-colors group"
                >
                  {loading ? (
                    <><Loader2 size={16} className="animate-spin" /> Envoi en cours…</>
                  ) : (
                    <><ArrowRight size={16} /> Envoyer le message</>
                  )}
                </button>

                <p className="text-center text-[#4B5563] text-xs mt-4">
                  Réponse garantie sous 24h · Devis 100% gratuit · Aucun engagement
                </p>
              </form>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                className="border border-white/7 rounded-2xl p-10 lg:p-14 flex flex-col items-center text-center bg-[#111827]"
              >
                <CheckCircle size={40} className="text-emerald-400 mb-6" />
                <h3 className="text-white font-extrabold text-2xl mb-3">Message envoyé !</h3>
                <p className="text-[#94A3B8] text-sm leading-relaxed mb-8 max-w-sm">
                  Merci. Notre équipe va analyser votre projet et vous recontacter
                  sous <span className="text-white font-semibold">24h ouvrées</span>.
                </p>
                <button
                  onClick={() => { setSubmitted(false); setForm(emptyForm); }}
                  className="px-7 py-3 rounded-lg border border-white/10 text-[#94A3B8] hover:text-white hover:border-white/20 text-sm font-semibold transition-colors"
                >
                  Envoyer un autre message
                </button>
              </motion.div>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  );
}

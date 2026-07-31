'use client';

import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faLocationDot,
  faPhone,
  faEnvelope,
  faClock,
  faPaperPlane,
  faPlus,
  faCheck,
} from '@fortawesome/free-solid-svg-icons';
import {
  faWhatsapp,
  faInstagram,
  faFacebookF,
  faTiktok,
  faYoutube,
} from '@fortawesome/free-brands-svg-icons';
import Container from '@/components/Container';
import SectionHeading from '@/components/SectionHeading';
import Reveal from '@/components/Reveal';
import { whatsappUrl, WHATSAPP_DISPLAY } from '@/lib/whatsapp';

const faqs = [
  {
    q: 'Proposez-vous des commandes groupées pour les clubs ?',
    a: "Oui. Tarifs préférentiels à partir de 10 maillots. Écris-nous par email ou WhatsApp avec ton logo et tes couleurs : tu as un devis sous 48 heures.",
  },
  {
    q: 'Quels sont les délais de livraison ?',
    a: "Livraison gratuite à Dakar sous 24 à 48 heures. Pour les autres régions du Sénégal, comptez 3 à 5 jours ouvrables. Les commandes personnalisées (flocage, broderie) nécessitent 7 à 10 jours supplémentaires.",
  },
  {
    q: 'Puis-je faire floquer un maillot au nom de mon joueur ?',
    a: "Oui, flocage et broderie sur tous nos maillots. Indique le nom, le numéro et la police au moment de la commande. Compte 2 000 FCFA de plus par maillot.",
  },
  {
    q: 'Comment devenir partenaire de DAKOOL pour mon club ?',
    a: "Écris à partenariats@dakool.sn, ou passe par le formulaire ci-dessus en choisissant le sujet « Partenariat club ». On répond sous 5 jours ouvrables.",
  },
  {
    q: 'Quels sont les modes de paiement acceptés ?',
    a: "Wave, Orange Money, Free Money, virement bancaire et espèces à la livraison dans la région de Dakar. Le paiement par carte bancaire sera disponible prochainement.",
  },
  {
    q: 'Proposez-vous une garantie ou une politique de retour ?',
    a: "Tous nos produits bénéficient d'une garantie de 30 jours contre les défauts de fabrication. Les articles non portés peuvent être retournés sous 14 jours. Les articles personnalisés ne sont pas repris.",
  },
];

const socials = [
  {
    icon: faInstagram,
    label: 'Instagram',
    handle: '@dakool.sn',
    href: 'https://instagram.com/dakool.sn',
  },
  {
    icon: faFacebookF,
    label: 'Facebook',
    handle: 'DAKOOL Sénégal',
    href: 'https://facebook.com/dakool.sn',
  },
  {
    icon: faTiktok,
    label: 'TikTok',
    handle: '@dakool.official',
    href: 'https://tiktok.com/@dakool.official',
  },
  {
    icon: faYoutube,
    label: 'YouTube',
    handle: 'DAKOOL TV',
    href: 'https://youtube.com/@dakool',
  },
];

const coordinates = [
  {
    icon: faLocationDot,
    title: 'Adresse',
    lines: ['Zone Industrielle de Dakar', 'Route de Rufisque, Dakar 11000', 'Sénégal'],
  },
  { icon: faPhone, title: 'Téléphone', lines: ['+221 76 123 45 67', '+221 33 800 12 34 (fixe)'] },
  { icon: faEnvelope, title: 'Email', lines: ['contact@dakool.sn', 'partenariats@dakool.sn'] },
  {
    icon: faClock,
    title: "Horaires d'ouverture",
    lines: ['Lun–Ven : 8h00 – 18h00', 'Samedi : 9h00 – 16h00', 'Dimanche : fermé'],
  },
];

const subjects = [
  'Commande & livraison',
  'Commande groupée (club / équipe)',
  'Partenariat club',
  'Sponsoring tournoi',
  'Produit personnalisé',
  'Service après-vente',
  'Presse & médias',
  'Autre',
];

const inputClass =
  'w-full border border-line bg-elevated px-4 py-3.5 text-sm text-white placeholder-mute-dim transition-colors focus:border-white focus:outline-none';
const labelClass = 'mb-1.5 block text-[10px] font-black uppercase tracking-label text-mute-dim';

export default function ContactClient() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    /* Pas encore de backend : on confirme localement l'envoi. */
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 1200);
  };

  return (
    <>
      <section className="bg-ink py-16 sm:py-20">
        <Container>
          <div className="grid gap-14 lg:grid-cols-2 lg:gap-16">
            {/* Formulaire */}
            <div>
              <span className="mb-5 flex items-center gap-3 text-[11px] font-bold uppercase tracking-brand text-white">
                <span className="h-2 w-2 shrink-0 rounded-full bg-white" />
                Formulaire de contact
              </span>
              <h2 className="mb-2 font-display text-title text-white">
                Écris-nous un <span className="text-accent">message</span>
              </h2>
              <p className="mb-8 text-sm text-mute">
                On répond en général dans les 24 heures.
              </p>

              {submitted ? (
                <div className="border border-white/20 bg-white/5 p-10 text-center">
                  <span className="mx-auto mb-5 flex h-12 w-12 items-center justify-center bg-white">
                    <FontAwesomeIcon icon={faCheck} className="h-5 w-5 text-black" />
                  </span>
                  <h3 className="mb-2 font-display text-3xl text-white">Message envoyé</h3>
                  <p className="text-sm text-mute">On te répond dans les 24 heures.</p>
                  <button
                    type="button"
                    onClick={() => setSubmitted(false)}
                    className="mt-5 border-b border-white/30 pb-0.5 text-sm text-accent transition-colors hover:border-white"
                  >
                    Envoyer un autre message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-3">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <label htmlFor="prenom" className={labelClass}>
                        Prénom *
                      </label>
                      <input
                        id="prenom"
                        name="prenom"
                        required
                        autoComplete="given-name"
                        placeholder="Moussa"
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label htmlFor="nom" className={labelClass}>
                        Nom *
                      </label>
                      <input
                        id="nom"
                        name="nom"
                        required
                        autoComplete="family-name"
                        placeholder="Diallo"
                        className={inputClass}
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="email" className={labelClass}>
                      Email *
                    </label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      required
                      autoComplete="email"
                      placeholder="moussa@example.sn"
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <label htmlFor="telephone" className={labelClass}>
                      Téléphone / WhatsApp
                    </label>
                    <input
                      id="telephone"
                      name="telephone"
                      type="tel"
                      autoComplete="tel"
                      placeholder="+221 76 000 00 00"
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <label htmlFor="sujet" className={labelClass}>
                      Sujet *
                    </label>
                    <select
                      id="sujet"
                      name="sujet"
                      required
                      defaultValue=""
                      className={`${inputClass} pr-10`}
                    >
                      <option value="" disabled>
                        Choisissez un sujet
                      </option>
                      {subjects.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="message" className={labelClass}>
                      Message *
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      required
                      rows={5}
                      placeholder="Dis-nous ce dont tu as besoin…"
                      className={`${inputClass} resize-none`}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="flex w-full items-center justify-center gap-2.5 bg-white py-4 text-sm font-black uppercase tracking-cta text-black transition-colors hover:bg-accent disabled:pointer-events-none disabled:opacity-50"
                  >
                    <FontAwesomeIcon icon={faPaperPlane} className="h-3.5 w-3.5" />
                    {loading ? 'Envoi en cours…' : 'Envoyer le message'}
                  </button>
                </form>
              )}
            </div>

            {/* Coordonnées */}
            <div>
              <span className="mb-5 flex items-center gap-3 text-[11px] font-bold uppercase tracking-brand text-white">
                <span className="h-2 w-2 shrink-0 rounded-full bg-white" />
                Nos coordonnées
              </span>
              <h2 className="mb-8 font-display text-title text-white">
                Où nous <span className="text-accent">trouver</span>
              </h2>

              <div className="mb-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
                {coordinates.map((item) => (
                  <div
                    key={item.title}
                    className="flex items-start gap-4 border border-line p-5 transition-colors hover:border-line-strong"
                  >
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center border border-white/20">
                      <FontAwesomeIcon icon={item.icon} className="h-3.5 w-3.5 text-accent" />
                    </span>
                    <div>
                      <h3 className="mb-1 text-xs font-black uppercase tracking-cta text-white">
                        {item.title}
                      </h3>
                      {item.lines.map((line) => (
                        <p key={line} className="text-sm text-mute">
                          {line}
                        </p>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <a
                href={whatsappUrl('Bonjour DAKOOL, j’ai une question.')}
                target="_blank"
                rel="noopener noreferrer"
                className="mb-8 flex items-start gap-4 border border-line p-5 transition-colors hover:border-line-strong"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center border border-line-strong">
                  <FontAwesomeIcon icon={faWhatsapp} className="h-3.5 w-3.5 text-white" />
                </span>
                <div>
                  <h3 className="mb-1 text-xs font-black uppercase tracking-cta text-white">
                    WhatsApp Business
                  </h3>
                  <p className="text-sm text-accent">{WHATSAPP_DISPLAY}</p>
                  <p className="text-xs text-mute-dim">Réponse rapide · 7j/7 · 8h–20h</p>
                </div>
              </a>

              <h3 className="mb-4 font-display text-xl text-white">Suivez-nous</h3>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {socials.map((s) => (
                  <a
                    key={s.label}
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 border border-line p-3.5 transition-colors hover:border-line-strong"
                  >
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center border border-line-strong text-white">
                      <FontAwesomeIcon icon={s.icon} className="h-3.5 w-3.5" />
                    </span>
                    <span>
                      <span className="block text-xs font-bold text-white">{s.label}</span>
                      <span className="block text-xs text-mute-dim">{s.handle}</span>
                    </span>
                  </a>
                ))}
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* FAQ */}
      <section className="border-t border-line bg-surface py-16 sm:py-20">
        <Container size="narrow">
          <SectionHeading eyebrow="FAQ" title="Questions" highlight="fréquentes" />

          <div className="flex flex-col divide-y divide-line border-y border-line">
            {faqs.map((faq, i) => {
              const open = openFaq === i;
              return (
                <Reveal key={faq.q} delay={i * 50}>
                  <h3>
                    <button
                      type="button"
                      onClick={() => setOpenFaq(open ? null : i)}
                      aria-expanded={open}
                      aria-controls={`faq-${i}`}
                      className="group flex w-full items-center justify-between gap-4 py-5 text-left"
                    >
                      <span
                        className={`text-sm font-medium transition-colors ${open ? 'text-accent' : 'text-white group-hover:text-white'}`}
                      >
                        {faq.q}
                      </span>
                      <FontAwesomeIcon
                        icon={faPlus}
                        className={`h-3.5 w-3.5 shrink-0 text-accent transition-transform duration-300 ${open ? 'rotate-45' : ''}`}
                      />
                    </button>
                  </h3>
                  {/* grid-rows 0fr→1fr : ouverture fluide sans hauteur fixe qui tronque. */}
                  <div
                    id={`faq-${i}`}
                    className={`grid transition-[grid-template-rows] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                      open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
                    }`}
                  >
                    <div className="overflow-hidden">
                      <p className="pb-5 text-sm leading-relaxed text-mute">{faq.a}</p>
                    </div>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </Container>
      </section>
    </>
  );
}

'use client';

import { useState } from 'react';
import PageHero from '@/components/PageHero';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLocationDot, faPhone, faEnvelope, faClock, faPaperPlane, faPlus } from '@fortawesome/free-solid-svg-icons';
import { faWhatsapp, faInstagram, faFacebookF, faTiktok, faYoutube } from '@fortawesome/free-brands-svg-icons';

const faqs = [
  { q: 'Proposez-vous des commandes groupées pour les clubs ?', a: 'Oui ! DAKOOL propose des tarifs préférentiels pour les commandes groupées à partir de 10 maillots. Contactez-nous par email ou WhatsApp avec votre logo et vos couleurs pour un devis personnalisé sous 48h.' },
  { q: 'Quels sont les délais de livraison ?', a: 'Livraison gratuite à Dakar sous 24–48h. Pour les autres régions du Sénégal, comptez 3–5 jours ouvrables. Les commandes personnalisées (flocage, broderie) nécessitent 7–10 jours supplémentaires.' },
  { q: 'Puis-je personnaliser un maillot avec le nom et le numéro de mon joueur ?', a: 'Oui ! Nous proposons le flocage (impression) et la broderie sur tous nos maillots. Envoyez-nous le nom, le numéro et la police souhaitée lors de votre commande. Frais supplémentaires de 2 000 FCFA par maillot.' },
  { q: 'Comment devenir partenaire de DAKOOL pour mon club ?', a: 'Contactez notre département partenariats à partenariats@dakool.sn ou via le formulaire ci-dessus (sujet : "Partenariat Club"). Nous répondons sous 5 jours ouvrables.' },
  { q: 'Quels sont les modes de paiement acceptés ?', a: 'Nous acceptons Wave, Orange Money, Free Money, virement bancaire et espèces pour les achats en boutique. Le paiement en ligne par carte bancaire sera disponible prochainement.' },
  { q: 'Proposez-vous une garantie ou politique de retour ?', a: 'Tous nos produits bénéficient d\'une garantie de 30 jours pour les défauts de fabrication. Les articles non portés peuvent être retournés sous 14 jours. Les articles personnalisés ne sont pas remboursables.' },
];

const socials = [
  { icon: faInstagram, label: 'Instagram', handle: '@dakool.sn', bg: 'linear-gradient(135deg,#833ab4,#fd1d1d,#fcb045)' },
  { icon: faFacebookF, label: 'Facebook', handle: 'DAKOOL Sénégal', bg: '#1877F2' },
  { icon: faTiktok, label: 'TikTok', handle: '@dakool.official', bg: '#000' },
  { icon: faYoutube, label: 'YouTube', handle: 'DAKOOL TV', bg: '#FF0000' },
];

export default function ContactPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => { setLoading(false); setSubmitted(true); }, 1500);
  };

  return (
    <>
      <PageHero tag="Nous Parler" title="" highlight="Contact" subtitle="Une question, une commande groupée, un partenariat ? Nous sommes à votre écoute." />

      <section className="py-20 bg-[#0a0a0a]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">

            {/* Form */}
            <div>
              <span className="inline-block bg-[#00853F]/10 border border-[#00853F]/30 text-[#00853F] text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-full font-sans mb-6">Formulaire de Contact</span>
              <h2 className="text-3xl sm:text-5xl font-black text-white mb-2" style={{ fontFamily: "'Bebas Neue', cursive" }}>
                Envoyez-nous un <span className="bg-gradient-to-r from-[#00853F] to-[#FDEF42] bg-clip-text text-transparent">Message</span>
              </h2>
              <p className="text-gray-400 font-sans text-sm mb-8">Nous répondons en général dans les 24 heures.</p>

              {submitted ? (
                <div className="bg-[#00853F]/10 border border-[#00853F]/30 rounded-2xl p-8 text-center">
                  <div className="text-5xl mb-4">✅</div>
                  <h3 className="text-white font-black text-2xl mb-2" style={{ fontFamily: "'Bebas Neue', cursive" }}>Message envoyé !</h3>
                  <p className="text-gray-400 font-sans text-sm">Nous vous répondrons dans les 24h.</p>
                  <button onClick={() => setSubmitted(false)} className="mt-4 text-[#00853F] font-sans text-sm underline">Envoyer un autre message</button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-gray-400 font-sans text-xs font-semibold uppercase tracking-wider mb-1">Prénom *</label>
                      <input type="text" required placeholder="Moussa" className="w-full bg-[#111] border border-white/10 rounded-xl px-4 py-3 text-white font-sans text-sm placeholder-gray-600 focus:border-[#00853F] focus:outline-none transition-colors" />
                    </div>
                    <div>
                      <label className="block text-gray-400 font-sans text-xs font-semibold uppercase tracking-wider mb-1">Nom *</label>
                      <input type="text" required placeholder="Diallo" className="w-full bg-[#111] border border-white/10 rounded-xl px-4 py-3 text-white font-sans text-sm placeholder-gray-600 focus:border-[#00853F] focus:outline-none transition-colors" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-gray-400 font-sans text-xs font-semibold uppercase tracking-wider mb-1">Email *</label>
                    <input type="email" required placeholder="moussa@example.sn" className="w-full bg-[#111] border border-white/10 rounded-xl px-4 py-3 text-white font-sans text-sm placeholder-gray-600 focus:border-[#00853F] focus:outline-none transition-colors" />
                  </div>
                  <div>
                    <label className="block text-gray-400 font-sans text-xs font-semibold uppercase tracking-wider mb-1">Téléphone / WhatsApp</label>
                    <input type="tel" placeholder="+221 76 000 00 00" className="w-full bg-[#111] border border-white/10 rounded-xl px-4 py-3 text-white font-sans text-sm placeholder-gray-600 focus:border-[#00853F] focus:outline-none transition-colors" />
                  </div>
                  <div>
                    <label className="block text-gray-400 font-sans text-xs font-semibold uppercase tracking-wider mb-1">Sujet *</label>
                    <select required className="w-full bg-[#111] border border-white/10 rounded-xl px-4 py-3 text-white font-sans text-sm focus:border-[#00853F] focus:outline-none transition-colors">
                      <option value="" disabled>Choisissez un sujet</option>
                      {['Commande & Livraison', 'Commande Groupée (club / équipe)', 'Partenariat Club', 'Sponsoring Tournoi', 'Produit personnalisé', 'Service après-vente', 'Presse & Médias', 'Autre'].map(s => <option key={s}>{s}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-gray-400 font-sans text-xs font-semibold uppercase tracking-wider mb-1">Message *</label>
                    <textarea required rows={5} placeholder="Décrivez votre demande..." className="w-full bg-[#111] border border-white/10 rounded-xl px-4 py-3 text-white font-sans text-sm placeholder-gray-600 focus:border-[#00853F] focus:outline-none transition-colors resize-none" />
                  </div>
                  <button type="submit" disabled={loading} className="w-full bg-[#00853F] hover:bg-[#006830] disabled:opacity-60 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all font-sans">
                    <FontAwesomeIcon icon={faPaperPlane} className="w-4 h-4" />
                    {loading ? 'Envoi en cours...' : 'Envoyer le message'}
                  </button>
                </form>
              )}
            </div>

            {/* Info */}
            <div>
              <span className="inline-block bg-[#00853F]/10 border border-[#00853F]/30 text-[#00853F] text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-full font-sans mb-6">Nos Coordonnées</span>
              <h2 className="text-3xl sm:text-5xl font-black text-white mb-8" style={{ fontFamily: "'Bebas Neue', cursive" }}>
                Trouvez-nous <span className="bg-gradient-to-r from-[#00853F] to-[#FDEF42] bg-clip-text text-transparent">Facilement</span>
              </h2>

              {[
                { icon: faLocationDot, title: 'Adresse', text: 'Zone Industrielle de Dakar\nRoute de Rufisque, Dakar 11000\nSénégal' },
                { icon: faPhone, title: 'Téléphone', text: '+221 76 123 45 67\n+221 33 800 12 34 (Fixe)' },
                { icon: faEnvelope, title: 'Email', text: 'contact@dakool.sn\npartenariats@dakool.sn' },
                { icon: faClock, title: "Horaires d'ouverture", text: 'Lun–Ven : 8h00 – 18h00\nSamedi : 9h00 – 16h00\nDimanche : Fermé' },
              ].map(item => (
                <div key={item.title} className="flex items-start gap-4 mb-5 bg-[#111] border border-white/10 rounded-xl p-4 hover:border-[#00853F]/20 transition-all">
                  <div className="w-10 h-10 rounded-lg bg-[#00853F]/10 border border-[#00853F]/20 flex items-center justify-center shrink-0">
                    <FontAwesomeIcon icon={item.icon} className="w-4 h-4 text-[#00853F]" />
                  </div>
                  <div>
                    <h4 className="text-white font-semibold font-sans text-sm mb-1">{item.title}</h4>
                    {item.text.split('\n').map(line => <p key={line} className="text-gray-400 font-sans text-sm">{line}</p>)}
                  </div>
                </div>
              ))}

              {/* WhatsApp */}
              <div className="flex items-start gap-4 mb-5 bg-[#111] border border-white/10 rounded-xl p-4 hover:border-[#25D366]/20 transition-all">
                <div className="w-10 h-10 rounded-lg bg-[#25D366]/10 border border-[#25D366]/20 flex items-center justify-center shrink-0">
                  <FontAwesomeIcon icon={faWhatsapp} className="w-4 h-4 text-[#25D366]" />
                </div>
                <div>
                  <h4 className="text-white font-semibold font-sans text-sm mb-1">WhatsApp Business</h4>
                  <p className="text-[#00853F] font-sans text-sm font-medium">+221 76 123 45 67</p>
                  <p className="text-gray-500 font-sans text-xs">Réponse rapide · 7j/7 · 8h–20h</p>
                </div>
              </div>

              {/* Socials */}
              <h4 className="text-white font-black tracking-widest mb-3 mt-6 text-lg" style={{ fontFamily: "'Bebas Neue', cursive" }}>Suivez-nous</h4>
              <div className="grid grid-cols-2 gap-3">
                {socials.map(s => (
                  <a key={s.label} href="#" className="flex items-center gap-3 bg-[#111] border border-white/10 rounded-xl p-3 hover:border-[#00853F]/30 transition-all">
                    <div className="w-9 h-9 rounded-lg flex items-center justify-center text-white shrink-0" style={{ background: s.bg }}>
                      <FontAwesomeIcon icon={s.icon} className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-white font-sans text-sm font-semibold">{s.label}</p>
                      <p className="text-gray-500 font-sans text-xs">{s.handle}</p>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 bg-[#0d0d0d] border-t border-white/10">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <span className="inline-block bg-[#00853F]/10 border border-[#00853F]/30 text-[#00853F] text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-full font-sans mb-4">FAQ</span>
            <h2 className="text-4xl sm:text-6xl font-black text-white" style={{ fontFamily: "'Bebas Neue', cursive" }}>
              Questions <span className="bg-gradient-to-r from-[#00853F] to-[#FDEF42] bg-clip-text text-transparent">Fréquentes</span>
            </h2>
            <div className="w-16 h-1 bg-gradient-to-r from-[#00853F] to-[#FDEF42] mx-auto mt-4 rounded-full" />
          </div>
          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <div key={i} className="bg-[#111] border border-white/10 rounded-xl overflow-hidden hover:border-[#00853F]/20 transition-all">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between px-6 py-5 text-left"
                >
                  <span className="text-white font-sans text-sm font-medium pr-4">{faq.q}</span>
                  <FontAwesomeIcon
                    icon={faPlus}
                    className={`w-4 h-4 text-[#00853F] shrink-0 transition-transform duration-300 ${openFaq === i ? 'rotate-45' : ''}`}
                  />
                </button>
                <div className={`overflow-hidden transition-all duration-300 ${openFaq === i ? 'max-h-48' : 'max-h-0'}`}>
                  <p className="px-6 pb-5 text-gray-400 font-sans text-sm leading-relaxed">{faq.a}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

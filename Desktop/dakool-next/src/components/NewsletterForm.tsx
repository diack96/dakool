'use client';

import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowRight, faCheck } from '@fortawesome/free-solid-svg-icons';

export default function NewsletterForm() {
  const [email, setEmail] = useState('');
  const [done, setDone] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    /* Pas encore de backend : on confirme localement l'inscription. */
    setDone(true);
    setEmail('');
  };

  if (done) {
    return (
      <p className="flex items-center gap-3 border border-white/20 bg-white/5 px-5 py-4 text-sm text-white">
        <FontAwesomeIcon icon={faCheck} className="h-4 w-4 shrink-0 text-accent" />
        Merci — vous êtes inscrit. Les prochaines sorties arrivent dans votre boîte mail.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex w-full max-w-md">
      <label htmlFor="newsletter-email" className="sr-only">
        Votre adresse email
      </label>
      <input
        id="newsletter-email"
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="votre@email.sn"
        className="min-w-0 flex-1 border border-line bg-ink px-4 py-3.5 text-sm text-white placeholder-mute-dim transition-colors focus:border-white focus:outline-none"
      />
      <button
        type="submit"
        aria-label="S'inscrire à la newsletter"
        className="flex shrink-0 items-center gap-2 bg-white px-5 py-3.5 text-xs font-black uppercase tracking-cta text-black transition-colors hover:bg-accent"
      >
        <span className="hidden sm:inline">S&apos;inscrire</span>
        <FontAwesomeIcon icon={faArrowRight} className="h-3.5 w-3.5" />
      </button>
    </form>
  );
}

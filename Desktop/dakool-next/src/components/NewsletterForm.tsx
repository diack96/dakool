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
      <p className="flex items-center gap-3 border border-fg/20 bg-inverse/5 px-5 py-4 text-sm text-fg">
        <FontAwesomeIcon icon={faCheck} className="h-4 w-4 shrink-0 text-accent" />
        Bienvenue au Club DAKOOL. Les prochaines sorties arrivent dans ta boîte mail.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex w-full max-w-md">
      <label htmlFor="newsletter-email" className="sr-only">
        Ton adresse email
      </label>
      <input
        id="newsletter-email"
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="ton@email.sn"
        className="min-w-0 flex-1 border border-line bg-bg px-4 py-3.5 text-sm text-fg placeholder-mute-dim transition-colors focus:border-fg focus:outline-none"
      />
      <button
        type="submit"
        aria-label="Rejoindre le Club DAKOOL"
        className="flex shrink-0 items-center gap-2 bg-inverse px-5 py-3.5 text-xs font-black uppercase tracking-cta text-on-inverse transition-colors hover:bg-accent"
      >
        <span className="hidden sm:inline">Rejoindre</span>
        <FontAwesomeIcon icon={faArrowRight} className="h-3.5 w-3.5" />
      </button>
    </form>
  );
}

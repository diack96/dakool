'use client';

import { useEffect, useRef, useState } from 'react';

type Props = {
  children: React.ReactNode;
  /** Décalage en ms — sert à cascader une grille d'éléments. */
  delay?: number;
  className?: string;
};

/**
 * Révèle son contenu quand il entre dans le viewport.
 * Sans JS, le <noscript> du layout force l'affichage.
 */
export default function Reveal({ children, delay = 0, className = '' }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    /* Pas de cas particulier pour `prefers-reduced-motion` : la feuille de
       style globale ramène déjà la durée d'animation à zéro, le contenu
       apparaît donc sans mouvement. */
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShown(true);
          observer.disconnect();
        }
      },
      { rootMargin: '0px 0px -10% 0px', threshold: 0.05 },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      data-reveal
      className={`${shown ? 'animate-rise' : 'opacity-0'} ${className}`}
      style={shown && delay ? { animationDelay: `${delay}ms` } : undefined}
    >
      {children}
    </div>
  );
}

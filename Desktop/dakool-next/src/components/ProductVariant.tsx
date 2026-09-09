'use client';

import { createContext, useCallback, useContext, useMemo, useState, ReactNode } from 'react';
import { hasColorViews, viewsFor, type Product } from '@/data/products';

type VariantContext = {
  /** Nom du coloris retenu pour la commande. */
  color: string;
  selectColor: (name: string) => void;
  /** Vues du coloris courant, dans l'ordre de la galerie. */
  views: string[];
  /** Index de la vue affichée, à l'intérieur de `views`. */
  view: number;
  selectView: (index: number) => void;
  /** Vrai quand chaque coloris porte ses propres photos. */
  linked: boolean;
};

const Context = createContext<VariantContext | null>(null);

/**
 * État partagé entre la galerie et le panneau d'achat.
 *
 * Quand chaque coloris porte ses propres vues, la galerie ne montre que
 * celles du coloris choisi : sans cela on pouvait regarder une photo et
 * commander un autre coloris.
 */
export function ProductVariantProvider({
  product,
  children,
}: {
  product: Product;
  children: ReactNode;
}) {
  const linked = hasColorViews(product);

  const [color, setColor] = useState(product.colors[0]?.name ?? '');
  const [view, setView] = useState(0);

  const selectColor = useCallback((name: string) => {
    setColor(name);
    /* Le nouveau coloris a ses propres vues : on repart de la première. */
    setView(0);
  }, []);

  const views = useMemo(() => viewsFor(product, color), [product, color]);

  const value = useMemo<VariantContext>(
    () => ({
      color,
      selectColor,
      views,
      view: Math.min(view, Math.max(views.length - 1, 0)),
      selectView: setView,
      linked,
    }),
    [color, selectColor, views, view, linked],
  );

  return <Context.Provider value={value}>{children}</Context.Provider>;
}

export function useProductVariant() {
  const ctx = useContext(Context);
  if (!ctx) throw new Error('useProductVariant doit être utilisé dans ProductVariantProvider');
  return ctx;
}

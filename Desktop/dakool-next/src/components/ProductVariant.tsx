'use client';

import { createContext, useCallback, useContext, useMemo, useState, ReactNode } from 'react';
import type { Product } from '@/data/products';

type VariantContext = {
  /** Index de la vue affichée dans la galerie. */
  view: number;
  selectView: (index: number) => void;
  /** Nom du coloris retenu pour la commande. */
  color: string;
  selectColor: (name: string) => void;
  /** Vrai quand chaque vue correspond à un coloris. */
  linked: boolean;
};

const Context = createContext<VariantContext | null>(null);

/**
 * État partagé entre la galerie et le panneau d'achat.
 *
 * Quand les vues sont des coloris (`viewsAreColorways`), les deux contrôles
 * sont synchronisés : sans cela on pouvait regarder une photo et commander
 * un autre coloris.
 */
export function ProductVariantProvider({
  product,
  children,
}: {
  product: Product;
  children: ReactNode;
}) {
  const linked = Boolean(
    product.viewsAreColorways && product.images?.length === product.colors.length,
  );

  const [view, setView] = useState(0);
  const [color, setColor] = useState(product.colors[0]?.name ?? '');

  const selectView = useCallback(
    (index: number) => {
      setView(index);
      if (linked) setColor(product.colors[index]?.name ?? '');
    },
    [linked, product.colors],
  );

  const selectColor = useCallback(
    (name: string) => {
      setColor(name);
      if (!linked) return;
      const index = product.colors.findIndex((c) => c.name === name);
      if (index >= 0) setView(index);
    },
    [linked, product.colors],
  );

  const value = useMemo<VariantContext>(
    () => ({ view, selectView, color, selectColor, linked }),
    [view, selectView, color, selectColor, linked],
  );

  return <Context.Provider value={value}>{children}</Context.Provider>;
}

export function useProductVariant() {
  const ctx = useContext(Context);
  if (!ctx) throw new Error('useProductVariant doit être utilisé dans ProductVariantProvider');
  return ctx;
}

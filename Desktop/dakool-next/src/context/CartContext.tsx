'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  ReactNode,
} from 'react';

export type CartItem = {
  /** Clé de ligne : un même produit en deux tailles fait deux lignes. */
  key: string;
  productId: string;
  slug: string;
  name: string;
  price: number;
  category: string;
  size?: string;
  color?: string;
  qty: number;
};

export type CartInput = Omit<CartItem, 'key' | 'qty'>;

type CartContextType = {
  cart: CartItem[];
  /** Faux tant que le panier stocké n'a pas été relu — évite d'afficher
      « panier vide » à un visiteur qui a des articles. */
  isReady: boolean;
  addToCart: (item: CartInput, qty?: number) => void;
  removeFromCart: (key: string) => void;
  updateQty: (key: string, delta: number) => void;
  clearCart: () => void;
  cartCount: number;
  cartTotal: number;
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
};

const CartContext = createContext<CartContextType | null>(null);

const STORAGE_KEY = 'dakool_cart';

function lineKey(item: CartInput): string {
  return [item.productId, item.size ?? '', item.color ?? ''].join('|');
}

function isCartItem(value: unknown): value is CartItem {
  if (typeof value !== 'object' || value === null) return false;
  const item = value as Record<string, unknown>;
  return (
    typeof item.key === 'string' &&
    typeof item.productId === 'string' &&
    typeof item.name === 'string' &&
    typeof item.price === 'number' &&
    typeof item.qty === 'number'
  );
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  /* Tant que le panier stocké n'est pas relu, on n'écrit rien : sinon le
     premier rendu (panier vide) écraserait le panier sauvegardé. */
  const [restored, setRestored] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed: unknown = JSON.parse(saved);
        if (Array.isArray(parsed)) setCart(parsed.filter(isCartItem));
      }
    } catch {
      /* Panier corrompu ou stockage indisponible : on repart d'un panier vide. */
      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch {}
    } finally {
      setRestored(true);
    }
  }, []);

  useEffect(() => {
    if (!restored) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
    } catch {
      /* Quota dépassé ou navigation privée : le panier reste valable pour la session. */
    }
  }, [cart, restored]);

  const addToCart = useCallback((item: CartInput, qty = 1) => {
    const key = lineKey(item);
    setCart((prev) => {
      const existing = prev.find((i) => i.key === key);
      if (existing) {
        return prev.map((i) => (i.key === key ? { ...i, qty: i.qty + qty } : i));
      }
      return [...prev, { ...item, key, qty }];
    });
  }, []);

  const removeFromCart = useCallback((key: string) => {
    setCart((prev) => prev.filter((i) => i.key !== key));
  }, []);

  const updateQty = useCallback((key: string, delta: number) => {
    setCart((prev) =>
      prev.flatMap((i) => {
        if (i.key !== key) return [i];
        const next = i.qty + delta;
        return next <= 0 ? [] : [{ ...i, qty: next }];
      }),
    );
  }, []);

  const clearCart = useCallback(() => setCart([]), []);
  const openCart = useCallback(() => setIsOpen(true), []);
  const closeCart = useCallback(() => setIsOpen(false), []);

  const value = useMemo<CartContextType>(
    () => ({
      cart,
      isReady: restored,
      addToCart,
      removeFromCart,
      updateQty,
      clearCart,
      cartCount: cart.reduce((sum, i) => sum + i.qty, 0),
      cartTotal: cart.reduce((sum, i) => sum + i.price * i.qty, 0),
      isOpen,
      openCart,
      closeCart,
    }),
    [cart, restored, isOpen, addToCart, removeFromCart, updateQty, clearCart, openCart, closeCart],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart doit être utilisé à l’intérieur de CartProvider');
  return ctx;
}

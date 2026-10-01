"use client";

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export type CartLine = {
  slug: string;
  name: string;
  priceCents: number;
  imageUrl: string;
  qty: number;
};

type CartContextValue = {
  lines: CartLine[];
  count: number;
  subtotalCents: number;
  isCartOpen: boolean;
  setCartOpen: (open: boolean) => void;
  addLine: (line: Omit<CartLine, "qty">, qty?: number) => void;
  updateQty: (slug: string, qty: number) => void;
  removeLine: (slug: string) => void;
  clear: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);
const STORAGE_KEY = "atelier-celeste-cart-v1";

export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [isCartOpen, setCartOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setLines(JSON.parse(raw));
    } catch {
      /* ignore */
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
  }, [lines, hydrated]);

  const value = useMemo<CartContextValue>(() => {
    const count = lines.reduce((s, l) => s + l.qty, 0);
    const subtotalCents = lines.reduce((s, l) => s + l.qty * l.priceCents, 0);
    return {
      lines,
      count,
      subtotalCents,
      isCartOpen,
      setCartOpen,
      addLine: (line, qty = 1) => {
        setLines((prev) => {
          const found = prev.find((l) => l.slug === line.slug);
          if (found) {
            return prev.map((l) => (l.slug === line.slug ? { ...l, qty: Math.min(99, l.qty + qty) } : l));
          }
          return [...prev, { ...line, qty }];
        });
        setCartOpen(true);
      },
      updateQty: (slug, qty) => {
        setLines((prev) =>
          qty <= 0 ? prev.filter((l) => l.slug !== slug) : prev.map((l) => (l.slug === slug ? { ...l, qty: Math.min(99, qty) } : l)),
        );
      },
      removeLine: (slug) => setLines((prev) => prev.filter((l) => l.slug !== slug)),
      clear: () => setLines([]),
    };
  }, [lines, isCartOpen]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart doit être utilisé dans <CartProvider>");
  return ctx;
}

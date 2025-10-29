import React, { createContext, useContext, useMemo, useState } from 'react';
import type { Product } from '../types';

type CartItem = { product: Product; qty: number };
type CartCtx = {
  items: CartItem[];
  add: (p: Product, qty?: number) => void;
  remove: (productId: number) => void;
  setQty: (productId: number, qty: number) => void;
  clear: () => void;
  total: number;
};

const Ctx = createContext<CartCtx | null>(null);
export const useCart = () => useContext(Ctx)!;

export const CartProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const add = (p: Product, qty: number = 1) => {
    setItems(prev => {
      const i = prev.findIndex(x => x.product.id === p.id);
      if (i >= 0) {
        const cp = [...prev]; cp[i] = { ...cp[i], qty: cp[i].qty + qty }; return cp;
      }
      return [...prev, { product: p, qty }];
    });
  };
  const remove = (id: number) => setItems(prev => prev.filter(x => x.product.id !== id));
  const setQty = (id: number, qty: number) => setItems(prev => prev.map(x => x.product.id===id?{...x,qty}:x));
  const clear = () => setItems([]);
  const total = useMemo(() => items.reduce((s, it) => s + Number(it.product.price) * it.qty, 0), [items]);

  return <Ctx.Provider value={{ items, add, remove, setQty, clear, total }}>{children}</Ctx.Provider>;
};

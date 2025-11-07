import React, { createContext, useContext, useEffect, useMemo, useReducer } from 'react';

export type CartItem = {
  productId: number;
  name: string;
  price: number;          // BRL
  imageUrl?: string | null;
  qty: number;
};

type CartState = { items: CartItem[] };

type CartAction =
  | { type: 'ADD'; payload: Omit<CartItem, 'qty'> & { qty?: number } }
  | { type: 'REMOVE'; payload: { productId: number } }
  | { type: 'SET_QTY'; payload: { productId: number; qty: number } }
  | { type: 'CLEAR' };

export type CartContextType = {
  state: CartState;
  add: (item: Omit<CartItem, 'qty'>, qty?: number) => void;
  remove: (productId: number) => void;
  setQty: (productId: number, qty: number) => void;
  inc: (productId: number, step?: number) => void;
  dec: (productId: number, step?: number) => void;
  clear: () => void;
  has: (productId: number) => boolean;
  totalItems: number;
  subtotal: number;
  freight: number;   // frete simplificado
  discount: number;  // desconto aplicado
  total: number;
};

const StorageKey = 'cart:v1';

function loadInitial(): CartState {
  try {
    const raw = localStorage.getItem(StorageKey);
    const parsed = raw ? JSON.parse(raw) : null;
    if (parsed && Array.isArray(parsed.items)) return { items: parsed.items };
  } catch {}
  return { items: [] };
}

function save(state: CartState) {
  try {
    localStorage.setItem(StorageKey, JSON.stringify(state));
  } catch {}
}

function reducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'ADD': {
      const { productId, name, price, imageUrl, qty = 1 } = action.payload;
      const i = state.items.findIndex((x) => x.productId === productId);
      if (i >= 0) {
        const items = state.items.slice();
        items[i] = { ...items[i], qty: items[i].qty + qty };
        return { items };
      }
      return { items: [...state.items, { productId, name, price, imageUrl, qty }] };
    }
    case 'REMOVE':
      return { items: state.items.filter((x) => x.productId !== action.payload.productId) };
    case 'SET_QTY': {
      const { productId, qty } = action.payload;
      if (qty <= 0) return { items: state.items.filter((x) => x.productId !== productId) };
      return { items: state.items.map((x) => (x.productId === productId ? { ...x, qty } : x)) };
    }
    case 'CLEAR':
      return { items: [] };
    default:
      return state;
  }
}

const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, loadInitial);

  useEffect(() => { save(state); }, [state]);

  const value = useMemo<CartContextType>(() => {
    const totalItems = state.items.reduce((s, i) => s + i.qty, 0);
    const subtotal = state.items.reduce((s, i) => s + i.qty * i.price, 0);

    // regras simples (ajuste à vontade):
    const freight = subtotal === 0 ? 0 : subtotal >= 200 ? 0 : 19.9; // frete grátis a partir de 200
    const discount = 0; // cupom aplicado será somado na página (mantemos 0 aqui)
    const total = Math.max(0, subtotal + freight - discount);

    return {
      state,
      add: (item, qty = 1) => dispatch({ type: 'ADD', payload: { ...item, qty } }),
      remove: (productId) => dispatch({ type: 'REMOVE', payload: { productId } }),
      setQty: (productId, qty) => dispatch({ type: 'SET_QTY', payload: { productId, qty } }),
      inc: (productId, step = 1) => {
        const found = state.items.find((x) => x.productId === productId);
        dispatch({ type: 'SET_QTY', payload: { productId, qty: (found?.qty ?? 0) + step } });
      },
      dec: (productId, step = 1) => {
        const found = state.items.find((x) => x.productId === productId);
        dispatch({ type: 'SET_QTY', payload: { productId, qty: Math.max(0, (found?.qty ?? 0) - step) } });
      },
      clear: () => dispatch({ type: 'CLEAR' }),
      has: (productId) => state.items.some((x) => x.productId === productId),
      totalItems,
      subtotal,
      freight,
      discount,
      total,
    };
  }, [state]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCartContext() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCartContext must be used within CartProvider');
  return ctx;
}

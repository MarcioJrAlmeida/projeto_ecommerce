import React, { createContext, useContext, useEffect, useMemo, useReducer } from 'react';

export type CartItem = {
  productId: number;
  name: string;
  price: number;          // em BRL (number)
  imageUrl?: string | null;
  qty: number;
};

type CartState = {
  items: CartItem[];
};

type CartAction =
  | { type: 'ADD'; payload: Omit<CartItem, 'qty'> & { qty?: number } }
  | { type: 'REMOVE'; payload: { productId: number } }
  | { type: 'SET_QTY'; payload: { productId: number; qty: number } }
  | { type: 'CLEAR' };

type CartContextType = {
  state: CartState;
  add: (item: Omit<CartItem, 'qty'>, qty?: number) => void;
  remove: (productId: number) => void;
  setQty: (productId: number, qty: number) => void;
  clear: () => void;
  totalItems: number;
  totalValue: number;
};

const StorageKey = 'cart:v1';

function loadInitial(): CartState {
  try {
    const raw = localStorage.getItem(StorageKey);
    if (!raw) return { items: [] };
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed?.items)) return { items: [] };
    return { items: parsed.items };
  } catch {
    return { items: [] };
  }
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
      const idx = state.items.findIndex((i) => i.productId === productId);
      if (idx >= 0) {
        const items = state.items.slice();
        items[idx] = { ...items[idx], qty: items[idx].qty + qty };
        return { items };
      }
      return { items: [...state.items, { productId, name, price, imageUrl, qty }] };
    }
    case 'REMOVE': {
      return { items: state.items.filter((i) => i.productId !== action.payload.productId) };
    }
    case 'SET_QTY': {
      const { productId, qty } = action.payload;
      if (qty <= 0) return { items: state.items.filter((i) => i.productId !== productId) };
      return {
        items: state.items.map((i) => (i.productId === productId ? { ...i, qty } : i)),
      };
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

  useEffect(() => {
    save(state);
  }, [state]);

  const value = useMemo<CartContextType>(() => {
    const totalItems = state.items.reduce((acc, i) => acc + i.qty, 0);
    const totalValue = state.items.reduce((acc, i) => acc + i.qty * i.price, 0);

    return {
      state,
      add: (item, qty = 1) =>
        dispatch({ type: 'ADD', payload: { ...item, qty } }),
      remove: (productId) => dispatch({ type: 'REMOVE', payload: { productId } }),
      setQty: (productId, qty) => dispatch({ type: 'SET_QTY', payload: { productId, qty } }),
      clear: () => dispatch({ type: 'CLEAR' }),
      totalItems,
      totalValue,
    };
  }, [state]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCartContext() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCartContext must be used within CartProvider');
  return ctx;
}

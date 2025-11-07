import { useCartContext } from './CartContext';

export function useCart() {
  return useCartContext();
}

// src/features/orders/hooks.ts
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  getOrders,
  getOrderById,
  createOrder,
  updateOrder,
  deleteOrderApi,
  createOrderFromCart,
  type OrderInput,
  type OrderQuery,
} from './api';

// chaves estáveis (boas para cache)
const ordersKey = (q?: OrderQuery) => ['orders', q] as const;
const orderKey = (id: number | string) => ['order', id] as const;

/* ========== QUERIES ========== */

export function useOrders(q: OrderQuery) {
  return useQuery({
    queryKey: ordersKey(q),
    queryFn: () => getOrders(q),
  });
}

export function useOrder(id: number | string) {
  const numOk = typeof id === 'number' ? Number.isFinite(id) : !!id;
  return useQuery({
    queryKey: orderKey(id),
    enabled: numOk,
    queryFn: () => getOrderById(id),
  });
}

/* ========== MUTATIONS ========== */

export function useCreateOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: OrderInput) => createOrder(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['orders'] });
    },
  });
}

export function useUpdateOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (arg: { id: number; data: OrderInput }) =>
      updateOrder(arg.id, arg.data),
    onSuccess: (_res, arg) => {
      qc.invalidateQueries({ queryKey: ['orders'] });
      qc.invalidateQueries({ queryKey: orderKey(arg.id) });
    },
  });
}

export function useDeleteOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteOrderApi(id),
    onSuccess: (_status, id) => {
      qc.invalidateQueries({ queryKey: ['orders'] });
      qc.invalidateQueries({ queryKey: orderKey(id) });
    },
  });
}

/** Checkout do carrinho → cria pedido + itens e atualiza caches */
export function useCheckoutFromCart() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createOrderFromCart,
    onSuccess: (order) => {
      qc.invalidateQueries({ queryKey: ['orders'] });
      qc.invalidateQueries({ queryKey: orderKey(order.id) });
    },
  });
}

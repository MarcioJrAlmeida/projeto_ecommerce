import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  listOrders,
  getOrder,
  createOrder,
  updateOrder,
  deleteOrderApi,
  type Order,
  type OrderInput,
  type OrderQuery,
  type Paged,
} from './api';

const ordersKey = (q?: OrderQuery) => [
  'orders',
  q?.page ?? 1,
  q?.limit ?? 12,
  q?.search ?? '',
  q?.status ?? '',
];
const orderKey = (id: number | string) => ['order', id];

/* ===== Queries ===== */

export function useOrders(query: OrderQuery) {
  return useQuery<Paged<Order>>({
    queryKey: ordersKey(query),
    queryFn: () => listOrders(query),
    keepPreviousData: true,
  });
}

export function useOrder(id?: string | number) {
  return useQuery<Order>({
    enabled: !!id,
    queryKey: id ? orderKey(id) : ['order', 'none'],
    queryFn: () => getOrder(id!),
  });
}

/* ===== Mutations ===== */

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
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['orders'] });
    },
  });
}

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createProduct, deleteProduct, getProduct, listProducts, updateProduct, type Product, type ProductInput, type ProductQuery, type Paged } from './api';

const productsKey = (q?: ProductQuery) => ['products', q?.page ?? 1, q?.limit ?? 12, q?.search ?? '', q?.sort ?? 'createdAt.desc'];
const productKey = (id: number | string) => ['product', id];

export function useProducts(query: ProductQuery) {
  return useQuery<Paged<Product>>({
    queryKey: productsKey(query),
    queryFn: () => listProducts(query)
  });
}

export function useProduct(id?: string) {
  return useQuery<Product>({
    enabled: !!id,
    queryKey: id ? productKey(id) : ['product', 'none'],
    queryFn: () => getProduct(id!),
  });
}

// MUTATIONS

export function useCreateProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: ProductInput) => createProduct(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['products'] });
    },
  });
}

export function useUpdateProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (arg: { id: number; data: ProductInput }) => updateProduct(arg.id, arg.data),
    onSuccess: (_, arg) => {
      qc.invalidateQueries({ queryKey: ['products'] });
      qc.invalidateQueries({ queryKey: productKey(arg.id) });
    },
  });
}

export function useDeleteProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteProduct(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['products'] });
    },
  });
}

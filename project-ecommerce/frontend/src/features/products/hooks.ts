import { useMemo } from 'react';
import { useQuery, useQueryClient, QueryClient } from '@tanstack/react-query';
import {
  listProducts,
  getProduct,
  type Product,
  type Paged,
  type ProductQuery,
} from './api';

/** Chaves de cache padronizadas para evitar colisões */
export const productKeys = {
  all: ['products'] as const,
  list: (q: Partial<ProductQuery> = {}) =>
    [...productKeys.all, 'list', normalizeQuery(q)] as const,
  detail: (id: number | string) =>
    [...productKeys.all, 'detail', String(id)] as const,
};

/** Normaliza a query para ser usada na queryKey (ordem estável dos campos) */
function normalizeQuery(q: Partial<ProductQuery>) {
  return {
    page: q.page ?? 1,
    limit: q.limit ?? 12,
    sort: q.sort ?? 'createdAt.desc',
    search: q.search ?? '',
    categoryId: q.categoryId ?? undefined,
    minPrice: q.minPrice ?? undefined,
    maxPrice: q.maxPrice ?? undefined,
    active: q.active ?? undefined,
  };
}

/** Lista paginada de produtos */
export function useProducts(query: Partial<ProductQuery> = {}) {
  const params = useMemo(() => normalizeQuery(query), [query]);

  return useQuery<Paged<Product>>({
    queryKey: productKeys.list(params),
    queryFn: () => listProducts(params),
    // Mantém a página anterior durante mudanças de filtro/página
    placeholderData: (prev) => prev, // equivalente ao keepPreviousData
    staleTime: 20_000, // 20s
    gcTime: 5 * 60_000, // 5min
    retry: 1,
  });
}

/** Detalhe de um produto */
export function useProduct(id?: number | string) {
  const enabled = !!id;

  return useQuery<Product>({
    queryKey: id ? productKeys.detail(id) : productKeys.all,
    queryFn: () => getProduct(id as number | string),
    enabled,
    staleTime: 30_000,
    retry: 1,
  });
}

/* ===========================
   Helpers para prefetch/invalidate
   =========================== */

/** Prefetch da lista (útil em navegação antecipada) */
export async function prefetchProducts(
  qc: QueryClient,
  query: Partial<ProductQuery> = {}
) {
  const params = normalizeQuery(query);
  await qc.prefetchQuery({
    queryKey: productKeys.list(params),
    queryFn: () => listProducts(params),
    staleTime: 20_000,
  });
}

/** Prefetch de um produto específico */
export async function prefetchProduct(qc: QueryClient, id: number | string) {
  await qc.prefetchQuery({
    queryKey: productKeys.detail(id),
    queryFn: () => getProduct(id),
    staleTime: 30_000,
  });
}

/** Invalidate da lista (ex.: após criar/editar produto) */
export async function invalidateProducts(qc: QueryClient, query?: Partial<ProductQuery>) {
  if (query) {
    await qc.invalidateQueries({ queryKey: productKeys.list(normalizeQuery(query)) });
  } else {
    await qc.invalidateQueries({ queryKey: productKeys.all });
  }
}

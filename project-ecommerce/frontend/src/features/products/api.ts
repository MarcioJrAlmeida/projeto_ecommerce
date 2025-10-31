import { http } from '@/lib/http';

/** Tipos mínimos para começarmos (podemos extrair depois para `types.ts`) */
export type Category = {
  id: number;
  name: string;
  slug?: string;
  active?: boolean;
};

export type Product = {
  id: number;
  name: string;
  slug?: string;
  description?: string;
  price: number;
  active: boolean;
  sku?: string;
  imageUrl?: string | null;
  category?: Category | null;
  categoryId?: number | null;
  createdAt?: string;
  updatedAt?: string;
};

export type Paged<T> = {
  items: T[];
  total: number;
  page: number;
  limit: number;
};

export type ProductSort =
  | 'name.asc'
  | 'name.desc'
  | 'price.asc'
  | 'price.desc'
  | 'createdAt.desc'
  | 'createdAt.asc';

export type ProductQuery = {
  search?: string;
  categoryId?: number;
  minPrice?: number;
  maxPrice?: number;
  active?: boolean;
  page?: number;   // 1-based
  limit?: number;  // items per page
  sort?: ProductSort;
};

/** Lista de produtos com paginação/filters */
export async function listProducts(
  query: ProductQuery = {}
): Promise<Paged<Product>> {
  const params = {
    page: query.page ?? 1,
    limit: query.limit ?? 12,
    sort: query.sort ?? 'createdAt.desc',
    search: query.search,
    categoryId: query.categoryId,
    minPrice: query.minPrice,
    maxPrice: query.maxPrice,
    active: query.active,
  };

  const { data } = await http.get<Paged<Product>>('/products', { params });
  return data;
}

/** Detalhe de um produto */
export async function getProduct(id: number | string): Promise<Product> {
  const { data } = await http.get<Product>(`/products/${id}`);
  return data;
}

/** Utilitário opcional: formata query padrão (útil para páginas) */
export const defaultProductQuery = (overrides: Partial<ProductQuery> = {}): ProductQuery => ({
  page: 1,
  limit: 12,
  sort: 'createdAt.desc',
  ...overrides,
});

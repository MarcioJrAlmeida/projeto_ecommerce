import { http } from '@/lib/http';

export type Product = {
  id: number;
  name: string;
  price: number;
  imageUrl?: string | null;
  description?: string | null;
  category?: string | null; // simples: string
  sku?: string | null;
  createdAt?: string;
  updatedAt?: string;
};

export type Paged<T> = {
  items: T[];
  total: number;
  page: number;
  limit: number;
};

export type ProductQuery = {
  search?: string;
  page?: number;
  limit?: number;
  sort?: 'createdAt.desc' | 'createdAt.asc' | 'price.asc' | 'price.desc' | 'name.asc' | 'name.desc';
};

export type ProductInput = {
  name: string;
  price: number;
  category?: string;
  imageUrl?: string;
  description?: string;
  sku?: string;
};

function prune<T extends Record<string, unknown>>(obj: T) {
  const o: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(obj)) {
    if (v !== undefined && v !== null && v !== '') o[k] = v;
  }
  return o;
}

export async function listProducts(query: ProductQuery = {}): Promise<Paged<Product>> {
  const params = prune({
    page: query.page ?? 1,
    limit: query.limit ?? 12,
    search: query.search,
    sort: query.sort,
  });
  const { data } = await http.get<Paged<Product>>('/products', { params });
  return data;
}

export async function getProduct(id: number | string): Promise<Product> {
  const { data } = await http.get<Product>(`/products/${id}`);
  return data;
}

export async function createProduct(payload: ProductInput): Promise<Product> {
  const { data } = await http.post<Product>('/products', payload);
  return data;
}

export async function updateProduct(id: number, payload: ProductInput): Promise<Product> {
  const { data } = await http.put<Product>(`/products/${id}`, payload);
  return data;
}

export async function deleteProduct(id: number): Promise<void> {
  await http.delete(`/products/${id}`);
}

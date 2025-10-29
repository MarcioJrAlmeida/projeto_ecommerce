import { http } from '@/lib/http';
import type { Product, ProductQuery, Paged } from './types';

export async function listProducts(query: ProductQuery): Promise<Paged<Product>> {
  const { data } = await http.get('/products', { params: query });
  return data;
}
export async function getProduct(id: number): Promise<Product> {
  const { data } = await http.get(`/products/${id}`);
  return data;
}

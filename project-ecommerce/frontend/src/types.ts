export type Category = { id: number; name: string; description?: string };
export type Product = {
  id: number; name: string; description?: string;
  price: string; stock: number; active: boolean;
  imageUrl?: string; category: Category;
};

export type Paged<T> = { data: T[]; meta: { page: number; limit: number; total: number; totalPages: number } };

export type Customer = { id: number; name: string; email: string; phone?: string };
export type OrderItem = { id: number; quantity: number; unitPrice: string; lineTotal: string; product: Product };
export type Order = { id: number; status: 'ABERTO'|'AGUARDANDO_PAGAMENTO'|'PAGO'|'CANCELADO';
  subtotal: string; total: string; totalItems: number; items: OrderItem[]; customer: Customer };

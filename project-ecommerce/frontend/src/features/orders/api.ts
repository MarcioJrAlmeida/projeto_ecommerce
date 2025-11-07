// src/features/orders/api.ts
import { http } from '@/lib/http';

/* ===================== Tipos ===================== */

export type OrderItem = {
  id: number;
  quantity: number;
  unitPrice: number | null;
  lineTotal: number | null;
  product?: {
    id: number;
    name: string;
    imageUrl?: string | null;
    price?: number | null;
  };
};

export type Order = {
  id: number;
  code?: string | null;
  userId?: number | null;       // alias local para compat
  customer?: { id: number; name?: string; email?: string };
  status: 'ABERTO' | 'AGUARDANDO_PAGAMENTO' | 'PAGO' | 'CANCELADO' | 'pending' | 'paid' | 'shipped' | 'cancelled' | string;
  subtotal?: number | null;
  total?: number | null;
  totalItems?: number | null;
  createdAt?: string;
  updatedAt?: string;
  items?: OrderItem[];
};

export type Paged<T> = { items: T[]; total: number; page: number; limit: number };

export type OrderInput = {
  code?: string;
  userId?: number;       // usamos como alias para customerId
  customerId?: number;
  status?: string;
  total?: number;
};

export type OrderQuery = {
  search?: string;
  status?: string;
  page?: number;
  limit?: number;
  userId?: number;
  customerId?: number;
};

/* ===================== Helpers ===================== */

function toNum(v: any): number | null {
  if (v == null || v === '') return null;
  const n = typeof v === 'number' ? v : Number(String(v).replace(',', '.'));
  return Number.isFinite(n) ? n : null;
}

function prune<T extends Record<string, unknown>>(obj: T) {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(obj)) {
    if (v !== '' && v != null) out[k] = v;
  }
  return out;
}

function normalizeOrder(o: any): Order {
  const items: OrderItem[] | undefined = Array.isArray(o?.items)
    ? o.items.map((it: any) => ({
        id: Number(it.id),
        quantity: Number(it.quantity ?? it.qty ?? 0),
        unitPrice: toNum(it.unitPrice ?? it.unit_price ?? it.price),
        lineTotal: toNum(it.lineTotal ?? it.line_total ?? (toNum(it.unitPrice ?? it.price) ?? 0) * Number(it.quantity ?? 0)),
        product: it.product
          ? {
              id: Number(it.product.id),
              name: it.product.name ?? '',
              imageUrl: it.product.imageUrl ?? it.product.image_url ?? it.product.image ?? null,
              price: toNum(it.product.price),
            }
          : undefined,
      }))
    : undefined;

  let subtotal = toNum(o.subtotal);
  if (subtotal == null && items) {
    subtotal = items.reduce((acc, it) => acc + (it.lineTotal ?? 0), 0);
  }

  const totalItems = items?.reduce((acc, it) => acc + (Number(it.quantity) || 0), 0) ?? null;

  return {
    id: Number(o.id),
    code: o.code ?? o.number ?? null,
    userId: o.userId ?? o.customerId ?? o.user_id ?? o.customer_id ?? null,
    customer: o.customer && typeof o.customer === 'object'
      ? { id: Number(o.customer.id), name: o.customer.name, email: o.customer.email }
      : undefined,
    status: o.status ?? 'pending',
    subtotal,
    total: toNum(o.total ?? o.totalValue) ?? subtotal ?? null,
    totalItems,
    createdAt: o.createdAt ?? o.created_at ?? undefined,
    updatedAt: o.updatedAt ?? o.updated_at ?? undefined,
    items,
  };
}

/** Aceita vários formatos de listagem */
function coerceListAndTotal(raw: any): { itemsRaw: any[]; total: number } {
  if (Array.isArray(raw)) return { itemsRaw: raw, total: raw.length };
  const r =
    raw?.data && (Array.isArray(raw.data.items) || Array.isArray(raw.data.rows))
      ? raw.data
      : raw;
  const itemsRaw = r.items ?? r.rows ?? r.results ?? r.data ?? (Array.isArray(r) ? r : []);
  let total =
    r.total ?? r.count ?? r.totalCount ?? r?.meta?.total ?? (Array.isArray(itemsRaw) ? itemsRaw.length : 0);
  if (!Array.isArray(itemsRaw)) return { itemsRaw: [], total: Number(total || 0) };
  return { itemsRaw, total: Number(total || itemsRaw.length || 0) };
}

/* ===================== API calls ===================== */

/** Listagem paginada */
export async function listOrders(q: OrderQuery = {}) {
  const page = q.page ?? 1;
  const limit = q.limit ?? 12;

  const params = prune({
    page,
    limit,
    search: q.search,
    status: q.status,
    userId: q.userId,
    customerId: q.customerId ?? q.userId, // alias
    // aliases comuns de paginação:
    skip: (page - 1) * limit,
    take: limit,
    offset: (page - 1) * limit,
  });

  const { data } = await http.get<any>('/orders', { params });

  const { itemsRaw, total } = coerceListAndTotal(data);

  // Paginação client-side se o back devolver array puro
  let paginated = itemsRaw;
  if (Array.isArray(itemsRaw) && (data.items == null && data.rows == null)) {
    const start = (page - 1) * limit;
    paginated = itemsRaw.slice(start, start + limit);
  }

  const items = paginated.map(normalizeOrder);

  return { items, total: Number(total), page, limit } as Paged<Order>;
}

/** Alias usado em hooks: getOrders */
export const getOrders = listOrders;

/** Detalhe */
export async function getOrder(id: number | string) {
  const { data } = await http.get<any>(`/orders/${id}`);
  return normalizeOrder(data);
}

/** Alias usado em hooks: getOrderById */
export const getOrderById = getOrder;

/** Cria um pedido (sem itens) */
export async function createOrder(payload: OrderInput) {
  const body = prune({
    code: payload.code,
    userId: payload.userId ?? payload.customerId,
    customerId: payload.customerId ?? payload.userId, // alias
    status: payload.status,
    total: payload.total,
  });
  const { data } = await http.post<any>('/orders', body);
  return normalizeOrder(data);
}

/** Alias: createOrderApi */
export const createOrderApi = createOrder;

/** Atualiza pedido */
export async function updateOrder(id: number, payload: OrderInput) {
  const body = prune({
    code: payload.code,
    userId: payload.userId ?? payload.customerId,
    customerId: payload.customerId ?? payload.userId, // alias
    status: payload.status,
    total: payload.total,
  });
  const { data } = await http.put<any>(`/orders/${id}`, body);
  return normalizeOrder(data);
}

/** Remove pedido (DELETE /orders/:id) */
export async function deleteOrderApi(id: number) {
  const res = await http.delete(`/orders/${id}`, {
    data: {},
    headers: { 'Content-Type': 'application/json' },
    validateStatus: (s) => [200, 202, 204].includes(s),
  });
  return res.status;
}

/** Adiciona item ao pedido (POST /orders/:id/items) */
export async function addOrderItemApi(
  orderId: number,
  payload: { productId: number; quantity: number; unitPrice: number }
) {
  const { data } = await http.post<any>(`/orders/${orderId}/items`, {
    productId: payload.productId,
    quantity: payload.quantity,
    unitPrice: payload.unitPrice,
  });
  // muitos backends retornam o pedido atualizado
  return normalizeOrder(data);
}

/**
 * Cria um pedido e adiciona todos os itens do carrinho.
 * Retorna o pedido final (com items).
 */
export async function createOrderFromCart(params: {
  customerId: number;
  status?: string; // 'ABERTO' | 'AGUARDANDO_PAGAMENTO' | ...
  items: Array<{ productId: number; qty: number; unitPrice: number }>;
}) {
  if (!params.customerId) throw new Error('customerId obrigatório para finalizar compra.');
  if (!params.items?.length) throw new Error('Carrinho vazio.');

  const order = await createOrderApi({
    customerId: params.customerId,
    status: params.status ?? 'ABERTO',
  });

  for (const it of params.items) {
    await addOrderItemApi(order.id, {
      productId: it.productId,
      quantity: it.qty,
      unitPrice: it.unitPrice,
    });
  }

  // retorna o pedido com itens atualizados
  return await getOrderById(order.id);
}

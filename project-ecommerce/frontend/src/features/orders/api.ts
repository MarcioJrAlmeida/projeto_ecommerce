import { http } from '@/lib/http';

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
  userId?: number | null;
  status: 'pending' | 'paid' | 'shipped' | 'cancelled' | string;
  subtotal?: number | null;   // ⬅️ novo
  total?: number | null;
  createdAt?: string;
  updatedAt?: string;
  items?: OrderItem[];
};
export type Paged<T> = { items: T[]; total: number; page: number; limit: number };

export type OrderInput = {
  code?: string;
  userId?: number;
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


/* ===== Helpers ===== */
function prune<T extends Record<string, unknown>>(obj: T) {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(obj)) {
    if (v !== '' && v != null) out[k] = v;
  }
  return out;
}

function normalizeOrder(o: any): Order {
  const items: OrderItem[] | undefined = Array.isArray(o.items)
    ? o.items.map((it: any) => ({
        id: Number(it.id),
        quantity: Number(it.quantity ?? 0),
        unitPrice: Number(it.unitPrice ?? it.unit_price ?? it.price),
        lineTotal: Number(it.lineTotal ?? it.line_total),
        product: it.product
          ? {
              id: Number(it.product.id),
              name: it.product.name ?? '',
              imageUrl:
                it.product.imageUrl ??
                it.product.image_url ??
                it.product.image ??
                null,
              price: Number(it.product.price),
            }
          : undefined,
      }))
    : undefined;

  return {
    id: Number(o.id),
    code: o.code ?? o.number ?? null,
    userId: o.userId ?? o.customerId ?? o.user_id ?? null,
    status: o.status ?? 'pending',
    subtotal: Number(o.subtotal),
    total: Number(o.total ?? o.totalValue),
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

/* ===== API calls ===== */

export async function listOrders(q: OrderQuery = {}) {
  const page = q.page ?? 1;
  const limit = q.limit ?? 12;

  const params = prune({
    page,
    limit,
    search: q.search,
    status: q.status,
    userId: q.userId,                 // ⬅️ NOVO
    customerId: q.customerId ?? q.userId, // ⬅️ NOVO (alias)
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

export async function getOrder(id: number | string) {
  const { data } = await http.get<any>(`/orders/${id}`);
  return normalizeOrder(data);
}

export async function createOrder(payload: OrderInput) {
  const body = prune({
    code: payload.code,
    userId: payload.userId,
    customerId: payload.userId, // alias
    status: payload.status,
    total: payload.total,
  });
  const { data } = await http.post<any>('/orders', body);
  return normalizeOrder(data);
}

export async function updateOrder(id: number, payload: OrderInput) {
  const body = prune({
    code: payload.code,
    userId: payload.userId,
    customerId: payload.userId, // alias
    status: payload.status,
    total: payload.total,
  });
  const { data } = await http.put<any>(`/orders/${id}`, body);
  return normalizeOrder(data);
}

// src/features/orders/api.ts
export async function deleteOrderApi(id: number) {
  try {
    // tenta o padrão REST comum (Nest aceita isso)
    const res = await http.delete(`/orders/${id}`, {
      // alguns servidores só aceitam DELETE com body explícito
      data: {},
      // e/ou exigem Content-Type
      headers: { 'Content-Type': 'application/json' },
      validateStatus: (s) => [200, 202, 204].includes(s), // considere OK 200/202/204
    });
    return res.status;
  } catch (err) {
    // fallback: alguns backends implementam remoção via POST/PUT (não ideal, mas comum)
    // se o seu tiver algo como /orders/:id/delete, descomente:
    // const res = await http.post(`/orders/${id}/delete`, {});
    // return res.status;
    throw err;
  }
}


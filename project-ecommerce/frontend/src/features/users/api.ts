import { http } from '@/lib/http';

/** ===== Tipos usados pela UI (mantidos) ===== */
export type User = {
  id: number;
  username: string;            // mapeado de customer.name || customer.username
  email?: string | null;
  role?: string | null;        // se o back não tiver, deixamos null
  createdAt?: string;
  updatedAt?: string;
};

export type Paged<T> = {
  items: T[];
  total: number;
  page: number;
  limit: number;
};

export type UserInput = {
  username: string;            // enviaremos como { name: username } para o /customers
  email?: string;
  role?: string;               // ignorado pelo back se não existir
};

export type UserQuery = {
  search?: string;
  page?: number;
  limit?: number;
};

/** ===== Helpers ===== */
function prune<T extends Record<string, unknown>>(obj: T) {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(obj)) {
    if (v !== '' && v != null) out[k] = v;
  }
  return out;
}

/** Normaliza um objeto vindo do /customers para o tipo User da UI */
function normalizeCustomer(cust: any): User {
  return {
    id: Number(cust.id),
    username: (cust.name ?? cust.username ?? '').toString(),
    email: cust.email ?? null,
    role: cust.role ?? null,
    createdAt: cust.createdAt ?? cust.created_at ?? undefined,
    updatedAt: cust.updatedAt ?? cust.updated_at ?? undefined,
  };
}

/**
 * Extrai lista e total de forma tolerante ao formato:
 *  - array direto
 *  - { items, total }   | { rows, count }
 *  - { data: { ... } }  | { meta: { total } }
 */
function coerceListAndTotal(raw: any): { itemsRaw: any[]; total: number } {
  // array puro
  if (Array.isArray(raw)) {
    return { itemsRaw: raw, total: raw.length };
  }
  // formatos comuns
  const r =
    raw?.data && (Array.isArray(raw.data.items) || Array.isArray(raw.data.rows))
      ? raw.data
      : raw;

  const itemsRaw =
    r.items ?? r.rows ?? r.results ?? r.data ?? (Array.isArray(r) ? r : []);

  let total =
    r.total ??
    r.count ??
    r.totalCount ??
    r?.meta?.total ??
    (Array.isArray(itemsRaw) ? itemsRaw.length : 0);

  if (!Array.isArray(itemsRaw)) return { itemsRaw: [], total: Number(total || 0) };
  return { itemsRaw, total: Number(total || itemsRaw.length || 0) };
}

/** ===== API calls apontando para /customers ===== */
export async function listUsers(q: UserQuery = {}) {
  const page = q.page ?? 1;
  const limit = q.limit ?? 12;

  // Enviamos vários aliases de paginação para se adaptar ao back:
  // page/limit + skip/take + offset/limit
  const params = prune({
    page,
    limit,
    search: q.search,
    skip: (page - 1) * limit,
    take: limit,
    offset: (page - 1) * limit,
  });

  // GET /customers
  const { data } = await http.get<any>('/customers', { params });

  const { itemsRaw, total } = coerceListAndTotal(data);

  // Se o back não paginar e devolver tudo de uma vez (array),
  // fazemos paginação no cliente para manter a UI consistente.
  let paginated = itemsRaw;
  if (Array.isArray(itemsRaw) && (data.items == null && data.rows == null)) {
    const start = (page - 1) * limit;
    paginated = itemsRaw.slice(start, start + limit);
  }

  const items = paginated.map(normalizeCustomer);

  return {
    items,
    total: Number(total),
    page,
    limit,
  } as Paged<User>;
}

export async function getUser(id: number | string) {
  // GET /customers/:id
  const { data } = await http.get<any>(`/customers/${id}`);
  return normalizeCustomer(data);
}

export async function createUser(payload: UserInput) {
  // POST /customers  — converte { username } -> { name }
  const body = prune({
    name: payload.username?.trim(),
    email: payload.email,
    role: payload.role, // se o back ignorar, sem problemas
  });

  const { data } = await http.post<any>('/customers', body);
  return normalizeCustomer(data);
}

export async function updateUser(id: number, payload: UserInput) {
  // PUT /customers/:id — converte { username } -> { name }
  const body = prune({
    name: payload.username?.trim(),
    email: payload.email,
    role: payload.role,
  });

  const { data } = await http.put<any>(`/customers/${id}`, body);
  return normalizeCustomer(data);
}

export async function deleteUserApi(id: number) {
  // DELETE /customers/:id
  await http.delete(`/customers/${id}`);
}

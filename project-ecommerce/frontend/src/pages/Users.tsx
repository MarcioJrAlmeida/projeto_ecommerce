import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import {
  useUsers,
  useCreateUser,
  useUpdateUser,
  useDeleteUser,
} from '@/features/users/hooks';
import type { User, UserInput, UserQuery } from '@/features/users/api';

import { useOrders } from '@/features/orders/hooks';
import type { Order } from '@/features/orders/api';

export default function UsersPage() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(12);

  const q = useMemo<UserQuery>(
    () => ({ search: search || undefined, page, limit }),
    [search, page, limit]
  );

  const { data, isLoading, isFetching, error } = useUsers(q);

  const [openForm, setOpenForm] =
    useState<null | { mode: 'create' } | { mode: 'edit'; user: User }>(null);

  // Modal de pedidos do usuário
  const [openOrders, setOpenOrders] = useState<null | { user: User }>(null);

  const createMut = useCreateUser();
  const updateMut = useUpdateUser();
  const deleteMut = useDeleteUser();

  useEffect(() => {
    setPage(1);
  }, [search, limit]);

  const total = data?.total ?? 0;
  const items = data?.items ?? [];
  const totalPages = Math.max(1, Math.ceil(total / (q.limit ?? 12)));

  return (
    <div style={{ display: 'grid', gap: 16 }}>
      <header
        style={{
          display: 'flex',
          gap: 12,
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
        }}
      >
        <h2 style={{ margin: 0 }}>Usuários</h2>

        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar usuários…"
            className="input"
          />
          <select
            value={String(limit)}
            onChange={(e) => setLimit(Number(e.target.value))}
            className="input"
          >
            <option value="6">6 / pág.</option>
            <option value="12">12 / pág.</option>
            <option value="24">24 / pág.</option>
          </select>

          <button
            className="btn"
            onClick={() => setOpenForm({ mode: 'create' })}
            style={{
              background: 'var(--primary,#2563eb)',
              borderColor: 'var(--primary,#2563eb)',
              color: '#fff',
            }}
          >
            + Adicionar usuário
          </button>
        </div>
      </header>

      {error && (
        <div className="card" role="alert" style={{ borderColor: '#dc2626' }}>
          Falha ao carregar usuários.
        </div>
      )}

      {isLoading ? (
        <div className="card">Carregando…</div>
      ) : (
        <>
          <div style={{ display: 'grid', gap: 12 }}>
            {items.map((u) => (
              <div
                key={u.id}
                className="card"
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr auto',
                  alignItems: 'center',
                }}
              >
                <div>
                  <div style={{ fontWeight: 600 }}>{u.username}</div>
                  <div style={{ opacity: 0.8, fontSize: 12 }}>
                    {u.email ?? '—'} {u.role ? `• ${u.role}` : ''}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 8 }}>
                  {/* Ver pedidos do usuário */}
                  <button
                    className="btn"
                    title="Pedidos do usuário"
                    onClick={() => setOpenOrders({ user: u })}
                    style={{ width: 40, minWidth: 40, padding: 8 }}
                  >
                    <OrdersIcon />
                  </button>

                  <button
                    className="btn"
                    title="Editar"
                    onClick={() => setOpenForm({ mode: 'edit', user: u })}
                    style={{ width: 40, minWidth: 40, padding: 8 }}
                  >
                    <PencilIcon />
                  </button>
                  <button
                    className="btn"
                    title="Excluir"
                    onClick={() =>
                      confirm(`Excluir ${u.username}?`) && deleteMut.mutate(u.id)
                    }
                    style={{
                      width: 40,
                      minWidth: 40,
                      padding: 8,
                      color: 'var(--danger,#ef4444)',
                      borderColor: 'var(--danger,#ef4444)',
                    }}
                  >
                    <CloseIcon />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <footer
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <small style={{ opacity: 0.7 }}>
              {total} usuário(s) {isFetching && '• atualizando…'}
            </small>
            <Pagination page={page} setPage={setPage} totalPages={totalPages} />
          </footer>
        </>
      )}

      {/* Modal de formulário (criar/editar) */}
      {openForm && (
        <Modal onClose={() => setOpenForm(null)}>
          <UserForm
            title={openForm.mode === 'create' ? 'Novo usuário' : 'Editar usuário'}
            initial={
              openForm.mode === 'edit'
                ? {
                    username: openForm.user.username,
                    email: openForm.user.email ?? undefined,
                    role: openForm.user.role ?? undefined,
                  }
                : null
            }
            onCancel={() => setOpenForm(null)}
            onSubmit={async (payload) => {
              if (openForm.mode === 'create') {
                await createMut.mutateAsync(payload);
              } else {
                await updateMut.mutateAsync({
                  id: openForm.user.id,
                  data: payload,
                });
              }
              setOpenForm(null);
            }}
          />
        </Modal>
      )}

      {/* Modal de pedidos por usuário */}
      {openOrders && (
        <Modal onClose={() => setOpenOrders(null)}>
          <UserOrders
            userId={openOrders.user.id}
            username={openOrders.user.username}
          />
        </Modal>
      )}
    </div>
  );
}

/* ---------- Formulário ---------- */
function UserForm({
  title,
  initial,
  onSubmit,
  onCancel,
}: {
  title: string;
  initial: (UserInput & { id?: number }) | null;
  onSubmit: (data: UserInput) => Promise<void> | void;
  onCancel: () => void;
}) {
  const [username, setUsername] = useState(initial?.username ?? '');
  const [email, setEmail] = useState(initial?.email ?? '');
  const [role, setRole] = useState(initial?.role ?? 'user');
  const [saving, setSaving] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await onSubmit({
        username: username.trim(),
        email: email || undefined,
        role: role || undefined,
      });
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={submit} style={{ display: 'grid', gap: 12 }}>
      <h3 style={{ margin: 0 }}>{title}</h3>

      <label style={{ display: 'grid', gap: 6 }}>
        <span>Usuário*</span>
        <input value={username} onChange={(e) => setUsername(e.target.value)} required />
      </label>

      <label style={{ display: 'grid', gap: 6 }}>
        <span>E-mail</span>
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
      </label>

      <label style={{ display: 'grid', gap: 6 }}>
        <span>Perfil</span>
        <select value={role} onChange={(e) => setRole(e.target.value)}>
          <option value="user">user</option>
          <option value="admin">admin</option>
        </select>
      </label>

      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
        <button type="button" className="btn" onClick={onCancel}>
          Cancelar
        </button>
        <button type="submit" className="btn" disabled={!username || saving}>
          {saving ? 'Salvando…' : 'Salvar'}
        </button>
      </div>
    </form>
  );
}

/* ---------- Modal de Pedidos por Usuário ---------- */
function UserOrders({ userId, username }: { userId: number; username: string }) {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const limit = 10;

  // usa o filtro userId → o api.ts mapeia também como customerId
  const { data, isLoading, error, isFetching } = useOrders({
    page,
    limit,
    userId,
  });

  const total = data?.total ?? 0;
  const items = data?.items ?? [];
  const totalPages = Math.max(1, Math.ceil(total / limit));

  return (
    <div style={{ display: 'grid', gap: 12 }}>
      <h3 style={{ margin: 0 }}>Pedidos de {username}</h3>

      {error && (
        <div className="card" role="alert" style={{ borderColor: '#dc2626' }}>
          Falha ao carregar pedidos.
        </div>
      )}

      {isLoading ? (
        <div className="card">Carregando…</div>
      ) : items.length === 0 ? (
        <div className="card">Nenhum pedido encontrado.</div>
      ) : (
        <>
          <div style={{ display: 'grid', gap: 8 }}>
            {items.map((o: Order) => (
              <div
                key={o.id}
                className="card"
                onClick={() => navigate(`/orders/${o.id}`)}
                style={{ display: 'grid', gap: 4, cursor: 'pointer' }}
                title="Ver detalhes do pedido"
              >
                <div>
                  <strong>#{o.id}</strong> {o.code ? `• ${o.code}` : ''}
                </div>
                <div style={{ opacity: 0.8, fontSize: 12 }}>
                  Status: {o.status} • Total:{' '}
                  {typeof o.total === 'number'
                    ? new Intl.NumberFormat('pt-BR', {
                        style: 'currency',
                        currency: 'BRL',
                      }).format(o.total)
                    : '—'}
                </div>
              </div>
            ))}
          </div>

          <div
            style={{
              display: 'flex',
              gap: 8,
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <small style={{ opacity: 0.75 }}>
              {total} pedido(s) {isFetching && '• atualizando…'}
            </small>
            <Pagination
              page={page}
              setPage={setPage}
              totalPages={totalPages}
            />
          </div>
        </>
      )}
    </div>
  );
}

/* ---------- UI auxiliares ---------- */
function Pagination({
  page,
  setPage,
  totalPages,
}: {
  page: number;
  setPage: (n: number) => void;
  totalPages: number;
}) {
  return (
    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
      <button
        className="btn"
        onClick={() => page > 1 && setPage(page - 1)}
        disabled={page <= 1}
      >
        ◀
      </button>
      <span>
        Página {page} de {totalPages}
      </span>
      <button
        className="btn"
        onClick={() => page < totalPages && setPage(page + 1)}
        disabled={page >= totalPages}
      >
        ▶
      </button>
    </div>
  );
}

function Modal({
  children,
  onClose,
}: {
  children: React.ReactNode;
  onClose: () => void;
}) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,.45)',
        display: 'grid',
        placeItems: 'center',
        padding: 16,
        zIndex: 50,
      }}
    >
      <div
        className="card"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: 'min(720px,96vw)',
          padding: 16,
          display: 'grid',
          gap: 12,
        }}
      >
        {children}
      </div>
    </div>
  );
}

/* ---------- Ícones ---------- */
function PencilIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" {...props}>
      <path
        d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25z"
        stroke="currentColor"
        strokeWidth="1.5"
        fill="currentColor"
      />
      <path
        d="M20.71 7.04a1 1 0 0 0 0-1.41l-2.34-2.34a1 1 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"
        fill="currentColor"
      />
    </svg>
  );
}
function CloseIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" {...props}>
      <path
        d="M18 6L6 18M6 6l12 12"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}
function OrdersIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" {...props}>
      <path
        d="M7 4h10a2 2 0 0 1 2 2v13l-4-2-4 2-4-2-4 2V6a2 2 0 0 1 2-2h2z"
        fill="currentColor"
        opacity=".15"
      />
      <path
        d="M7 4h10a2 2 0 0 1 2 2v13l-4-2-4 2-4-2-4 2V6a2 2 0 0 1 2-2h2z"
        stroke="currentColor"
        strokeWidth="1.5"
        fill="none"
      />
    </svg>
  );
}

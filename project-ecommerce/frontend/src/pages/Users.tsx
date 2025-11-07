import { useEffect, useState } from 'react';
import { useUsers } from '@/features/users/hooks';
import type { User } from '@/features/users/api';
import { useOrders } from '@/features/orders/hooks';

/* helper de moeda */
const brl = (n: number | null | undefined) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(n ?? 0);

export default function UsersPage() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState('');

  const { data, isLoading, error } = useUsers({ page, limit, search });

  const users: User[] = data?.items ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / limit));

  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  return (
    <div style={{ display: 'grid', gap: 16 }}>
      <header style={{ display: 'flex', gap: 12, alignItems: 'center', justifyContent: 'space-between' }}>
        <h2 style={{ margin: 0 }}>Usuários</h2>
        <div style={{ display: 'flex', gap: 8 }}>
          <input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Buscar por nome ou e-mail"
            style={{ minWidth: 240 }}
          />
          <select value={String(limit)} onChange={(e) => setLimit(Number(e.target.value))}>
            <option value="10">10 / pág.</option>
            <option value="20">20 / pág.</option>
            <option value="50">50 / pág.</option>
          </select>
        </div>
      </header>

      {error ? (
        <div className="card" role="alert" style={{ borderColor: '#dc2626' }}>
          <strong>Erro:</strong> {(error as any)?.message || 'Falha ao carregar usuários.'}
        </div>
      ) : isLoading ? (
        <div className="card">Carregando…</div>
      ) : users.length === 0 ? (
        <div className="card">Nenhum usuário.</div>
      ) : (
        <section className="card" style={{ padding: 0 }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ textAlign: 'left' }}>
                <th style={{ padding: '12px 16px' }}>ID</th>
                <th style={{ padding: '12px 16px' }}>Nome</th>
                <th style={{ padding: '12px 16px' }}>E-mail</th>
                <th style={{ padding: '12px 16px' }}>Telefone</th>
                <th style={{ padding: '12px 16px' }}>Criado</th>
                <th style={{ padding: '12px 16px' }} />
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} style={{ borderTop: '1px solid var(--muted)' }}>
                  <td style={{ padding: '12px 16px' }}>{u.id}</td>
                  <td style={{ padding: '12px 16px' }}>{u.name}</td>
                  <td style={{ padding: '12px 16px' }}>{u.email}</td>
                  <td style={{ padding: '12px 16px' }}>{u.phone || '—'}</td>
                  <td style={{ padding: '12px 16px' }}>
                    {u.createdAt ? new Date(u.createdAt).toLocaleString() : '—'}
                  </td>
                  <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                    <button className="btn" onClick={() => setSelectedUser(u)}>
                      Ver pedidos
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}

      <footer style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <button className="btn" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1}>
          ◀
        </button>
        <span style={{ minWidth: 120, textAlign: 'center' }}>
          Página {page} de {totalPages}
        </span>
        <button className="btn" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page >= totalPages}>
          ▶
        </button>
      </footer>

      {selectedUser && (
        <OrdersDialog user={selectedUser} onClose={() => setSelectedUser(null)} />
      )}
    </div>
  );
}

/* ============== Dialog com pedidos filtrados por customerId ============== */
function OrdersDialog({ user, onClose }: { user: User; onClose: () => void }) {
  const [page, setPage] = useState(1);
  const limit = 10;

  // 👇 ESSENCIAL: Filtra no front usando customerId = user.id
  const { data, isLoading, error } = useOrders({
    page,
    limit,
    customerId: user.id,
  });

  const items = data?.items ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / limit));

  useEffect(() => {
    setPage(1);
  }, [user.id]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.45)',
        display: 'grid',
        placeItems: 'center',
        padding: 16,
        zIndex: 50,
      }}
    >
      <div
        className="card"
        onClick={(e) => e.stopPropagation()}
        style={{ width: 'min(860px, 96vw)', padding: 16, display: 'grid', gap: 12 }}
      >
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ margin: 0 }}>Pedidos de {user.name} (ID {user.id})</h3>
          <button className="btn" onClick={onClose} aria-label="Fechar">Fechar</button>
        </header>

        {error ? (
          <div className="card" role="alert" style={{ borderColor: '#dc2626' }}>
            <strong>Erro:</strong> {(error as any)?.message || 'Falha ao carregar pedidos.'}
          </div>
        ) : isLoading ? (
          <div className="card">Carregando…</div>
        ) : items.length === 0 ? (
          <div className="card">Nenhum pedido para este usuário.</div>
        ) : (
          <section className="card" style={{ padding: 0 }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ textAlign: 'left' }}>
                  <th style={{ padding: '12px 16px' }}>Pedido</th>
                  <th style={{ padding: '12px 16px' }}>Status</th>
                  <th style={{ padding: '12px 16px' }}>Itens</th>
                  <th style={{ padding: '12px 16px' }}>Subtotal</th>
                  <th style={{ padding: '12px 16px' }}>Criado</th>
                </tr>
              </thead>
              <tbody>
                {items.map((o) => (
                  <tr key={o.id} style={{ borderTop: '1px solid var(--muted)' }}>
                    <td style={{ padding: '12px 16px' }}>#{o.id}</td>
                    <td style={{ padding: '12px 16px' }}>{o.status}</td>
                    <td style={{ padding: '12px 16px' }}>{o.totalItems ?? o.items?.length ?? 0}</td>
                    <td style={{ padding: '12px 16px' }}>{brl(o.subtotal)}</td>
                    <td style={{ padding: '12px 16px' }}>
                      {o.createdAt ? new Date(o.createdAt).toLocaleString() : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        )}

        <footer style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <button className="btn" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1}>
            ◀
          </button>
          <span style={{ minWidth: 120, textAlign: 'center' }}>
            Página {page} de {totalPages}
          </span>
          <button className="btn" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page >= totalPages}>
            ▶
          </button>
        </footer>
      </div>
    </div>
  );
}

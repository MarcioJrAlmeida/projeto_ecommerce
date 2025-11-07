import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  useOrders,
  useUpdateOrder,
  useDeleteOrder,
} from '@/features/orders/hooks';
import type { Order, OrderQuery } from '@/features/orders/api';

export default function OrdersPage() {
  const navigate = useNavigate();

  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(12);
  const [deletingId, setDeletingId] = useState<number | null>(null); // ⬅️ NEW

  const q = useMemo<OrderQuery>(
    () => ({
      search: search || undefined,
      status: status || undefined,
      page,
      limit,
    }),
    [search, status, page, limit]
  );

  const { data, isLoading, isFetching, error } = useOrders(q);
  const updateMut = useUpdateOrder();
  const deleteMut = useDeleteOrder();

  useEffect(() => {
    setPage(1);
  }, [search, status, limit]);

  const total = data?.total ?? 0;
  const items = data?.items ?? [];
  const totalPages = Math.max(1, Math.ceil(total / (q.limit ?? 12)));

  async function handleDelete(e: React.MouseEvent, id: number) {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm(`Excluir pedido #${id}?`)) return;
    try {
      setDeletingId(id);
      await deleteMut.mutateAsync(id);
    } catch (err) {
      console.error('Falha ao excluir pedido:', err);
      alert('Não foi possível excluir o pedido. Verifique o backend e tente novamente.');
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div style={{ display: 'grid', gap: 16 }}>
      <header
        style={{
          display: 'flex',
          gap: 8,
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
        }}
      >
        <h2 style={{ margin: 0 }}>Pedidos</h2>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por código/cliente…"
            className="input"
          />
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="input"
          >
            <option value="">Todos</option>
            <option value="pending">Pendente</option>
            <option value="paid">Pago</option>
            <option value="shipped">Enviado</option>
            <option value="cancelled">Cancelado</option>
          </select>
          <select
            value={String(limit)}
            onChange={(e) => setLimit(Number(e.target.value))}
            className="input"
          >
            <option value="6">6 / pág.</option>
            <option value="12">12 / pág.</option>
            <option value="24">24 / pág.</option>
          </select>
        </div>
      </header>

      {error && (
        <div className="card" role="alert" style={{ borderColor: '#dc2626' }}>
          Falha ao carregar pedidos.
        </div>
      )}

      {isLoading ? (
        <div className="card">Carregando…</div>
      ) : (
        <>
          <div style={{ display: 'grid', gap: 12 }}>
            {items.map((o: Order) => {
              const totalFmt =
                typeof o.total === 'number'
                  ? new Intl.NumberFormat('pt-BR', {
                      style: 'currency',
                      currency: 'BRL',
                    }).format(o.total)
                  : '—';

              return (
                <div
                  key={o.id}
                  className="card"
                  onClick={() => navigate(`/orders/${o.id}`)}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr auto',
                    alignItems: 'center',
                    cursor: 'pointer',
                  }}
                  title="Ver detalhes do pedido"
                >
                  <div>
                    <div>
                      <strong>#{o.id}</strong> {o.code ? `• ${o.code}` : ''}
                    </div>
                    <div style={{ opacity: 0.8, fontSize: 12 }}>
                      Status: {o.status} • Total: {totalFmt}
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    {/* impedir que o select dispare a navegação */}
                    <select
                      value={o.status}
                      onClick={(e) => e.stopPropagation()}
                      onChange={(e) => {
                        e.stopPropagation();
                        updateMut.mutate({
                          id: o.id,
                          data: { status: e.target.value },
                        });
                      }}
                      className="input"
                    >
                      <option value="pending">pending</option>
                      <option value="paid">paid</option>
                      <option value="shipped">shipped</option>
                      <option value="cancelled">cancelled</option>
                    </select>

                    {/* botão de excluir robusto */}
                    <button
                      type="button"                          // ⬅️ importante
                      className="btn"
                      title="Excluir"
                      onClick={(e) => handleDelete(e, o.id)} // ⬅️ para await + stopPropagation
                      disabled={deletingId === o.id || deleteMut.isPending}
                      style={{
                        width: 40,
                        minWidth: 40,
                        padding: 8,
                        color: 'var(--danger,#ef4444)',
                        borderColor: 'var(--danger,#ef4444)',
                        opacity: deletingId === o.id ? 0.6 : 1,
                        cursor:
                          deletingId === o.id ? 'not-allowed' : 'pointer',
                      }}
                    >
                      {deletingId === o.id ? '…' : <CloseIcon />}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <footer
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <small style={{ opacity: 0.7 }}>
              {total} pedido(s) {isFetching && '• atualizando…'}
            </small>
            <Pagination page={page} setPage={setPage} totalPages={totalPages} />
          </footer>
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

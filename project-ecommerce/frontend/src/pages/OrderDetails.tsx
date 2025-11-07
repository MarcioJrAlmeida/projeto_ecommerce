import { useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useOrder } from '@/features/orders/hooks';
import type { OrderItem } from '@/features/orders/api';

export default function OrderDetailsPage() {
  const { id } = useParams();
  const orderId = useMemo(() => (id ? Number(id) : undefined), [id]);
  const { data, isLoading, error, isFetching } = useOrder(orderId);

  if (isLoading) return <div className="card">Carregando pedido…</div>;
  if (error) return <div className="card" style={{ borderColor: '#dc2626' }}>Falha ao carregar o pedido.</div>;
  if (!data) return <div className="card">Pedido não encontrado.</div>;

  const totalFmt =
    typeof data.total === 'number'
      ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(data.total)
      : '—';

  return (
    <div style={{ display: 'grid', gap: 16 }}>
      <header style={{ display: 'flex', gap: 12, alignItems: 'baseline', justifyContent: 'space-between', flexWrap: 'wrap' }}>
        <div>
          <h2 style={{ margin: 0 }}>
            Pedido #{data.id} {data.code ? <small style={{ opacity: .7 }}>• {data.code}</small> : null}
          </h2>
          <div style={{ opacity: .8, fontSize: 13 }}>
            Status: <strong>{data.status}</strong> {isFetching && '• atualizando…'}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <Link to="/orders" className="btn">Voltar aos pedidos</Link>
        </div>
      </header>

      <section className="card" style={{ display: 'grid', gap: 12 }}>
        <h3 style={{ margin: 0 }}>Resumo</h3>
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          <Info label="ID">{data.id}</Info>
          {data.code ? <Info label="Código">{data.code}</Info> : null}
          <Info label="Status">{data.status}</Info>
          <Info label="Total">{totalFmt}</Info>
        </div>
      </section>

      <section className="card" style={{ display: 'grid', gap: 12 }}>
        <h3 style={{ margin: 0 }}>Itens</h3>

        {(!data.items || data.items.length === 0) ? (
          <div style={{ opacity: .8 }}>Pedido sem itens.</div>
        ) : (
          <div style={{ display: 'grid', gap: 8 }}>
            {data.items.map((it: OrderItem) => {
              const unitFmt =
                typeof it.unitPrice === 'number'
                  ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(it.unitPrice)
                  : '—';
              const lineFmt =
                typeof it.lineTotal === 'number'
                  ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(it.lineTotal)
                  : '—';
              const img =
                it.product?.imageUrl ||
                'https://via.placeholder.com/64x64.png?text=%20';

              return (
                <div key={it.id} style={{ display: 'grid', gridTemplateColumns: '64px 1fr auto', gap: 12, alignItems: 'center', border: '1px solid var(--muted)', borderRadius: 8, padding: 8 }}>
                  <img src={img} alt={it.product?.name ?? 'Produto'} width={64} height={64} style={{ objectFit: 'cover', borderRadius: 8 }} />
                  <div>
                    <div style={{ fontWeight: 600 }}>{it.product?.name ?? `Item ${it.id}`}</div>
                    <div style={{ opacity: .8, fontSize: 12 }}>
                      Quantidade: <strong>{it.quantity}</strong> • Unit.: {unitFmt}
                    </div>
                  </div>
                  <div style={{ justifySelf: 'end', fontWeight: 600 }}>{lineFmt}</div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}

function Info({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="card" style={{ padding: 8 }}>
      <div style={{ fontSize: 11, opacity: .7, textTransform: 'uppercase' }}>{label}</div>
      <div>{children}</div>
    </div>
  );
}

import { useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { http } from '@/lib/http';

type RawProduct = {
  id: number;
  name?: string;
  title?: string;
  price?: number | string;
  image?: string | null;
  imageUrl?: string | null;
  category?: string | { id?: number; name?: string };
};

function toNumber(v: unknown): number | null {
  if (v == null) return null;
  if (typeof v === 'number') return Number.isFinite(v) ? v : null;
  if (typeof v === 'string') {
    const n = Number(v.replace?.(',', '.') ?? v);
    return Number.isFinite(n) ? n : null;
  }
  return null;
}

function normalizeProduct(p: RawProduct) {
  const name = p.name ?? p.title ?? `Produto ${p.id}`;
  const img = p.imageUrl ?? p.image ?? null;
  const price = toNumber(p.price) ?? 0;
  const category =
    typeof p.category === 'string'
      ? p.category
      : p.category?.name ?? '—';
  return { id: p.id, name, imageUrl: img, price, category };
}

export default function ProductDetailsPage() {
  const { id } = useParams();
  const pid = useMemo(() => (id ? Number(id) : NaN), [id]);

  const { data, isLoading, error, isFetching } = useQuery({
    queryKey: ['product', pid],
    enabled: Number.isFinite(pid),
    queryFn: async () => {
      const { data } = await http.get<RawProduct>(`/products/${pid}`);
      return normalizeProduct(data);
    },
  });

  if (!Number.isFinite(pid)) {
    return <div className="card">ID de produto inválido.</div>;
  }

  if (isLoading) return <div className="card">Carregando produto…</div>;
  if (error) return <div className="card" style={{ borderColor: '#dc2626' }}>Falha ao carregar produto.</div>;
  if (!data) return <div className="card">Produto não encontrado.</div>;

  const priceFmt = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(data.price);

  return (
    <div style={{ display: 'grid', gap: 16 }}>
      <header
        style={{
          display: 'flex',
          gap: 12,
          alignItems: 'baseline',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
        }}
      >
        <div>
          <h2 style={{ margin: 0 }}>{data.name}</h2>
          <div style={{ opacity: 0.8, fontSize: 13 }}>
            {isFetching ? 'Atualizando…' : 'Detalhes do produto'}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <Link to="/catalog" className="btn">Voltar ao catálogo</Link>
          <Link to="/cart" className="btn">Ir ao carrinho</Link>
        </div>
      </header>

      <section className="card" style={{ display: 'grid', gap: 16, gridTemplateColumns: 'minmax(240px, 360px) 1fr' }}>
        <div style={{ display: 'grid', placeItems: 'center', background: 'var(--panel,#0f0f0f0a)', borderRadius: 8, padding: 12 }}>
          <img
            src={data.imageUrl || 'https://via.placeholder.com/480x480.png?text=%20'}
            alt={data.name}
            style={{ maxWidth: '100%', maxHeight: 420, objectFit: 'contain', borderRadius: 8 }}
          />
        </div>

        <div style={{ display: 'grid', gap: 12 }}>
          <div>
            <div style={{ fontSize: 12, opacity: 0.7, textTransform: 'uppercase' }}>Categoria</div>
            <div style={{ fontWeight: 600 }}>{data.category}</div>
          </div>

          <div>
            <div style={{ fontSize: 12, opacity: 0.7, textTransform: 'uppercase' }}>Preço unitário</div>
            <div style={{ fontSize: 20, fontWeight: 700 }}>{priceFmt}</div>
          </div>
        </div>
      </section>
    </div>
  );
}

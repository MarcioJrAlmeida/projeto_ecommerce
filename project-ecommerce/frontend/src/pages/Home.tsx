import { Link } from 'react-router-dom';
import { useProducts } from '@/features/products/hooks';
import type { Product } from '@/features/products/api';

function formatBRL(v: number) {
  try {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      maximumFractionDigits: 2,
    }).format(v);
  } catch {
    return `R$ ${v.toFixed(2)}`;
  }
}

export default function Home() {
  const { data, isLoading, isFetching, error } = useProducts({
    page: 1,
    limit: 6,
    sort: 'createdAt.desc',
    active: true,
  });

  const items = data?.items ?? [];

  return (
    <div style={{ display: 'grid', gap: 24 }}>
      {/* HERO */}
      <section
        className="card"
        style={{
          padding: 24,
          display: 'grid',
          gap: 12,
          alignItems: 'center',
        }}
      >
        <h2 style={{ margin: 0, fontSize: 28, lineHeight: 1.2 }}>
          Bem-vindo(a) ao <span style={{ opacity: 0.85 }}>E-commerce</span>
        </h2>
        <p style={{ margin: '6px 0 0', opacity: 0.8 }}>
          Explore nosso catálogo e encontre as melhores ofertas.
        </p>
        <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
          <Link to="/catalog" className="btn">
            Ver catálogo
          </Link>
          <Link to="/cart" className="btn">
            Ir para o carrinho
          </Link>
        </div>
      </section>

      {/* DESTAQUES */}
      <section style={{ display: 'grid', gap: 12 }}>
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ margin: 0 }}>Destaques</h3>
          <Link to="/catalog" style={{ opacity: 0.9 }}>
            Ver tudo →
          </Link>
        </header>

        {error ? (
          <div className="card" role="alert" style={{ borderColor: '#dc2626' }}>
            <strong>Erro:</strong>{' '}
            {(error as any)?.response?.data?.message ||
              (error as Error).message ||
              'Falha ao carregar destaques.'}
          </div>
        ) : isLoading ? (
          <div className="card">Carregando destaques…</div>
        ) : (
          <>
            <FeaturedGrid items={items} />
            <div style={{ textAlign: 'right', fontSize: 12, opacity: 0.75 }}>
              {isFetching ? 'Atualizando…' : null}
            </div>
          </>
        )}
      </section>
    </div>
  );
}

function FeaturedGrid({ items }: { items: Product[] }) {
  if (!items.length) {
    return (
      <div className="card" style={{ textAlign: 'center' }}>
        Nenhum destaque no momento.
      </div>
    );
  }

  return (
    <div
      style={{
        display: 'grid',
        gap: 16,
        gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
      }}
    >
      {items.map((p) => (
        <article key={p.id} className="card" style={{ display: 'grid', gap: 8 }}>
          <div
            style={{
              aspectRatio: '4/3',
              borderRadius: 8,
              border: '1px dashed var(--muted)',
              display: 'grid',
              placeItems: 'center',
              fontSize: 12,
              opacity: 0.7,
              overflow: 'hidden',
            }}
          >
            {p.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={p.imageUrl}
                alt={p.name}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            ) : (
              'Sem imagem'
            )}
          </div>

          <header>
            <h4 style={{ margin: 0, fontSize: 16, lineHeight: 1.3 }}>{p.name}</h4>
            {typeof p.price === 'number' && (
              <div style={{ marginTop: 4, opacity: 0.85 }}>{formatBRL(p.price)}</div>
            )}
          </header>

          <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
            <Link to={`/product/${p.id}`} className="btn" style={{ textAlign: 'center', flex: 1 }}>
              Ver detalhes
            </Link>
            <button
              className="btn"
              style={{ flex: 1 }}
              onClick={() => alert(`Adicionar ao carrinho: ${p.name}`)}
            >
              Adicionar
            </button>
          </div>
        </article>
      ))}
    </div>
  );
}

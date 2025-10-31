import { useMemo, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useProduct } from '@/features/products/hooks';

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

export default function ProductDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: product, isLoading, isFetching, error } = useProduct(id);

  const [qty, setQty] = useState(1);
  const canAdd = useMemo(() => qty > 0 && Number.isFinite(qty), [qty]);

  if (error) {
    return (
      <div className="card" role="alert" style={{ borderColor: '#dc2626' }}>
        <strong>Erro:</strong>{' '}
        {(error as any)?.response?.data?.message ||
          (error as Error).message ||
          'Falha ao carregar produto.'}
        <div style={{ marginTop: 12 }}>
          <button className="btn" onClick={() => navigate(-1)}>Voltar</button>
        </div>
      </div>
    );
  }

  if (isLoading || !product) {
    return <div className="card">Carregando produto…</div>;
  }

  return (
    <div style={{ display: 'grid', gap: 16 }}>
      {/* Breadcrumb simples */}
      <nav style={{ fontSize: 14, opacity: 0.85 }}>
        <Link to="/">Início</Link> &nbsp;/&nbsp; <Link to="/catalog">Catálogo</Link> &nbsp;/&nbsp;{' '}
        <span style={{ opacity: 0.8 }}>{product.name}</span>
        {isFetching ? <span style={{ marginLeft: 8, opacity: 0.6 }}>· atualizando…</span> : null}
      </nav>

      <section
        className="card"
        style={{
          display: 'grid',
          gap: 16,
          gridTemplateColumns: 'minmax(260px, 520px) 1fr',
        }}
      >
        {/* Imagem */}
        <div
          style={{
            border: '1px dashed var(--muted)',
            borderRadius: 12,
            overflow: 'hidden',
            aspectRatio: '4/3',
            display: 'grid',
            placeItems: 'center',
          }}
        >
          {product.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={product.imageUrl}
              alt={product.name}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          ) : (
            <span style={{ opacity: 0.6 }}>Sem imagem</span>
          )}
        </div>

        {/* Info */}
        <div style={{ display: 'grid', gap: 12, alignContent: 'start' }}>
          <header>
            <h2 style={{ margin: 0 }}>{product.name}</h2>
            <div style={{ marginTop: 6, fontSize: 14, opacity: 0.8 }}>
              {product.category?.name ? (
                <>
                  Categoria:{' '}
                  <span style={{ opacity: 0.9 }}>{product.category.name}</span>
                </>
              ) : (
                '—'
              )}
            </div>
          </header>

          {typeof product.price === 'number' && (
            <div
              style={{
                fontSize: 22,
                fontWeight: 600,
                marginTop: 4,
              }}
            >
              {formatBRL(product.price)}
            </div>
          )}

          {product.description ? (
            <p style={{ margin: '8px 0 0', opacity: 0.9, lineHeight: 1.5 }}>
              {product.description}
            </p>
          ) : (
            <p style={{ margin: '8px 0 0', opacity: 0.7 }}>Sem descrição.</p>
          )}

          {/* Comprar */}
          <div
            style={{
              display: 'flex',
              gap: 8,
              alignItems: 'center',
              marginTop: 8,
            }}
          >
            <label style={{ fontSize: 14, opacity: 0.9 }}>
              Qtde:
              <input
                type="number"
                min={1}
                value={qty}
                onChange={(e) => setQty(Math.max(1, Number(e.target.value)))}
                style={{
                  marginLeft: 8,
                  width: 80,
                  background: 'var(--soft)',
                  color: 'var(--fg)',
                  border: '1px solid var(--muted)',
                  borderRadius: 8,
                  padding: '6px 8px',
                }}
              />
            </label>

            <button
              className="btn"
              disabled={!canAdd}
              onClick={() =>
                alert(`Adicionar ao carrinho: ${product.name} (x${qty})`)
              }
              style={{ padding: '10px 14px' }}
            >
              Adicionar ao carrinho
            </button>

            <Link to="/cart" className="btn" style={{ padding: '10px 14px' }}>
              Ir para o carrinho
            </Link>
          </div>

          {/* Metadados simples */}
          <div
            style={{
              display: 'grid',
              gap: 6,
              marginTop: 12,
              fontSize: 12,
              opacity: 0.75,
            }}
          >
            {product.sku ? <div>SKU: {product.sku}</div> : null}
            {product.updatedAt ? (
              <div>
                Atualizado:{' '}
                {new Date(product.updatedAt).toLocaleString('pt-BR')}
              </div>
            ) : null}
          </div>
        </div>
      </section>

      <div>
        <Link to="/catalog" className="btn">
          ← Voltar ao catálogo
        </Link>
      </div>
    </div>
  );
}
ss
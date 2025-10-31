import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  useProducts,
} from '@/features/products/hooks';
import type { ProductQuery, Product } from '@/features/products/api';

/** Formata preço em BRL sem depender de helpers externos */
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

/** Debounce para evitar requisições a cada tecla digitada */
function useDebounced<T>(value: T, delay = 400) {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return v;
}

export default function Catalog() {
  // filtros locais
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<ProductQuery['sort']>('createdAt.desc');
  const [limit, setLimit] = useState(12);
  const [page, setPage] = useState(1);

  const debouncedSearch = useDebounced(search, 500);

  // query param estável
  const query = useMemo<ProductQuery>(() => {
    return {
      page,
      limit,
      sort,
      search: debouncedSearch || undefined,
      // categoryId, minPrice, maxPrice, active podem ser adicionados depois
    };
  }, [page, limit, sort, debouncedSearch]);

  const { data, isLoading, isFetching, error } = useProducts(query);

  const total = data?.total ?? 0;
  const items = data?.items ?? [];
  const totalPages = Math.max(1, Math.ceil(total / (query.limit ?? 12)));

  // quando mudar busca/ordenacao/limit, sempre volta para página 1
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, sort, limit]);

  return (
    <div style={{ display: 'grid', gap: 16 }}>
      <header style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center', justifyContent: 'space-between' }}>
        <h2 style={{ margin: 0 }}>Catálogo</h2>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar produtos…"
            style={{
              background: 'var(--soft)',
              color: 'var(--fg)',
              border: '1px solid var(--muted)',
              borderRadius: 8,
              padding: '8px 10px',
              minWidth: 220,
            }}
          />
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as ProductQuery['sort'])}
            style={{
              background: 'var(--soft)',
              color: 'var(--fg)',
              border: '1px solid var(--muted)',
              borderRadius: 8,
              padding: '8px 10px',
            }}
          >
            <option value="createdAt.desc">Mais recentes</option>
            <option value="createdAt.asc">Mais antigos</option>
            <option value="price.asc">Preço: menor → maior</option>
            <option value="price.desc">Preço: maior → menor</option>
            <option value="name.asc">Nome A-Z</option>
            <option value="name.desc">Nome Z-A</option>
          </select>

          <select
            value={String(limit)}
            onChange={(e) => setLimit(Number(e.target.value))}
            style={{
              background: 'var(--soft)',
              color: 'var(--fg)',
              border: '1px solid var(--muted)',
              borderRadius: 8,
              padding: '8px 10px',
            }}
          >
            <option value="6">6 / página</option>
            <option value="12">12 / página</option>
            <option value="24">24 / página</option>
            <option value="48">48 / página</option>
          </select>
        </div>
      </header>

      {error ? (
        <div className="card" role="alert" style={{ borderColor: '#dc2626' }}>
          <strong>Erro:</strong>{' '}
          {(error as any)?.response?.data?.message || (error as Error).message || 'Falha ao buscar produtos.'}
        </div>
      ) : null}

      {isLoading ? (
        <div className="card">Carregando produtos…</div>
      ) : (
        <>
          <Grid items={items} />

          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: 12,
              marginTop: 4,
            }}
          >
            <small style={{ opacity: 0.75 }}>
              {total > 0
                ? `Mostrando ${items.length} de ${total} resultado${total > 1 ? 's' : ''}`
                : 'Nenhum resultado'}
              {isFetching && !isLoading ? ' • atualizando…' : ''}
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

function Grid({ items }: { items: Product[] }) {
  if (!items.length) {
    return (
      <div className="card" style={{ textAlign: 'center' }}>
        Nada por aqui ainda.
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
            <h3 style={{ margin: 0, fontSize: 16, lineHeight: 1.3 }}>{p.name}</h3>
            {typeof p.price === 'number' && (
              <div style={{ marginTop: 4, opacity: 0.85 }}>{formatBRL(p.price)}</div>
            )}
          </header>

          <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
            <Link
              to={`/product/${p.id}`}
              className="btn"
              style={{ textAlign: 'center', flex: 1 }}
            >
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

function Pagination({
  page,
  setPage,
  totalPages,
}: {
  page: number;
  setPage: (n: number) => void;
  totalPages: number;
}) {
  const canPrev = page > 1;
  const canNext = page < totalPages;

  return (
    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
      <button
        className="btn"
        onClick={() => canPrev && setPage(page - 1)}
        disabled={!canPrev}
        aria-label="Página anterior"
      >
        ◀
      </button>
      <span style={{ minWidth: 120, textAlign: 'center' }}>
        Página {page} de {totalPages}
      </span>
      <button
        className="btn"
        onClick={() => canNext && setPage(page + 1)}
        disabled={!canNext}
        aria-label="Próxima página"
      >
        ▶
      </button>
    </div>
  );
}

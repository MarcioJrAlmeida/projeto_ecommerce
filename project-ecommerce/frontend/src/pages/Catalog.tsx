import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useProducts } from '@/features/products/hooks';
import type { ProductQuery, Product } from '@/features/products/api';
import { useAuth } from '@/features/auth/store';
import { ProductForm } from '@/features/products/components/ProductForm';
import { useCreateProduct, useDeleteProduct, useUpdateProduct } from '@/features/products/hooks';

/** Formata preço em BRL */
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

/** Debounce */
function useDebounced<T>(value: T, delay = 400) {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return v;
}

export default function Catalog() {
  const { user } = useAuth();
  const isAdmin = user?.username === 'admin';

  // filtros locais (mantidos)
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<ProductQuery['sort']>('createdAt.desc');
  const [limit, setLimit] = useState(12);
  const [page, setPage] = useState(1);

  const debouncedSearch = useDebounced(search, 500);

  // estado do modal/edição
  const [openForm, setOpenForm] = useState<null | { mode: 'create' } | { mode: 'edit'; product: Product }>(null);

  // query param estável (mantido)
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

  // mutações CRUD (somente se admin usar)
  const createMutation = useCreateProduct();
  const updateMutation = useUpdateProduct();
  const deleteMutation = useDeleteProduct();

  // quando mudar filtros, volta pra 1 (mantido)
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

          {/* Botão Adicionar só para admin */}
          {isAdmin && (
            <button
              className="btn"
              onClick={() => setOpenForm({ mode: 'create' })}
              style={{
                background: 'var(--primary, #2563eb)',
                borderColor: 'var(--primary, #2563eb)',
                color: '#fff',
              }}
            >
              + Adicionar produto
            </button>
          )}

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
          <Grid
            items={items}
            isAdmin={isAdmin}
            onEdit={(p) => setOpenForm({ mode: 'edit', product: p })}
            onDelete={async (p) => {
              if (!confirm(`Excluir "${p.name}"?`)) return;
              try {
                await deleteMutation.mutateAsync(p.id);
              } catch (e: any) {
                alert(e?.message || 'Falha ao excluir.');
              }
            }}
          />

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

            <Pagination page={page} setPage={setPage} totalPages={totalPages} />
          </div>
        </>
      )}

      {/* Modal de formulário (create/edit) */}
      {openForm && (
        <Modal onClose={() => setOpenForm(null)}>
          {openForm.mode === 'create' ? (
            <ProductForm
              title="Novo produto"
              initial={null}
              onCancel={() => setOpenForm(null)}
              onSubmit={async (payload) => {
                try {
                  await createMutation.mutateAsync(payload);
                  setOpenForm(null);
                } catch (e: any) {
                  alert(e?.message || 'Falha ao criar produto.');
                }
              }}
            />
          ) : (
            <ProductForm
              title="Editar produto"
              initial={openForm.product}
              onCancel={() => setOpenForm(null)}
              onSubmit={async (payload) => {
                try {
                  await updateMutation.mutateAsync({ id: openForm.product.id, data: payload });
                  setOpenForm(null);
                } catch (e: any) {
                  alert(e?.message || 'Falha ao salvar produto.');
                }
              }}
            />
          )}
        </Modal>
      )}
    </div>
  );
}

function Grid({
  items,
  isAdmin,
  onEdit,
  onDelete,
}: {
  items: Product[];
  isAdmin: boolean;
  onEdit: (p: Product) => void;
  onDelete: (p: Product) => void;
}) {
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
              <img src={p.imageUrl} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              'Sem imagem'
            )}
          </div>

          <header>
            <h3 style={{ margin: 0, fontSize: 16, lineHeight: 1.3 }}>{p.name}</h3>
            {typeof p.price === 'number' && <div style={{ marginTop: 4, opacity: 0.85 }}>{formatBRL(p.price)}</div>}
            {p.category ? <div style={{ fontSize: 12, opacity: 0.8, marginTop: 4 }}>Categoria: {p.category}</div> : null}
          </header>

          <div style={{ display: 'flex', gap: 8, marginTop: 4, flexWrap: 'wrap' }}>
            <Link to={`/product/${p.id}`} className="btn" style={{ textAlign: 'center', flex: 1 }}>
              Ver detalhes
            </Link>
            <button className="btn" style={{ flex: 1 }} onClick={() => alert(`Adicionar ao carrinho: ${p.name}`)}>
              Adicionar
            </button>

            {/* Ações de admin */}
            {isAdmin && (
              <div style={{ display: 'flex', gap: 8, flex: 1, justifyContent: 'flex-end' }}>
                {/* Editar (lápis) */}
                <button
                  className="btn"
                  title="Editar"
                  aria-label={`Editar ${p.name}`}
                  onClick={() => onEdit(p)}
                  style={{
                    padding: 8,
                    width: 40,
                    minWidth: 40,
                    display: 'grid',
                    placeItems: 'center',
                  }}
                >
                  <PencilIcon />
                </button>
                
                {/* Excluir (X vermelho) */}
                <button
                  className="btn"
                  title="Excluir"
                  aria-label={`Excluir ${p.name}`}
                  onClick={() => onDelete(p)}
                  style={{
                    padding: 8,
                    width: 40,
                    minWidth: 40,
                    display: 'grid',
                    placeItems: 'center',
                    borderColor: 'var(--danger, #ef4444)',
                    color: 'var(--danger, #ef4444)',
                  }}
                >
                  <CloseIcon />
                </button>
              </div>
            )}

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
      <button className="btn" onClick={() => canPrev && setPage(page - 1)} disabled={!canPrev} aria-label="Página anterior">
        ◀
      </button>
      <span style={{ minWidth: 120, textAlign: 'center' }}>
        Página {page} de {totalPages}
      </span>
      <button className="btn" onClick={() => canNext && setPage(page + 1)} disabled={!canNext} aria-label="Próxima página">
        ▶
      </button>
    </div>
  );
}

function Modal({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
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
        style={{ width: 'min(720px, 96vw)', padding: 16, display: 'grid', gap: 12 }}
      >
        {children}
      </div>
    </div>
  );
}

function PencilIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" {...props}>
      <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25z" stroke="currentColor" strokeWidth="1.5" fill="currentColor" />
      <path d="M20.71 7.04a1 1 0 0 0 0-1.41l-2.34-2.34a1 1 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" fill="currentColor" />
    </svg>
  );
}

function CloseIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" {...props}>
      <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

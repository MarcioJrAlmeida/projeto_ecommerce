import { Link } from 'react-router-dom';
import { useCart } from '@/app/cart/useCart';

export default function CartPage() {
  const { state, setQty, remove, clear, totalItems, totalValue } = useCart();

  return (
    <div style={{ display: 'grid', gap: 16 }}>
      <header style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <h2 style={{ margin: 0 }}>Carrinho</h2>
        <div style={{ display: 'flex', gap: 8 }}>
          <Link to="/catalog" className="btn">Continuar comprando</Link>
          {state.items.length > 0 && (
            <button className="btn" onClick={clear} title="Esvaziar carrinho">
              Esvaziar
            </button>
          )}
        </div>
      </header>

      {state.items.length === 0 ? (
        <div className="card">Seu carrinho está vazio.</div>
      ) : (
        <>
          <div style={{ display: 'grid', gap: 12 }}>
            {state.items.map((it) => {
              const unitFmt = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(it.price);
              const lineFmt = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(it.price * it.qty);

              return (
                <div key={it.productId} className="card" style={{ display: 'grid', gridTemplateColumns: '64px 1fr auto', gap: 12, alignItems: 'center' }}>
                  <img
                    src={it.imageUrl || 'https://via.placeholder.com/64x64.png?text=%20'}
                    alt={it.name}
                    width={64}
                    height={64}
                    style={{ objectFit: 'cover', borderRadius: 8 }}
                  />
                  <div>
                    <div style={{ fontWeight: 600 }}>{it.name}</div>
                    <div style={{ opacity: 0.8, fontSize: 12 }}>
                      Unit.: {unitFmt} • Quantidade:
                      <input
                        type="number"
                        min={1}
                        value={it.qty}
                        onChange={(e) => setQty(it.productId, Math.max(1, Number(e.target.value)))}
                        style={{ width: 72, marginLeft: 8 }}
                      />
                    </div>
                  </div>
                  <div style={{ display: 'grid', gap: 8, justifyItems: 'end' }}>
                    <div style={{ fontWeight: 600 }}>{lineFmt}</div>
                    <button
                      className="btn"
                      title="Remover"
                      onClick={() => remove(it.productId)}
                      style={{ color: 'var(--danger,#ef4444)', borderColor: 'var(--danger,#ef4444)' }}
                    >
                      Remover
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <footer className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div><strong>{totalItems}</strong> item(ns)</div>
            </div>
            <div style={{ display: 'grid', gap: 6, justifyItems: 'end' }}>
              <div>
                Total:{' '}
                <strong>
                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalValue)}
                </strong>
              </div>
              <button className="btn" disabled>
                Finalizar compra (em breve)
              </button>
            </div>
          </footer>
        </>
      )}
    </div>
  );
}

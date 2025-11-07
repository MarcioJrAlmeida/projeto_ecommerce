import { Link } from 'react-router-dom';
import { useState, useMemo } from 'react';
import { useCart } from '@/app/cart/useCart';

function brl(n: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(n || 0);
}

export default function CartPage() {
  const { state, inc, dec, setQty, remove, clear, totalItems, subtotal, freight, total } = useCart();

  // cupom simples no front
  const [coupon, setCoupon] = useState<string>('');
  const couponDiscount = useMemo(() => {
    const code = coupon.trim().toUpperCase();
    if (!code) return 0;
    if (code === 'FIRST10') return Math.min(subtotal * 0.1, 100); // 10% até 100
    if (code === 'FRETEGRATIS') return freight; // zera frete
    return 0;
  }, [coupon, subtotal, freight]);

  const grandTotal = Math.max(0, subtotal + freight - couponDiscount);

  return (
    <div style={{ display: 'grid', gap: 16 }}>
      <header style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
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
        <div className="card">
          Seu carrinho está vazio. <Link to="/catalog">Ver catálogo</Link>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: 16, gridTemplateColumns: '1fr minmax(280px, 360px)' }}>
          {/* Lista de itens */}
          <section className="card" style={{ display: 'grid', gap: 12 }}>
            {state.items.map((it) => {
              const unit = brl(it.price);
              const line = brl(it.price * it.qty);
              return (
                <div key={it.productId} style={{ display: 'grid', gridTemplateColumns: '64px 1fr auto', gap: 12, alignItems: 'center' }}>
                  <img
                    src={it.imageUrl || 'https://via.placeholder.com/64x64.png?text=%20'}
                    alt={it.name}
                    width={64}
                    height={64}
                    style={{ objectFit: 'cover', borderRadius: 8 }}
                  />
                  <div>
                    <div style={{ fontWeight: 600 }}>{it.name}</div>
                    <div style={{ opacity: 0.8, fontSize: 12 }}>Unit.: {unit}</div>

                    {/* Stepper */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 6 }}>
                      <button className="btn" onClick={() => dec(it.productId)} aria-label="Diminuir">−</button>
                      <input
                        type="number"
                        min={1}
                        value={it.qty}
                        onChange={(e) => setQty(it.productId, Math.max(1, Number(e.target.value)))}
                        style={{ width: 72 }}
                      />
                      <button className="btn" onClick={() => inc(it.productId)} aria-label="Aumentar">+</button>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gap: 8, justifyItems: 'end' }}>
                    <div style={{ fontWeight: 600 }}>{line}</div>
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
          </section>

          {/* Resumo */}
          <aside className="card" style={{ display: 'grid', gap: 12, alignSelf: 'start' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Itens</span>
              <strong>{totalItems}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Subtotal</span>
              <strong>{brl(subtotal)}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Frete</span>
              <strong>{freight === 0 ? 'Grátis' : brl(freight)}</strong>
            </div>

            {/* Cupom */}
            <div style={{ borderTop: '1px dashed var(--muted)', paddingTop: 12, display: 'grid', gap: 8 }}>
              <label style={{ fontSize: 12, opacity: 0.8 }}>Cupom</label>
              <div style={{ display: 'flex', gap: 8 }}>
                <input
                  value={coupon}
                  onChange={(e) => setCoupon(e.target.value)}
                  placeholder="FIRST10 ou FRETEGRATIS"
                  style={{ flex: 1, border: '1px solid var(--muted)', borderRadius: 8, padding: '8px 10px', background: 'var(--soft)', color: 'var(--fg)' }}
                />
              </div>
              {couponDiscount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--success,#16a34a)' }}>
                  <span>Desconto</span>
                  <strong>-{brl(couponDiscount)}</strong>
                </div>
              )}
            </div>

            <div style={{ borderTop: '1px dashed var(--muted)', paddingTop: 12, display: 'flex', justifyContent: 'space-between' }}>
              <span>Total</span>
              <strong style={{ fontSize: 18 }}>{brl(grandTotal)}</strong>
            </div>

            <button className="btn" disabled title="Em breve">Finalizar compra</button>
          </aside>
        </div>
      )}
    </div>
  );
}

import { useCart } from '../cart/CartContext';
import { Link, useNavigate } from 'react-router-dom';

export default function CartPage() {
  const { items, setQty, remove, total } = useCart();
  const nav = useNavigate();
  return (
    <div style={{padding:16}}>
      <h1>Carrinho</h1>
      {items.length===0 && <p>Vazio. <Link to="/">Ir ao catálogo</Link></p>}
      {items.map(it=>(
        <div key={it.product.id} style={{display:'flex', gap:16, alignItems:'center', borderBottom:'1px solid #eee', padding:'8px 0'}}>
          <img src={it.product.imageUrl} style={{width:80,height:80,objectFit:'cover'}}/>
          <div style={{flex:1}}>
            <div>{it.product.name}</div>
            <div>R$ {Number(it.product.price).toFixed(2)}</div>
          </div>
          <input type="number" min={1} value={it.qty} onChange={e=>setQty(it.product.id, Number(e.target.value))} style={{width:64}}/>
          <button onClick={()=>remove(it.product.id)}>Remover</button>
        </div>
      ))}
      {items.length>0 && (
        <div style={{marginTop:12}}>
          <h3>Total: R$ {total.toFixed(2)}</h3>
          <button onClick={()=>nav('/checkout')}>Ir para o pagamento</button>
        </div>
      )}
    </div>
  );
}

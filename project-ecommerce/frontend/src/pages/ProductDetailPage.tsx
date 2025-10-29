import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../api';
import type { Product } from '../types';
import { useCart } from '../cart/CartContext';

export default function ProductDetailPage() {
  const { id } = useParams();
  const [p, setP] = useState<Product | null>(null);
  const { add } = useCart();
  useEffect(()=>{ api.get<Product>(`/products/${id}`).then(r=>setP(r.data)); }, [id]);
  if (!p) return <div style={{padding:16}}>Carregando...</div>;
  return (
    <div style={{display:'flex', gap:24, padding:16}}>
      <img src={p.imageUrl} alt={p.name} style={{width:360, height:360, objectFit:'cover'}}/>
      <div>
        <h2>{p.name}</h2>
        <div style={{fontSize:24, margin:'8px 0'}}>R$ {Number(p.price).toFixed(2)}</div>
        <p>{p.description}</p>
        <div>Estoque: {p.stock}</div>
        <button onClick={()=>add(p,1)} disabled={!p.active || p.stock<=0}>Adicionar ao carrinho</button>
      </div>
    </div>
  );
}

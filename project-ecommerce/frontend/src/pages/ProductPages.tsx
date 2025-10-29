import { useEffect, useState } from 'react';
import { api } from '../api';
import type { Category, Paged, Product } from '../types';
import { Link } from 'react-router-dom';
import { useCart } from '../cart/CartContext';

export default function ProductsPage() {
  const [data, setData] = useState<Paged<Product> | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [q, setQ] = useState({ search:'', categoryId:'', minPrice:'', maxPrice:'', page:1, limit:12, sort:'id:desc' });
  const { add } = useCart();

  const fetchData = async () => {
    const params:any = { page:q.page, limit:q.limit, sort:q.sort };
    if (q.search) params.search = q.search;
    if (q.categoryId) params.categoryId = Number(q.categoryId);
    if (q.minPrice) params.minPrice = q.minPrice;
    if (q.maxPrice) params.maxPrice = q.maxPrice;
    const res = await api.get<Paged<Product>>('/products', { params });
    setData(res.data);
  };

  useEffect(() => { api.get<Category[]>('/categories').then(r=>setCategories(r.data)); }, []);
  useEffect(() => { fetchData(); }, [q]);

  return (
    <div style={{padding:16}}>
      <h1>Produtos</h1>
      {/* filtros */}
      <div style={{display:'grid', gridTemplateColumns:'1fr 1fr 1fr 1fr 1fr', gap:8, marginBottom:12}}>
        <input placeholder="buscar..." value={q.search} onChange={e=>setQ({...q, search:e.target.value, page:1})}/>
        <select value={q.categoryId} onChange={e=>setQ({...q, categoryId:e.target.value, page:1})}>
          <option value="">Todas categorias</option>
          {categories.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <input placeholder="mín R$" value={q.minPrice} onChange={e=>setQ({...q, minPrice:e.target.value, page:1})}/>
        <input placeholder="máx R$" value={q.maxPrice} onChange={e=>setQ({...q, maxPrice:e.target.value, page:1})}/>
        <select value={q.sort} onChange={e=>setQ({...q, sort:e.target.value})}>
          <option value="id:desc">Mais recentes</option>
          <option value="price:asc">Preço ↑</option>
          <option value="price:desc">Preço ↓</option>
          <option value="name:asc">Nome A→Z</option>
          <option value="name:desc">Nome Z→A</option>
        </select>
      </div>

      {/* grid */}
      <div style={{display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12}}>
        {data?.data.map(p=>(
          <div key={p.id} style={{border:'1px solid #eee', padding:12, borderRadius:8}}>
            <Link to={`/product/${p.id}`}>
              <img src={p.imageUrl} alt={p.name} style={{width:'100%', height:160, objectFit:'cover'}}/>
              <h3>{p.name}</h3>
            </Link>
            <div>R$ {Number(p.price).toFixed(2)}</div>
            <button onClick={()=>add(p,1)} disabled={!p.active || p.stock<=0}>Adicionar</button>
          </div>
        ))}
      </div>

      {/* paginação */}
      <div style={{marginTop:12, display:'flex', gap:8}}>
        <button disabled={q.page<=1} onClick={()=>setQ({...q, page:q.page-1})}>◀</button>
        <span>Página {q.page} / {data?.meta.totalPages ?? 1}</span>
        <button disabled={q.page>=(data?.meta.totalPages ?? 1)} onClick={()=>setQ({...q, page:q.page+1})}>▶</button>
      </div>
    </div>
  );
}

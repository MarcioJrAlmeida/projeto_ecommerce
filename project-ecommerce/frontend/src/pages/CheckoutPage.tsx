import { type FormEvent, useState } from 'react';
import { api } from '../api';
import { useCart } from '../cart/CartContext';
import { useNavigate } from 'react-router-dom';
import type { Customer, Order } from '../types';

export default function CheckoutPage() {
  const { items, clear } = useCart();
  const nav = useNavigate();
  const [customer, setCustomer] = useState({ name:'', email:'' });
  const [loading, setLoading] = useState(false);
  const disabled = items.length===0 || !customer.name || !customer.email;

  const submit = async (e: FormEvent) => {
    e.preventDefault(); if (disabled) return;
    setLoading(true);
    try {
      // cria cliente (ou poderia buscar existente por email)
      const c = (await api.post<Customer>('/customers', { ...customer })).data;
      // cria pedido
      let order = (await api.post<Order>('/orders', { customerId: c.id })).data;
      // adiciona itens
      for (const it of items) {
        await api.post(`/orders/${order.id}/items`, { productId: it.product.id, quantity: it.qty });
      }
      // pagar
      order = (await api.post<Order>(`/orders/${order.id}/pay`)).data;
      clear();
      alert(`Pedido #${order.id} pago! Total R$ ${order.total}`);
      nav('/');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{padding:16}}>
      <h1>Checkout</h1>
      <form onSubmit={submit} style={{display:'grid', gap:8, maxWidth:420}}>
        <input placeholder="Nome" value={customer.name} onChange={e=>setCustomer({...customer, name:e.target.value})}/>
        <input type="email" placeholder="E-mail" value={customer.email} onChange={e=>setCustomer({...customer, email:e.target.value})}/>
        <button disabled={disabled || loading}>{loading?'Processando...':'Finalizar pagamento'}</button>
      </form>
    </div>
  );
}

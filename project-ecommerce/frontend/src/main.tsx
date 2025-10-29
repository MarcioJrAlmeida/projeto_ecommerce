import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { CartProvider, useCart } from './cart/CartContext';
import ProductsPage from './pages/ProductPages';
import ProductDetailPage from './pages/ProductDetailPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import './index.css';

function Navbar() {
  const { items, total } = useCart();
  const count = items.reduce((a,b)=>a+b.qty,0);
  return (
    <nav style={{display:'flex',gap:16,padding:12,background:'#111',color:'#fff'}}>
      <Link to="/" style={{color:'#fff'}}>Catálogo</Link>
      <Link to="/cart" style={{color:'#fff'}}>Carrinho ({count}) - R$ {total.toFixed(2)}</Link>
    </nav>
  );
}

function App() {
  return (
    <CartProvider>
      <Navbar/>
      <Routes>
        <Route path="/" element={<ProductsPage/>}/>
        <Route path="/product/:id" element={<ProductDetailPage/>}/>
        <Route path="/cart" element={<CartPage/>}/>
        <Route path="/checkout" element={<CheckoutPage/>}/>
      </Routes>
    </CartProvider>
  );
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter><App/></BrowserRouter>
  </React.StrictMode>
);

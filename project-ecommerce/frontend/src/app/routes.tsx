import { lazy, Suspense } from 'react';
import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
} from 'react-router-dom';

// Páginas reais (lazy)
const Home = lazy(() => import('@/pages/Home'));
const Catalog = lazy(() => import('@/pages/Catalog'));
const ProductDetails = lazy(() => import('@/pages/ProductDetails'));

// Placeholders temporários (substituiremos quando criarmos as páginas)
const Cart = lazy(async () => ({
  default: () => (
    <Page title="Carrinho">
      <p>Itens do carrinho, subtotal e ações.</p>
    </Page>
  ),
}));

const Checkout = lazy(async () => ({
  default: () => (
    <Page title="Checkout">
      <p>Fluxo de cliente → pedido → pagamento.</p>
    </Page>
  ),
}));

const NotFound = () => (
  <Page title="404">
    <p>Página não encontrada.</p>
  </Page>
);

// Shell/layout simples para reutilizar
function Page({
  title,
  children,
}: {
  title: string;
  children?: React.ReactNode;
}) {
  return (
    <div style={{ padding: 24, maxWidth: 960, margin: '0 auto' }}>
      <header style={{ marginBottom: 24 }}>
        <h1 style={{ margin: 0 }}>{title}</h1>
        <p style={{ margin: '8px 0 0', opacity: 0.7 }}>
          (Substitua estes placeholders pelos componentes reais quando criarmos as páginas.)
        </p>
      </header>
      <main>{children}</main>
      <footer style={{ marginTop: 48, opacity: 0.6 }}>© {new Date().getFullYear()} E-commerce</footer>
    </div>
  );
}

const router = createBrowserRouter([
  {
    path: '/',
    element: (
      <Suspense fallback={<div style={{ padding: 24 }}>Carregando…</div>}>
        <Home />
      </Suspense>
    ),
  },
  {
    path: '/catalog',
    element: (
      <Suspense fallback={<div style={{ padding: 24 }}>Carregando catálogo…</div>}>
        <Catalog />
      </Suspense>
    ),
  },
  {
    path: '/product/:id',
    element: (
      <Suspense fallback={<div style={{ padding: 24 }}>Carregando produto…</div>}>
        <ProductDetails />
      </Suspense>
    ),
  },
  {
    path: '/cart',
    element: (
      <Suspense fallback={<div style={{ padding: 24 }}>Carregando carrinho…</div>}>
        <Cart />
      </Suspense>
    ),
  },
  {
    path: '/checkout',
    element: (
      <Suspense fallback={<div style={{ padding: 24 }}>Carregando checkout…</div>}>
        <Checkout />
      </Suspense>
    ),
  },
  { path: '/home', element: <Navigate to="/" replace /> },
  { path: '*', element: <NotFound /> },
]);

export default function AppRoutes() {
  return <RouterProvider router={router} />;
}

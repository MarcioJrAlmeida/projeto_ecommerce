import { lazy, Suspense } from 'react';
import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
} from 'react-router-dom';

/**
 * Para manter este arquivo auto-contido (e evitar imports de páginas que ainda não existem),
 * uso componentes mínimos in-line como fallbacks. Depois podemos trocar por imports reais.
 */

// Lazy placeholders (você poderá substituir por arquivos reais, ex.: `lazy(() => import('@/pages/Home'))`)
const Home = lazy(async () => ({
  default: () => (
    <Page title="Home">
      <p>Bem-vindo(a) ao E-commerce. 🚀</p>
    </Page>
  ),
}));

const Catalog = lazy(async () => ({
  default: () => (
    <Page title="Catálogo">
      <p>Lista de produtos com filtros virá aqui.</p>
    </Page>
  ),
}));

const ProductDetails = lazy(async () => ({
  default: () => (
    <Page title="Produto">
      <p>Detalhes do produto selecionado.</p>
    </Page>
  ),
}));

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
    <div style={{ fontFamily: 'system-ui, sans-serif', padding: 24, maxWidth: 960, margin: '0 auto' }}>
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

/**
 * Componente raiz de rotas.
 * Depois, no `src/main.tsx`, você poderá trocar o conteúdo atual por:
 *
 *   createRoot(root).render(
 *     <StrictMode>
 *       <AppRoutes />
 *     </StrictMode>
 *   );
 */
export default function AppRoutes() {
  return <RouterProvider router={router} />;
}

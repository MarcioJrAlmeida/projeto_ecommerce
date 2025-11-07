import { lazy, Suspense } from 'react';
import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
  Outlet,
  Link,
} from 'react-router-dom';
import RequireAuth from '@/features/auth/RequireAuth';
import AccountButton from '../components/AccountButton';
import { useTheme } from './providers/Theme';

// Páginas reais (lazy)
const Home = lazy(() => import('@/pages/Home'));
const Catalog = lazy(() => import('@/pages/Catalog'));
const ProductDetails = lazy(() => import('@/pages/ProductDetails'));
const Login = lazy(() => import('@/pages/Login'));
const Profile = lazy(() => import('@/pages/Profile'));

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

// Shell/layout simples para placeholders reutilizáveis
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

/** ⬇️ Novo: Layout raiz com SEU header original (dentro do Router) */
function RootLayout() {
  const { theme, toggleTheme } = useTheme();
  const year = new Date().getFullYear();

  return (
    <div
      style={{
        minHeight: '100dvh',
        display: 'flex',
        flexDirection: 'column',
        background: 'var(--bg)',
        color: 'var(--fg)',
      }}
    >
      <header
        style={{
          borderBottom: '1px solid var(--muted)',
          padding: '12px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'sticky',
          top: 0,
          backdropFilter: 'blur(6px)',
        }}
      >
        <div className="container" style={{ display: 'flex', gap: 16, alignItems: 'center', justifyContent: 'space-between' }}>
          <strong style={{ letterSpacing: 0.3 }}>
            <Link to="/" style={{ color: 'inherit', textDecoration: 'none' }}>E-commerce</Link>
          </strong>
          <div style={{ display: 'flex', gap: 8 }}>
            <Link to="/catalog" className="btn">Catálogo</Link>
            <Link to="/cart" className="btn">Carrinho</Link>
            <button className="btn" onClick={toggleTheme} aria-label="Alternar tema">
              {theme === 'dark' ? '🌙 Dark' : '☀️ Light'}
            </button>
            <AccountButton />
          </div>
        </div>
      </header>

      <main style={{ flex: 1 }}>
        <div className="container" style={{ padding: '24px 0' }}>
          <Suspense fallback={<div style={{ padding: 24 }}>Carregando…</div>}>
            <Outlet />
          </Suspense>
        </div>
      </main>

      <footer
        style={{
          borderTop: '1px solid var(--muted)',
          padding: '12px 24px',
          fontSize: 12,
          opacity: 0.7,
        }}
      >
        <div className="container">© {year} E-commerce — frontend em desenvolvimento</div>
      </footer>
    </div>
  );
}

const router = createBrowserRouter([
  {
    element: <RootLayout />, // <-- Tudo abaixo fica DENTRO do Router + seu header
    children: [
      {
        path: '/',
        element: <Home />,
      },
      {
        path: '/catalog',
        element: <Catalog />,
      },
      {
        path: '/product/:id',
        element: <ProductDetails />,
      },
      // público
      {
        path: '/login',
        element: <Login />,
      },
      // protegidas
      {
        path: '/profile',
        element: (
          <RequireAuth>
            <Profile />
          </RequireAuth>
        ),
      },
      {
        path: '/checkout',
        element: (
          <RequireAuth>
            <Checkout />
          </RequireAuth>
        ),
      },
      // outros
      {
        path: '/cart',
        element: <Cart />,
      },
      { path: '/home', element: <Navigate to="/" replace /> },
      { path: '*', element: <NotFound /> },
    ],
  },
]);

export default function AppRoutes() {
  return <RouterProvider router={router} />;
}

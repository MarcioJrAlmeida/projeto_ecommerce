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
import { useCart } from './cart/useCart'; // ⬅️ novo


// Páginas reais (lazy)
const Home = lazy(() => import('@/pages/Home'));
const Catalog = lazy(() => import('@/pages/Catalog'));
const ProductDetails = lazy(() => import('@/pages/ProductDetails'));
const Login = lazy(() => import('@/pages/Login'));
const Profile = lazy(() => import('@/pages/Profile'));
const UsersPage = lazy(() => import('@/pages/Users')); // ⬅️ NOVO
const OrdersPage = lazy(() => import('@/pages/Orders'));        // se já existir
const OrderDetailsPage = lazy(() => import('@/pages/OrderDetails')); // ⬅️ NOVO
const Cart = lazy(() => import('@/pages/Cart')); // ⬅️ troque o placeholder anterior



// Placeholders temporários (substituiremos quando criarmos as páginas)

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

/** Layout raiz com seu header original (dentro do Router) */
export function RootLayout() {
  const { theme, toggleTheme } = useTheme();
  const { totalItems } = useCart();
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
          zIndex: 10,
        }}
      >
        <div
          className="container"
          style={{
            display: 'flex',
            gap: 16,
            alignItems: 'center',
            justifyContent: 'space-between',
            width: '100%',
          }}
        >
          <strong style={{ letterSpacing: 0.3 }}>
            <Link to="/" style={{ color: 'inherit', textDecoration: 'none' }}>
              E-commerce
            </Link>
          </strong>

          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <Link to="/catalog" className="btn">
              Catálogo
            </Link>

            <Link to="/cart" className="btn" style={{ position: 'relative' }}>
              Carrinho
              {totalItems > 0 && (
                <span
                  style={{
                    position: 'absolute',
                    top: -6,
                    right: -6,
                    minWidth: 18,
                    height: 18,
                    borderRadius: 999,
                    padding: '0 6px',
                    background: 'var(--primary,#2563eb)',
                    color: '#fff',
                    fontSize: 11,
                    display: 'grid',
                    placeItems: 'center',
                  }}
                  aria-label={`${totalItems} itens no carrinho`}
                >
                  {totalItems}
                </span>
              )}
            </Link>

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
      { path: '/', element: <Home /> },
      { path: '/catalog', element: <Catalog /> },
      { path: '/product/:id', element: <ProductDetails /> },

      // público
      { path: '/login', element: <Login /> },

      // página de usuários (sem guardas, como você pediu)
      { path: '/users', element: <UsersPage /> }, // ⬅️ NOVA ROTA

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
      { path: '/cart', element: <Cart /> },
      { path: '/home', element: <Navigate to="/" replace /> },
      { path: '*', element: <NotFound /> },
      { path: '/orders', element: <OrdersPage /> },           // se ainda não estiver
      { path: '/orders/:id', element: <OrderDetailsPage /> }, // ⬅️ NOVA ROTA
      

    ],
  },
]);

export default function AppRoutes() {
  return <RouterProvider router={router} />;
}

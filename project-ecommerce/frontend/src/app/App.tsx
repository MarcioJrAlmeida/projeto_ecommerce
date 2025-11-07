import { useMemo } from 'react';
import AppRoutes from './routes';
import QueryProvider from './providers/Query';
import { ThemeProvider } from './providers/Theme';
import { CartProvider } from './cart/CartContext'; // ⬅️ novo import


function Shell() {
  const year = useMemo(() => new Date().getFullYear(), []);
  // Header e footer reais agora vivem no RootLayout (dentro do Router)

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
      {/* O Router + header estão em routes.tsx */}
      <main style={{ flex: 1 }}>
        <div className="container" style={{ padding: '0' }}>
          <AppRoutes />
        </div>
      </main>
      {/* Rodapé está no RootLayout, para manter consistência visual entre páginas */}
    </div>
  );
}

export default function App() {
  return (
    <QueryProvider>
      <ThemeProvider>
        <CartProvider> {/* ⬅️ novo wrapper */}
          <AppRoutes />
        </CartProvider>
      </ThemeProvider>
    </QueryProvider>
  );
}
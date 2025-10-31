import { useMemo } from 'react';
import AppRoutes from './routes';
import QueryProvider from './providers/Query';
import { ThemeProvider, useTheme } from './providers/Theme';

function Shell() {
  const year = useMemo(() => new Date().getFullYear(), []);
  const { theme, toggleTheme } = useTheme();

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
          <strong style={{ letterSpacing: 0.3 }}>E-commerce</strong>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn" onClick={toggleTheme} aria-label="Alternar tema">
              {theme === 'dark' ? '🌙 Dark' : '☀️ Light'}
            </button>
          </div>
        </div>
      </header>

      <main style={{ flex: 1 }}>
        <div className="container" style={{ padding: '24px 0' }}>
          {/* O RouterProvider vive dentro de AppRoutes */}
          <AppRoutes />
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

export default function App() {
  return (
    <QueryProvider>
      <ThemeProvider>
        <Shell />
      </ThemeProvider>
    </QueryProvider>
  );
}

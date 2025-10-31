import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from 'react';

type Theme = 'light' | 'dark';
type ThemeCtx = {
  theme: Theme;
  setTheme: (t: Theme) => void;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeCtx | null>(null);

const THEME_KEY = 'theme';

function applyThemeVars(theme: Theme) {
  const root = document.documentElement;
  root.setAttribute('data-theme', theme);

  if (theme === 'dark') {
    root.style.setProperty('--bg', '#0b1020');
    root.style.setProperty('--fg', '#e6e8ef');
    root.style.setProperty('--muted', '#1d2442');
    root.style.setProperty('--soft', 'rgba(255,255,255,0.08)');
    root.style.setProperty('--link', '#8ab4ff');
  } else {
    root.style.setProperty('--bg', '#f8fafc');
    root.style.setProperty('--fg', '#0b1020');
    root.style.setProperty('--muted', '#e2e8f0');
    root.style.setProperty('--soft', 'rgba(0,0,0,0.06)');
    root.style.setProperty('--link', '#1d4ed8');
  }
}

export function ThemeProvider({ children }: PropsWithChildren) {
  const [theme, setThemeState] = useState<Theme>(() => {
    const saved = localStorage.getItem(THEME_KEY) as Theme | null;
    if (saved === 'light' || saved === 'dark') return saved;
    const prefersDark = window.matchMedia?.('(prefers-color-scheme: dark)').matches;
    return prefersDark ? 'dark' : 'light';
  });

  useEffect(() => {
    applyThemeVars(theme);
    localStorage.setItem(THEME_KEY, theme);
  }, [theme]);

  useEffect(() => {
    // CSS base mínima (uma vez)
    const id = 'app-base-styles';
    if (document.getElementById(id)) return;

    const style = document.createElement('style');
    style.id = id;
    style.innerHTML = `
      :root {
        --bg: #0b1020;
        --fg: #e6e8ef;
        --muted: #1d2442;
        --soft: rgba(255,255,255,0.08);
        --link: #8ab4ff;
      }
      * { box-sizing: border-box; }
      html, body, #root { height: 100%; }
      body {
        margin: 0;
        background: var(--bg);
        color: var(--fg);
        font-family: system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, 'Helvetica Neue', Arial, 'Noto Sans', 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol';
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
      }
      a { color: var(--link); text-decoration: none; }
      hr { border: none; height: 1px; background: var(--muted); opacity: .5; }
      .container { max-width: 1200px; margin: 0 auto; padding: 0 24px; }
      .card {
        border: 1px solid var(--muted);
        background: color-mix(in oklab, var(--bg) 92%, black);
        border-radius: 12px;
        padding: 16px;
      }
      .btn {
        border: 1px solid var(--muted);
        background: var(--soft);
        color: var(--fg);
        border-radius: 10px;
        padding: 8px 12px;
        cursor: pointer;
      }
      .btn:hover { opacity: .9; }
    `;
    document.head.appendChild(style);
  }, []);

  const api = useMemo<ThemeCtx>(
    () => ({
      theme,
      setTheme: (t) => setThemeState(t),
      toggleTheme: () => setThemeState((prev) => (prev === 'dark' ? 'light' : 'dark')),
    }),
    [theme]
  );

  return <ThemeContext.Provider value={api}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}

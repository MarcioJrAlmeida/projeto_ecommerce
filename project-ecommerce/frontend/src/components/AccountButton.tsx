import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/features/auth/store';

export default function AccountButton() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const nav = useNavigate();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!ref.current) return;
      if (!ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('click', onDoc);
    return () => document.removeEventListener('click', onDoc);
  }, []);

  if (!user) {
    return (
      <Link to="/login" className="btn" title="Entrar" aria-label="Entrar">
        {/* silhueta simples */}
        <span style={{ fontSize: 16 }}>👤</span>
      </Link>
    );
  }

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button className="btn" onClick={() => setOpen((v) => !v)} aria-haspopup="menu" aria-expanded={open}>
        👤 <span style={{ marginLeft: 6, opacity: 0.85 }}>{user.username}</span>
      </button>
      {open && (
        <div
          role="menu"
          className="card"
          style={{
            position: 'absolute',
            right: 0,
            marginTop: 8,
            minWidth: 180,
            display: 'grid',
            gap: 6,
            zIndex: 10,
          }}
        >
          <Link to="/profile" className="btn">Meu perfil</Link>
          <button
            className="btn"
            onClick={() => {
              logout();
              setOpen(false);
              nav('/login');
            }}
          >
            Sair
          </button>
        </div>
      )}
    </div>
  );
}

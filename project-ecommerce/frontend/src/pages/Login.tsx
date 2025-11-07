import { FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/features/auth/store';

export default function Login() {
  const nav = useNavigate();
  const { login } = useAuth();
  const [usernameOrEmail, setUsernameOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!usernameOrEmail || !password) return alert('Preencha usuário/e-mail e senha.');
    try {
      setSubmitting(true);
      await login(usernameOrEmail.trim(), password);
      nav('/'); // sucesso → home
    } catch (err: any) {
      alert(err?.message || 'Falha ao entrar.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div style={{ display: 'grid', placeItems: 'center', minHeight: '60dvh' }}>
      <form onSubmit={onSubmit} className="card" style={{ width: 360, display: 'grid', gap: 12, padding: 24 }}>
        <h2 style={{ margin: 0, textAlign: 'center' }}>Entrar</h2>

        <label style={{ display: 'grid', gap: 6 }}>
          <span style={{ fontSize: 12, opacity: 0.8 }}>Usuário ou e-mail</span>
          <input
            value={usernameOrEmail}
            onChange={(e) => setUsernameOrEmail(e.target.value)}
            placeholder="admin ou admin@admin.com"
            autoComplete="username"
            style={{ background: 'var(--soft)', color: 'var(--fg)', border: '1px solid var(--muted)', borderRadius: 8, padding: '8px 10px' }}
          />
        </label>

        <label style={{ display: 'grid', gap: 6 }}>
          <span style={{ fontSize: 12, opacity: 0.8 }}>Senha</span>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="admin123"
            autoComplete="current-password"
            style={{ background: 'var(--soft)', color: 'var(--fg)', border: '1px solid var(--muted)', borderRadius: 8, padding: '8px 10px' }}
          />
        </label>

        <button className="btn" type="submit" disabled={submitting} style={{ width: '100%' }}>
          {submitting ? 'Entrando…' : 'Entrar'}
        </button>

        <div style={{ textAlign: 'center', fontSize: 12 }}>
          <Link to="/">← Voltar</Link>
        </div>
      </form>
    </div>
  );
}
import { useAuth } from '@/features/auth/store';

export default function Profile() {
  const { user, logout } = useAuth();

  if (!user) {
    return (
      <div className="card">
        <strong>Você não está logado(a).</strong>
      </div>
    );
  }

  return (
    <div className="card" style={{ maxWidth: 520, margin: '0 auto', display: 'grid', gap: 12 }}>
      <h2 style={{ margin: 0 }}>Meu perfil</h2>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '120px 1fr',
          gap: 8,
          alignItems: 'center',
        }}
      >
        <div style={{ opacity: 0.7 }}>Usuário</div>
        <div><strong>{user.username}</strong></div>

        <div style={{ opacity: 0.7 }}>E-mail</div>
        <div>—</div>

        <div style={{ opacity: 0.7 }}>Status</div>
        <div>Conectado</div>
      </div>

      <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
        <button className="btn" onClick={logout}>Sair</button>
      </div>
    </div>
  );
}

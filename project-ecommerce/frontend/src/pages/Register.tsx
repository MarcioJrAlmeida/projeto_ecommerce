import { FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { registerUser } from '@/features/auth/api';

export default function Register() {
  const nav = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');   // ainda não persiste no back
  const [password, setPassword] = useState(''); // ainda não persiste no back
  const [confirm, setConfirm] = useState('');   // ainda não persiste no back
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!name || !email) return alert('Preencha nome e e-mail.');

    // Mantemos a validação de senha/confirm, mesmo sem persistir, para futura integração
    if ((password || confirm) && password !== confirm) {
      return alert('Senha e confirmação não conferem.');
    }

    try {
      setSubmitting(true);
      await registerUser({
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim() || undefined,
        address: address.trim() || undefined, // coletado, mas não enviado
        password,                             // coletado, mas não enviado
      });
      alert('Cadastro realizado! Faça login para continuar.\nObservação: senha e endereço ainda não são salvos no backend atual.');
      nav('/login');
    } catch (err: any) {
      alert(err?.response?.data?.message || err?.message || 'Falha ao cadastrar.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div style={{ display: 'grid', placeItems: 'center', minHeight: '60dvh' }}>
      <form onSubmit={onSubmit} className="card" style={{ width: 420, display: 'grid', gap: 12, padding: 24 }}>
        <h2 style={{ margin: 0, textAlign: 'center' }}>Criar conta</h2>

        <label style={{ display: 'grid', gap: 6 }}>
          <span style={{ fontSize: 12, opacity: 0.8 }}>Nome completo</span>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Seu nome" />
        </label>

        <label style={{ display: 'grid', gap: 6 }}>
          <span style={{ fontSize: 12, opacity: 0.8 }}>E-mail</span>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="voce@email.com" />
        </label>

        <label style={{ display: 'grid', gap: 6 }}>
          <span style={{ fontSize: 12, opacity: 0.8 }}>Telefone (opcional)</span>
          <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="(00) 90000-0000" />
        </label>

        {/* Campos coletados mas ainda não persistidos no back */}
        <label style={{ display: 'grid', gap: 6 }}>
          <span style={{ fontSize: 12, opacity: 0.8 }}>Endereço (linha livre)</span>
          <input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Rua, nº, bairro, cidade/UF" />
        </label>

        <div style={{ display: 'grid', gap: 8, gridTemplateColumns: '1fr 1fr' }}>
          <label style={{ display: 'grid', gap: 6 }}>
            <span style={{ fontSize: 12, opacity: 0.8 }}>Senha</span>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
          </label>
          <label style={{ display: 'grid', gap: 6 }}>
            <span style={{ fontSize: 12, opacity: 0.8 }}>Confirmar senha</span>
            <input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="••••••••" />
          </label>
        </div>

        <small style={{ opacity: 0.7 }}>
          * No backend atual, apenas nome, e-mail e telefone são salvos. Endereço e senha exigem ajustes no servidor.
        </small>

        <button className="btn" type="submit" disabled={submitting} style={{ width: '100%' }}>
          {submitting ? 'Salvando…' : 'Salvar'}
        </button>

        <div style={{ display: 'grid', gap: 8, textAlign: 'center', fontSize: 12 }}>
          <Link to="/login">Já tem conta? Entrar</Link>
          <Link to="/">← Voltar</Link>
        </div>
      </form>
    </div>
  );
}

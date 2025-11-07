import { create } from 'zustand';

type User = { username: string };

type AuthState = {
  user: User | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
};

export const useAuth = create<AuthState>((set) => ({
  user: (() => {
    const raw = localStorage.getItem('auth:user');
    return raw ? (JSON.parse(raw) as User) : null;
  })(),

  async login(username: string, password: string) {
    // validação hardcoded (mock):
    const ok =
      (username === 'admin' || username === 'admin@admin.com' || username === 'admin@email.com') &&
      password === 'admin123';

    await new Promise(r => setTimeout(r, 300));

    if (!ok) {
      throw new Error('Credenciais inválidas.');
    }

    const user = { username: 'admin' };
    localStorage.setItem('auth:user', JSON.stringify(user));
    set({ user });
  },

  logout() {
    localStorage.removeItem('auth:user');
    set({ user: null });
  },
}));

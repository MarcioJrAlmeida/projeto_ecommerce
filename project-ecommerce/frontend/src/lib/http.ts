import axios from 'axios';

/**
 * Base da API vem do .env (VITE_API_BASE_URL).
 * Ex.: VITE_API_BASE_URL=http://localhost:3000
 */
const baseURL = import.meta.env.VITE_API_BASE_URL;

if (!baseURL) {
  // Não interrompe a app, mas alerta para configurar o .env
  // Você pode usar proxy do Vite (VITE_API_BASE_URL=/api) se preferir.
  // Veja: vite.config.ts -> server.proxy
  console.warn(
    '[http] VITE_API_BASE_URL não definido. Configure seu .env (ex.: http://localhost:3000 ou /api).'
  );
}

export const http = axios.create({
  baseURL: baseURL || '/api',
  headers: { 'Content-Type': 'application/json' },
  // withCredentials: true, // habilite se o backend usar cookies/sessões
});

// Interceptor de request (ex.: injetar auth token no futuro)
http.interceptors.request.use((config) => {
  // const token = localStorage.getItem('token');
  // if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Interceptor de response (log básico de erros)
http.interceptors.response.use(
  (res) => res,
  (err) => {
    const msg =
      err?.response?.data?.message ||
      err?.message ||
      'Erro desconhecido ao chamar API';
    console.error('[http] API error:', msg, err?.response || '');
    return Promise.reject(err);
  }
);

// src/lib/http.ts
import axios from 'axios';

const baseURL = import.meta.env.VITE_API_BASE_URL || '/api';
export const http = axios.create({
  baseURL,
  headers: { 'Content-Type': 'application/json' },
});

http.interceptors.response.use(
  (res) => res,
  (err) => {
    // Log útil: status, URL e payload de erro do back
    const status = err?.response?.status;
    const url = err?.config?.url;
    const data = err?.response?.data;
    console.error('[http] error', status, url, data);
    return Promise.reject(err);
  }
);

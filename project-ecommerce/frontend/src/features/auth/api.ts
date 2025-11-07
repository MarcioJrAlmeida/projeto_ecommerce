import { http } from '@/lib/http';

export async function registerUser(payload: {
  name: string;
  email: string;
  phone?: string;
  // address e password estão no form, mas não serão enviados ao /customers por enquanto
  address?: string;
  password?: string;
}) {
  // Envia apenas os campos aceitos pelo DTO atual do backend
  const body = {
    name: payload.name,
    email: payload.email,
    phone: payload.phone || undefined,
  };
  const { data } = await http.post('/customers', body);
  return data;
}

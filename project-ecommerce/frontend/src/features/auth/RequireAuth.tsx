import { PropsWithChildren } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './store';

/**
 * Protege rotas: se não estiver logado, redireciona para /login
 * mantendo o "from" para voltar depois do login.
 */
export default function RequireAuth({ children }: PropsWithChildren) {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }
  return <>{children}</>;
}

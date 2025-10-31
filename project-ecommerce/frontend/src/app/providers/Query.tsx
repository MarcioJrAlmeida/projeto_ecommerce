import { PropsWithChildren, useMemo } from 'react';
import {
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query';

/**
 * Provider do TanStack Query (cache/fetch de dados do backend).
 * Envolva sua aplicação com este componente.
 */
export default function QueryProvider({ children }: PropsWithChildren) {
  // um único QueryClient por montagem da app
  const client = useMemo(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            refetchOnWindowFocus: false,
            retry: 1,
            staleTime: 15_000, // 15s
          },
          mutations: {
            retry: 0,
          },
        },
      }),
    []
  );

  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}

'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useState } from 'react';

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Cache por 1 hora (3600000ms) para dados estáticos
            staleTime: 1000 * 60 * 60, // 1 hora
            // Cache por 24 horas
            gcTime: 1000 * 60 * 60 * 24, // 24 horas
            // Retry apenas 1 vez em caso de erro
            retry: 1,
            // Refetch apenas quando a janela ganha foco
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
} 
import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Time in milliseconds that unused/inactive cache data remains in memory
      gcTime: 1000 * 60 * 5, // 5 minutes
      
      // Time in milliseconds after data is considered stale
      staleTime: 1000 * 60 * 1, // 1 minute
      
      // Disable automatic retries
      retry: false,
      
      // Refetch on window focus
      refetchOnWindowFocus: false,
      
      // Refetch on reconnect
      refetchOnReconnect: true,
      
      // Background refetch interval
      refetchInterval: false,
    },
    mutations: {
      // Disable automatic retries for mutations
      retry: false,
    },
  },
}); 
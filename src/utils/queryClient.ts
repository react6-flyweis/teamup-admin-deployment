import { QueryClient } from '@tanstack/react-query';

// Configure standard query client options
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false, // Turn off automatic refetch on window focus for consistent UX
      retry: 1, // Limit retries to prevent spamming server
      staleTime: 5 * 60 * 1000, // 5 minutes stale time
    },
  },
});

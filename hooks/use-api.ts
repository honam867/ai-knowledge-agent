import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { queryKeys } from '@/lib/query-keys';
// Auth hooks are in separate files for better organization
// import { useAuth } from './use-auth';
// import { useCurrentUserQuery, useLoginMutation } from './use-auth-queries';

// Test endpoint hook
export function useTestQuery() {
  return useQuery({
    queryKey: queryKeys.test,
    queryFn: async () => {
      const response = await api.test();
      return response.data;
    },
    // Optional: customize options for this specific query
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}

// Health check hook
export function useHealthQuery() {
  return useQuery({
    queryKey: queryKeys.health,
    queryFn: async () => {
      const response = await api.health();
      return response.data;
    },
  });
}

// Example mutation hook (for future use)
// export function useCreateUserMutation() {
//   const queryClient = useQueryClient();
//   
//   return useMutation({
//     mutationFn: async (userData: any) => {
//       const response = await api.users.create(userData);
//       return response.data;
//     },
//     onSuccess: () => {
//       // Invalidate and refetch users list
//       queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
//     },
//     onError: (error) => {
//       console.error('Failed to create user:', error);
//     },
//   });
// }

// Hook for manual query invalidation
export function useInvalidateQueries() {
  const queryClient = useQueryClient();
  
  return {
    invalidateTest: () => queryClient.invalidateQueries({ queryKey: queryKeys.test }),
    invalidateHealth: () => queryClient.invalidateQueries({ queryKey: queryKeys.health }),
    invalidateAuth: () => queryClient.invalidateQueries({ queryKey: queryKeys.auth.all }),
    invalidateAll: () => queryClient.invalidateQueries(),
  };
} 
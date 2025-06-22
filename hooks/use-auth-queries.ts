'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { authApi, tokenManager, isAuthenticated as checkIsAuthenticated } from '@/lib/auth-api';
import { queryKeys } from '@/lib/query-keys';
import type { LoginDTO, RegisterDTO } from '@/types/auth';

// Auth-specific query hooks for React Query integration

// Query for current user (can be used independently)
export function useCurrentUserQuery() {
  return useQuery({
    queryKey: queryKeys.auth.user(),
    queryFn: async () => {
      if (!checkIsAuthenticated()) {
        return null;
      }
      const response = await authApi.getCurrentUser();
      return response.data;
    },
    enabled: checkIsAuthenticated(),
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: (failureCount, error: any) => {
      // Don't retry on 401 errors
      if (error?.response?.status === 401) {
        return false;
      }
      return failureCount < 2;
    },
  });
}

// Login mutation hook
export function useLoginMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (credentials: LoginDTO) => authApi.login(credentials),
    onSuccess: (response) => {
      tokenManager.setToken(response.data.token);
      queryClient.setQueryData(queryKeys.auth.user(), response.data.user);
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.all });
    },
    onError: (error) => {
      console.error('Login failed:', error);
      tokenManager.removeToken();
      queryClient.setQueryData(queryKeys.auth.user(), null);
    },
  });
}

// Register mutation hook
export function useRegisterMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: RegisterDTO) => authApi.register(data),
    onSuccess: (response) => {
      tokenManager.setToken(response.data.token);
      queryClient.setQueryData(queryKeys.auth.user(), response.data.user);
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.all });
    },
    onError: (error) => {
      console.error('Registration failed:', error);
      tokenManager.removeToken();
      queryClient.setQueryData(queryKeys.auth.user(), null);
    },
  });
}

// Logout mutation hook
export function useLogoutMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => authApi.logout(),
    onSuccess: () => {
      tokenManager.removeToken();
      queryClient.setQueryData(queryKeys.auth.user(), null);
      queryClient.clear(); // Clear all cached data on logout
    },
    onError: (error) => {
      console.error('Logout failed:', error);
      // Still clear local data even if API call fails
      tokenManager.removeToken();
      queryClient.setQueryData(queryKeys.auth.user(), null);
      queryClient.clear();
    },
  });
}

// Hook to check authentication status
export function useAuthStatus() {
  const { data: user, isLoading } = useCurrentUserQuery();
  
  return {
    isAuthenticated: !!user && checkIsAuthenticated(),
    user,
    isLoading,
  };
}

// Hook for invalidating auth queries
export function useInvalidateAuth() {
  const queryClient = useQueryClient();

  return {
    invalidateUser: () => queryClient.invalidateQueries({ queryKey: queryKeys.auth.user() }),
    invalidateAll: () => queryClient.invalidateQueries({ queryKey: queryKeys.auth.all }),
    clearAuth: () => {
      queryClient.setQueryData(queryKeys.auth.user(), null);
      queryClient.removeQueries({ queryKey: queryKeys.auth.all });
    },
  };
} 
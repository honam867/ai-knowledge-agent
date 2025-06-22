'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect } from 'react';
import { authApi, tokenManager, isAuthenticated as checkIsAuthenticated, getCurrentUserFromToken } from '@/lib/auth-api';
import type { LoginDTO, RegisterDTO, GoogleOAuthDTO } from '@/types/auth';

// Query keys for auth-related queries
export const authQueryKeys = {
  user: ['auth', 'user'] as const,
  session: ['auth', 'session'] as const,
} as const;

// Main useAuth hook
export function useAuth() {
  const queryClient = useQueryClient();

  // Query for current user data
  const {
    data: user,
    isLoading: isUserLoading,
    error: userError,
    refetch: refetchUser,
  } = useQuery({
    queryKey: authQueryKeys.user,
    queryFn: async () => {
      if (!checkIsAuthenticated()) {
        return null;
      }
      try {
        const response = await authApi.getCurrentUser();
        return response.data;
      } catch (error) {
        // If API call fails but we have a token, try to get user from token
        const tokenUser = getCurrentUserFromToken();
        if (tokenUser) {
          // Return minimal user data from token
          return {
            id: tokenUser.id,
            email: tokenUser.email,
            name: tokenUser.email, // Fallback to email if name not in token
            provider: 'email' as const,
            emailVerified: false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
        }
        throw error;
      }
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

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: authApi.login,
    onSuccess: (response) => {
      tokenManager.setToken(response.data.token);
      queryClient.setQueryData(authQueryKeys.user, response.data.user);
      queryClient.invalidateQueries({ queryKey: authQueryKeys.user });
    },
    onError: (error) => {
      console.error('Login failed:', error);
      tokenManager.removeToken();
    },
  });

  // Register mutation
  const registerMutation = useMutation({
    mutationFn: authApi.register,
    onSuccess: (response) => {
      tokenManager.setToken(response.data.token);
      queryClient.setQueryData(authQueryKeys.user, response.data.user);
      queryClient.invalidateQueries({ queryKey: authQueryKeys.user });
    },
    onError: (error) => {
      console.error('Registration failed:', error);
      tokenManager.removeToken();
    },
  });

  // Google OAuth mutation
  const googleAuthMutation = useMutation({
    mutationFn: ({ code, state }: { code: string; state?: string }) => 
      authApi.handleGoogleCallback(code, state),
    onSuccess: (response) => {
      tokenManager.setToken(response.data.token);
      queryClient.setQueryData(authQueryKeys.user, response.data.user);
      queryClient.invalidateQueries({ queryKey: authQueryKeys.user });
    },
    onError: (error) => {
      console.error('Google OAuth failed:', error);
      tokenManager.removeToken();
    },
  });

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: authApi.logout,
    onSuccess: () => {
      tokenManager.removeToken();
      queryClient.setQueryData(authQueryKeys.user, null);
      queryClient.clear(); // Clear all cached data on logout
    },
    onError: (error) => {
      console.error('Logout failed:', error);
      // Still clear local data even if API call fails
      tokenManager.removeToken();
      queryClient.setQueryData(authQueryKeys.user, null);
      queryClient.clear();
    },
  });

  // Auth functions
  const login = useCallback(async (credentials: LoginDTO) => {
    await loginMutation.mutateAsync(credentials);
  }, [loginMutation]);

  const register = useCallback(async (data: RegisterDTO) => {
    await registerMutation.mutateAsync(data);
  }, [registerMutation]);

  const googleAuth = useCallback(async (data: GoogleOAuthDTO) => {
    await googleAuthMutation.mutateAsync(data);
  }, [googleAuthMutation]);

  const logout = useCallback(async () => {
    await logoutMutation.mutateAsync();
  }, [logoutMutation]);

  const refreshUser = useCallback(async () => {
    await refetchUser();
  }, [refetchUser]);

  const clearError = useCallback(() => {
    loginMutation.reset();
    registerMutation.reset();
    googleAuthMutation.reset();
    logoutMutation.reset();
  }, [loginMutation, registerMutation, googleAuthMutation, logoutMutation]);

  // Listen for auth events (like token expiration)
  useEffect(() => {
    const handleAuthLogout = () => {
      queryClient.setQueryData(authQueryKeys.user, null);
      queryClient.clear();
    };

    window.addEventListener('auth:logout', handleAuthLogout);
    return () => window.removeEventListener('auth:logout', handleAuthLogout);
  }, [queryClient]);

  // Check token validity on mount and periodically
  useEffect(() => {
    const checkTokenValidity = () => {
      if (!checkIsAuthenticated()) {
        queryClient.setQueryData(authQueryKeys.user, null);
      }
    };

    checkTokenValidity();
    
    // Check every minute
    const interval = setInterval(checkTokenValidity, 60000);
    return () => clearInterval(interval);
  }, [queryClient]);

  // Compute auth state
  const isAuthenticated = !!user && !!tokenManager.getToken();
  const isLoading = isUserLoading || loginMutation.isPending || registerMutation.isPending || googleAuthMutation.isPending || logoutMutation.isPending;
  
  // Get error from any mutation
  const error = loginMutation.error?.message || 
                registerMutation.error?.message || 
                googleAuthMutation.error?.message ||
                logoutMutation.error?.message || 
                (userError as any)?.message || 
                null;

  return {
    // State
    user,
    isAuthenticated,
    isLoading,
    error,
    
    // Actions
    login,
    register,
    googleAuth,
    logout,
    refreshUser,
    clearError,
    
    // Mutation states for granular loading states
    isLoggingIn: loginMutation.isPending,
    isRegistering: registerMutation.isPending,
    isGoogleAuthenticating: googleAuthMutation.isPending,
    isLoggingOut: logoutMutation.isPending,
  };
}

// Hook for protecting routes
export function useAuthProtection(options: { redirectTo?: string; redirectIfFound?: boolean } = {}) {
  const { isAuthenticated, isLoading } = useAuth();
  
  useEffect(() => {
    if (isLoading) return;
    
    if (!isAuthenticated && !options.redirectIfFound) {
      // Redirect to login if not authenticated
      const redirectTo = options.redirectTo || '/auth/signin';
      if (typeof window !== 'undefined') {
        window.location.href = redirectTo;
      }
    } else if (isAuthenticated && options.redirectIfFound) {
      // Redirect away if authenticated (e.g., from login page)
      const redirectTo = options.redirectTo || '/dashboard';
      if (typeof window !== 'undefined') {
        window.location.href = redirectTo;
      }
    }
  }, [isAuthenticated, isLoading, options.redirectTo, options.redirectIfFound]);

  return {
    isAuthenticated,
    isLoading,
    shouldRender: isLoading || (isAuthenticated && !options.redirectIfFound) || (!isAuthenticated && options.redirectIfFound),
  };
}

// Hook for getting user data specifically
export function useUser() {
  return useQuery({
    queryKey: authQueryKeys.user,
    queryFn: async () => {
      if (!checkIsAuthenticated()) {
        return null;
      }
      const response = await authApi.getCurrentUser();
      return response.data;
    },
    enabled: checkIsAuthenticated(),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

// Hook for auth mutations only (useful for forms)
export function useAuthMutations() {
  const queryClient = useQueryClient();

  const loginMutation = useMutation({
    mutationFn: authApi.login,
    onSuccess: (response) => {
      tokenManager.setToken(response.data.token);
      queryClient.setQueryData(authQueryKeys.user, response.data.user);
    },
  });

  const registerMutation = useMutation({
    mutationFn: authApi.register,
    onSuccess: (response) => {
      tokenManager.setToken(response.data.token);
      queryClient.setQueryData(authQueryKeys.user, response.data.user);
    },
  });

  return {
    login: loginMutation,
    register: registerMutation,
  };
} 
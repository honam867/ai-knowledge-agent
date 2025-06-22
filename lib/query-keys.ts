// Query key factory for consistent key management
// This helps with cache invalidation and prevents key conflicts

export const queryKeys = {
  // Test queries
  test: ['test'] as const,
  
  // Health queries
  health: ['health'] as const,
  
  // Auth queries
  auth: {
    all: ['auth'] as const,
    user: () => [...queryKeys.auth.all, 'user'] as const,
    session: () => [...queryKeys.auth.all, 'session'] as const,
  },
  
  // Example pattern for other entities:
  // users: {
  //   all: ['users'] as const,
  //   lists: () => [...queryKeys.users.all, 'list'] as const,
  //   list: (filters: string) => [...queryKeys.users.lists(), { filters }] as const,
  //   details: () => [...queryKeys.users.all, 'detail'] as const,
  //   detail: (id: string) => [...queryKeys.users.details(), id] as const,
  // },
} as const;

// Helper function to invalidate related queries
export const getInvalidationKeys = {
  // Invalidate all test-related queries
  test: () => queryKeys.test,
  
  // Invalidate all health-related queries  
  health: () => queryKeys.health,
  
  // Invalidate all auth-related queries
  auth: () => queryKeys.auth.all,
  authUser: () => queryKeys.auth.user(),
} as const; 
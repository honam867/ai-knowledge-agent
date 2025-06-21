# React Query Setup and Usage Examples

This document provides examples and best practices for using React Query in this project.

## Overview

React Query (TanStack Query) is set up with the following features:
- Automatic caching and background updates
- Error handling and retry logic
- Request/response interceptors
- Development tools integration
- TypeScript support

## Configuration

### Base API URL
- **Development**: `http://localhost:8070`
- **Timeout**: 10 seconds
- **Cache Time**: 5 minutes
- **Stale Time**: 1 minute

## Usage Examples

### 1. Basic Query Usage

```tsx
import { useTestQuery } from '@/hooks/use-api';

function MyComponent() {
  const { data, isLoading, error } = useTestQuery();

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return <div>Data: {JSON.stringify(data)}</div>;
}
```

### 2. Manual Refetch

```tsx
import { useTestQuery } from '@/hooks/use-api';

function MyComponent() {
  const { data, refetch } = useTestQuery();

  return (
    <div>
      <button onClick={() => refetch()}>
        Refresh Data
      </button>
      {data && <pre>{JSON.stringify(data, null, 2)}</pre>}
    </div>
  );
}
```

### 3. Cache Invalidation

```tsx
import { useInvalidateQueries } from '@/hooks/use-api';

function MyComponent() {
  const { invalidateTest, invalidateAll } = useInvalidateQueries();

  return (
    <div>
      <button onClick={() => invalidateTest()}>
        Invalidate Test Cache
      </button>
      <button onClick={() => invalidateAll()}>
        Invalidate All Caches
      </button>
    </div>
  );
}
```

### 4. Error Handling

```tsx
import { useTestQuery } from '@/hooks/use-api';

function MyComponent() {
  const { data, error, isError } = useTestQuery();

  if (isError) {
    // Handle different types of errors
    if (error?.response?.status === 404) {
      return <div>Resource not found</div>;
    }
    if (error?.response?.status >= 500) {
      return <div>Server error. Please try again later.</div>;
    }
    return <div>An error occurred: {error.message}</div>;
  }

  return <div>{data && JSON.stringify(data)}</div>;
}
```

### 5. Loading States

```tsx
import { useTestQuery } from '@/hooks/use-api';

function MyComponent() {
  const { 
    data, 
    isLoading,      // Initial loading
    isFetching,     // Any fetching (including background)
    isRefetching    // Manual refetch
  } = useTestQuery();

  return (
    <div>
      {isLoading && <div>Initial loading...</div>}
      {isFetching && !isLoading && <div>Updating...</div>}
      {isRefetching && <div>Refreshing...</div>}
      {data && <div>Data loaded!</div>}
    </div>
  );
}
```

## Adding New API Endpoints

### 1. Add to API Client (`lib/api.ts`)

```typescript
export const api = {
  // Existing endpoints...
  
  // New endpoint
  users: {
    getAll: () => apiClient.get('/users'),
    getById: (id: string) => apiClient.get(`/users/${id}`),
    create: (data: CreateUserData) => apiClient.post('/users', data),
    update: (id: string, data: UpdateUserData) => apiClient.put(`/users/${id}`, data),
    delete: (id: string) => apiClient.delete(`/users/${id}`),
  },
} as const;
```

### 2. Add Query Keys (`lib/query-keys.ts`)

```typescript
export const queryKeys = {
  // Existing keys...
  
  // New keys
  users: {
    all: ['users'] as const,
    lists: () => [...queryKeys.users.all, 'list'] as const,
    list: (filters: string) => [...queryKeys.users.lists(), { filters }] as const,
    details: () => [...queryKeys.users.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.users.details(), id] as const,
  },
} as const;
```

### 3. Create Hooks (`hooks/use-api.ts`)

```typescript
// Query hook
export function useUsersQuery(filters?: string) {
  return useQuery({
    queryKey: queryKeys.users.list(filters || ''),
    queryFn: async () => {
      const response = await api.users.getAll();
      return response.data;
    },
  });
}

// Mutation hook
export function useCreateUserMutation() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (userData: CreateUserData) => {
      const response = await api.users.create(userData);
      return response.data;
    },
    onSuccess: () => {
      // Invalidate users list to refetch
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
    },
    onError: (error) => {
      console.error('Failed to create user:', error);
    },
  });
}
```

## Best Practices

### 1. Query Key Consistency
- Always use the query key factory from `lib/query-keys.ts`
- Use hierarchical keys for related data
- Include relevant parameters in query keys

### 2. Error Handling
- Handle errors at the component level when specific UI is needed
- Use global error handling in axios interceptors for common cases
- Provide user-friendly error messages

### 3. Loading States
- Show loading indicators for better UX
- Differentiate between initial loading and background updates
- Consider skeleton screens for better perceived performance

### 4. Cache Management
- Use appropriate stale times based on data freshness requirements
- Invalidate related queries after mutations
- Use optimistic updates for better UX when appropriate

### 5. TypeScript
- Define proper interfaces for API responses
- Use typed hooks for better development experience
- Leverage TypeScript's type inference

## Debugging

### React Query DevTools
The DevTools are available in development mode. Look for the React Query icon in the bottom-left corner of your browser.

### Console Logging
API requests and responses are logged to the console in development mode for debugging purposes.

### Network Tab
Use the browser's Network tab to inspect actual HTTP requests and responses.

## Testing

When testing components that use React Query:

1. Mock the API calls
2. Use React Query's testing utilities
3. Consider using `react-query/test-utils` for easier testing

Example test setup:
```typescript
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render } from '@testing-library/react';

const createTestQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: { retry: false },
    mutations: { retry: false },
  },
});

const renderWithQueryClient = (ui: React.ReactElement) => {
  const testQueryClient = createTestQueryClient();
  return render(
    <QueryClientProvider client={testQueryClient}>
      {ui}
    </QueryClientProvider>
  );
};
``` 
# React Query Setup Guide

This project is configured with React Query (TanStack Query) for efficient API state management.

## 🚀 Quick Start

1. **Start your API server** (should be running on port 8070)
2. **Start the frontend**:
   ```bash
   npm run dev
   ```
3. **Test the API connection**:
   ```bash
   npm run test-api
   ```

## 📁 Project Structure

```
fe/
├── lib/
│   ├── api.ts              # Axios client & API endpoints
│   ├── query-client.ts     # React Query configuration
│   └── query-keys.ts       # Query key factory
├── hooks/
│   └── use-api.ts          # Custom React Query hooks
├── components/
│   ├── providers/
│   │   └── query-provider.tsx  # React Query provider
│   └── test-api.tsx        # Demo component
└── examples/
    └── react-query-usage.md    # Detailed usage examples
```

## 🔧 Configuration

### API Client (`lib/api.ts`)
- **Base URL**: `http://localhost:8070`
- **Timeout**: 10 seconds
- **Automatic request/response logging**
- **Error handling with interceptors**

### Query Client (`lib/query-client.ts`)
- **Cache Time**: 5 minutes (how long inactive data stays in memory)
- **Stale Time**: 1 minute (how long data is considered fresh)
- **Retry Logic**: Smart retry with exponential backoff
- **No refetch on window focus** (configurable)

## 🎯 Available Endpoints

### Test Endpoint
- **URL**: `/test`
- **Hook**: `useTestQuery()`
- **Purpose**: Basic connectivity test

### Health Check
- **URL**: `/health`
- **Hook**: `useHealthQuery()`
- **Purpose**: Server health verification

## 💻 Usage Examples

### Basic Query
```tsx
import { useTestQuery } from '@/hooks/use-api';

function MyComponent() {
  const { data, isLoading, error } = useTestQuery();

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  
  return <div>{JSON.stringify(data)}</div>;
}
```

### Manual Refetch
```tsx
const { data, refetch } = useTestQuery();

<button onClick={() => refetch()}>Refresh</button>
```

### Cache Management
```tsx
import { useInvalidateQueries } from '@/hooks/use-api';

const { invalidateTest, invalidateAll } = useInvalidateQueries();

<button onClick={() => invalidateTest()}>Clear Cache</button>
```

## 🛠️ Development Tools

### React Query DevTools
- Available in development mode
- Look for the React Query icon in bottom-left corner
- Inspect queries, mutations, and cache state

### API Testing
Run the API test script to verify your backend is working:
```bash
npm run test-api
```

### Console Logging
All API requests and responses are logged to the console in development mode.

## 📝 Adding New Endpoints

1. **Add to API client** (`lib/api.ts`):
```typescript
export const api = {
  // ... existing endpoints
  users: {
    getAll: () => apiClient.get('/users'),
    getById: (id: string) => apiClient.get(`/users/${id}`),
  },
} as const;
```

2. **Add query keys** (`lib/query-keys.ts`):
```typescript
export const queryKeys = {
  // ... existing keys
  users: {
    all: ['users'] as const,
    detail: (id: string) => [...queryKeys.users.all, id] as const,
  },
} as const;
```

3. **Create hooks** (`hooks/use-api.ts`):
```typescript
export function useUsersQuery() {
  return useQuery({
    queryKey: queryKeys.users.all,
    queryFn: async () => {
      const response = await api.users.getAll();
      return response.data;
    },
  });
}
```

## 🎨 Demo Component

The `TestApi` component (`components/test-api.tsx`) demonstrates:
- ✅ Query execution and loading states
- ✅ Error handling and display
- ✅ Manual refetch functionality
- ✅ Cache invalidation
- ✅ Real-time status indicators

## 🔍 Troubleshooting

### API Connection Issues
1. Verify your backend is running on port 8070
2. Check the console for detailed error messages
3. Use the test script: `npm run test-api`

### Query Not Updating
1. Check if data is stale (default: 1 minute)
2. Use `refetch()` for manual updates
3. Invalidate cache with `invalidateQueries()`

### TypeScript Errors
1. Ensure proper interfaces for API responses
2. Check that query keys are properly typed
3. Verify axios response types

## 📚 Further Reading

- [TanStack Query Documentation](https://tanstack.com/query/latest)
- [Detailed Usage Examples](./examples/react-query-usage.md)
- [API Hooks Documentation](./README-API-HOOKS.md)

## 🎯 Next Steps

1. Add authentication tokens to API requests
2. Implement optimistic updates for mutations
3. Add pagination support
4. Set up error boundary for global error handling
5. Add unit tests for query hooks 
# Frontend Documentation (FE_DOC)

## 📁 Project Structure

```
fe/
├── app/                          # Next.js 13+ App Router
│   ├── auth/                     # Authentication pages
│   │   ├── signin/page.tsx       # Sign-in page
│   │   ├── signup/page.tsx       # Registration page
│   │   └── callback/page.tsx     # OAuth callback handler
│   ├── dashboard/page.tsx        # Protected dashboard
│   ├── layout.tsx               # Root layout with providers
│   ├── page.tsx                 # Home page with auth integration
│   └── globals.css              # Global styles
├── components/                   # Reusable UI components
│   ├── auth/                    # Authentication components
│   │   ├── google-oauth-button.tsx
│   │   ├── login-form.tsx
│   │   ├── register-form.tsx
│   │   ├── user-profile.tsx
│   │   └── index.ts            # Barrel exports
│   ├── providers/              # React context providers
│   │   ├── auth-provider.tsx   # Auth context wrapper
│   │   └── query-provider.tsx  # React Query wrapper
│   ├── ui/                     # Base UI components (Shadcn style)
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── input.tsx
│   │   └── label.tsx
│   └── test-api.tsx           # API testing component
├── hooks/                      # Custom React hooks
│   ├── use-auth.ts            # Main authentication hook
│   ├── use-auth-queries.ts    # Auth-specific React Query hooks
│   ├── use-api.ts             # General API hooks
│   └── use-auth.ts            # Auth state management
├── lib/                       # Utility libraries
│   ├── api.ts                 # Main API client (Axios)
│   ├── auth-api.ts            # Authentication API client
│   ├── query-client.ts        # React Query configuration
│   ├── query-keys.ts          # Query key factory
│   └── utils.ts               # Utility functions
├── types/                     # TypeScript type definitions
│   └── auth.ts               # Authentication types
└── package.json              # Dependencies and scripts
```

## 🔧 Core Technologies & Libraries

### Required Dependencies
- **Next.js 14+** - React framework with App Router
- **React 18+** - UI library
- **TypeScript** - Type safety
- **Tailwind CSS** - Utility-first CSS framework
- **@tanstack/react-query** - Server state management
- **axios** - HTTP client
- **lodash** - Utility library (USE FOR EVERY CASE)
- **@radix-ui/react-*** - Accessible UI primitives
- **class-variance-authority** - Component variant management
- **clsx** - Conditional className utility

### Development Dependencies
- **ESLint** - Code linting
- **PostCSS** - CSS processing
- **Tailwind CSS** - Styling

## 🎯 Key Patterns & Conventions

### 1. **Lodash Usage (CRITICAL)**
**USE LODASH FOR EVERY FUNCTIONAL OPERATION**

```typescript
import _ from 'lodash';

// ✅ DO: Use lodash for array operations
const activeUsers = _.filter(users, user => user.isActive);
const userNames = _.map(users, 'name');
const groupedUsers = _.groupBy(users, 'role');

// ✅ DO: Use lodash for object operations
const cleanData = _.omit(formData, ['confirmPassword']);
const defaultUser = _.defaults(userData, { role: 'user', isActive: true });

// ✅ DO: Use lodash for utility functions
const debouncedSearch = _.debounce(searchFunction, 300);
const isEmpty = _.isEmpty(data);
const clonedData = _.cloneDeep(originalData);

// ❌ DON'T: Use native array methods when lodash is available
const activeUsers = users.filter(user => user.isActive); // Use _.filter instead
```

### 2. **Component Structure**
```typescript
// Component file structure pattern
'use client'; // If using client-side features

import { useState } from 'react';
import _ from 'lodash';
import { ComponentProps } from './types';

interface ComponentProps {
  // Props interface
}

export function Component({ prop1, prop2 }: ComponentProps) {
  // State and hooks
  const [state, setState] = useState();
  
  // Event handlers (use lodash where applicable)
  const handleSubmit = _.debounce((data) => {
    // Implementation
  }, 300);
  
  // Render
  return (
    <div>
      {/* JSX */}
    </div>
  );
}
```

### 3. **API Client Pattern**
```typescript
// Use the established API client pattern
import { apiClient } from '@/lib/api';
import _ from 'lodash';

export const userApi = {
  getUsers: () => apiClient.get('/users'),
  getUserById: (id: string) => apiClient.get(`/users/${id}`),
  createUser: (data: CreateUserDTO) => {
    // Clean data with lodash
    const cleanData = _.omit(data, ['confirmPassword']);
    return apiClient.post('/users', cleanData);
  },
  updateUser: (id: string, data: UpdateUserDTO) => {
    const updates = _.pick(data, ['name', 'email', 'role']);
    return apiClient.put(`/users/${id}`, updates);
  }
};
```

### 4. **React Query Hooks Pattern**
```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import _ from 'lodash';
import { queryKeys } from '@/lib/query-keys';

export function useUsers(filters?: UserFilters) {
  return useQuery({
    queryKey: queryKeys.users.list(filters),
    queryFn: async () => {
      const response = await userApi.getUsers();
      // Use lodash for data transformation
      return _.map(response.data, user => 
        _.pick(user, ['id', 'name', 'email', 'role', 'isActive'])
      );
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export function useCreateUser() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: userApi.createUser,
    onSuccess: () => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
    },
  });
}
```

## 🔐 Authentication System

### Architecture Overview
The authentication system uses a custom implementation with React Query for state management:

```
AuthProvider (Context)
    ↓
useAuth (Main Hook)
    ↓
auth-api.ts (API Client)
    ↓
Backend API (/auth/*)
```

### Key Files
- **`/hooks/use-auth.ts`** - Main authentication hook with state management
- **`/lib/auth-api.ts`** - Auth API client with token management
- **`/components/providers/auth-provider.tsx`** - Auth context provider
- **`/types/auth.ts`** - Authentication TypeScript types

### Usage Examples

#### 1. **Using Authentication in Components**
```typescript
import { useAuth } from '@/hooks/use-auth';
import _ from 'lodash';

function MyComponent() {
  const { 
    user, 
    isAuthenticated, 
    login, 
    logout, 
    isLoggingIn,
    error 
  } = useAuth();

  const handleLogin = async (credentials) => {
    // Clean credentials with lodash
    const cleanCredentials = _.pick(credentials, ['email', 'password']);
    await login(cleanCredentials);
  };

  if (!isAuthenticated) {
    return <LoginForm onSubmit={handleLogin} />;
  }

  return <div>Welcome, {user?.name}!</div>;
}
```

#### 2. **Token Management**
```typescript
import { tokenManager } from '@/lib/auth-api';

// Token is automatically managed, but you can access it:
const token = tokenManager.getToken();
const isValid = !tokenManager.isTokenExpired();
```

#### 3. **Protected Routes Pattern**
```typescript
'use client';

import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function ProtectedPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/auth/signin');
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) return <div>Loading...</div>;
  if (!isAuthenticated) return null;

  return <div>Protected content</div>;
}
```

## 🎨 UI Components

### Shadcn UI Integration
The project uses Shadcn UI patterns with Tailwind CSS:

```typescript
// Base component pattern
import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "base-classes",
  {
    variants: {
      variant: {
        default: "default-classes",
        destructive: "destructive-classes",
      },
      size: {
        default: "default-size",
        sm: "small-size",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
```

### Form Components
```typescript
import { useState } from 'react';
import _ from 'lodash';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

function FormComponent() {
  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});

  const handleInputChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [field]: e.target.value
    }));
    
    // Clear field error using lodash
    if (_.has(errors, field)) {
      setErrors(prev => _.omit(prev, field));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    // Use lodash for validation
    if (_.isEmpty(formData.email)) {
      newErrors.email = 'Email is required';
    }
    
    setErrors(newErrors);
    return _.isEmpty(newErrors);
  };

  return (
    <form onSubmit={handleSubmit}>
      <Input
        value={formData.email || ''}
        onChange={handleInputChange('email')}
        className={_.has(errors, 'email') ? 'border-red-500' : ''}
      />
      {_.get(errors, 'email') && (
        <p className="text-red-500">{errors.email}</p>
      )}
    </form>
  );
}
```

## 📊 State Management

### React Query Setup
```typescript
// lib/query-client.ts
import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 3,
    },
  },
});

// lib/query-keys.ts - Query key factory
export const queryKeys = {
  auth: {
    all: ['auth'] as const,
    user: () => [...queryKeys.auth.all, 'user'] as const,
    session: () => [...queryKeys.auth.all, 'session'] as const,
  },
  users: {
    all: ['users'] as const,
    lists: () => [...queryKeys.users.all, 'list'] as const,
    list: (filters: string) => [...queryKeys.users.lists(), { filters }] as const,
    details: () => [...queryKeys.users.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.users.details(), id] as const,
  },
} as const;
```

### Custom Hooks Pattern
```typescript
import { useQuery, useMutation } from '@tanstack/react-query';
import _ from 'lodash';

export function useEntityList<T>(
  entityName: string,
  fetcher: () => Promise<T[]>,
  options?: {
    filters?: Record<string, any>;
    transform?: (data: T[]) => T[];
  }
) {
  return useQuery({
    queryKey: [entityName, 'list', options?.filters],
    queryFn: async () => {
      const data = await fetcher();
      // Use lodash for data transformation
      return options?.transform ? options.transform(data) : data;
    },
    select: (data) => {
      // Use lodash for filtering/sorting
      if (options?.filters) {
        return _.filter(data, options.filters);
      }
      return data;
    },
  });
}
```

## 🔄 API Integration

### Backend Integration
The frontend integrates with the backend API located at `be/src/routes/auth.routes.ts`:

**Available Endpoints:**
- `POST /auth/register` - User registration
- `POST /auth/login` - User login
- `POST /auth/logout` - User logout
- `GET /auth/me` - Get current user
- `POST /auth/refresh` - Refresh token
- `GET /auth/google` - Google OAuth URL
- `POST /auth/google` - Google OAuth callback

### API Client Configuration
```typescript
// lib/api.ts
import axios from 'axios';
import _ from 'lodash';

export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api',
  timeout: 10000,
});

// Request interceptor
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token && !_.includes(config.url, '/auth/')) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized
      localStorage.removeItem('auth_token');
      window.location.href = '/auth/signin';
    }
    return Promise.reject(error);
  }
);
```

## 🧪 Testing Patterns

### Component Testing
```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import _ from 'lodash';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@/components/providers/auth-provider';

function renderWithProviders(component: React.ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } }
  });
  
  return render(
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        {component}
      </AuthProvider>
    </QueryClientProvider>
  );
}

// Test example
test('should handle form submission', async () => {
  const mockSubmit = jest.fn();
  renderWithProviders(<LoginForm onSubmit={mockSubmit} />);
  
  const emailInput = screen.getByLabelText(/email/i);
  const passwordInput = screen.getByLabelText(/password/i);
  
  fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
  fireEvent.change(passwordInput, { target: { value: 'password123' } });
  
  fireEvent.click(screen.getByRole('button', { name: /sign in/i }));
  
  await waitFor(() => {
    expect(mockSubmit).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password123'
    });
  });
});
```

## 📝 Development Guidelines

### 1. **File Naming**
- Use kebab-case for directories: `auth-components/`
- Use kebab-case for files: `user-profile.tsx`
- Use PascalCase for components: `UserProfile`
- Use camelCase for functions and variables: `handleSubmit`

### 2. **Import Organization**
```typescript
// 1. React imports
import { useState, useEffect } from 'react';

// 2. Third-party imports
import _ from 'lodash';
import { useQuery } from '@tanstack/react-query';

// 3. Internal imports (absolute paths)
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';
import type { User } from '@/types/auth';

// 4. Relative imports
import './component.css';
```

### 3. **Error Handling**
```typescript
import _ from 'lodash';

try {
  const result = await apiCall();
  // Use lodash for data processing
  return _.pick(result.data, ['id', 'name', 'email']);
} catch (error) {
  // Standardized error handling
  const errorMessage = _.get(error, 'response.data.message', 'An error occurred');
  console.error('API Error:', errorMessage);
  throw new Error(errorMessage);
}
```

### 4. **Performance Optimization**
```typescript
import { useMemo, useCallback } from 'react';
import _ from 'lodash';

function OptimizedComponent({ data, onFilter }) {
  // Memoize expensive computations with lodash
  const processedData = useMemo(() => 
    _.orderBy(
      _.filter(data, item => item.isActive),
      ['createdAt'],
      ['desc']
    ), [data]
  );
  
  // Debounce callbacks
  const debouncedFilter = useCallback(
    _.debounce(onFilter, 300),
    [onFilter]
  );
  
  return <div>{/* Component JSX */}</div>;
}
```

## 🚀 Getting Started

### 1. **Setup New Component**
```bash
# Create component file
touch components/feature/new-component.tsx

# Add to barrel export
echo "export { NewComponent } from './new-component';" >> components/feature/index.ts
```

### 2. **Add New API Endpoint**
```typescript
// 1. Add to lib/api.ts
export const api = {
  // existing endpoints...
  newEndpoint: (data) => apiClient.post('/new-endpoint', data),
};

// 2. Create custom hook in hooks/
export function useNewEndpoint() {
  return useMutation({
    mutationFn: api.newEndpoint,
    // ... configuration
  });
}

// 3. Add query keys
export const queryKeys = {
  // existing keys...
  newEntity: {
    all: ['newEntity'] as const,
    // ... other keys
  },
};
```

### 3. **Environment Variables**
```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## 🔍 Debugging Tips

### 1. **React Query DevTools**
```typescript
// Add to app/layout.tsx in development
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <QueryProvider>
          {children}
          {process.env.NODE_ENV === 'development' && (
            <ReactQueryDevtools initialIsOpen={false} />
          )}
        </QueryProvider>
      </body>
    </html>
  );
}
```

### 2. **Console Debugging with Lodash**
```typescript
import _ from 'lodash';

// Debug object structures
console.log('User data:', _.pick(user, ['id', 'name', 'email']));

// Debug arrays
console.log('Active users:', _.filter(users, 'isActive').length);

// Debug deeply nested data
console.log('Nested value:', _.get(data, 'user.profile.settings.theme', 'default'));
```

## 📚 Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [React Query Documentation](https://tanstack.com/query/latest)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Lodash Documentation](https://lodash.com/docs)
- [Radix UI Documentation](https://www.radix-ui.com/)

---

**Remember: Always use Lodash for functional operations, data transformations, and utility functions throughout the codebase!** 
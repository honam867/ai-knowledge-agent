// Frontend auth types that match backend types

export interface JWTPayload {
  id: string;
  email: string;
  iat?: number;
  exp?: number;
}

export interface LoginDTO {
  email: string;
  password: string;
}

export interface RegisterDTO {
  email: string;
  password: string;
  name: string;
}

export interface GoogleOAuthDTO {
  code: string;
  state?: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  provider: 'email' | 'google';
  avatar?: string;
  emailVerified: boolean;
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string;
}

// Frontend-specific auth state types
export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface AuthContextType extends AuthState {
  login: (credentials: LoginDTO) => Promise<void>;
  register: (data: RegisterDTO) => Promise<void>;
  googleAuth: (data: GoogleOAuthDTO) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
  refreshUser: () => Promise<void>;
}

// Form validation types
export interface LoginFormData {
  email: string;
  password: string;
}

export interface RegisterFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

// Auth hook options
export interface UseAuthOptions {
  redirectTo?: string;
  redirectIfFound?: boolean;
}

// Route protection types
export interface ProtectedRouteProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  redirectTo?: string;
}

// OAuth types
export interface GoogleOAuthButtonProps {
  onSuccess?: (user: User) => void;
  onError?: (error: string) => void;
  disabled?: boolean;
  children?: React.ReactNode;
} 
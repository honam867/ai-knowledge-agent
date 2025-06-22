import { apiClient } from "./api";
import type {
  LoginDTO,
  RegisterDTO,
  GoogleOAuthDTO,
  JWTPayload,
} from "../types/auth";

// Auth API response types
export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    user: {
      id: string;
      email: string;
      name: string;
      provider: "email" | "google";
      avatar?: string;
      emailVerified: boolean;
      createdAt: string;
      updatedAt: string;
      lastLoginAt?: string;
    };
    token: string;
  };
  timestamp: string;
}

export interface UserResponse {
  success: boolean;
  message: string;
  data: {
    id: string;
    email: string;
    name: string;
    provider: "email" | "google";
    avatar?: string;
    emailVerified: boolean;
    createdAt: string;
    updatedAt: string;
    lastLoginAt?: string;
  };
  timestamp: string;
}

export interface ApiError {
  success: false;
  message: string;
  error?: string;
  timestamp: string;
}

// Cookie helper functions
const setCookie = (name: string, value: string, days: number = 7) => {
  if (typeof window === "undefined") return;
  
  const expires = new Date();
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
  
  document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;SameSite=Lax;Secure=${location.protocol === 'https:'}`;
};

const getCookie = (name: string): string | null => {
  if (typeof window === "undefined") return null;
  
  const nameEQ = name + "=";
  const ca = document.cookie.split(';');
  
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === ' ') c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
  }
  return null;
};

const removeCookie = (name: string) => {
  if (typeof window === "undefined") return;
  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`;
};

// Token management with both localStorage and cookies
export const tokenManager = {
  getToken: (): string | null => {
    if (typeof window === "undefined") return null;
    // Try localStorage first, then cookies as fallback
    return localStorage.getItem("auth_token") || getCookie("auth_token");
  },

  setToken: (token: string): void => {
    if (typeof window === "undefined") return;
    // Set in both localStorage and cookies
    localStorage.setItem("auth_token", token);
    setCookie("auth_token", token, 7); // 7 days expiry
  },

  removeToken: (): void => {
    if (typeof window === "undefined") return;
    // Remove from both localStorage and cookies
    localStorage.removeItem("auth_token");
    removeCookie("auth_token");
  },

  isTokenExpired: (token: string): boolean => {
    try {
      const payload = JSON.parse(atob(token.split(".")[1])) as JWTPayload;
      const now = Date.now() / 1000;
      return payload.exp ? payload.exp < now : false;
    } catch {
      return true;
    }
  },

  getTokenPayload: (token: string): JWTPayload | null => {
    try {
      return JSON.parse(atob(token.split(".")[1])) as JWTPayload;
    } catch {
      return null;
    }
  },
};

// Create auth-specific axios instance with interceptors
export const authApiClient = apiClient;

// Add auth token to requests
authApiClient.interceptors.request.use(
  (config) => {
    const token = tokenManager.getToken();
    if (token && !tokenManager.isTokenExpired(token)) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle auth errors in responses
authApiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      tokenManager.removeToken();
      // Trigger auth state update (will be handled by useAuth hook)
      window.dispatchEvent(new CustomEvent("auth:logout"));
    }
    return Promise.reject(error);
  }
);

// Auth API functions
export const authApi = {
  // Register new user
  register: async (data: RegisterDTO): Promise<AuthResponse> => {
    const response = await authApiClient.post<AuthResponse>(
      "/auth/register",
      data
    );
    return response.data;
  },

  // Login user
  login: async (data: LoginDTO): Promise<AuthResponse> => {
    const response = await authApiClient.post<AuthResponse>(
      "/auth/login",
      data
    );
    return response.data;
  },

  // Logout user
  logout: async (): Promise<void> => {
    try {
      await authApiClient.post("/auth/logout");
    } catch (error) {
      // Even if the API call fails, we should clear local storage
      console.warn(
        "Logout API call failed, but clearing local storage:",
        error
      );
    } finally {
      tokenManager.removeToken();
    }
  },

  // Get current user
  getCurrentUser: async (): Promise<UserResponse> => {
    const response = await authApiClient.get<UserResponse>("/auth/me");
    console.log("❤️ ~ authApi ~ response:", response);
    return response.data;
  },

  // Refresh token (simplified - just validates current token)
  refreshToken: async (): Promise<AuthResponse> => {
    const response = await authApiClient.post<AuthResponse>("/auth/refresh");
    return response.data;
  },

  // Google OAuth - get authorization URL
  getGoogleAuthUrl: (): string => {
    const baseUrl = authApiClient.defaults.baseURL;
    return `${baseUrl}/auth/google`;
  },

  // Handle Google OAuth callback (this would typically be handled by the backend redirect)
  handleGoogleCallback: async (
    code: string,
    state?: string
  ): Promise<AuthResponse> => {
    const response = await authApiClient.get<AuthResponse>(
      `/auth/google/callback?code=${code}${state ? `&state=${state}` : ""}`
    );
    return response.data;
  },
};

// Helper function to check if user is authenticated
export const isAuthenticated = (): boolean => {
  const token = tokenManager.getToken();
  return token !== null && !tokenManager.isTokenExpired(token);
};

// Helper function to get current user from token
export const getCurrentUserFromToken = (): JWTPayload | null => {
  const token = tokenManager.getToken();
  if (!token || tokenManager.isTokenExpired(token)) {
    return null;
  }
  return tokenManager.getTokenPayload(token);
};

import axios from 'axios';

// Create axios instance with base configuration
export const apiClient = axios.create({
  baseURL: 'http://localhost:8070/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for adding auth tokens, logging, etc.
apiClient.interceptors.request.use(
  (config) => {
    // Add auth token if available (will be handled by auth-api.ts for auth endpoints)
    // For non-auth endpoints, we can add token here if needed
    const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
    if (token && !config.url?.includes('/auth/')) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    console.log('API Request:', config.method?.toUpperCase(), config.url);
    return config;
  },
  (error) => {
    console.error('Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for handling errors globally
apiClient.interceptors.response.use(
  (response) => {
    console.log('API Response:', response.status, response.config.url);
    return response;
  },
  (error) => {
    console.error('Response Error:', error.response?.status, error.response?.data);
    
    // Handle common error cases
    if (error.response?.status === 401) {
      // Handle unauthorized access
      console.warn('Unauthorized access - consider redirecting to login');
    }
    
    if (error.response?.status >= 500) {
      // Handle server errors
      console.error('Server error occurred');
    }
    
    return Promise.reject(error);
  }
);

// API endpoints
export const api = {
  // Test endpoint
  test: () => apiClient.get('/testing'),
  
  // Health check
  health: () => apiClient.get('/health'),
  
  // Auth endpoints (note: detailed auth logic is in auth-api.ts)
  auth: {
    register: (data: any) => apiClient.post('/auth/register', data),
    login: (data: any) => apiClient.post('/auth/login', data),
    logout: () => apiClient.post('/auth/logout'),
    me: () => apiClient.get('/auth/me'),
    refresh: () => apiClient.post('/auth/refresh'),
    googleAuth: () => apiClient.get('/auth/google'),
  },
  
  // Add more endpoints as needed
  // users: {
  //   getAll: () => apiClient.get('/users'),
  //   getById: (id: string) => apiClient.get(`/users/${id}`),
  //   create: (data: any) => apiClient.post('/users', data),
  //   update: (id: string, data: any) => apiClient.put(`/users/${id}`, data),
  //   delete: (id: string) => apiClient.delete(`/users/${id}`),
  // },
} as const; 
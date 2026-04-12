import axios from 'axios';

const BASE_URL = 'http://localhost:8765';

// Create axios instance
const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem('qma-token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message = error.response?.data?.message || error.response?.data?.error || error.message;
    return Promise.reject(new Error(message));
  }
);

// Auth services
export const authService = {
  login: (username, password) => 
    apiClient.post('/auth-service/auth/login', { username, password }),
  
  signup: (username, password) => 
    apiClient.post('/auth-service/auth/register', { username, password }),
  
  googleLogin: () => {
    window.location.href = `${BASE_URL}/auth-service/oauth2/authorization/google`;
  },
  
  checkOAuthSuccess: () => 
    apiClient.get('/auth-service/auth/oauth-success'),
};

// Measurement services
export const measurementService = {
  calculate: (payload,operation) =>
    apiClient.post(`/qma-service/api/v1/quantities/${operation}`, payload),
  
  getHistory: (operation) => 
    apiClient.get(`/qma-service/api/v1/quantities/history/${operation}`),
};

export default apiClient;

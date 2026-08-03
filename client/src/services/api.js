import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('cloudatlas_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // Token expired or invalid
      if (error.response.status === 401) {
        localStorage.removeItem('cloudatlas_token');
        localStorage.removeItem('cloudatlas_user');
        
        // Only redirect if we are not already on login or landing pages
        const currentPath = window.location.pathname;
        if (currentPath !== '/login' && currentPath !== '/') {
          window.location.href = '/login';
        }
      } else if (error.response.status === 502 || error.response.status === 504) {
        error.message = 'Backend server timeout or connection error (502). Please check Node backend at port 5000.';
      }
    } else if (error.code === 'ECONNABORTED' || error.message?.includes('Network Error')) {
      error.message = 'Backend server is offline or unreachable on http://localhost:5000.';
    }
    return Promise.reject(error);
  }
);

export default api;

import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('admin_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle token expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('admin_token');
      localStorage.removeItem('admin_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Admin Auth API
export const adminAuthAPI = {
  login: (credentials: any) => api.post('/admin/login', credentials),
};

// Users Management API
export const usersAPI = {
  getPendingUsers: () => api.get('/admin/users/pending'),
  getAllUsers: () => api.get('/admin/users'),
  approveUser: (id: string) => api.put(`/admin/users/${id}/approve`),
  rejectUser: (id: string) => api.put(`/admin/users/${id}/reject`),
};

// Requests Management API
export const requestsAPI = {
  getAllRequests: () => api.get('/admin/requests'),
  updateRequest: (id: string, status: string) => api.put(`/admin/requests/${id}`, { status }),
  deleteRequest: (id: string) => api.delete(`/admin/requests/${id}`),
};

export default api;

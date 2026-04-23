import axios from 'axios';
import { wakeUpServer } from './api';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 30s - Render free tier mất 15-30s để wake up
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
  async (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('admin_token');
      localStorage.removeItem('admin_user');
      window.location.href = '/login';
    }
    
    // Handle network errors - thử wake server và retry 1 lần
    if (!error.response && !error.config?._retried) {
      try {
        await wakeUpServer();
        await new Promise(resolve => setTimeout(resolve, 3000));
        const retryConfig = { ...error.config, _retried: true, timeout: 30000 };
        return api(retryConfig);
      } catch {
        // ignore, trả về lỗi gốc
      }
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

// Fake Notifications Management API
export const fakeNotificationsAPI = {
  getAll: () => api.get('/admin/fake-notifications'),
  create: (data: any) => api.post('/admin/fake-notifications', data),
  update: (id: string, data: any) => api.put(`/admin/fake-notifications/${id}`, data),
  delete: (id: string) => api.delete(`/admin/fake-notifications/${id}`),
  toggle: (id: string) => api.patch(`/admin/fake-notifications/${id}/toggle`),
};

// Driver Fake Notifications API (for customers)
export const driverFakeNotificationsAPI = {
  getNotifications: (region: string) => api.get(`/driver/fake-notifications?region=${region}`),
  acceptNotification: (id: string) => api.post(`/driver/fake-notifications/${id}/accept`),
};

// App Settings API
export const settingsAPI = {
  getSettings: () => api.get('/admin/settings'),
  updateSettings: (data: any) => api.put('/admin/settings', data),
};

export default api;

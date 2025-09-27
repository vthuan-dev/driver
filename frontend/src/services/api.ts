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
  const token = localStorage.getItem('token');
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
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.reload();
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (userData: any) => api.post('/auth/register', userData),
  login: (credentials: any) => api.post('/auth/login', credentials),
  adminLogin: (credentials: any) => api.post('/auth/admin/login', credentials),
  getMe: () => api.get('/auth/me'),
};

// Users API
export const usersAPI = {
  getPendingUsers: () => api.get('/users/pending'),
  getAllUsers: () => api.get('/users'),
  approveUser: (id: string) => api.put(`/users/${id}/approve`),
  rejectUser: (id: string) => api.put(`/users/${id}/reject`),
};

// Drivers API
export const driversAPI = {
  getDrivers: () => api.get('/drivers'),
  createDriver: (driverData: any) => api.post('/drivers', driverData),
  updateDriver: (id: string, driverData: any) => api.put(`/drivers/${id}`, driverData),
  deleteDriver: (id: string) => api.delete(`/drivers/${id}`),
};

// Requests API
export const requestsAPI = {
  createRequest: (requestData: any) => api.post('/requests', requestData),
  getMyRequests: () => api.get('/requests/my-requests'),
  getAllRequests: () => api.get('/requests'),
  updateRequest: (id: string, status: string) => api.put(`/requests/${id}`, { status }),
};

export default api;

import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// ─── Axios instance ────────────────────────────────────────────────────────────
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000, // 15s timeout – VPS luôn sẵn sàng
  headers: { 'Content-Type': 'application/json' },
});

// Đính kèm token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('driver_user');
      localStorage.removeItem('admin_token');
      localStorage.removeItem('admin_user');
    }
    if (!error.response) {
      error.message = 'Không thể kết nối đến máy chủ. Vui lòng thử lại.';
    }
    return Promise.reject(error);
  }
);

// ─── Auth API ──────────────────────────────────────────────────────────────────
export const authAPI = {
  register:   (userData: any)    => api.post('/auth/register', userData),
  login:      (credentials: any) => api.post('/auth/login', credentials),
  adminLogin: (credentials: any) => api.post('/auth/admin/login', credentials),
  getMe:      ()                 => api.get('/auth/me'),
};

// ─── Users API ─────────────────────────────────────────────────────────────────
export const usersAPI = {
  getPendingUsers: ()           => api.get('/users/pending'),
  getAllUsers:     ()           => api.get('/users'),
  approveUser:    (id: string) => api.put(`/users/${id}/approve`),
  rejectUser:     (id: string) => api.put(`/users/${id}/reject`),
};

// ─── Drivers API ───────────────────────────────────────────────────────────────
export const driversAPI = {
  getDrivers:   ()                      => api.get('/drivers'),
  createDriver: (driverData: any)       => api.post('/drivers', driverData),
  updateDriver: (id: string, data: any) => api.put(`/drivers/${id}`, data),
  deleteDriver: (id: string)            => api.delete(`/drivers/${id}`),
};

// ─── Requests API ──────────────────────────────────────────────────────────────
export const requestsAPI = {
  createRequest: (requestData: any) => api.post('/requests', requestData),
  getMyRequests: ()                 => api.get('/requests/my-requests'),
  getAllRequests: (params?: { status?: string; limit?: number }) =>
    api.get('/requests', { params }),
  updateRequest: (id: string, status: string) =>
    api.put(`/requests/${id}`, { status }),
};

// ─── Driver API ────────────────────────────────────────────────────────────────
export const driverAPI = {
  getStats:          ()              => api.get('/driver/stats'),
  getDownloadStatus: ()              => api.get('/driver/download-status'),
  recordDownload:    (plan: string)  => api.post('/driver/record-download', { plan }),
};

// ─── Driver Fake Notifications API ────────────────────────────────────────────
export const driverFakeNotificationsAPI = {
  getFakeNotifications:   (region: string) => api.get(`/driver/fake-notifications?region=${region}`),
  acceptFakeNotification: (id: string)     => api.post(`/driver/fake-notifications/${id}/accept`),
};

export default api;

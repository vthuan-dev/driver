import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Wake up Render server nếu bị sleep (free tier)
let _waking = false;
export const wakeUpServer = async () => {
  if (_waking) return;
  _waking = true;
  try {
    await axios.get(`${API_BASE_URL}/health`, { timeout: 30000 });
  } catch {
    // ignore - chỉ cần gửi request để wake
  } finally {
    _waking = false;
  }
};

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
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle token expiration and network errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    console.error('API Error:', error);
    
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('driver_user');
      localStorage.removeItem('admin_token');
      localStorage.removeItem('admin_user');
    }
    
    // Handle network errors - thử wake server và retry 1 lần
    if (!error.response && !error.config?._retried) {
      error.message = 'Không thể kết nối đến máy chủ. Đang thử kết nối lại...';
      error.code = 'NETWORK_ERROR';
      
      // Wake server và retry sau 3s
      try {
        await wakeUpServer();
        await new Promise(resolve => setTimeout(resolve, 3000));
        const retryConfig = { ...error.config, _retried: true, timeout: 30000 };
        return api(retryConfig);
      } catch {
        error.message = 'Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng.';
      }
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
  // Optional params to fetch public waiting requests for homepage
  getAllRequests: (params?: { status?: string; limit?: number }) => api.get('/requests', { params }),
  updateRequest: (id: string, status: string) => api.put(`/requests/${id}`, { status }),
};

// Driver API
export const driverAPI = {
  getStats: () => api.get('/driver/stats'),
};

// Driver Fake Notifications API
export const driverFakeNotificationsAPI = {
  getFakeNotifications: (region: string) => api.get(`/driver/fake-notifications?region=${region}`),
  acceptFakeNotification: (id: string) => api.post(`/driver/fake-notifications/${id}/accept`),
};

export default api;

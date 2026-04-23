import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// ─── Wake-up helper ────────────────────────────────────────────────────────────
// Poll /api/health mỗi 2s cho đến khi DB = "connected" (tối đa 60s)
// Dùng một Promise duy nhất để tránh gọi nhiều lần song song
let _wakePromise: Promise<void> | null = null;

export const wakeUpServer = (): Promise<void> => {
  if (_wakePromise) return _wakePromise; // trả về promise đang chạy

  _wakePromise = (async () => {
    const MAX_WAIT = 60_000;   // 60s tổng
    const POLL    = 2_000;     // poll mỗi 2s
    const start   = Date.now();

    console.log('[Server] Đang kết nối đến server...');

    while (Date.now() - start < MAX_WAIT) {
      try {
        const res = await axios.get(`${API_BASE_URL}/health`, { timeout: 8000 });
        if (res.data?.db === 'connected') {
          console.log('[Server] Kết nối thành công!');
          return; // ✅ server + DB đã sẵn sàng
        }
        console.log('[Server] DB chưa sẵn sàng, thử lại...');
      } catch {
        console.log('[Server] Server đang khởi động...');
      }
      await new Promise(r => setTimeout(r, POLL));
    }
    console.warn('[Server] Timeout sau 60s, thử kết nối trực tiếp.');
  })().finally(() => {
    _wakePromise = null;
  });

  return _wakePromise;
};

// ─── Axios instance ────────────────────────────────────────────────────────────
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60_000, // 60s – Render free-tier cold start mất 30-50s
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
  async (error) => {
    // 401 → xoá token
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('driver_user');
      localStorage.removeItem('admin_token');
      localStorage.removeItem('admin_user');
    }

    // Network error (server sleep) → đợi server thật sự sẵn sàng rồi retry 1 lần
    if (!error.response && !error.config?._retried) {
      try {
        await wakeUpServer();
        return api({ ...error.config, _retried: true });
      } catch {
        // không làm gì, fall-through
      }
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
  getPendingUsers: ()              => api.get('/users/pending'),
  getAllUsers:     ()              => api.get('/users'),
  approveUser:    (id: string)    => api.put(`/users/${id}/approve`),
  rejectUser:     (id: string)    => api.put(`/users/${id}/reject`),
};

// ─── Drivers API ───────────────────────────────────────────────────────────────
export const driversAPI = {
  getDrivers:   ()                            => api.get('/drivers'),
  createDriver: (driverData: any)             => api.post('/drivers', driverData),
  updateDriver: (id: string, data: any)       => api.put(`/drivers/${id}`, data),
  deleteDriver: (id: string)                  => api.delete(`/drivers/${id}`),
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
  getStats: () => api.get('/driver/stats'),
};

// ─── Driver Fake Notifications API ────────────────────────────────────────────
export const driverFakeNotificationsAPI = {
  getFakeNotifications:    (region: string) => api.get(`/driver/fake-notifications?region=${region}`),
  acceptFakeNotification:  (id: string)     => api.post(`/driver/fake-notifications/${id}/accept`),
};

export default api;

import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

// Production VPS URL - dùng HTTPS qua sslip.io
const API_URL = 'https://180-93-35-55.sslip.io/api';

const api = axios.create({
    baseURL: API_URL,
    timeout: 15000,
});

api.interceptors.request.use(async (config) => {
    // SecureStore only works on native platforms, not web
    if (Platform.OS !== 'web') {
        try {
            const token = await SecureStore.getItemAsync('userToken');
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
        } catch (e) {
            console.log('[API] SecureStore error:', e);
        }
    }
    return config;
});

// Response interceptor - handle errors globally
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (!error.response) {
            error.message = 'Không thể kết nối đến máy chủ. Vui lòng thử lại.';
        }
        return Promise.reject(error);
    }
);

export const authAPI = {
    login:    (data: any) => api.post('/auth/login', data),
    register: (data: any) => api.post('/auth/register', data),
    getMe:    ()          => api.get('/auth/me'),
};

export const driversAPI = {
    getDrivers: (region?: string) => api.get(`/drivers${region ? `?region=${region}` : ''}`),
};

export const requestsAPI = {
    getRequests:   (region?: string) => api.get(`/requests${region ? `?region=${region}` : ''}`),
    createRequest: (data: any)       => api.post('/requests', data),
};

export const driverFakeNotificationsAPI = {
    getNotifications:   (region: string) => api.get(`/driver/fake-notifications?region=${region}`),
    acceptNotification: (id: string)     => api.post(`/driver/fake-notifications/${id}/accept`),
};

import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const API_URL = 'http://localhost:5000/api';

const api = axios.create({
    baseURL: API_URL,
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

export const authAPI = {
    login: (data: any) => api.post('/auth/login', data),
    register: (data: any) => api.post('/auth/register', data),
};

export const driversAPI = {
    getDrivers: (region?: string) => api.get(`/drivers${region ? `?region=${region}` : ''}`),
};

export const requestsAPI = {
    getRequests: (region?: string) => api.get(`/requests${region ? `?region=${region}` : ''}`),
    createRequest: (data: any) => api.post('/requests', data),
};

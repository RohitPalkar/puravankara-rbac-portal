import axios from 'axios';
import type { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { CONFIG } from 'src/config-global';

const STORAGE_KEY = 'accessToken';
const REFRESH_KEY = 'refreshToken';

const apiClient = axios.create({
  baseURL: CONFIG.serverUrl,
  headers: { 'Content-Type': 'application/json' },
});

apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = sessionStorage.getItem(STORAGE_KEY);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
}> = [];

const processQueue = (error: unknown, token: string | null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token!);
    }
  });
  failedQueue = [];
};

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return apiClient(originalRequest);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = sessionStorage.getItem(REFRESH_KEY);
        if (!refreshToken) throw new Error('No refresh token');

        const res = await axios.post(`${CONFIG.serverUrl}/auth/refresh`, {
          refreshToken,
        });

        const { accessToken, refreshToken: newRefresh } = res.data?.data || res.data;
        sessionStorage.setItem(STORAGE_KEY, accessToken);
        if (newRefresh) sessionStorage.setItem(REFRESH_KEY, newRefresh);

        processQueue(null, accessToken);
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return await apiClient(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        sessionStorage.removeItem(STORAGE_KEY);
        sessionStorage.removeItem(REFRESH_KEY);
        window.location.href = '/auth/jwt/sign-in';
        return await Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    if (error.response?.status === 403) {
      window.dispatchEvent(new CustomEvent('rbac:forbidden'));
    }

    return Promise.reject(error);
  }
);

export function setTokens(accessToken: string, refreshToken?: string) {
  sessionStorage.setItem(STORAGE_KEY, accessToken);
  if (refreshToken) sessionStorage.setItem(REFRESH_KEY, refreshToken);
}

export function clearTokens() {
  sessionStorage.removeItem(STORAGE_KEY);
  sessionStorage.removeItem(REFRESH_KEY);
}

export function getAccessToken(): string | null {
  return sessionStorage.getItem(STORAGE_KEY);
}

export default apiClient;

import type { AxiosError, InternalAxiosRequestConfig } from 'axios';

import axios from 'axios';

import { CONFIG } from 'src/config-global';

import { AppApiError, NetworkError, NotFoundError, ValidationError, UnauthorizedError } from './errors';

import type { ApiResponse, ApiError as ApiErrorType } from '../types/api';

let accessToken: string | null = null;

export function setAccessToken(token: string | null) {
  accessToken = token;
  if (token) {
    apiClient.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    delete apiClient.defaults.headers.common.Authorization;
  }
}

export function getAccessToken(): string | null {
  return accessToken;
}

if (!CONFIG.serverUrl && typeof window !== 'undefined') {
  console.warn(
    'VITE_SERVER_URL / VITE_API_URL is empty - API baseURL will be "" and requests will 404. Set it in .env or Vercel env.',
  );
}

const apiClient = axios.create({
  baseURL: CONFIG.serverUrl,
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000,
  // Keep-alive for better performance on Render (Oregon ↔ Tokyo)
  transitional: { silentJSONParsing: true },
});

const RETRYABLE_STATUS_CODES = [502, 503, 504];

const MAX_RETRIES = 2;

const RETRY_DELAY_MS = 1000;

function retryDelay(attempt: number): number {
  return RETRY_DELAY_MS * 2 ** attempt;
}

apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  if (accessToken && config.headers) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ApiErrorType>) => {
    if (!error.response) {
      return Promise.reject(new NetworkError());
    }

    const { status, data, config } = error.response;

    const attempt = (config as InternalAxiosRequestConfig & { _retryCount?: number })?._retryCount ?? 0;

    const canRetry =
      RETRYABLE_STATUS_CODES.includes(status) &&
      attempt < MAX_RETRIES;

    if (canRetry) {
      (config as InternalAxiosRequestConfig & { _retryCount?: number })._retryCount = attempt + 1;
      await new Promise((resolve) => setTimeout(resolve, retryDelay(attempt)));
      return apiClient.request(config as InternalAxiosRequestConfig);
    }

    switch (status) {
      case 401: {
        if (accessToken) {
          accessToken = null;
          delete apiClient.defaults.headers.common.Authorization;
        }
        // Attempt refresh once if refreshToken exists in storage
        const refreshToken = typeof window !== 'undefined' ? sessionStorage.getItem('refresh_token') : null;
        const originalConfig = config as InternalAxiosRequestConfig & { _retryAuth?: boolean };
        if (refreshToken && !originalConfig._retryAuth) {
          originalConfig._retryAuth = true;
          try {
            const refreshRes = await axios.post<{ data: { accessToken: string; refreshToken?: string } }>(
              `${CONFIG.serverUrl}/auth/refresh`,
              { refreshToken },
            );
            const newToken = (refreshRes.data as any)?.data?.accessToken || (refreshRes.data as any)?.accessToken;
            if (newToken) {
              setAccessToken(newToken);
              if (typeof window !== 'undefined') sessionStorage.setItem('jwt_access_token', newToken);
              const newRefresh = (refreshRes.data as any)?.data?.refreshToken || (refreshRes.data as any)?.refreshToken;
              if (newRefresh && typeof window !== 'undefined') sessionStorage.setItem('refresh_token', newRefresh);
              originalConfig.headers.Authorization = `Bearer ${newToken}`;
              return await apiClient.request(originalConfig);
            }
          } catch {
            // refresh failed -> fall through to logout
          }
        }
        if (typeof window !== 'undefined') {
          sessionStorage.removeItem('jwt_access_token');
          sessionStorage.removeItem('jwt_user');
          sessionStorage.removeItem('jwt_permissions');
          // Redirect to login preserving returnTo
          const current = window.location.pathname + window.location.search;
          if (!current.startsWith('/auth')) {
            window.location.href = `/auth/jwt/sign-in?returnTo=${encodeURIComponent(current)}`;
          }
        }
        return Promise.reject(new UnauthorizedError(data));
      }
      case 404:
        return Promise.reject(new NotFoundError(data));
      case 422:
        return Promise.reject(new ValidationError(data));
      default:
        return Promise.reject(new AppApiError(data));
    }
  }
);

export async function apiGet<T>(
  url: string,
  params?: Record<string, unknown>
): Promise<ApiResponse<T>> {
  const res = await apiClient.get<ApiResponse<T>>(url, { params });
  return res.data;
}

export async function apiPost<T>(
  url: string,
  data?: unknown
): Promise<ApiResponse<T>> {
  const res = await apiClient.post<ApiResponse<T>>(url, data);
  return res.data;
}

export async function apiPut<T>(
  url: string,
  data?: unknown
): Promise<ApiResponse<T>> {
  const res = await apiClient.put<ApiResponse<T>>(url, data);
  return res.data;
}

export async function apiPatch<T>(
  url: string,
  data?: unknown
): Promise<ApiResponse<T>> {
  const res = await apiClient.patch<ApiResponse<T>>(url, data);
  return res.data;
}

export async function apiDelete<T>(
  url: string
): Promise<ApiResponse<T>> {
  const res = await apiClient.delete<ApiResponse<T>>(url);
  return res.data;
}

export default apiClient;

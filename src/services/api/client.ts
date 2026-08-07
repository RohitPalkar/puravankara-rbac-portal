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

const apiClient = axios.create({
  baseURL: CONFIG.serverUrl,
  headers: { 'Content-Type': 'application/json' },
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
      case 401:
        if (accessToken) {
          accessToken = null;
          delete apiClient.defaults.headers.common.Authorization;
        }
        return Promise.reject(new UnauthorizedError(data));
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

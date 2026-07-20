import { apiGet, apiPost, setAccessToken } from '../api/client';
import { endpoints } from '../api/endpoints';
import type { ApiResponse } from '../types/api';
import type {
  AuthResponse,
  LoginRequest,
  RefreshTokenRequest,
  SetPasswordRequest,
  MeResponse,
} from '../types/auth';

export const authService = {
  login: async (data: LoginRequest): Promise<ApiResponse<AuthResponse>> => {
    const res = await apiPost<AuthResponse>(endpoints.auth.login, data);
    setAccessToken(res.data.accessToken);
    return res;
  },

  refresh: async (data: RefreshTokenRequest): Promise<ApiResponse<AuthResponse>> => {
    const res = await apiPost<AuthResponse>(endpoints.auth.refresh, data);
    setAccessToken(res.data.accessToken);
    return res;
  },

  logout: async (): Promise<ApiResponse<void>> =>
    apiPost<void>(endpoints.auth.logout),

  logoutAll: async (): Promise<ApiResponse<void>> =>
    apiPost<void>(endpoints.auth.logoutAll),

  setPassword: async (data: SetPasswordRequest): Promise<ApiResponse<void>> =>
    apiPost<void>(endpoints.auth.setPassword, data),

  me: async (): Promise<ApiResponse<MeResponse>> =>
    apiGet<MeResponse>(endpoints.auth.me),
};

import api from '@/services/api/axios'
import type { ApiResponse, LoginPayload, RefreshPayload, User } from '@/types/api.types'

export const authService = {
  login: (email: string, password: string) =>
    api.post<ApiResponse<LoginPayload>>('/auth/login', { email, password })
      .then((r) => r.data.data),

  logout: () =>
    api.post<ApiResponse<null>>('/auth/logout').then((r) => r.data),

  refreshToken: (refreshToken: string) =>
    api.post<ApiResponse<RefreshPayload>>('/auth/refresh', { refreshToken })
      .then((r) => r.data.data),

  getProfile: () =>
    api.get<ApiResponse<User>>('/auth/me').then((r) => r.data.data),
}

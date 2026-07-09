import apiClient, { setTokens, clearTokens } from 'src/services/api-client';
import type { PermissionResponse } from 'src/types';

interface LoginRequest {
  email: string;
  password: string;
}

interface LoginResponse {
  accessToken: string;
  refreshToken?: string;
  user: {
    empId: string;
    name: string;
    email: string;
    role?: string;
    roles?: string[];
  };
}

interface MeResponse {
  user: {
    empId: string;
    name: string;
    email: string;
    departmentId?: number;
    department?: string;
    employmentStatus?: string;
  };
  roles: Array<{
    roleId: number;
    roleName: string;
    departmentId: number;
    departmentName: string;
  }>;
}

interface MePermissionsResponse {
  user: {
    empId: string;
    name: string;
    email: string;
    role?: string;
  };
  permissions: {
    modules: Array<{
      code: string;
      name: string;
      route: string;
      allowed: boolean;
      actions?: string[];
    }>;
  };
}

export const authApi = {
  async login(data: LoginRequest): Promise<LoginResponse> {
    const res = await apiClient.post('/auth/sign-in', data);
    const result = res.data?.data || res.data;
    if (result.accessToken) {
      setTokens(result.accessToken, result.refreshToken);
    }
    return result;
  },

  async me(): Promise<MeResponse> {
    const res = await apiClient.get('/auth/me');
    return res.data?.data || res.data;
  },

  async permissionsMe(): Promise<PermissionResponse> {
    const res = await apiClient.get('/permissions/me');
    const raw: MePermissionsResponse = res.data?.data || res.data;
    return {
      user: {
        id: raw.user.empId,
        name: raw.user.name,
        email: raw.user.email,
        role: raw.user.role,
      },
      permissions: {
        modules: (raw.permissions?.modules ?? []).map((m) => ({
          code: m.code,
          name: m.name,
          route: m.route,
          allowed: m.allowed,
          actions: m.actions,
        })),
      },
    };
  },

  async logout(): Promise<void> {
    try {
      await apiClient.post('/auth/logout');
    } finally {
      clearTokens();
    }
  },

  isAuthenticated(): boolean {
    return !!sessionStorage.getItem('accessToken');
  },
};

export type { LoginResponse, MeResponse };

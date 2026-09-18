import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { queryKeys } from '../api/query-keys';
import { setAccessToken } from '../api/client';
import { authService } from '../services/auth.service';

import type { MeUser, MeResponse, LoginRequest, SetPasswordRequest, RefreshTokenRequest, ResetPasswordRequest, ChangePasswordRequest, ForgotPasswordRequest } from '../types/auth';

type FlatMe = MeUser & { roles: MeResponse['roles'] };

export function useMe() {
  return useQuery({
    queryKey: queryKeys.auth.me,
    queryFn: async () => {
      const res = await authService.me();
      return { ...res.data.user, roles: res.data.roles } as FlatMe;
    },
  });
}

export function useLogin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: LoginRequest) => {
      const res = await authService.login(data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.me });
    },
  });
}

export function useRefreshToken() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: RefreshTokenRequest) => {
      const res = await authService.refresh(data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.me });
    },
  });
}

export function useLogout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      await authService.logout();
      setAccessToken(null);
    },
    onSuccess: () => {
      queryClient.clear();
    },
  });
}

export function useSetPassword() {
  return useMutation({
    mutationFn: async (data: SetPasswordRequest) => {
      await authService.setPassword(data);
    },
  });
}

export function useChangePassword() {
  return useMutation({
    mutationFn: async (data: ChangePasswordRequest) => {
      await authService.changePassword(data);
    },
  });
}

export function useForgotPassword() {
  return useMutation({
    mutationFn: async (data: ForgotPasswordRequest) => authService.forgotPassword(data),
  });
}

export function useResetPassword() {
  return useMutation({
    mutationFn: async (data: ResetPasswordRequest) => {
      await authService.resetPassword(data);
    },
  });
}

export function useMyRoles() {
  return useQuery({
    queryKey: queryKeys.auth.myRoles,
    queryFn: async () => {
      const res = await authService.myRoles();
      return res.data;
    },
    staleTime: 10_000,
    refetchOnWindowFocus: true,
  });
}

export function useSwitchRole() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { roleId: number }) => {
      const res = await authService.switchRole(data);
      const d = res.data as any;
      // Persist new tokens atomically
      if (d?.accessToken) {
        setAccessToken(d.accessToken);
        sessionStorage.setItem('jwt_access_token', d.accessToken);
        // Also update jwt_access_token alias used by older code
        sessionStorage.setItem('jwt_accessToken', d.accessToken);
      }
      if (d?.refreshToken) {
        sessionStorage.setItem('refresh_token', d.refreshToken);
      }
      // Persist active role hint for fast UI fallback
      if (d?.activeRoleId) {
        try {
          const stored = sessionStorage.getItem('jwt_user');
          if (stored) {
            const u = JSON.parse(stored);
            u.activeRoleId = d.activeRoleId;
            u.activeRoleName = d.activeRoleName;
            sessionStorage.setItem('jwt_user', JSON.stringify(u));
          }
        } catch {
          // ignore parse errors
        }
      }
      return d;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.me });
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.myRoles });
      queryClient.invalidateQueries({ queryKey: queryKeys.permissions.me });
      // Wipe permission caches
      sessionStorage.removeItem('jwt_permissions');
    },
  });
}

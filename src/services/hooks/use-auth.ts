import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { queryKeys } from '../api/query-keys';
import { setAccessToken } from '../api/client';
import { authService } from '../services/auth.service';

import type { MeUser, MeResponse, LoginRequest, SetPasswordRequest, RefreshTokenRequest } from '../types/auth';

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

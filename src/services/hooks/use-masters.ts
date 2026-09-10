import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import {
  masterCityService,
  bdLandTeamService,
  landConsultantService,
  masterDepartmentService,
} from '../services/master.service';

import type { PaginationQuery } from '../types/api';
import type {
  CreateMasterCityRequest,
  UpdateMasterCityRequest,
  CreateLandConsultantRequest,
  UpdateLandConsultantRequest,
  CreateBDLandTeamMemberRequest,
  UpdateBDLandTeamMemberRequest,
  CreateMasterDepartmentRequest,
  UpdateMasterDepartmentRequest,
} from '../types/master';

export const masterQueryKeys = {
  cities: {
    all: ['master', 'cities'] as const,
    list: (params?: Record<string, unknown>) => ['master', 'cities', 'list', params] as const,
    byId: (id: number) => ['master', 'cities', id] as const,
  },
  consultants: {
    all: ['master', 'land-consultants'] as const,
    list: (params?: Record<string, unknown>) => ['master', 'land-consultants', 'list', params] as const,
    byId: (id: number) => ['master', 'land-consultants', id] as const,
  },
  team: {
    all: ['master', 'bd-land-team'] as const,
    list: (params?: Record<string, unknown>) => ['master', 'bd-land-team', 'list', params] as const,
    byId: (id: number) => ['master', 'bd-land-team', id] as const,
  },
  departments: {
    all: ['master', 'departments'] as const,
    list: (params?: Record<string, unknown>) => ['master', 'departments', 'list', params] as const,
    byId: (id: number) => ['master', 'departments', id] as const,
  },
  allCities: ['master', 'cities', 'all-flat'] as const,
} as const;

export function useMasterCityList(params?: PaginationQuery) {
  return useQuery({
    queryKey: masterQueryKeys.cities.list(params as Record<string, unknown>),
    queryFn: async () => {
      const res = await masterCityService.list(params as Record<string, unknown>);
      return { data: res.data, meta: res.meta };
    },
  });
}

export function useMasterCityById(id: number) {
  return useQuery({
    queryKey: masterQueryKeys.cities.byId(id),
    queryFn: async () => (await masterCityService.byId(id)).data,
    enabled: !!id,
  });
}

export function useCreateMasterCity() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateMasterCityRequest) => masterCityService.create(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: masterQueryKeys.cities.all }),
  });
}

export function useUpdateMasterCity() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateMasterCityRequest }) => masterCityService.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: masterQueryKeys.cities.all }),
  });
}

export function useDeleteMasterCity() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => masterCityService.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: masterQueryKeys.cities.all }),
  });
}

export function useLandConsultantList(params?: PaginationQuery) {
  return useQuery({
    queryKey: masterQueryKeys.consultants.list(params as Record<string, unknown>),
    queryFn: async () => {
      const res = await landConsultantService.list(params as Record<string, unknown>);
      return { data: res.data, meta: res.meta };
    },
  });
}

export function useLandConsultantById(id: number) {
  return useQuery({
    queryKey: masterQueryKeys.consultants.byId(id),
    queryFn: async () => (await landConsultantService.byId(id)).data,
    enabled: !!id,
  });
}

export function useCreateLandConsultant() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateLandConsultantRequest) => landConsultantService.create(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: masterQueryKeys.consultants.all }),
  });
}

export function useUpdateLandConsultant() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateLandConsultantRequest }) => landConsultantService.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: masterQueryKeys.consultants.all }),
  });
}

export function useDeleteLandConsultant() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => landConsultantService.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: masterQueryKeys.consultants.all }),
  });
}

export function useBDLandTeamList(params?: PaginationQuery) {
  return useQuery({
    queryKey: masterQueryKeys.team.list(params as Record<string, unknown>),
    queryFn: async () => {
      const res = await bdLandTeamService.list(params as Record<string, unknown>);
      return { data: res.data, meta: res.meta };
    },
  });
}

export function useBDLandTeamById(id: number) {
  return useQuery({
    queryKey: masterQueryKeys.team.byId(id),
    queryFn: async () => (await bdLandTeamService.byId(id)).data,
    enabled: !!id,
  });
}

export function useCreateBDLandTeamMember() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateBDLandTeamMemberRequest) => bdLandTeamService.create(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: masterQueryKeys.team.all }),
  });
}

export function useUpdateBDLandTeamMember() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateBDLandTeamMemberRequest }) => bdLandTeamService.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: masterQueryKeys.team.all }),
  });
}

export function useDeleteBDLandTeamMember() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => bdLandTeamService.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: masterQueryKeys.team.all }),
  });
}

export function useMasterDepartmentList(params?: PaginationQuery) {
  return useQuery({
    queryKey: masterQueryKeys.departments.list(params as Record<string, unknown>),
    queryFn: async () => {
      const res = await masterDepartmentService.list(params as Record<string, unknown>);
      return { data: res.data, meta: res.meta };
    },
  });
}

export function useMasterDepartmentById(id: number) {
  return useQuery({
    queryKey: masterQueryKeys.departments.byId(id),
    queryFn: async () => (await masterDepartmentService.byId(id)).data,
    enabled: !!id,
  });
}

export function useCreateMasterDepartment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateMasterDepartmentRequest) => masterDepartmentService.create(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: masterQueryKeys.departments.all }),
  });
}

export function useUpdateMasterDepartment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateMasterDepartmentRequest }) => masterDepartmentService.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: masterQueryKeys.departments.all }),
  });
}

export function useDeleteMasterDepartment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => masterDepartmentService.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: masterQueryKeys.departments.all }),
  });
}

export function useAllMasterCities() {
  return useQuery({
    queryKey: masterQueryKeys.allCities,
    queryFn: async () => masterCityService.all(),
  });
}

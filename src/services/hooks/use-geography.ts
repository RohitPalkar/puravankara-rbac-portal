import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { createCrudHooks } from './use-crud';
import { queryKeys } from '../api/query-keys';
import { cityService, zoneService, cityZoneMappingService } from '../services/geography.service';

import type { City, Zone, CreateCityRequest, UpdateCityRequest, CreateZoneRequest, UpdateZoneRequest, CreateCityZoneMappingRequest } from '../types/geography';

export const {
  useList: useCityList,
  useById: useCityById,
  useCreate: useCreateCity,
  useUpdate: useUpdateCity,
  useDelete: useDeleteCity,
} = createCrudHooks<City, CreateCityRequest, UpdateCityRequest>({
  allKey: queryKeys.cities.all,
  listKey: queryKeys.cities.list,
  byIdKey: queryKeys.cities.byId,
  listFn: cityService.list,
  byIdFn: cityService.byId,
  createFn: cityService.create,
  updateFn: cityService.update,
  deleteFn: cityService.delete,
});

export const {
  useList: useZoneList,
  useById: useZoneById,
  useCreate: useCreateZone,
  useUpdate: useUpdateZone,
  useDelete: useDeleteZone,
} = createCrudHooks<Zone, CreateZoneRequest, UpdateZoneRequest>({
  allKey: queryKeys.zones.all,
  listKey: queryKeys.zones.list,
  byIdKey: queryKeys.zones.byId,
  listFn: zoneService.list,
  byIdFn: zoneService.byId,
  createFn: zoneService.create,
  updateFn: zoneService.update,
  deleteFn: zoneService.delete,
});

export function useCityZoneMappingList() {
  return useQuery({
    queryKey: queryKeys.cityZoneMappings.all,
    queryFn: async () => {
      const res = await cityZoneMappingService.list();
      return res.data;
    },
  });
}

export function useCreateCityZoneMapping() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateCityZoneMappingRequest) => {
      const res = await cityZoneMappingService.create(data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.cityZoneMappings.all });
    },
  });
}

export function useDeleteCityZoneMapping() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ cityId, zoneId }: { cityId: number; zoneId: number }) => {
      await cityZoneMappingService.delete(cityId, zoneId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.cityZoneMappings.all });
    },
  });
}

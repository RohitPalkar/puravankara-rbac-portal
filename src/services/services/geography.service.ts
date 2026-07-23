import { endpoints } from '../api/endpoints';
import { createCrudService } from '../api/crud';
import { apiGet, apiPost, apiDelete } from '../api/client';

import type { ApiResponse } from '../types/api';
import type {
  City,
  Zone,
  CityZoneMapping,
  CreateCityRequest,
  UpdateCityRequest,
  CreateZoneRequest,
  UpdateZoneRequest,
  CreateCityZoneMappingRequest,
} from '../types/geography';

export const cityService = createCrudService<City, CreateCityRequest, UpdateCityRequest>({
  list: endpoints.cities.list,
  byId: endpoints.cities.byId,
  create: endpoints.cities.create,
  update: endpoints.cities.update,
  delete: endpoints.cities.delete,
});

export const zoneService = createCrudService<Zone, CreateZoneRequest, UpdateZoneRequest>({
  list: endpoints.zones.list,
  byId: endpoints.zones.byId,
  create: endpoints.zones.create,
  update: endpoints.zones.update,
  delete: endpoints.zones.delete,
});

export const cityZoneMappingService = {
  list: async (): Promise<ApiResponse<CityZoneMapping[]>> =>
    apiGet<CityZoneMapping[]>(endpoints.cityZoneMappings.list),

  create: async (data: CreateCityZoneMappingRequest): Promise<ApiResponse<CityZoneMapping>> =>
    apiPost<CityZoneMapping>(endpoints.cityZoneMappings.create, data),

  delete: async (cityId: number, zoneId: number): Promise<ApiResponse<void>> =>
    apiDelete<void>(endpoints.cityZoneMappings.delete(cityId, zoneId)),
};

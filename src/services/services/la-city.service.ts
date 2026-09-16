import { endpoints } from '../api/endpoints';
import { createCrudService } from '../api/crud';

export interface LaRegion {
  id?: number;
  regionName: string;
  micromarkets?: LaMicromarket[];
}

export interface LaMicromarket {
  id?: number;
  micromarketName: string;
  localities?: LaLocality[];
}

export interface LaLocality {
  id?: number;
  localityName: string;
  pincode: string;
}

export interface LaApproval {
  genericApproval: string;
  governingBodies?: string[];
  documents?: any[];
}

export interface LaCity {
  id: number;
  cityName: string;
  businessZoneId: number;
  businessZoneName?: string;
  regions?: LaRegion[];
  approvals?: LaApproval[];
  isActive: boolean;
  regionsCount?: number;
  micromarketsCount?: number;
  pincodesCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateLaCityRequest {
  cityName: string;
  businessZoneId: number;
  regions?: LaRegion[];
  approvals?: LaApproval[];
  isActive?: boolean;
}

export type UpdateLaCityRequest = Partial<CreateLaCityRequest>;

export const laCityService = createCrudService<LaCity, CreateLaCityRequest, UpdateLaCityRequest>({
  list: endpoints.laCities.list,
  byId: endpoints.laCities.byId,
  create: endpoints.laCities.create,
  update: endpoints.laCities.update,
  delete: endpoints.laCities.delete,
});

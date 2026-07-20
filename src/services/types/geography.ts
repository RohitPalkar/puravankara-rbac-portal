import { AppBase } from './common';

export interface City extends AppBase {
  name: string;
  isActive: boolean;
}

export interface CreateCityRequest {
  name: string;
  isActive?: boolean;
}

export type UpdateCityRequest = Partial<CreateCityRequest>;

export interface Zone extends AppBase {
  name: string;
  isActive: boolean;
  salaryCapping: number;
  startDate: string;
  endDate: string | null;
  salaryCappingLabel?: string;
  citiesMapped?: string[];
}

export interface CreateZoneRequest {
  name: string;
  salaryCapping?: number;
  startDate?: string;
  endDate?: string;
}

export type UpdateZoneRequest = Partial<CreateZoneRequest> & { isActive?: boolean };

export interface CityZoneMapping {
  cityId: number;
  zoneId: number;
  cityName?: string;
  zoneName?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCityZoneMappingRequest {
  cityId: number;
  zoneId: number;
}

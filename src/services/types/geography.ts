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
  effectiveDate: string;
  salaryCappingLabel?: string;
  citiesMapped?: number;
}

export interface CreateZoneRequest {
  name: string;
  isActive?: boolean;
  salaryCapping?: number;
  effectiveDate?: string;
}

export type UpdateZoneRequest = Partial<CreateZoneRequest>;

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

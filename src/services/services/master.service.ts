import * as store from '../mocks/master.store';

import type { PaginatedResult } from '../api/crud';
import type {
  MasterCity,
  LandConsultant,
  BDLandTeamMember,
  MasterDepartment,
  CreateMasterCityRequest,
  UpdateMasterCityRequest,
  CreateLandConsultantRequest,
  UpdateLandConsultantRequest,
  CreateBDLandTeamMemberRequest,
  UpdateBDLandTeamMemberRequest,
  CreateMasterDepartmentRequest,
  UpdateMasterDepartmentRequest,
} from '../types/master';

/**
 * Standalone reference-master services backed by the in-memory mock store.
 *
 * Each method returns the same `{ data, meta }` shape as the real backend
 * services, so the hook/component layer never needs to change when these are
 * swapped for `createCrudService<...>({ ...endpoints })`.
 */

export const masterCityService = {
  list: async (params?: Record<string, unknown>): Promise<PaginatedResult<MasterCity>> =>
    store.listCities(params as { search?: string; page?: number; limit?: number }),

  all: async (): Promise<MasterCity[]> => store.allCitiesFlat(),

  byId: async (id: number): Promise<{ data: MasterCity }> => {
    const record = store.getCity(id);
    if (!record) throw new Error('City not found');
    return { data: record };
  },

  create: async (data: CreateMasterCityRequest): Promise<{ data: MasterCity }> => ({
    data: store.createCity(data as Omit<MasterCity, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt' | 'createdBy' | 'updatedBy'>),
  }),

  update: async (id: number, data: UpdateMasterCityRequest): Promise<{ data: MasterCity }> => {
    const record = store.updateCity(id, data as Partial<MasterCity>);
    if (!record) throw new Error('City not found');
    return { data: record };
  },

  delete: async (id: number): Promise<{ data: void }> => {
    if (!store.deleteCity(id)) throw new Error('City not found');
    return { data: undefined };
  },
};

export const landConsultantService = {
  list: async (params?: Record<string, unknown>): Promise<PaginatedResult<LandConsultant>> =>
    store.listConsultants(params as { search?: string; page?: number; limit?: number }),

  byId: async (id: number): Promise<{ data: LandConsultant }> => {
    const record = store.getConsultant(id);
    if (!record) throw new Error('Land consultant not found');
    return { data: record };
  },

  create: async (data: CreateLandConsultantRequest): Promise<{ data: LandConsultant }> => ({
    data: store.createConsultant(data as unknown as Omit<LandConsultant, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt' | 'createdBy' | 'updatedBy'>),
  }),

  update: async (id: number, data: UpdateLandConsultantRequest): Promise<{ data: LandConsultant }> => {
    const record = store.updateConsultant(id, data as Partial<LandConsultant>);
    if (!record) throw new Error('Land consultant not found');
    return { data: record };
  },

  delete: async (id: number): Promise<{ data: void }> => {
    if (!store.deleteConsultant(id)) throw new Error('Land consultant not found');
    return { data: undefined };
  },
};

export const bdLandTeamService = {
  list: async (params?: Record<string, unknown>): Promise<PaginatedResult<BDLandTeamMember>> =>
    store.listTeam(params as { search?: string; page?: number; limit?: number }),

  byId: async (id: number): Promise<{ data: BDLandTeamMember }> => {
    const record = store.getTeamMember(id);
    if (!record) throw new Error('Team member not found');
    return { data: record };
  },

  create: async (data: CreateBDLandTeamMemberRequest): Promise<{ data: BDLandTeamMember }> => ({
    data: store.createTeamMember(data as unknown as Omit<BDLandTeamMember, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt' | 'createdBy' | 'updatedBy'>),
  }),

  update: async (id: number, data: UpdateBDLandTeamMemberRequest): Promise<{ data: BDLandTeamMember }> => {
    const record = store.updateTeamMember(id, data as Partial<BDLandTeamMember>);
    if (!record) throw new Error('Team member not found');
    return { data: record };
  },

  delete: async (id: number): Promise<{ data: void }> => {
    if (!store.deleteTeamMember(id)) throw new Error('Team member not found');
    return { data: undefined };
  },
};

export const masterDepartmentService = {
  list: async (params?: Record<string, unknown>): Promise<PaginatedResult<MasterDepartment>> =>
    store.listDepartments(params as { search?: string; page?: number; limit?: number }),

  byId: async (id: number): Promise<{ data: MasterDepartment }> => {
    const record = store.getDepartment(id);
    if (!record) throw new Error('Department not found');
    return { data: record };
  },

  create: async (data: CreateMasterDepartmentRequest): Promise<{ data: MasterDepartment }> => ({
    data: store.createDepartment(data as Omit<MasterDepartment, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt' | 'createdBy' | 'updatedBy'>),
  }),

  update: async (id: number, data: UpdateMasterDepartmentRequest): Promise<{ data: MasterDepartment }> => {
    const record = store.updateDepartment(id, data as Partial<MasterDepartment>);
    if (!record) throw new Error('Department not found');
    return { data: record };
  },

  delete: async (id: number): Promise<{ data: void }> => {
    if (!store.deleteDepartment(id)) throw new Error('Department not found');
    return { data: undefined };
  },
};

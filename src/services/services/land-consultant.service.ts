import { endpoints } from '../api/endpoints';
import { createCrudService } from '../api/crud';

export interface LandConsultant {
  id: number;
  consultantType: 'Individual' | 'Registered';
  businessName?: string;
  consultantName?: string;
  gstNo?: string;
  contactPersonName: string;
  contactNumber: string;
  emailAddress: string;
  address: string;
  specialization?: string;
  bdExecutiveId: string;
  isPuravankaraEmployee?: boolean;
  departmentId?: number;
  employeeId?: string;
  isActive: boolean;
  proposedS0Count: number;
  s1s2Count: number;
  mouJdaCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateLandConsultantRequest {
  consultantType: 'Individual' | 'Registered';
  businessName?: string;
  consultantName?: string;
  gstNo?: string;
  contactPersonName: string;
  contactNumber: string;
  emailAddress: string;
  address: string;
  specialization?: string;
  bdExecutiveId: string;
  isPuravankaraEmployee?: boolean;
  departmentId?: number;
  employeeId?: string;
  isActive?: boolean;
}

export type UpdateLandConsultantRequest = Partial<CreateLandConsultantRequest>;

export const landConsultantService = createCrudService<
  LandConsultant,
  CreateLandConsultantRequest,
  UpdateLandConsultantRequest
>({
  list: endpoints.landConsultants.list,
  byId: endpoints.landConsultants.byId,
  create: endpoints.landConsultants.create,
  update: endpoints.landConsultants.update,
  delete: endpoints.landConsultants.delete,
});

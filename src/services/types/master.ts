import type { AppBase } from './common';

/**
 * Standalone reference masters.
 *
 * These entities are intentionally distinct from the existing RBAC City (geography)
 * and Department (organization) entities. They are "not mapped to the working
 * platform" yet, so they live under their own MASTERS nav section and are served
 * by an in-memory mock layer. Swap the mock services for real API calls when a
 * backend becomes available.
 */

/** Template upload entry — dynamic multiple with name + file. */
export interface CityTemplateUpload {
  id: string;
  name: string;
  fileName: string;
  fileUrl?: string;
}

/** Sample reference document for a department. */
export interface CitySampleReference {
  fileName: string;
  fileUrl?: string;
}

/** Per-department approval mapping inside a Generic Approval. */
export interface CityDepartmentMapping {
  id: string;
  departmentName: string;
  /** Checklist: supports URL + file (image/document). */
  checklistUrl?: string;
  checklistFileName?: string;
  checklistFileUrl?: string;
  /** Upload image/document (generic). */
  documentFileName?: string;
  documentFileUrl?: string;
  /** Dynamic templates. */
  templates: CityTemplateUpload[];
  /** Sample reference. */
  sampleReference?: CitySampleReference;
}

/** Generic Approval grouping — UI in popup, contains 1..N department mappings. */
export interface CityGenericApproval {
  id: string;
  title?: string;
  departments: CityDepartmentMapping[];
  createdAt?: string;
}

export interface CityApprovalPayload {
  genericApprovals: CityGenericApproval[];
}

/** Cities master — city/state/country reference used by other masters. */
export interface MasterCity extends AppBase {
  code: string;
  name: string;
  state: string;
  country: string;
  isActive: boolean;
  /** New: Approval & Department Mapping */
  genericApprovals?: CityGenericApproval[];
}

export interface CreateMasterCityRequest {
  code: string;
  name: string;
  state: string;
  country: string;
  isActive?: boolean;
  genericApprovals?: CityGenericApproval[];
}

export type UpdateMasterCityRequest = Partial<CreateMasterCityRequest>;

/** Land Consultants master — external land consultants. */
export interface LandConsultant extends AppBase {
  code: string;
  name: string;
  contactPerson: string;
  mobile: string;
  email: string;
  cityIds: number[];
  specialisation: string;
  isActive: boolean;
}

export interface CreateLandConsultantRequest {
  code: string;
  name: string;
  contactPerson: string;
  mobile: string;
  email: string;
  cityIds: number[];
  specialisation: string;
  isActive?: boolean;
}

export type UpdateLandConsultantRequest = Partial<CreateLandConsultantRequest>;

/** BD & Land Team master — internal business development / land team members. */
export interface BDLandTeamMember extends AppBase {
  empId: string;
  name: string;
  designation: string;
  department: string;
  email: string;
  mobile: string;
  cityIds: number[];
  isActive: boolean;
}

export interface CreateBDLandTeamMemberRequest {
  empId: string;
  name: string;
  designation: string;
  department: string;
  email: string;
  mobile: string;
  cityIds: number[];
  isActive?: boolean;
}

export type UpdateBDLandTeamMemberRequest = Partial<CreateBDLandTeamMemberRequest>;

/**
 * Department master (reference) — company departments such as BD, Land, Finance,
 * Legal, Operations. Distinct from the RBAC Department hierarchy.
 */
export interface MasterDepartment extends AppBase {
  code: string;
  name: string;
  description: string;
  isActive: boolean;
}

export interface CreateMasterDepartmentRequest {
  code: string;
  name: string;
  description: string;
  isActive?: boolean;
}

export type UpdateMasterDepartmentRequest = Partial<CreateMasterDepartmentRequest>;

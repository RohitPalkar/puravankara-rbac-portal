import type { AppBase } from './common';

export interface Phase extends AppBase {
  brandId: number;
  brandName?: string;
  cityId: number;
  cityName?: string;
  projectId: number;
  projectName?: string;
  phaseName: string;
  sfdcPhaseName: string;
  sfdcBlockName?: string;
  possessionDate: string;
  agreementExecutionPercentage?: number;
  bookingGatewayId?: number;
  milestoneGatewayId?: number;
  launchEnabled: boolean;
  launchStartDate?: string;
  launchEndDate?: string;
  sustenanceEnabled: boolean;
  sustenanceDate?: string;
  isActive: boolean;
}

export interface CreatePhaseRequest {
  brandId: number;
  cityId: number;
  projectId: number;
  phaseName: string;
  sfdcPhaseName: string;
  sfdcBlockName?: string;
  possessionDate: string;
  agreementExecutionPercentage?: number;
  bookingGatewayId?: number;
  milestoneGatewayId?: number;
  launchEnabled?: boolean;
  launchStartDate?: string;
  launchEndDate?: string;
  sustenanceEnabled?: boolean;
  sustenanceDate?: string;
  isActive?: boolean;
}

export type UpdatePhaseRequest = Partial<CreatePhaseRequest>;

export interface UpdateLaunchRequest {
  launchEnabled: boolean;
  launchStartDate?: string;
  launchEndDate?: string;
}

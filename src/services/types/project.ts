import { AppBase } from './common';
import { PaymentGatewayType, IncentiveType } from './enums';

export interface Project extends AppBase {
  brandId: number;
  brandName?: string;
  cityId: number;
  cityName?: string;
  name: string;
  billingName?: string;
  gstin?: string;
  panNumber?: string;
  address1?: string;
  address2?: string;
  pinCode?: string;
  projectImage?: string;
  jvLogo?: string;
  sfdcProjectName?: string;
  codename?: string;
  termsHtml?: string;
  isActive: boolean;
  extendedMetadata?: Record<string, unknown>;
  paymentGateways?: ProjectPaymentGateway[];
  incentiveRules?: ProjectIncentiveRule[];
}

export interface ProjectPaymentGateway extends AppBase {
  projectId: number;
  gatewayType: PaymentGatewayType;
  merchantId?: string;
  secretKey?: string;
  salt?: string;
  key?: string;
  subMerchantId?: string;
  isActive: boolean;
}

export interface ProjectIncentiveRule extends AppBase {
  projectId: number;
  incentiveType: IncentiveType;
  regularizationPercentage?: number;
  payablePercentage?: number;
  maxDays?: number;
  startDate?: string;
}

export interface PaymentGatewayRequest {
  gatewayType: PaymentGatewayType;
  merchantId?: string;
  secretKey?: string;
  salt?: string;
  key?: string;
  subMerchantId?: string;
}

export interface IncentiveRuleRequest {
  incentiveType: IncentiveType;
  regularizationPercentage?: number;
  payablePercentage?: number;
  maxDays?: number;
  startDate?: string;
}

export interface CreateProjectRequest {
  brandId: number;
  cityId: number;
  name: string;
  billingName?: string;
  panNumber?: string;
  gstin?: string;
  address1?: string;
  address2?: string;
  pinCode?: string;
  projectImage?: string;
  jvLogo?: string;
  sfdcProjectName?: string;
  codename?: string;
  termsHtml?: string;
  isActive?: boolean;
  paymentGateways?: PaymentGatewayRequest[];
  incentiveRules?: IncentiveRuleRequest[];
}

export type UpdateProjectRequest = Partial<CreateProjectRequest>;

export interface ProjectLocation {
  projectId: number;
  cityId: number;
  zoneId: number;
  cityName?: string;
  zoneName?: string;
}

export interface CreateProjectLocationRequest {
  projectId: number;
  cityId: number;
  zoneId: number;
}

import type { AppBase } from './common';

export interface Brand extends AppBase {
  brandName: string;
  salaryMultiplier: number;
  razorpayMerchantId?: string;
  razorpaySecretKey?: string;
  easebuzzBookingSalt?: string;
  easebuzzBookingKey?: string;
  easebuzzBookingSubMerchantId?: string;
  easebuzzMilestoneSalt?: string;
  easebuzzMilestoneKey?: string;
  easebuzzMilestoneSubMerchantId?: string;
  billingName?: string;
  panNumber?: string;
  gstin?: string;
  address1?: string;
  address2?: string;
  city?: string;
  state?: string;
  country?: string;
  pinCode?: string;
  logoUrl?: string;
  reraRegularizationPercentage?: number;
  reraQualificationPercentage?: number;
  maximumRegularizationDays?: number;
  rtmRegularizationPercentage?: number;
  rtmQualificationPercentage?: number;
  regularizationStartDate?: string;
  termsAndConditions?: string;
  isActive: boolean;
}

export interface CreateBrandRequest {
  brandName: string;
  salaryMultiplier: number;
  razorpayMerchantId?: string;
  razorpaySecretKey?: string;
  easebuzzBookingSalt?: string;
  easebuzzBookingKey?: string;
  easebuzzBookingSubMerchantId?: string;
  easebuzzMilestoneSalt?: string;
  easebuzzMilestoneKey?: string;
  easebuzzMilestoneSubMerchantId?: string;
  billingName?: string;
  panNumber?: string;
  gstin?: string;
  address1?: string;
  address2?: string;
  city?: string;
  state?: string;
  country?: string;
  pinCode?: string;
  logoUrl?: string;
  reraRegularizationPercentage?: number;
  reraQualificationPercentage?: number;
  maximumRegularizationDays?: number;
  rtmRegularizationPercentage?: number;
  rtmQualificationPercentage?: number;
  regularizationStartDate?: string;
  termsAndConditions?: string;
  isActive?: boolean;
}

export type UpdateBrandRequest = Partial<CreateBrandRequest>;

import type { Brand } from 'src/types';

import apiClient from 'src/services/api-client';

interface BrandEntity {
  id: number;
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
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
}

function mapBrand(be: BrandEntity): Brand {
  return {
    id: String(be.id),
    brandName: be.brandName,
    salaryMultiplier: be.salaryMultiplier,
    razorpayMerchantId: be.razorpayMerchantId,
    razorpaySecretKey: be.razorpaySecretKey,
    easebuzzBookingSalt: be.easebuzzBookingSalt,
    easebuzzBookingKey: be.easebuzzBookingKey,
    easebuzzBookingSubMerchantId: be.easebuzzBookingSubMerchantId,
    easebuzzMilestoneSalt: be.easebuzzMilestoneSalt,
    easebuzzMilestoneKey: be.easebuzzMilestoneKey,
    easebuzzMilestoneSubMerchantId: be.easebuzzMilestoneSubMerchantId,
    billingName: be.billingName,
    panNumber: be.panNumber,
    gstin: be.gstin,
    address1: be.address1,
    address2: be.address2,
    pinCode: be.pinCode,
    logoUrl: be.logoUrl,
    reraRegularizationPercentage: be.reraRegularizationPercentage,
    reraQualificationPercentage: be.reraQualificationPercentage,
    maximumRegularizationDays: be.maximumRegularizationDays,
    rtmRegularizationPercentage: be.rtmRegularizationPercentage,
    rtmQualificationPercentage: be.rtmQualificationPercentage,
    regularizationStartDate: be.regularizationStartDate,
    termsAndConditions: be.termsAndConditions,
    status: be.isActive !== false ? 'active' : 'inactive',
    createdBy: be.createdBy || '',
    createdAt: be.createdAt,
    updatedAt: be.updatedAt,
  };
}

export const brandApi = {
  async list(): Promise<Brand[]> {
    const res = await apiClient.get('/brands');
    const raw = res.data?.data || res.data || [];
    const items = Array.isArray(raw) ? raw : [];
    return items.map(mapBrand);
  },

  async getById(id: string): Promise<Brand> {
    const res = await apiClient.get(`/brands/${id}`);
    const raw = res.data?.data || res.data;
    return mapBrand(raw);
  },

  async create(data: {
    brandName: string;
    salaryMultiplier: number;
    isActive?: boolean;
  }): Promise<Brand> {
    const res = await apiClient.post('/brands', data);
    const raw = res.data?.data || res.data;
    return mapBrand(raw);
  },

  async update(id: string, data: Partial<Brand>): Promise<Brand> {
    const res = await apiClient.patch(`/brands/${id}`, data);
    const raw = res.data?.data || res.data;
    return mapBrand(raw);
  },

  async remove(id: string): Promise<void> {
    await apiClient.delete(`/brands/${id}`);
  },
};
import type { AppBase } from './common';

export interface ChannelPartnerType extends AppBase {
  name: string;
  description?: string;
  isActive: boolean;
}

export interface CreateChannelPartnerTypeRequest {
  name: string;
  description?: string;
  isActive?: boolean;
}

export type UpdateChannelPartnerTypeRequest = Partial<CreateChannelPartnerTypeRequest>;

export interface ChannelPartner extends AppBase {
  cpId: string;
  cpName: string;
  cpTypeId: number;
  cpTypeName?: string;
  startDate: string;
  endDate?: string;
  isActive: boolean;
}

export interface CreateChannelPartnerRequest {
  cpId: string;
  cpName: string;
  cpTypeId: number;
  startDate: string;
  endDate?: string;
  isActive?: boolean;
}

export type UpdateChannelPartnerRequest = Partial<CreateChannelPartnerRequest>;

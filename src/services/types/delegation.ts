import type { AppBase } from './common';

export interface Delegation extends AppBase {
  fromUserId: string;
  fromUserName?: string;
  toUserId: string;
  toUserName?: string;
  moduleId?: number;
  moduleName?: string;
  startDate?: string;
  endDate?: string;
  reason?: string;
  isActive: boolean;
}

export interface CreateDelegationRequest {
  fromUserId: string;
  toUserId: string;
  moduleId?: number;
  startDate?: string;
  endDate?: string;
  reason?: string;
}

export interface UpdateDelegationRequest {
  toUserId?: string;
  moduleId?: number;
  startDate?: string;
  endDate?: string;
  reason?: string;
  isActive?: boolean;
}

export interface DelegationQuery {
  fromUserId?: string;
  toUserId?: string;
  moduleId?: number;
  isActive?: boolean;
  search?: string;
  page?: number;
  limit?: number;
}

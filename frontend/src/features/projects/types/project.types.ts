export interface Project {
  id: string
  name: string
  cityId?: string
  cityName?: string
  zoneName?: string
  billingEntityName?: string
  billingGstin?: string
  extendedMetadata?: ProjectMetadata
  projectImagePath?: string
  jvImagePath?: string
  isActive: boolean
  phase?: string
  brand?: string
  company?: string
  paymentGatewayEasebuzz?: boolean
  isReraIncentiveEligible?: boolean
  createdAt?: string
  updatedAt?: string
}

export interface ProjectMetadata {
  phase?: string
  brand?: string
  company?: string
  payment_gateway_easebuzz?: boolean
  is_rera_incentive_eligible?: boolean
}

export interface CreateProjectPayload {
  name: string
  cityId: string
  billingEntityName: string
  billingGstin: string
  extendedMetadata?: ProjectMetadata
  projectImagePath?: string
  jvImagePath?: string
  isActive?: boolean
}

export interface UpdateProjectPayload {
  name?: string
  cityId?: string
  billingEntityName?: string
  billingGstin?: string
  extendedMetadata?: ProjectMetadata
  projectImagePath?: string
  jvImagePath?: string
  isActive?: boolean
}

export interface ProjectListFilters {
  search?: string
  page?: number
  limit?: number
  isActive?: boolean
}

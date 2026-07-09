export enum PermissionType {
  ALLOW = 'ALLOW',
  DENY = 'DENY',
}

export enum ApprovalStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

export enum EmploymentStatus {
  PERMANENT = 'PERMANENT',
  CONTRACT = 'CONTRACT',
  PROBATION = 'PROBATION',
  INTERN = 'INTERN',
  SERVING_NOTICE = 'SERVING_NOTICE',
}

export enum AuthProvider {
  LOCAL = 'LOCAL',
  AZURE_AD = 'AZURE_AD',
  GOOGLE = 'GOOGLE',
  OKTA = 'OKTA',
}

export enum ApprovalType {
  REVIEW = 'REVIEW',
  APPROVE = 'APPROVE',
  REJECT = 'REJECT',
}

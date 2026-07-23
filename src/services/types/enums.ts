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

export enum PaymentGatewayType {
  RAZORPAY = 'RAZORPAY',
  EASEBUZZ_BOOKING = 'EASEBUZZ_BOOKING',
  EASEBUZZ_MILESTONE = 'EASEBUZZ_MILESTONE',
}

export enum IncentiveType {
  RERA = 'RERA',
  RTM = 'RTM',
}

export enum NotificationPriority {
  LOW = 'LOW',
  NORMAL = 'NORMAL',
  HIGH = 'HIGH',
  URGENT = 'URGENT',
}

export enum SubModulePermissionType {
  ACTION = 'ACTION',
  MODULE = 'MODULE',
}

export enum AuditAction {
  CREATE = 'CREATE',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
  LOGIN = 'LOGIN',
  LOGOUT = 'LOGOUT',
}

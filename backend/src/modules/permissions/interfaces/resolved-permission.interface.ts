export interface ResolvedPermission {
  allowed: boolean;
  source: 'role' | 'template' | 'override' | 'profile' | 'super-admin' | 'denied';
  reason?: string;
}

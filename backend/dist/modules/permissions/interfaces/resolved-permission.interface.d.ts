export interface ResolvedPermission {
    allowed: boolean;
    source: 'role' | 'template' | 'override' | 'super-admin' | 'denied';
    reason?: string;
}

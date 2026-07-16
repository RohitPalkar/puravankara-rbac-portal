import { usePermissionStore } from 'src/stores/permission-store';

type CanProps = {
  module: string;
  action?: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
};

export function Can({ module, action, children, fallback = null }: CanProps) {
  const hasPermission = usePermissionStore((s) => s.hasPermission);
  const can = usePermissionStore((s) => s.can);
  const permResponse = usePermissionStore((s) => s.permissionResponse);

  if (!permResponse) return <>{children}</>;

  const allowed = action ? can(module, action) : hasPermission(module);
  if (!allowed) return <>{fallback}</>;

  return <>{children}</>;
}
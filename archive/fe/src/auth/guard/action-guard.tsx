import { usePermissionStore } from 'src/stores/permission-store';

type Props = {
  code: string;
  action?: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
};

export function ActionGuard({ code, action, children, fallback = null }: Props) {
  const hasPermission = usePermissionStore((s) => s.hasPermission);
  const can = usePermissionStore((s) => s.can);
  const permResponse = usePermissionStore((s) => s.permissionResponse);

  if (!permResponse) return <>{children}</>;

  const allowed = action ? can(code, action) : hasPermission(code);
  if (!allowed) return <>{fallback}</>;

  return <>{children}</>;
}
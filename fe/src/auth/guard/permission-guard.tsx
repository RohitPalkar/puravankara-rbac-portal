import { useMemo } from 'react';
import { m } from 'framer-motion';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import { usePathname, useRouter } from 'src/routes/hooks';
import { usePermissionStore } from 'src/stores/permission-store';
import { ForbiddenIllustration } from 'src/assets/illustrations';
import { varBounce, MotionContainer } from 'src/components/animate';
import { Iconify } from 'src/components/iconify';

const ROUTE_CODE_MAP: Record<string, string> = {
  '/dashboard': 'DASHBOARD',
  '/dashboard/zone-master': 'ZONE_MGMT',
  '/dashboard/department-master': 'DEPARTMENTS',
  '/dashboard/project-master': 'PROJECTS',
  '/dashboard/permission-mapping': 'PERMISSION_MATRIX',
  '/dashboard/user-management': 'USERS',
  '/dashboard/audit-logs': 'ACTIVITY_LOGS',
  '/apps/crm': 'CRM',
  '/apps/eoi': 'EOI',
  '/apps/iom': 'IOM',
  '/apps/bookings': 'BOOKINGS',
  '/apps/inventory': 'INVENTORY',
  '/apps/finance': 'FINANCE',
  '/apps/reports': 'REPORTS',
  '/apps/documents': 'DOCUMENTS',
  '/apps/esignature': 'ESIGNATURE',
};

type Props = {
  children: React.ReactNode;
};

export function PermissionGuard({ children }: Props) {
  const pathname = usePathname();
  const router = useRouter();
  const hasPermission = usePermissionStore((s) => s.hasPermission);
  const permResponse = usePermissionStore((s) => s.permissionResponse);

  const allowed = useMemo(() => {
    if (!permResponse) return true;
    const code = Object.entries(ROUTE_CODE_MAP).find(([route]) => pathname.startsWith(route))?.[1];
    if (!code) return true;
    return hasPermission(code);
  }, [pathname, permResponse, hasPermission]);

  if (!allowed) {
    return (
      <Container component={MotionContainer} sx={{ textAlign: 'center', py: 8 }}>
        <m.div variants={varBounce().in}>
          <Typography variant="h3" sx={{ mb: 2 }}>Access Denied</Typography>
        </m.div>
        <m.div variants={varBounce().in}>
          <Typography sx={{ color: 'text.secondary', mb: 4 }}>
            You do not have permission to access this page.
          </Typography>
        </m.div>
        <m.div variants={varBounce().in}>
          <ForbiddenIllustration sx={{ my: { xs: 5, sm: 10 } }} />
        </m.div>
        <m.div variants={varBounce().in}>
          <Stack direction="row" justifyContent="center" spacing={2}>
            <Button
              variant="contained"
              startIcon={<Iconify icon="solar:arrow-left-bold" width={16} />}
              onClick={() => router.back()}
            >
              Go Back
            </Button>
            <Button
              variant="outlined"
              startIcon={<Iconify icon="solar:home-smile-bold" width={16} />}
              onClick={() => router.push('/dashboard')}
            >
              Go to Dashboard
            </Button>
          </Stack>
        </m.div>
      </Container>
    );
  }

  return <>{children}</>;
}
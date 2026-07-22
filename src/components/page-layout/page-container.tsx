import type { StackProps } from '@mui/material/Stack';
import Stack from '@mui/material/Stack';
import { DashboardBreadcrumbs } from 'src/layouts/components/dashboard-breadcrumbs';

export function PageContainer({ children, sx, ...other }: StackProps) {
  return (
    <Stack spacing={3} sx={{ width: 1, px: 4, pt: 3, ...sx }} {...other}>
      <DashboardBreadcrumbs />
      {children}
    </Stack>
  );
}

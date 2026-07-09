import { Helmet } from 'react-helmet-async';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';

import { usePathname } from 'src/routes/hooks';

import { usePermission } from 'src/hooks/use-permission';

import { CONFIG } from 'src/config-global';

import { Iconify } from 'src/components/iconify';
import { PageHeader, PageContainer } from 'src/components/page-layout';

const MODULE_CODE_MAP: Record<string, string> = {
  crm: 'CRM',
  eoi: 'EOI',
  iom: 'IOM',
  bookings: 'BOOKINGS',
  inventory: 'INVENTORY',
  finance: 'FINANCE',
  reports: 'REPORTS',
  documents: 'DOCUMENTS',
  esignature: 'ESIGNATURE',
};

const MODULE_INFO: Record<string, { name: string; description: string; icon: string }> = {
  crm: { name: 'CRM', description: 'Customer relationship management module', icon: 'solar:users-group-rounded-bold-duotone' },
  eoi: { name: 'EOI', description: 'Expression of Interest management module', icon: 'solar:document-bold-duotone' },
  iom: { name: 'IOM', description: 'Instruction of Memo management module', icon: 'solar:file-check-bold-duotone' },
  bookings: { name: 'Bookings', description: 'Booking and reservation management module', icon: 'solar:calendar-mark-bold-duotone' },
  inventory: { name: 'Inventory', description: 'Inventory and stock management module', icon: 'solar:box-bold-duotone' },
  finance: { name: 'Finance', description: 'Financial operations and accounting module', icon: 'solar:wallet-bold-duotone' },
  reports: { name: 'Reports', description: 'Reporting and analytics module', icon: 'solar:chart-square-bold-duotone' },
  documents: { name: 'Documents', description: 'Document management and storage module', icon: 'solar:folder-with-files-bold-duotone' },
  esignature: { name: 'eSignature', description: 'Digital signature and approval module', icon: 'solar:pen-new-square-bold-duotone' },
};

export default function DemoAppPage() {
  const pathname = usePathname();
  const moduleKey = pathname.split('/').pop() ?? 'crm';
  const moduleCode = MODULE_CODE_MAP[moduleKey] ?? moduleKey.toUpperCase();
  const info = MODULE_INFO[moduleKey];
  const { activeRole, activeUser, hasModule, getModuleActions } = usePermission();

  const allowed = hasModule(moduleCode);
  const actions = getModuleActions(moduleCode);

  return (
    <>
      <Helmet><title>{info?.name ?? moduleKey} - {CONFIG.appName}</title></Helmet>
      <PageContainer>
        <PageHeader title={info?.name ?? moduleKey} description={info?.description ?? ''} />

        <Box display="grid" gridTemplateColumns={{ xs: '1fr', md: '1fr 1fr' }} gap={3}>
          <Card sx={{ p: 3 }}>
            <Typography variant="subtitle1" sx={{ mb: 2 }}>Session Info</Typography>
            <Stack spacing={1}>
              <Stack direction="row" justifyContent="space-between">
                <Typography variant="body2" color="text.secondary">User</Typography>
                <Typography variant="body2" fontWeight={600}>{activeUser?.name ?? '-'}</Typography>
              </Stack>
              <Divider />
              <Stack direction="row" justifyContent="space-between">
                <Typography variant="body2" color="text.secondary">Current Role</Typography>
                <Typography variant="body2" fontWeight={600}>{activeRole?.roleName ?? '-'}</Typography>
              </Stack>
              <Divider />
              <Stack direction="row" justifyContent="space-between">
                <Typography variant="body2" color="text.secondary">Department</Typography>
                <Typography variant="body2" fontWeight={600}>{activeUser?.departmentName ?? '-'}</Typography>
              </Stack>
            </Stack>
          </Card>

          <Card sx={{ p: 3 }}>
            <Typography variant="subtitle1" sx={{ mb: 2 }}>
              Module Access
              {!allowed && (
                <Chip label="No Access" size="small" color="error" variant="outlined" sx={{ ml: 1 }} />
              )}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {moduleCode} — Allowed Actions:
            </Typography>
            <Stack direction="row" spacing={1.5} flexWrap="wrap" useFlexGap>
              {actions.length > 0 ? actions.map((action) => (
                <Chip
                  key={action}
                  icon={<Iconify icon="solar:check-circle-bold" width={16} />}
                  label={action.charAt(0) + action.slice(1).toLowerCase()}
                  variant="filled"
                  color="success"
                  sx={{ fontWeight: 500, '& .MuiChip-icon': { fontSize: 16 } }}
                />
              )) : (
                <Typography variant="body2" color="text.disabled">
                  {allowed ? 'No specific actions configured (full access)' : 'You do not have access to this module.'}
                </Typography>
              )}
            </Stack>
          </Card>
        </Box>
      </PageContainer>
    </>
  );
}
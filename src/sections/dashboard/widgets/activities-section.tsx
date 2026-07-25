import { lazy, Suspense } from 'react';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Skeleton from '@mui/material/Skeleton';
import Typography from '@mui/material/Typography';

import { useAuditLogList } from 'src/services/hooks/use-audit';

import { Iconify } from 'src/components/iconify';

function SectionDivider({ icon, label }: { icon: string; label: string }) {
  return (
    <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 2, mt: 0.5 }}>
      <Box sx={{ width: 28, height: 28, borderRadius: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'grey.100' }}>
        <Iconify icon={icon} width={15} sx={{ color: 'text.secondary' }} />
      </Box>
      <Typography variant="caption" sx={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, color: 'text.secondary' }}>
        {label}
      </Typography>
      <Box sx={{ flex: 1, height: 1, bgcolor: 'divider' }} />
    </Stack>
  );
}

const RecentActivities = lazy(() =>
  import('./activities').then((m) => ({ default: m.RecentActivities }))
);
const AuditTimeline = lazy(() =>
  import('./activities').then((m) => ({ default: m.AuditTimeline }))
);

function ActivitiesSkeleton() {
  return (
    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
      <Skeleton variant="rectangular" height={260} sx={{ borderRadius: 1.5 }} />
      <Skeleton variant="rectangular" height={260} sx={{ borderRadius: 1.5 }} />
    </Box>
  );
}

export default function ActivitiesSection() {
  const { data: auditLogs, isLoading: auditLogsLoading } = useAuditLogList(
    { limit: 20, sortBy: 'createdAt' as const, sortOrder: 'DESC' as const },
  );

  return (
    <Box sx={{ mb: 2 }}>
      <SectionDivider icon="solar:clock-circle-bold" label="Activity & Audit" />
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
        <Suspense fallback={<ActivitiesSkeleton />}>
          <RecentActivities auditLogs={auditLogs} auditLoading={auditLogsLoading} />
          <AuditTimeline auditLogs={auditLogs} auditLoading={auditLogsLoading} />
        </Suspense>
      </Box>
    </Box>
  );
}
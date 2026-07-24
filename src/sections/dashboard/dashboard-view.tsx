import { useMemo } from 'react';
import { Helmet } from 'react-helmet-async';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { CONFIG } from 'src/config-global';
import { useMe } from 'src/services/hooks/use-auth';
import { useAuditLogList } from 'src/services/hooks/use-audit';
import { useMyPermissions } from 'src/services/hooks/use-permissions';
import { useModuleTree } from 'src/services/hooks/use-product-catalog';

import { Iconify } from 'src/components/iconify';
import { PageContainer } from 'src/components/page-layout';

import { KpiCards } from './widgets/kpi-cards';
import { AnalyticsSection } from './widgets/charts';
import { ZoneOverview } from './widgets/zone-overview';
import { QuickActions } from './widgets/quick-actions';
import { WelcomeBanner } from './widgets/welcome-banner';
import { OperationsHub } from './widgets/operations-hub';
import { AuditTimeline, RecentActivities } from './widgets/activities';
import { SecurityCenter, SystemHealthWidget } from './widgets/security-health';

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

export default function DashboardView() {
  const { data: me } = useMe();
  const { data: myPermissions } = useMyPermissions();
  const { data: moduleTree } = useModuleTree();
  const { data: auditLogs, isLoading: auditLogsLoading } = useAuditLogList(
    me?.empId
      ? {
          performedBy: me.empId,
          limit: 50,
          sortBy: 'createdAt' as const,
          sortOrder: 'DESC' as const,
        }
      : undefined,
  );

  const { data: allAuditLogs, isLoading: allAuditLogsLoading } = useAuditLogList(
    { limit: 20, sortBy: 'createdAt' as const, sortOrder: 'DESC' as const },
  );

  const isSuperAdmin = useMemo(() => {
    if (!me?.roles?.length) return false;
    return me.roles.some(
      (r: any) => r.isSystemRole === true || ['super_admin', 'super admin', 'superadmin'].includes(r.roleName?.toLowerCase()),
    );
  }, [me]);

  const hasUserModuleAccess = useMemo(() => {
    if (!myPermissions?.projects) return false;
    return myPermissions.projects.some((project: any) =>
      project.modules.some((mod: any) =>
        mod.subModules.some(
          (sm: any) => sm.name === 'USER_MANAGEMENT' && sm.actions.some((a: any) => a.allowed),
        ),
      ),
    );
  }, [myPermissions]);

  return (
    <>
      <Helmet><title>Dashboard - {CONFIG.appName}</title></Helmet>
      <PageContainer>
        {/* Welcome */}
        <Box sx={{ mb: 3 }}>
          <WelcomeBanner me={me} />
        </Box>

        {/* KPI Cards */}
        <Box sx={{ mb: 3 }}>
          <KpiCards />
        </Box>

        {/* Analytics */}
        <Box sx={{ mb: 3 }}>
          <SectionDivider icon="solar:chart-2-bold" label="Analytics" />
          <AnalyticsSection auditLogs={auditLogs} auditLoading={auditLogsLoading} moduleTree={moduleTree} />
        </Box>

        {/* Operations Hub */}
        {(isSuperAdmin || hasUserModuleAccess) && (
          <Box sx={{ mb: 3 }}>
            <SectionDivider icon="solar:inbox-archive-bold" label="Operations Hub" />
            <OperationsHub />
          </Box>
        )}

        {/* Zone Overview + Security + Health */}
        {isSuperAdmin && (
          <Box sx={{ mb: 3 }}>
            <SectionDivider icon="solar:map-point-bold" label="Zone Overview" />
            <Box sx={{ mb: 2 }}>
              <ZoneOverview />
            </Box>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr 1fr' }, gap: 2 }}>
              <SecurityCenter />
              <SystemHealthWidget />
              <QuickActions isSuperAdmin={isSuperAdmin} hasUserAccess={hasUserModuleAccess} />
            </Box>
          </Box>
        )}

        {/* Activities + Audit Timeline */}
        <Box sx={{ mb: 2 }}>
          <SectionDivider icon="solar:clock-circle-bold" label="Activity & Audit" />
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
            <RecentActivities auditLogs={allAuditLogs} auditLoading={allAuditLogsLoading} />
            <AuditTimeline auditLogs={allAuditLogs} auditLoading={allAuditLogsLoading} />
          </Box>
        </Box>
      </PageContainer>
    </>
  );
}

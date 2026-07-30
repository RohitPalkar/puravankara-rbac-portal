import type { Zone } from 'src/services/types/geography';

import { useMemo, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useQuery } from '@tanstack/react-query';

import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

import { CONFIG } from 'src/config-global';
import { useMe } from 'src/services/hooks/use-auth';
import { queryKeys } from 'src/services/api/query-keys';
import { useAuditLogList } from 'src/services/hooks/use-audit';
import { useMyPermissions } from 'src/services/hooks/use-permissions';
import { zoneService } from 'src/services/services/geography.service';
import { useModuleTree } from 'src/services/hooks/use-product-catalog';

import { Iconify } from 'src/components/iconify';
import { PageContainer } from 'src/components/page-layout';
import { renderDropdownItems } from 'src/components/hook-form/dropdown-empty';

import { useAuthContext } from 'src/auth/hooks/use-auth-context';

import { filterWidgets, createWidgetRegistry, groupWidgetsBySection } from './widget-engine';

import type { WidgetContext, WidgetSection } from './widget-engine';

function SectionHeader({ icon, label }: { icon: string; label: string }) {
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

const SECTION_ICONS: Record<WidgetSection, string> = {
  welcome: 'solar:home-smile-bold',
  kpi: 'solar:chart-2-bold',
  analytics: 'solar:chart-square-bold',
  zone: 'solar:map-point-wave-bold',
  operations: 'solar:tuning-2-bold',
  security: 'solar:shield-check-bold',
  health: 'solar:health-bold',
  activities: 'solar:clock-circle-bold',
  'quick-actions': 'solar:flash-bold',
  'system-status': 'solar:health-bold',
};

const SECTION_LABELS: Record<WidgetSection, string> = {
  welcome: '',
  kpi: 'Overview',
  analytics: 'Analytics',
  zone: 'Zone Overview',
  operations: 'Operations Hub',
  security: 'Security Center',
  health: 'System Health',
  activities: 'Recent Activity',
  'quick-actions': 'Quick Actions',
  'system-status': 'System Status',
};

function RenderWidget({ widget, ctx }: { widget: any; ctx: WidgetContext }) {
  const { component: Component, props = {} } = widget;
  return <Component {...props} />;
}

export default function DashboardView() {
  const { data: me } = useMe();
  const { user: authUser } = useAuthContext();
  const { data: myPermissions } = useMyPermissions();
  const { data: moduleTree } = useModuleTree();
  const [selectedZoneId, setSelectedZoneId] = useState<number | ''>('');

  const isSuperAdmin = Array.isArray((authUser as any)?.roles)
    && (authUser as any).roles.includes('SUPER_ADMIN');

  const { data: allZones } = useQuery({
    queryKey: queryKeys.zones.list({}),
    queryFn: async () => {
      const res = await zoneService.list({});
      return (res.data ?? []) as Zone[];
    },
  });

  const activeZones = useMemo(() => (allZones ?? []).filter((z: Zone) => z.isActive !== false), [allZones]);

  const { data: auditLogs, isLoading: auditLoading } = useAuditLogList(
    { limit: 20, sortBy: 'createdAt' as const, sortOrder: 'DESC' as const },
  );

  const widgetCtx: WidgetContext = useMemo(() => ({
    me,
    myPermissions,
    moduleTree,
    auditLogs,
    auditLoading,
    isSuperAdmin,
    selectedZoneId: selectedZoneId || undefined,
  }), [me, myPermissions, moduleTree, auditLogs, auditLoading, isSuperAdmin, selectedZoneId]);

  const visibleWidgets = useMemo(() => {
    const registry = createWidgetRegistry(widgetCtx);
    return filterWidgets(registry, widgetCtx);
  }, [widgetCtx]);

  const grouped = useMemo(() => groupWidgetsBySection(visibleWidgets), [visibleWidgets]);

  const sectionOrder: WidgetSection[] = [
    'welcome', 'kpi', 'analytics', 'zone', 'operations',
    'activities', 'system-status', 'security', 'health', 'quick-actions',
  ];

  return (
    <>
      <Helmet><title>Dashboard - {CONFIG.appName}</title></Helmet>
      <PageContainer>
        <Box sx={{ mb: 3 }}>
          {grouped.welcome?.[0] && <RenderWidget widget={grouped.welcome[0]} ctx={widgetCtx} />}
        </Box>

        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'flex-end' }}>
          <TextField
            select
            label="Zone"
            value={selectedZoneId}
            onChange={(e) => setSelectedZoneId(Number(e.target.value) || '')}
            sx={{ minWidth: 200 }}
            size="small"
          >
            <MenuItem value="">All Zones</MenuItem>
            {renderDropdownItems(activeZones, (z) => <MenuItem key={z.id} value={z.id}>{z.name}</MenuItem>)}
          </TextField>
        </Box>

        {sectionOrder.map((section) => {
          const widgets = grouped[section];
          if (!widgets?.length) return null;

          const label = SECTION_LABELS[section];
          const icon = SECTION_ICONS[section];

          const isGrid = ['kpi', 'analytics', 'zone', 'operations', 'activities'].includes(section);
          const isMultiColumn = ['security', 'health'].includes(section);

          if (section === 'activities') {
            return (
              <Box key={section} sx={{ mb: 3 }}>
                <SectionHeader icon={icon} label={label} />
                <Grid container spacing={2}>
                  {widgets.map((w) => (
                    <Grid item key={w.id} xs={w.gridWidth?.xs ?? 12} md={w.gridWidth?.md ?? 12}>
                      <RenderWidget widget={w} ctx={widgetCtx} />
                    </Grid>
                  ))}
                </Grid>
              </Box>
            );
          }

          if (isGrid) {
            return (
              <Box key={section} sx={{ mb: 3 }}>
                {label && <SectionHeader icon={icon} label={label} />}
                <Grid container spacing={2}>
                  {widgets.map((w) => (
                    <Grid item key={w.id} xs={12}>
                      <RenderWidget widget={w} ctx={widgetCtx} />
                    </Grid>
                  ))}
                </Grid>
              </Box>
            );
          }

          if (isMultiColumn) {
            return (
              <Box key={section} sx={{ mb: 3 }}>
                <SectionHeader icon={icon} label={label} />
                <Grid container spacing={2}>
                  {widgets.map((w) => (
                    <Grid item key={w.id} xs={w.gridWidth?.xs ?? 12} md={w.gridWidth?.md ?? 6}>
                      <RenderWidget widget={w} ctx={widgetCtx} />
                    </Grid>
                  ))}
                </Grid>
              </Box>
            );
          }

          return (
            <Box key={section} sx={{ mb: 3 }}>
              {label && <SectionHeader icon={icon} label={label} />}
              {widgets.map((w) => (
                <RenderWidget key={w.id} widget={w} ctx={widgetCtx} />
              ))}
            </Box>
          );
        })}
      </PageContainer>
    </>
  );
}

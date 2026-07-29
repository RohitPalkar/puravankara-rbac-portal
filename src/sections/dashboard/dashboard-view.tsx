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
import { zoneService } from 'src/services/services/geography.service';

import { Iconify } from 'src/components/iconify';
import { PageContainer } from 'src/components/page-layout';

import { KpiCards } from './widgets/kpi-cards';
import { QuickActions } from './widgets/quick-actions';
import { SystemStatus } from './widgets/system-status';
import { WelcomeBanner } from './widgets/welcome-banner';
import { RecentActivity } from './widgets/recent-activity';

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
  const [selectedZoneId, setSelectedZoneId] = useState<number | ''>('');

  const { data: allZones } = useQuery({
    queryKey: queryKeys.zones.list({}),
    queryFn: async () => {
      const res = await zoneService.list({});
      return (res.data ?? []) as Zone[];
    },
  });

  const activeZones = useMemo(() => (allZones ?? []).filter((z: Zone) => z.isActive !== false), [allZones]);

  return (
    <>
      <Helmet><title>Dashboard - {CONFIG.appName}</title></Helmet>
      <PageContainer>
        {/* Welcome Banner */}
        <Box sx={{ mb: 3 }}>
          <WelcomeBanner me={me} />
        </Box>

        {/* Zone Filter */}
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
            {activeZones.map((z) => <MenuItem key={z.id} value={z.id}>{z.name}</MenuItem>)}
          </TextField>
        </Box>

        {/* KPI Cards */}
        <Box sx={{ mb: 3 }}>
          <SectionDivider icon="solar:chart-2-bold" label="Overview" />
          <KpiCards zoneId={selectedZoneId || undefined} />
        </Box>

        {/* Recent Activity + System Status + Quick Actions */}
        <Grid container spacing={2}>
          <Grid item xs={12} md={7}>
            <SectionDivider icon="solar:clock-circle-bold" label="Recent Activity" />
            <RecentActivity />
          </Grid>
          <Grid item xs={12} md={5}>
            <SectionDivider icon="solar:health-bold" label="System" />
            <Stack spacing={2}>
              <SystemStatus zoneId={selectedZoneId || undefined} />
              <QuickActions />
            </Stack>
          </Grid>
        </Grid>
      </PageContainer>
    </>
  );
}

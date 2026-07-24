import dayjs from 'dayjs';
import { useMemo } from 'react';
import {
  Bar,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  BarChart,
  PieChart,
  ResponsiveContainer,
} from 'recharts';

import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Skeleton from '@mui/material/Skeleton';
import Typography from '@mui/material/Typography';
import CardContent from '@mui/material/CardContent';

import { Iconify } from 'src/components/iconify';

const COLORS = ['#2F3C98', '#5B6ABF', '#8B9FE8', '#4CAF50', '#FF9800', '#E91E63', '#00BCD4', '#9C27B0'];

interface Props {
  auditLogs: any;
  auditLoading: boolean;
  moduleTree: any;
}

function groupAuditByDate(logs: any[]): { date: string; count: number }[] {
  const map = new Map<string, number>();
  for (let i = 6; i >= 0; i -= 1) {
    map.set(dayjs().subtract(i, 'day').format('MMM DD'), 0);
  }
  logs.forEach((log) => {
    const d = dayjs(log.createdAt).format('MMM DD');
    if (map.has(d)) map.set(d, (map.get(d) ?? 0) + 1);
  });
  return Array.from(map.entries()).map(([date, count]) => ({ date, count }));
}

export function AnalyticsSection({ auditLogs, auditLoading, moduleTree }: Props) {
  const barData = useMemo(() => {
    if (!auditLogs) return [];
    const logs = Array.isArray(auditLogs) ? auditLogs : (auditLogs as any).data ?? [];
    return groupAuditByDate(logs);
  }, [auditLogs]);

  const pieData = useMemo(() => {
    if (!moduleTree?.length) return [];
    return moduleTree.map((mod: any) => ({ name: mod.name, value: mod.subModules?.length ?? 0 }));
  }, [moduleTree]);

  if (auditLoading) {
    return (
      <Grid container spacing={2}>
        <Grid item xs={12} md={7}><Skeleton variant="rectangular" height={280} sx={{ borderRadius: 1.5 }} /></Grid>
        <Grid item xs={12} md={5}><Skeleton variant="rectangular" height={280} sx={{ borderRadius: 1.5 }} /></Grid>
      </Grid>
    );
  }

  if (barData.length === 0 && pieData.length === 0) return null;

  return (
    <Grid container spacing={2}>
      {/* Bar: Activity Trend */}
      {barData.length > 0 && (
        <Grid item xs={12} md={7}>
          <Card variant="outlined" sx={{ borderRadius: 1.5, height: 1 }}>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
                <Iconify icon="solar:chart-2-bold" width={18} color="primary.main" />
                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>Activity Trend (7 days)</Typography>
              </Stack>
              <ResponsiveContainer width="100%" height={230}>
                <BarChart data={barData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #e0e0e0', fontSize: 13 }} />
                  <Bar dataKey="count" fill="#2F3C98" radius={[4, 4, 0, 0]} maxBarSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
      )}

      {/* Pie: Module Distribution */}
      {pieData.length > 0 && (
        <Grid item xs={12} md={5}>
          <Card variant="outlined" sx={{ borderRadius: 1.5, height: 1 }}>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                <Iconify icon="solar:pie-chart-2-bold" width={18} color="primary.main" />
                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>Sub-Modules per Module</Typography>
              </Stack>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={2} dataKey="value">
                    {pieData.map((_: any, i: number) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #e0e0e0', fontSize: 13 }} />
                </PieChart>
              </ResponsiveContainer>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, justifyContent: 'center', mt: 0.5 }}>
                {pieData.slice(0, 5).map((entry: any, i: number) => (
                  <Stack key={entry.name} direction="row" spacing={0.5} alignItems="center">
                    <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: COLORS[i % COLORS.length], flexShrink: 0 }} />
                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>{entry.name}</Typography>
                  </Stack>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      )}
    </Grid>
  );
}

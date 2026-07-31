import { useMemo } from 'react';

import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Skeleton from '@mui/material/Skeleton';
import Typography from '@mui/material/Typography';
import CardContent from '@mui/material/CardContent';

import { Iconify } from 'src/components/iconify';

const ACTION_ORDER = ['VIEW', 'CREATE', 'EDIT', 'DELETE', 'APPROVE', 'EXPORT'];

type ModuleSummaryItem = { id: string | number | null; name: string; summary: Record<string, boolean> };

export function PermissionSummary({ permissions, moduleTree, isLoading }: { permissions: any; moduleTree: any; isLoading: boolean }) {
  const modules = useMemo<ModuleSummaryItem[]>(() => {
    if (!permissions || !Array.isArray(permissions.projects) || !moduleTree) return [];

    const allowedModules = new Map<string, Record<string, boolean>>();
    permissions.projects.forEach((project: any) => {
      (project.modules ?? []).forEach((mod: any) => {
        if (!allowedModules.has(mod.name)) {
          allowedModules.set(mod.name, Object.fromEntries(ACTION_ORDER.map((code) => [code, false])));
        }
        (mod.subModules ?? []).forEach((sm: any) => {
          if (!moduleTree.some((m: any) => m.name === mod.name)) return;
          (sm.actions ?? []).forEach((a: any) => {
            if (a.allowed) allowedModules.get(mod.name)![a.code] = true;
          });
        });
      });
    });

    return Array.from(allowedModules.entries())
      .filter(([, summary]) => ACTION_ORDER.some((code) => summary[code]))
      .map(([name, summary]) => ({ id: null, name, summary }));
  }, [permissions, moduleTree]);

  if (isLoading) {
    return (
      <Card variant="outlined" sx={{ borderRadius: 2 }}>
        <CardContent>
          <Skeleton width={200} height={24} sx={{ mb: 2 }} />
          <Skeleton width="100%" height={56} />
        </CardContent>
      </Card>
    );
  }

  if (modules.length === 0) {
    return null;
  }

  return (
    <Card variant="outlined" sx={{ borderRadius: 2 }}>
      <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
          <Box sx={{ width: 30, height: 30, borderRadius: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'success.lighter' }}>
            <Iconify icon="solar:shield-check-bold" width={16} color="success.main" />
          </Box>
          <Typography variant="subtitle2" fontWeight={700}>Your Permissions</Typography>
        </Stack>

        <Grid container spacing={1.5}>
          {modules.map((mod) => (
            <Grid item xs={12} sm={6} md={4} key={mod.id}>
              <Card variant="outlined" sx={{ borderRadius: 1.5, bgcolor: 'background.default' }}>
                <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
                  <Typography variant="body2" fontWeight={700} sx={{ mb: 1 }}>
                    {mod.name}
                  </Typography>
                  <Stack direction="row" flexWrap="wrap" spacing={0.5}>
                    {ACTION_ORDER.map((code) => (
                      <Chip
                        key={code}
                        size="small"
                        label={code}
                        icon={mod.summary[code]
                          ? <Iconify icon="solar:check-circle-bold" width={14} color="success.main" />
                          : <Iconify icon="solar:close-circle-bold" width={14} color="error.main" />}
                        variant={mod.summary[code] ? 'filled' : 'outlined'}
                        color={mod.summary[code] ? 'success' : 'default'}
                      />
                    ))}
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </CardContent>
    </Card>
  );
}

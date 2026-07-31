import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Skeleton from '@mui/material/Skeleton';
import Typography from '@mui/material/Typography';
import CardContent from '@mui/material/CardContent';

import { paths } from 'src/routes/paths';

import { Iconify } from 'src/components/iconify';

import { hasAnyAction } from 'src/auth/utils/authorization';

function slugify(text: string): string {
  return text.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
}

export function ModuleShortcuts({ permissions, moduleTree, isLoading }: { permissions: any; moduleTree: any; isLoading: boolean }) {
  const navigate = useNavigate();

  const modules = useMemo(() => {
    if (!permissions || !moduleTree || isLoading) return [];
    return (moduleTree ?? []).filter((mod: any) => hasAnyAction(permissions, mod.name));
  }, [permissions, moduleTree, isLoading]);

  if (isLoading) {
    return (
      <Grid container spacing={2}>
        {[1, 2, 3, 4].map((i) => (
          <Grid item xs={6} md={3} key={i}>
            <Skeleton variant="rounded" height={96} sx={{ borderRadius: 2 }} />
          </Grid>
        ))}
      </Grid>
    );
  }

  if (modules.length === 0) return null;

  return (
    <Grid container spacing={2}>
      {modules.map((mod: any) => (
        <Grid item xs={6} md={3} key={mod.id}>
          <Card
            variant="outlined"
            sx={{
              borderRadius: 2,
              height: 1,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              '&:hover': { borderColor: 'primary.main', bgcolor: 'primary.lighter', transform: 'translateY(-2px)' },
            }}
            onClick={() => navigate(paths.dashboard.modules.dashboard(slugify(mod.code ?? mod.name)))}
          >
            <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
              <Stack direction="row" spacing={1.5} alignItems="center">
                <Box sx={{ width: 36, height: 36, borderRadius: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'primary.lighter' }}>
                  <Iconify icon="solar:folder-bold" width={18} color="primary.main" />
                </Box>
                <Box sx={{ minWidth: 0 }}>
                  <Typography variant="body2" fontWeight={700} noWrap>{mod.name}</Typography>
                  <Typography variant="caption" color="text.secondary">Open module</Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
}

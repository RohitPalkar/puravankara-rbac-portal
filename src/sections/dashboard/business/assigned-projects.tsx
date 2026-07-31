import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';

import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Skeleton from '@mui/material/Skeleton';
import Typography from '@mui/material/Typography';
import CardContent from '@mui/material/CardContent';

import { queryKeys } from 'src/services/api/query-keys';
import { projectService } from 'src/services/services/project.service';

import { Iconify } from 'src/components/iconify';

interface AssignedProject {
  id: number;
  name: string;
  brandName?: string;
  phaseName?: string;
  cityName?: string;
  zoneName?: string;
}

function ProjectCard({ project }: { project: AssignedProject }) {
  const rows = [
    { icon: 'solar:tag-bold', label: 'Brand', value: project.brandName },
    { icon: 'solar:layers-minimalistic-bold', label: 'Phase', value: project.phaseName },
    { icon: 'solar:city-bold', label: 'City', value: project.cityName },
    { icon: 'solar:map-point-wave-bold', label: 'Zone', value: project.zoneName },
  ].filter((r) => r.value);

  return (
    <Card variant="outlined" sx={{ borderRadius: 2, height: 1, transition: 'all 0.2s ease', '&:hover': { boxShadow: (theme) => theme.shadows[8], transform: 'translateY(-2px)' } }}>
      <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
        <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 1.5 }}>
          <Box sx={{ width: 40, height: 40, borderRadius: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'primary.lighter' }}>
            <Iconify icon="solar:building-bold" width={20} color="primary.main" />
          </Box>
          <Typography variant="subtitle1" fontWeight={700} noWrap>{project.name}</Typography>
        </Stack>
        <Stack spacing={1}>
          {rows.map((row) => (
            <Stack key={row.label} direction="row" spacing={1} alignItems="center">
              <Iconify icon={row.icon} width={16} sx={{ color: 'text.secondary' }} />
              <Typography variant="caption" color="text.secondary" sx={{ minWidth: 56 }}>{row.label}</Typography>
              <Typography variant="body2" fontWeight={600}>{row.value}</Typography>
            </Stack>
          ))}
        </Stack>
      </CardContent>
    </Card>
  );
}

export function AssignedProjects({ projectIds }: { projectIds: number[] }) {
  const { data: projects, isLoading } = useQuery({
    queryKey: queryKeys.projects.list({}),
    queryFn: async () => {
      const res = await projectService.list({});
      return (res.data ?? []) as AssignedProject[];
    },
  });

  const assigned = useMemo(
    () => (projects ?? []).filter((p) => projectIds.includes(p.id)),
    [projects, projectIds]
  );

  if (projectIds.length === 0) {
    return (
      <Card variant="outlined" sx={{ borderRadius: 2 }}>
        <CardContent>
          <Typography variant="body2" color="text.secondary">
            No projects assigned yet. Contact your administrator.
          </Typography>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Grid container spacing={2}>
        {[1, 2].map((i) => (
          <Grid item xs={12} sm={6} md={4} key={i}>
            <Skeleton variant="rounded" height={150} sx={{ borderRadius: 2 }} />
          </Grid>
        ))}
      </Grid>
    );
  }

  if (assigned.length === 0) {
    return (
      <Card variant="outlined" sx={{ borderRadius: 2 }}>
        <CardContent>
          <Stack direction="row" spacing={1} alignItems="center">
            <Iconify icon="solar:building-bold" width={20} color="text.secondary" />
            <Typography variant="body2" color="text.secondary">
              Project details unavailable.
            </Typography>
          </Stack>
        </CardContent>
      </Card>
    );
  }

  return (
    <Grid container spacing={2}>
      {assigned.map((project) => (
        <Grid item xs={12} sm={6} md={4} key={project.id}>
          <ProjectCard project={project} />
        </Grid>
      ))}
    </Grid>
  );
}

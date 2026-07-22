import { Helmet } from 'react-helmet-async';
import { useNavigate, useParams } from 'react-router-dom';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import { CONFIG } from 'src/config-global';
import { PageContainer, PageHeader } from 'src/components/page-layout';
import { Iconify } from 'src/components/iconify';
import { useModuleActions } from './hooks/use-module-permission';

export default function ModuleViewPage() {
  const navigate = useNavigate();
  const { moduleCode, id } = useParams<{ moduleCode: string; id: string }>();
  const { actions, moduleName, isLoading } = useModuleActions();

  if (isLoading) {
    return (
      <PageContainer>
        <CircularProgress />
      </PageContainer>
    );
  }

  return (
    <>
      <Helmet><title>View {moduleName || 'Record'} - {CONFIG.appName}</title></Helmet>
      <PageContainer>
        <PageHeader
          title={`${moduleName || 'Record'} #${id}`}
          description={`View details of ${moduleName?.toLowerCase() || 'module'} record #${id}.`}
          action={
            <Stack direction="row" spacing={1}>
              {actions.EDIT && (
                <Button
                  variant="contained"
                  startIcon={<Iconify icon="solar:pen-bold" />}
                  onClick={() => navigate(`/dashboard/modules/${moduleCode}/${id}/edit`)}
                >
                  Edit
                </Button>
              )}
              {actions.DELETE && (
                <Button
                  variant="outlined"
                  color="error"
                  startIcon={<Iconify icon="solar:trash-bin-trash-bold" />}
                  onClick={() => navigate(`/dashboard/modules/${moduleCode}/${id}/delete`)}
                >
                  Delete
                </Button>
              )}
            </Stack>
          }
        />

        {!actions.VIEW ? (
          <Card>
            <CardContent>
              <Stack spacing={2} alignItems="center" sx={{ py: 4 }}>
                <Iconify icon="solar:forbidden-circle-bold" width={48} color="error.main" />
                <Typography variant="h6" color="error">Access Denied</Typography>
                <Typography color="text.secondary" textAlign="center">
                  You do not have permission to view records in this module.
                </Typography>
                <Chip label="VIEW action required" color="error" variant="outlined" />
                <Button variant="outlined" onClick={() => navigate(`/dashboard/modules/${moduleCode}`)}>
                  Go to Dashboard
                </Button>
              </Stack>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent>
              <Stack spacing={2} sx={{ maxWidth: 600 }}>
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="subtitle2" color="text.secondary">ID</Typography>
                  <Typography>{id}</Typography>
                </Stack>
                <Divider />
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="subtitle2" color="text.secondary">Name</Typography>
                  <Typography>{`Sample ${moduleName || 'Record'} ${id}`}</Typography>
                </Stack>
                <Divider />
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="subtitle2" color="text.secondary">Code</Typography>
                  <Typography>{`${moduleCode?.toUpperCase()}-${id?.padStart(3, '0')}`}</Typography>
                </Stack>
                <Divider />
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="subtitle2" color="text.secondary">Status</Typography>
                  <Chip label="Active" color="success" size="small" />
                </Stack>
                <Divider />
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="subtitle2" color="text.secondary">Created Date</Typography>
                  <Typography>2026-01-15</Typography>
                </Stack>
                <Divider />
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="subtitle2" color="text.secondary">Last Updated</Typography>
                  <Typography>2026-03-22</Typography>
                </Stack>
              </Stack>
            </CardContent>
          </Card>
        )}
      </PageContainer>
    </>
  );
}

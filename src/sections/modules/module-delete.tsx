import { Helmet } from 'react-helmet-async';
import { useNavigate, useParams } from 'react-router-dom';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import Chip from '@mui/material/Chip';
import Alert from '@mui/material/Alert';
import { CONFIG } from 'src/config-global';
import { PageContainer, PageHeader } from 'src/components/page-layout';
import { Iconify } from 'src/components/iconify';
import { useModuleActions } from './hooks/use-module-permission';

export default function ModuleDeletePage() {
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
      <Helmet><title>Delete {moduleName || 'Record'} - {CONFIG.appName}</title></Helmet>
      <PageContainer>
        <PageHeader
          title={`Delete ${moduleName || 'Record'} #${id}`}
          description={`Confirm deletion of ${moduleName?.toLowerCase() || 'module'} record #${id}.`}
        />

        {!actions.DELETE ? (
          <Card>
            <CardContent>
              <Stack spacing={2} alignItems="center" sx={{ py: 4 }}>
                <Iconify icon="solar:forbidden-circle-bold" width={48} color="error.main" />
                <Typography variant="h6" color="error">Access Denied</Typography>
                <Typography color="text.secondary" textAlign="center">
                  You do not have permission to delete records in this module.
                </Typography>
                <Chip label="DELETE action required" color="error" variant="outlined" />
                <Button variant="outlined" onClick={() => navigate(`/dashboard/modules/${moduleCode}/${id}`)}>
                  Go Back
                </Button>
              </Stack>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent>
              <Stack spacing={3} sx={{ maxWidth: 600 }}>
                <Alert severity="warning" icon={<Iconify icon="solar:danger-triangle-bold" />}>
                  This action cannot be undone. This will permanently delete the record.
                </Alert>

                <Typography variant="subtitle1">
                  Are you sure you want to delete {moduleName || 'Record'} #{id}?
                </Typography>

                <Card variant="outlined" sx={{ bgcolor: 'grey.50' }}>
                  <CardContent>
                    <Stack spacing={1}>
                      <Stack direction="row" justifyContent="space-between">
                        <Typography variant="body2" color="text.secondary">Name</Typography>
                        <Typography variant="body2">{`Sample ${moduleName || 'Record'} ${id}`}</Typography>
                      </Stack>
                      <Stack direction="row" justifyContent="space-between">
                        <Typography variant="body2" color="text.secondary">Code</Typography>
                        <Typography variant="body2">{`${moduleCode?.toUpperCase()}-${id?.padStart(3, '0')}`}</Typography>
                      </Stack>
                      <Stack direction="row" justifyContent="space-between">
                        <Typography variant="body2" color="text.secondary">Status</Typography>
                        <Chip label="Active" color="success" size="small" />
                      </Stack>
                    </Stack>
                  </CardContent>
                </Card>

                <Stack direction="row" spacing={2} justifyContent="flex-end">
                  <Button variant="outlined" onClick={() => navigate(`/dashboard/modules/${moduleCode}/${id}`)}>
                    Cancel
                  </Button>
                  <Button
                    variant="contained"
                    color="error"
                    startIcon={<Iconify icon="solar:trash-bin-trash-bold" />}
                    onClick={() => navigate(`/dashboard/modules/${moduleCode}/list`)}
                  >
                    Delete
                  </Button>
                </Stack>
              </Stack>
            </CardContent>
          </Card>
        )}
      </PageContainer>
    </>
  );
}

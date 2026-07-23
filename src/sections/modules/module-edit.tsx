import { Helmet } from 'react-helmet-async';
import { useParams, useNavigate } from 'react-router-dom';

import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import CardContent from '@mui/material/CardContent';
import CircularProgress from '@mui/material/CircularProgress';

import { CONFIG } from 'src/config-global';

import { Iconify } from 'src/components/iconify';
import { PageHeader, PageContainer } from 'src/components/page-layout';

import { useModuleActions } from './hooks/use-module-permission';

export default function ModuleEditPage() {
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
      <Helmet><title>Edit {moduleName || 'Record'} - {CONFIG.appName}</title></Helmet>
      <PageContainer>
        <PageHeader
          title={`Edit ${moduleName || 'Record'} #${id}`}
          description={`Update ${moduleName?.toLowerCase() || 'module'} record #${id}.`}
        />

        {!actions.EDIT ? (
          <Card>
            <CardContent>
              <Stack spacing={2} alignItems="center" sx={{ py: 4 }}>
                <Iconify icon="solar:forbidden-circle-bold" width={48} color="error.main" />
                <Typography variant="h6" color="error">Access Denied</Typography>
                <Typography color="text.secondary" textAlign="center">
                  You do not have permission to edit records in this module.
                </Typography>
                <Chip label="EDIT action required" color="error" variant="outlined" />
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
                <TextField label="Name" fullWidth required defaultValue={`Sample ${moduleName || 'Record'} ${id}`} />
                <TextField label="Code" fullWidth required defaultValue={`${moduleCode?.toUpperCase()}-${id?.padStart(3, '0')}`} />
                <TextField label="Description" fullWidth multiline rows={3} defaultValue="Sample description for this record." />
                <TextField label="Status" fullWidth select SelectProps={{ native: true }} defaultValue="Active">
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                  <option value="Draft">Draft</option>
                </TextField>
                <Stack direction="row" spacing={2} justifyContent="flex-end">
                  <Button variant="outlined" onClick={() => navigate(`/dashboard/modules/${moduleCode}/${id}`)}>
                    Cancel
                  </Button>
                  <Button
                    variant="contained"
                    startIcon={<Iconify icon="solar:check-circle-bold" />}
                    onClick={() => navigate(`/dashboard/modules/${moduleCode}/${id}`)}
                  >
                    Save Changes
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

import { useMemo, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useParams, useNavigate } from 'react-router-dom';

import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Alert from '@mui/material/Alert';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import TableRow from '@mui/material/TableRow';
import TextField from '@mui/material/TextField';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import Typography from '@mui/material/Typography';
import CardContent from '@mui/material/CardContent';
import TableContainer from '@mui/material/TableContainer';

import { paths } from 'src/routes/paths';

import { CONFIG } from 'src/config-global';
import { useMyPermissions } from 'src/services/hooks/use-permissions';
import { useModuleTree } from 'src/services/hooks/use-product-catalog';

import { Iconify } from 'src/components/iconify';
import { PageHeader, PageContainer } from 'src/components/page-layout';

import { useAuthContext } from 'src/auth/hooks/use-auth-context';

import { submoduleDescription } from './module-descriptions';
import { useModuleActions } from './hooks/use-module-permission';

import type { SubModuleActions } from './hooks/use-module-permission';

const ACTION_ORDER = ['VIEW', 'CREATE', 'EDIT', 'DELETE', 'APPROVE', 'EXPORT'] as const;

const ACTION_ICONS: Record<string, string> = {
  VIEW: 'solar:eye-bold',
  CREATE: 'solar:add-circle-bold',
  EDIT: 'solar:pen-bold',
  DELETE: 'solar:trash-bin-trash-bold',
  APPROVE: 'solar:check-circle-bold',
  EXPORT: 'solar:export-bold',
};

interface DemoRow {
  id: number;
  ref: string;
  name: string;
  status: string;
}

function demoRows(submoduleName: string, count = 10): DemoRow[] {
  const prefix = submoduleName.replace(/[^a-zA-Z]/g, '').slice(0, 3).toUpperCase() || 'REC';
  return Array.from({ length: count }, (_, i) => ({
    id: i + 1,
    ref: `${prefix}-${1000 + i}`,
    name: `${submoduleName} Record ${i + 1}`,
    status: i % 3 === 0 ? 'Draft' : i % 3 === 1 ? 'In Review' : 'Completed',
  }));
}

function SectionHeader({ icon, label }: { icon: string; label: string }) {
  return (
    <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 2, mt: 3 }}>
      <Box sx={{ width: 30, height: 30, borderRadius: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'primary.lighter' }}>
        <Iconify icon={icon} width={16} sx={{ color: 'primary.main' }} />
      </Box>
      <Typography variant="subtitle2" sx={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.8, color: 'text.primary' }}>
        {label}
      </Typography>
      <Box sx={{ flex: 1, height: 1, bgcolor: 'divider' }} />
    </Stack>
  );
}

function slugify(text: string): string {
  return text.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
}

export default function SubmoduleShowcasePage() {
  const navigate = useNavigate();
  const { moduleCode = '', submoduleId = '' } = useParams<{ moduleCode: string; submoduleId: string }>();
  const { subModules, moduleName, isLoading } = useModuleActions();
  const { user: authUser } = useAuthContext();
  const { data: myPermissions } = useMyPermissions();
  const { data: moduleTree } = useModuleTree();

  const isSA = Array.isArray(authUser?.roles) && authUser.roles.includes('SUPER_ADMIN');

  const submodule: SubModuleActions | undefined = useMemo(
    () => subModules.find((sm) => String(sm.id) === submoduleId),
    [subModules, submoduleId]
  );

  const submoduleName = submodule?.name ?? 'Submodule';

  const actionsMap = useMemo<Record<string, boolean>>(() => {
    const map: Record<string, boolean> = {};
    ACTION_ORDER.forEach((code) => { map[code] = false; });
    (submodule?.actions ?? []).forEach((a) => {
      if (a.allowed) map[a.code] = true;
    });
    return map;
  }, [submodule]);

  const assignedProjects = useMemo(() => {
    if (isSA) return [];
    return (myPermissions?.projects ?? [])
      .filter((p) => (p.modules ?? []).some((m) => (m.subModules ?? []).some((sm) => String(sm.id) === submoduleId)))
      .map((p) => p.name)
      .filter((name): name is string => !!name);
  }, [myPermissions, submoduleId, isSA]);

  const roleNames = useMemo(
    () => (Array.isArray(myPermissions?.user?.roles) ? (myPermissions.user.roles as string[]) : []),
    [myPermissions]
  );

  const [rows, setRows] = useState<DemoRow[]>(() => demoRows(submoduleName, 10));
  const [showRecords, setShowRecords] = useState(false);
  const [showForm, setShowForm] = useState<'create' | 'edit' | null>(null);
  const [formName, setFormName] = useState('');
  const [notice, setNotice] = useState<{ severity: 'success' | 'info' | 'error'; text: string } | null>(null);

  const treeModule = (moduleTree ?? []).find((m) => slugify(m.name) === moduleCode);

  const openForm = (mode: 'create' | 'edit') => {
    setShowForm(mode);
    setFormName(mode === 'edit' ? (rows[0]?.name ?? '') : '');
    setNotice(null);
  };

  const saveRecord = () => {
    if (!formName.trim()) {
      setNotice({ severity: 'error', text: 'Please enter a record name.' });
      return;
    }
    if (showForm === 'create') {
      const nextId = rows.length + 1;
      setRows((prev) => [
        { id: nextId, ref: `NEW-${1000 + nextId}`, name: formName.trim(), status: 'Draft' },
        ...prev,
      ]);
      setNotice({ severity: 'success', text: 'Record created (demo). No data was saved to the backend.' });
    } else {
      setRows((prev) => prev.map((r, i) => (i === 0 ? { ...r, name: formName.trim() } : r)));
      setNotice({ severity: 'success', text: 'Record updated (demo). No data was saved to the backend.' });
    }
    setShowForm(null);
  };

  const deleteRecord = () => {
    setRows((prev) => prev.slice(0, -1));
    setNotice({ severity: 'info', text: 'Last record removed (demo). No data was changed in the backend.' });
  };

  const exportRecords = () => {
    setNotice({ severity: 'success', text: `Export successful — ${slugify(submoduleName)}_demo.xlsx downloaded (demo).` });
  };

  if (isLoading) {
    return (
      <PageContainer>
        <Card><CardContent><Typography color="text.secondary">Loading access overview...</Typography></CardContent></Card>
      </PageContainer>
    );
  }

  if (!submodule) {
    return (
      <PageContainer>
        <Card variant="outlined" sx={{ borderRadius: 2 }}>
          <CardContent>
            <Typography color="text.secondary">
              You don&apos;t have access to this submodule. Contact your administrator if you believe this is incorrect.
            </Typography>
          </CardContent>
        </Card>
      </PageContainer>
    );
  }

  return (
    <>
      <Helmet><title>{submoduleName} - {CONFIG.appName}</title></Helmet>
      <PageContainer>
        <PageHeader title={submoduleName} description={submoduleDescription(submoduleName)} />

        <SectionHeader icon="solar:shield-keyhole-bold" label="Current Access" />
        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <Card variant="outlined" sx={{ borderRadius: 2, height: 1 }}>
              <CardContent>
                <Typography variant="overline" color="text.secondary">Role</Typography>
                <Stack direction="row" flexWrap="wrap" spacing={0.5} sx={{ mt: 0.5 }}>
                  {(roleNames.length > 0 ? roleNames : [isSA ? 'SUPER_ADMIN' : '—']).map((role) => (
                    <Chip key={role} label={role} color="primary" variant="outlined" size="small" />
                  ))}
                </Stack>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card variant="outlined" sx={{ borderRadius: 2, height: 1 }}>
              <CardContent>
                <Typography variant="overline" color="text.secondary">Projects</Typography>
                {isSA ? (
                  <Typography variant="body2" fontWeight={600} sx={{ mt: 0.5 }}>All projects</Typography>
                ) : assignedProjects.length > 0 ? (
                  <Stack spacing={0.5} sx={{ mt: 0.5 }}>
                    {assignedProjects.map((name) => (
                      <Stack key={name} direction="row" spacing={1} alignItems="center">
                        <Iconify icon="solar:check-circle-bold" width={14} color="success.main" />
                        <Typography variant="body2">{name}</Typography>
                      </Stack>
                    ))}
                  </Stack>
                ) : (
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>No projects assigned</Typography>
                )}
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card variant="outlined" sx={{ borderRadius: 2, height: 1 }}>
              <CardContent>
                <Typography variant="overline" color="text.secondary">Permissions</Typography>
                <Grid container spacing={0.5} sx={{ mt: 0.5 }}>
                  {ACTION_ORDER.map((code) => (
                    <Grid item xs={6} key={code}>
                      <Stack direction="row" spacing={0.5} alignItems="center">
                        <Iconify
                          icon={actionsMap[code] ? 'solar:check-circle-bold' : 'solar:close-circle-bold'}
                          width={14}
                          color={actionsMap[code] ? 'success.main' : 'error.main'}
                        />
                        <Typography variant="caption" color={actionsMap[code] ? 'text.primary' : 'text.secondary'}>
                          {code}
                        </Typography>
                      </Stack>
                    </Grid>
                  ))}
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <SectionHeader icon="solar:mouse-circle-bold" label="Available Actions" />
        <Card variant="outlined" sx={{ borderRadius: 2 }}>
          <CardContent>
            <Stack direction="row" flexWrap="wrap" spacing={1.5} alignItems="center">
              {actionsMap.VIEW && (
                <Button
                  variant="contained"
                  startIcon={<Iconify icon={ACTION_ICONS.VIEW} />}
                  onClick={() => { setShowRecords((v) => !v); setShowForm(null); setNotice(null); }}
                >
                  View Records
                </Button>
              )}
              {actionsMap.CREATE && (
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<Iconify icon={ACTION_ICONS.CREATE} />}
                  onClick={() => openForm('create')}
                >
                  Create Record
                </Button>
              )}
              <Tooltip title={actionsMap.EDIT ? '' : 'Update permission not granted to your role'}>
                <span>
                  <Button
                    variant="outlined"
                    startIcon={<Iconify icon={ACTION_ICONS.EDIT} />}
                    disabled={!actionsMap.EDIT}
                    onClick={() => openForm('edit')}
                  >
                    Edit
                  </Button>
                </span>
              </Tooltip>
              {actionsMap.DELETE && (
                <Button
                  variant="outlined"
                  color="error"
                  startIcon={<Iconify icon={ACTION_ICONS.DELETE} />}
                  onClick={deleteRecord}
                >
                  Delete
                </Button>
              )}
              {actionsMap.APPROVE && (
                <Button
                  variant="outlined"
                  color="success"
                  startIcon={<Iconify icon={ACTION_ICONS.APPROVE} />}
                  onClick={() => setNotice({ severity: 'success', text: 'Record approved (demo). No data was changed in the backend.' })}
                >
                  Approve
                </Button>
              )}
              {actionsMap.EXPORT && (
                <Button
                  variant="outlined"
                  startIcon={<Iconify icon={ACTION_ICONS.EXPORT} />}
                  onClick={exportRecords}
                >
                  Export
                </Button>
              )}
              <Typography variant="caption" color="text.secondary" sx={{ ml: 'auto' }}>
                Edit shows disabled / Delete & Approve hidden when the permission is not granted.
              </Typography>
            </Stack>
          </CardContent>
        </Card>

        {notice && (
          <Alert severity={notice.severity} sx={{ mt: 2 }} onClose={() => setNotice(null)}>
            {notice.text}
          </Alert>
        )}

        {showRecords && (
          <Card variant="outlined" sx={{ borderRadius: 2, mt: 2 }}>
            <CardContent>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>Demo Records ({rows.length})</Typography>
              {rows.length === 0 ? (
                <Typography variant="body2" color="text.secondary">No records left. All demo records were removed.</Typography>
              ) : (
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Ref</TableCell>
                        <TableCell>Name</TableCell>
                        <TableCell>Status</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {rows.map((row) => (
                        <TableRow key={row.id} hover>
                          <TableCell sx={{ fontFamily: 'monospace' }}>{row.ref}</TableCell>
                          <TableCell>{row.name}</TableCell>
                          <TableCell>
                            <Chip
                              size="small"
                              label={row.status}
                              color={row.status === 'Completed' ? 'success' : row.status === 'In Review' ? 'warning' : 'default'}
                              variant="outlined"
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </CardContent>
          </Card>
        )}

        {showForm && (
          <Card variant="outlined" sx={{ borderRadius: 2, mt: 2 }}>
            <CardContent>
              <Typography variant="subtitle2" sx={{ mb: 1.5 }}>
                {showForm === 'create' ? `Create ${submoduleName} Record` : `Edit ${submoduleName} Record`}
              </Typography>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
                <TextField
                  fullWidth
                  size="small"
                  label="Record Name"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                />
                <Button
                  variant="contained"
                  onClick={saveRecord}
                  startIcon={<Iconify icon="solar:check-bold" />}
                >
                  Save
                </Button>
                <Button variant="text" onClick={() => setShowForm(null)}>Cancel</Button>
              </Stack>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                Demo only — this form simulates the workflow. The real module will be implemented from Figma designs without changing the permission layer.
              </Typography>
            </CardContent>
          </Card>
        )}

        {!isSA && treeModule && (
          <Box sx={{ mt: 3 }}>
            <Button
              variant="text"
              startIcon={<Iconify icon="solar:arrow-left-bold" />}
              onClick={() => navigate(paths.dashboard.modules.dashboard(moduleCode))}
            >
              Back to {moduleName || treeModule.name}
            </Button>
          </Box>
        )}
      </PageContainer>
    </>
  );
}

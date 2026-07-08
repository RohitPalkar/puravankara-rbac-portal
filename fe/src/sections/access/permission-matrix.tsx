import { useMemo, useState, useCallback, Fragment } from 'react';
import { Helmet } from 'react-helmet-async';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Checkbox from '@mui/material/Checkbox';
import IconButton from '@mui/material/IconButton';
import Collapse from '@mui/material/Collapse';
import Box from '@mui/material/Box';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import { CONFIG } from 'src/config-global';
import { PageContainer, PageHeader } from 'src/components/page-layout';
import { Iconify } from 'src/components/iconify';
import { mockRoles, mockModules, mockSubModules } from 'src/services/mock-data';

const STANDARD_ACTIONS = ['Create', 'Read', 'Update', 'Delete'];

const modulesWithSubModules = mockModules
  .map((mod) => ({
    ...mod,
    subModules: mockSubModules.filter((sm) => sm.moduleId === mod.id),
  }))
  .filter((mod) => mod.subModules.length > 0);

export default function PermissionMatrixPage() {
  const [selectedRoleId, setSelectedRoleId] = useState<string>('1');
  const [matrix, setMatrix] = useState<Record<string, Record<string, boolean>>>(() => {
    const m: Record<string, Record<string, boolean>> = {};
    mockSubModules.forEach((sm) => {
      mockRoles.forEach((role) => {
        const key = `${role.id}:${sm.id}`;
        m[key] = {};
        STANDARD_ACTIONS.forEach((a) => {
          m[key][a] = role.id === '1' || (role.id === '2' && a === 'Read');
        });
      });
    });
    return m;
  });
  const [expandedModules, setExpandedModules] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(modulesWithSubModules.map((m) => [m.id, true]))
  );
  const [search, setSearch] = useState('');
  const [dirty, setDirty] = useState(false);

  const selectedRole = mockRoles.find((r) => r.id === selectedRoleId);

  const filteredModules = useMemo(() => {
    if (!search) return modulesWithSubModules;
    const lower = search.toLowerCase();
    return modulesWithSubModules
      .map((mod) => ({
        ...mod,
        subModules: mod.subModules.filter(
          (sm) => sm.name.toLowerCase().includes(lower) || mod.name.toLowerCase().includes(lower)
        ),
      }))
      .filter((mod) => mod.subModules.length > 0);
  }, [search]);

  const getCellKey = (subModuleId: string, action: string) => `${selectedRoleId}:${subModuleId}`;

  const isActionChecked = (subModuleId: string, action: string) =>
    matrix[getCellKey(subModuleId, action)]?.[action] ?? false;

  const setAction = (subModuleId: string, action: string, value: boolean) => {
    setMatrix((prev) => {
      const key = getCellKey(subModuleId, action);
      return { ...prev, [key]: { ...prev[key], [action]: value } };
    });
    setDirty(true);
  };

  const isSubModuleAllChecked = (subModuleId: string) =>
    STANDARD_ACTIONS.every((a) => isActionChecked(subModuleId, a));

  const setSubModuleAll = (subModuleId: string, value: boolean) => {
    STANDARD_ACTIONS.forEach((a) => setAction(subModuleId, a, value));
  };

  const isModuleAllChecked = (subModules: typeof mockSubModules) =>
    subModules.every((sm) => isSubModuleAllChecked(sm.id));

  const setModuleAll = (subModules: typeof mockSubModules, value: boolean) => {
    subModules.forEach((sm) => setSubModuleAll(sm.id, value));
  };

  const handleSave = useCallback(() => {
    setDirty(false);
  }, []);

  return (
    <>
      <Helmet><title>Permission Matrix - {CONFIG.appName}</title></Helmet>
      <PageContainer>
        <PageHeader
          title="Permission Matrix"
          description="Configure role-based permissions"
          action={
            <Button variant="contained" startIcon={<Iconify icon="solar:check-circle-bold" />} onClick={handleSave} disabled={!dirty}>
              Save Changes
            </Button>
          }
        />

        <Card sx={{ p: 3, mb: 3 }}>
          <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap">
            <TextField
              label="Role"
              select
              value={selectedRoleId}
              onChange={(e) => { setSelectedRoleId(e.target.value); setDirty(false); }}
              sx={{ minWidth: 220 }}
            >
              {mockRoles.map((r) => (
                <MenuItem key={r.id} value={r.id}>{r.name}</MenuItem>
              ))}
            </TextField>
            <TextField
              label="Search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search modules or sub-modules..."
              sx={{ minWidth: 280 }}
              InputProps={{
                startAdornment: <Iconify icon="solar:magnifer-bold" width={18} style={{ marginRight: 8, opacity: 0.5 }} />,
              }}
            />
            <Stack direction="row" spacing={1} alignItems="center" ml="auto">
              <Typography variant="body2" color="text.secondary">
                {dirty ? 'Unsaved changes' : 'All changes saved'}
              </Typography>
              <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: dirty ? 'warning.main' : 'success.main' }} />
            </Stack>
          </Stack>
        </Card>

        <Card>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ width: '40%', fontWeight: 700 }}>Module / Sub-Module</TableCell>
                  {STANDARD_ACTIONS.map((action) => (
                    <TableCell key={action} align="center" sx={{ fontWeight: 700, width: `${60 / STANDARD_ACTIONS.length}%` }}>
                      {action}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredModules.map((mod) => {
                  const isExpanded = expandedModules[mod.id] ?? true;
                  const moduleAll = isModuleAllChecked(mod.subModules);
                  return (
                    <Fragment key={mod.id}>
                      <TableRow sx={{ bgcolor: 'action.hover' }}>
                        <TableCell>
                          <Stack direction="row" alignItems="center" spacing={0.5}>
                            <IconButton size="small" onClick={() => setExpandedModules((prev) => ({ ...prev, [mod.id]: !prev[mod.id] }))}>
                              <Iconify icon={isExpanded ? 'solar:alt-arrow-down-bold' : 'solar:alt-arrow-right-bold'} width={16} />
                            </IconButton>
                            <Checkbox
                              checked={moduleAll}
                              indeterminate={!moduleAll && mod.subModules.some((sm) => isSubModuleAllChecked(sm.id))}
                              onChange={(e) => setModuleAll(mod.subModules, e.target.checked)}
                            />
                            <Typography variant="subtitle2">{mod.name}</Typography>
                            <Typography variant="caption" color="text.disabled">({mod.code})</Typography>
                          </Stack>
                        </TableCell>
                        {STANDARD_ACTIONS.map((action) => (
                          <TableCell key={action} align="center">
                            <Checkbox
                              checked={mod.subModules.every((sm) => isActionChecked(sm.id, action))}
                              indeterminate={
                                !mod.subModules.every((sm) => isActionChecked(sm.id, action)) &&
                                mod.subModules.some((sm) => isActionChecked(sm.id, action))
                              }
                              onChange={(e) => mod.subModules.forEach((sm) => setAction(sm.id, action, e.target.checked))}
                            />
                          </TableCell>
                        ))}
                      </TableRow>
                      <TableRow>
                        <TableCell colSpan={STANDARD_ACTIONS.length + 1} sx={{ p: 0 }}>
                          <Collapse in={isExpanded}>
                            {mod.subModules.map((sm) => (
                              <TableRow key={sm.id} sx={{ '&:last-child td': { border: 0 } }}>
                                <TableCell>
                                  <Stack direction="row" alignItems="center" spacing={0.5} sx={{ pl: 7 }}>
                                    <Checkbox
                                      checked={isSubModuleAllChecked(sm.id)}
                                      onChange={(e) => setSubModuleAll(sm.id, e.target.checked)}
                                    />
                                    <Typography variant="body2">{sm.name}</Typography>
                                  </Stack>
                                </TableCell>
                                {STANDARD_ACTIONS.map((action) => (
                                  <TableCell key={action} align="center">
                                    <Checkbox
                                      checked={isActionChecked(sm.id, action)}
                                      onChange={(e) => setAction(sm.id, action, e.target.checked)}
                                    />
                                  </TableCell>
                                ))}
                              </TableRow>
                            ))}
                          </Collapse>
                        </TableCell>
                      </TableRow>
                    </Fragment>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>
      </PageContainer>
    </>
  );
}

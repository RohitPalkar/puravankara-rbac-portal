import { Helmet } from 'react-helmet-async';
import { useMemo, useState, Fragment, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import Checkbox from '@mui/material/Checkbox';
import Collapse from '@mui/material/Collapse';
import TableRow from '@mui/material/TableRow';
import TextField from '@mui/material/TextField';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import TableContainer from '@mui/material/TableContainer';

import { CONFIG } from 'src/config-global';
import { mockRoles, mockModules, mockSubModules, mockDepartments } from 'src/services/mock-data';

import { Iconify } from 'src/components/iconify';
import { PageHeader, PageContainer } from 'src/components/page-layout';

const STANDARD_ACTIONS = ['Create', 'Read', 'Update', 'Delete'];

export default function PermissionMatrixPage() {
  const [selectedDeptId, setSelectedDeptId] = useState<string>('');
  const [selectedLevel, setSelectedLevel] = useState<string>('');
  const [selectedRoleId, setSelectedRoleId] = useState<string>('');

  const [matrix, setMatrix] = useState<Record<string, Record<string, boolean>>>(() => {
    const m: Record<string, Record<string, boolean>> = {};
    const allSubModuleIds = [...mockSubModules.map((sm) => sm.id), ...mockModules.map((mod) => `flat-${mod.id}`)];
    allSubModuleIds.forEach((sm) => {
      mockRoles.forEach((role) => {
        const key = `${role.id}:${sm}`;
        m[key] = {};
        STANDARD_ACTIONS.forEach((a) => { m[key][a] = false; });
      });
    });
    return m;
  });
  const [expandedModules, setExpandedModules] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(mockModules.map((m) => [m.id, true]))
  );
  const [search, setSearch] = useState('');
  const [dirty, setDirty] = useState(false);

  const selectedDept = mockDepartments.find((d) => d.id === selectedDeptId);
  const levelOptions = selectedDept
    ? Array.from({ length: selectedDept.maxHierarchyLevels }, (_, i) => ({ value: `L${i + 1}`, label: `Level ${i + 1}` }))
    : [];

  const filteredRoles = useMemo(() => {
    let roles = mockRoles;
    if (selectedDeptId) roles = roles.filter((r) => r.departmentId === selectedDeptId);
    if (selectedLevel) roles = roles.filter((r) => r.level === selectedLevel);
    return roles;
  }, [selectedDeptId, selectedLevel]);

  // Reset role when filters change
  const handleDeptChange = (deptId: string) => {
    setSelectedDeptId(deptId);
    setSelectedLevel('');
    setSelectedRoleId('');
    setDirty(false);
  };

  const handleLevelChange = (level: string) => {
    setSelectedLevel(level);
    setSelectedRoleId('');
    setDirty(false);
  };

  const selectedRole = mockRoles.find((r) => r.id === selectedRoleId);

  const modulesWithSubModules = useMemo(() =>
    mockModules.map((mod) => ({
      ...mod,
      subModules: mockSubModules.filter((sm) => sm.moduleId === mod.id),
    })),
  []
  );

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
      .filter((mod) => mod.subModules.length > 0 || mod.name.toLowerCase().includes(lower));
  }, [search, modulesWithSubModules]);

  const getCellKey = (entityId: string) => `${selectedRoleId}:${entityId}`;

  const isActionChecked = (entityId: string, action: string) =>
    selectedRoleId ? matrix[getCellKey(entityId)]?.[action] ?? false : false;

  const setAction = (entityId: string, action: string, value: boolean) => {
    setMatrix((prev) => {
      const key = getCellKey(entityId);
      return { ...prev, [key]: { ...prev[key], [action]: value } };
    });
    setDirty(true);
  };

  const isSubModuleAllChecked = (entityId: string) =>
    STANDARD_ACTIONS.every((a) => isActionChecked(entityId, a));

  const setSubModuleAll = (entityId: string, value: boolean) => {
    STANDARD_ACTIONS.forEach((a) => setAction(entityId, a, value));
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
          description="Department → Level → Role → Module → Actions"
          action={
            <Button variant="contained" startIcon={<Iconify icon="solar:check-circle-bold" />} onClick={handleSave} disabled={!dirty}>
              Save Changes
            </Button>
          }
        />

        <Card sx={{ p: 3, mb: 3 }}>
          <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap">
            <TextField
              label="Department"
              select
              value={selectedDeptId}
              onChange={(e) => handleDeptChange(e.target.value)}
              sx={{ minWidth: 200 }}
            >
              <MenuItem value="">All Departments</MenuItem>
              {mockDepartments.map((d) => (
                <MenuItem key={d.id} value={d.id}>{d.name}</MenuItem>
              ))}
            </TextField>
            <TextField
              label="Level"
              select
              value={selectedLevel}
              onChange={(e) => handleLevelChange(e.target.value)}
              sx={{ minWidth: 140 }}
              disabled={!selectedDeptId}
            >
              <MenuItem value="">All Levels</MenuItem>
              {levelOptions.map((o) => (
                <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>
              ))}
            </TextField>
            <TextField
              label="Role"
              select
              value={selectedRoleId}
              onChange={(e) => { setSelectedRoleId(e.target.value); setDirty(false); }}
              sx={{ minWidth: 200 }}
              disabled={!selectedDeptId}
            >
              <MenuItem value="">Select Role</MenuItem>
              {filteredRoles.map((r) => (
                <MenuItem key={r.id} value={r.id}>
                  {r.name} <Chip label={r.level} size="small" sx={{ ml: 1 }} />
                </MenuItem>
              ))}
            </TextField>
            <TextField
              label="Search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search modules..."
              sx={{ minWidth: 240 }}
              InputProps={{
                startAdornment: <Iconify icon="solar:magnifer-bold" width={18} style={{ marginRight: 8, opacity: 0.5 }} />,
              }}
            />
            {dirty && (
              <Stack direction="row" spacing={1} alignItems="center" ml="auto">
                <Typography variant="body2" color="text.secondary">Unsaved changes</Typography>
                <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: 'warning.main' }} />
              </Stack>
            )}
          </Stack>
        </Card>

        {!selectedRoleId ? (
          <Card sx={{ p: 6, textAlign: 'center' }}>
            <Iconify icon="solar:shield-check-bold" width={48} color="text.disabled" />
            <Typography variant="h6" color="text.secondary" sx={{ mt: 2 }}>
              Select a Department, Level, and Role to configure permissions
            </Typography>
          </Card>
        ) : (
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
                    const hasSubModules = mod.subModules.length > 0;

                    if (!hasSubModules) {
                      return (
                        <TableRow key={mod.id} sx={{ bgcolor: 'action.hover' }}>
                          <TableCell>
                            <Stack direction="row" alignItems="center" spacing={0.5}>
                              <Checkbox
                                checked={isSubModuleAllChecked(`flat-${mod.id}`)}
                                indeterminate={
                                  !isSubModuleAllChecked(`flat-${mod.id}`) &&
                                  STANDARD_ACTIONS.some((a) => isActionChecked(`flat-${mod.id}`, a))
                                }
                                onChange={(e) => setSubModuleAll(`flat-${mod.id}`, e.target.checked)}
                              />
                              <Typography variant="subtitle2">{mod.name}</Typography>
                              <Typography variant="caption" color="text.disabled">({mod.code})</Typography>
                              <Chip label="Flat" size="small" variant="outlined" sx={{ ml: 1 }} />
                            </Stack>
                          </TableCell>
                          {STANDARD_ACTIONS.map((action) => (
                            <TableCell key={action} align="center">
                              <Checkbox
                                checked={isActionChecked(`flat-${mod.id}`, action)}
                                onChange={(e) => setAction(`flat-${mod.id}`, action, e.target.checked)}
                              />
                            </TableCell>
                          ))}
                        </TableRow>
                      );
                    }

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
        )}
      </PageContainer>
    </>
  );
}

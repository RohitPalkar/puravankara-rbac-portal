import { useState, useMemo, useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Checkbox from '@mui/material/Checkbox';
import Chip from '@mui/material/Chip';
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import Alert from '@mui/material/Alert';
import Snackbar from '@mui/material/Snackbar';
import LinearProgress from '@mui/material/LinearProgress';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import ToggleButton from '@mui/material/ToggleButton';
import { CONFIG } from 'src/config-global';
import { PageContainer, PageHeader } from 'src/components/page-layout';
import { Iconify } from 'src/components/iconify';
import { mockDepartments, mockRoles, mockModules, mockSubModules, mockPermissionMappings } from 'src/services/mock-data';
import { paths } from 'src/routes/paths';

const STEPS = ['Basic Information', 'Select Modules', 'Configure Permissions', 'Review & Save'];

const ALL_ACTIONS = ['View', 'Create', 'Edit', 'Delete', 'Approve', 'Reject', 'Export'];

type WizardSubModule = {
  subModuleId: string;
  subModuleName: string;
  actionIds: string[];
};

type WizardModule = {
  moduleId: string;
  moduleName: string;
  moduleIcon: string;
  selected: boolean;
  subModules: WizardSubModule[];
};

export default function PermissionMappingNewPage() {
  const navigate = useNavigate();

  const [activeStep, setActiveStep] = useState(0);
  const [deptId, setDeptId] = useState('');
  const [level, setLevel] = useState('');
  const [roleId, setRoleId] = useState('');
  const [moduleSearch, setModuleSearch] = useState('');
  const [viewMode, setViewMode] = useState<'tree' | 'matrix'>('tree');
  const [saving, setSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const [wizardModules, setWizardModules] = useState<WizardModule[]>(() =>
    mockModules
      .filter((m) => !['1', '2', '3', '4', '5', '6', '7'].includes(m.id))
      .map((m) => ({
        moduleId: m.id,
        moduleName: m.name,
        moduleIcon: m.icon,
        selected: false,
        subModules: mockSubModules
          .filter((sm) => sm.moduleId === m.id)
          .map((sm) => ({
            subModuleId: sm.id,
            subModuleName: sm.name,
            actionIds: [],
          })),
      }))
  );

  const selectedDept = mockDepartments.find((d) => d.id === deptId);
  const levelOptions = selectedDept
    ? Array.from({ length: selectedDept.maxHierarchyLevels }, (_, i) => ({ value: `L${i + 1}`, label: `Level ${i + 1}` }))
    : [];

  const filteredRoles = useMemo(() => {
    let roles = mockRoles;
    if (deptId) roles = roles.filter((r) => r.departmentId === deptId);
    if (level) roles = roles.filter((r) => r.level === level);
    return roles;
  }, [deptId, level]);

  const selectedRole = mockRoles.find((r) => r.id === roleId);

  const selectedModules = wizardModules.filter((m) => m.selected);
  const totalSubmodules = selectedModules.reduce((acc, m) => acc + m.subModules.length, 0);
  const totalActions = selectedModules.reduce((acc, m) => acc + m.subModules.reduce((a, sm) => a + sm.actionIds.length, 0), 0);

  const handleDeptChange = (v: string) => {
    setDeptId(v);
    setLevel('');
    setRoleId('');
  };

  const handleLevelChange = (v: string) => {
    setLevel(v);
    setRoleId('');
  };

  const canGoNext = useMemo(() => {
    if (activeStep === 0) return Boolean(deptId && level && roleId);
    if (activeStep === 1) return wizardModules.some((m) => m.selected);
    if (activeStep === 2) {
      const sel = wizardModules.filter((m) => m.selected);
      return sel.some((m) => m.subModules.some((sm) => sm.actionIds.length > 0));
    }
    return true;
  }, [activeStep, deptId, level, roleId, wizardModules]);

  const handleNext = () => {
    if (activeStep < STEPS.length - 1) setActiveStep((p) => p + 1);
    else handleSave();
  };

  const handleBack = () => {
    if (activeStep > 0) setActiveStep((p) => p - 1);
  };

  const toggleModule = (moduleId: string) => {
    setWizardModules((prev) =>
      prev.map((m) => {
        if (m.moduleId !== moduleId) return m;
        const newSelected = !m.selected;
        return {
          ...m,
          selected: newSelected,
          subModules: m.subModules.map((sm) => ({ ...sm, actionIds: newSelected ? sm.actionIds : [] })),
        };
      })
    );
  };

  const toggleAction = (moduleId: string, subModuleId: string, actionName: string) => {
    setWizardModules((prev) =>
      prev.map((m) => {
        if (m.moduleId !== moduleId) return m;
        return {
          ...m,
          subModules: m.subModules.map((sm) => {
            if (sm.subModuleId !== subModuleId) return sm;
            const has = sm.actionIds.includes(actionName);
            return { ...sm, actionIds: has ? sm.actionIds.filter((a) => a !== actionName) : [...sm.actionIds, actionName] };
          }),
        };
      })
    );
  };

  const setSubModuleActions = (moduleId: string, subModuleId: string, actionNames: string[]) => {
    setWizardModules((prev) =>
      prev.map((m) => {
        if (m.moduleId !== moduleId) return m;
        return {
          ...m,
          subModules: m.subModules.map((sm) => {
            if (sm.subModuleId !== subModuleId) return sm;
            return { ...sm, actionIds: actionNames };
          }),
        };
      })
    );
  };

  const handleSave = useCallback(() => {
    setSaving(true);
    const selected = wizardModules.filter((m) => m.selected).map((m) => ({
      moduleId: m.moduleId,
      moduleName: m.moduleName,
      moduleIcon: m.moduleIcon,
      subModules: m.subModules
        .filter((sm) => sm.actionIds.length > 0)
        .map((sm) => ({
          subModuleId: sm.subModuleId,
          subModuleName: sm.subModuleName,
          actionIds: sm.actionIds,
          actionNames: sm.actionIds,
        })),
    }));

    const newMapping = {
      id: String(Date.now()),
      departmentId: deptId,
      departmentName: selectedDept?.name ?? '',
      level,
      roleId,
      roleName: selectedRole?.name ?? '',
      modules: selected,
      createdBy: 'You',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    (mockPermissionMappings as any).unshift(newMapping);

    setTimeout(() => {
      setSaving(false);
      setShowSuccess(true);
      setTimeout(() => navigate(paths.dashboard.permissionMatrix), 1200);
    }, 800);
  }, [deptId, level, roleId, selectedDept, selectedRole, wizardModules, navigate]);

  const filteredModuleCards = useMemo(() => {
    if (!moduleSearch) return wizardModules;
    const lower = moduleSearch.toLowerCase();
    return wizardModules.filter(
      (m) =>
        m.moduleName.toLowerCase().includes(lower) ||
        m.subModules.some((sm) => sm.subModuleName.toLowerCase().includes(lower))
    );
  }, [moduleSearch, wizardModules]);

  return (
    <>
      <Helmet><title>Create Permission Mapping - {CONFIG.appName}</title></Helmet>
      <PageContainer>
        <PageHeader
          title="Create Permission Mapping"
          description="Define role-based permissions with a 4-step wizard"
        />

        {saving && <LinearProgress />}

        <Stepper activeStep={activeStep} sx={{ mb: 3 }}>
          {STEPS.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {activeStep === 0 && (
          <Card sx={{ p: 3 }}>
            <Typography variant="subtitle1" sx={{ mb: 2.5 }}>Basic Information</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Select the Department, Hierarchy Level, and Role for this permission mapping.
            </Typography>
            <Box display="grid" gridTemplateColumns={{ xs: '1fr', sm: '1fr 1fr' }} gap={2.5}>
              <TextField select label="Department" value={deptId} onChange={(e) => handleDeptChange(e.target.value)}>
                <MenuItem value="">Select Department</MenuItem>
                {mockDepartments.map((d) => <MenuItem key={d.id} value={d.id}>{d.name}</MenuItem>)}
              </TextField>
              <TextField select label="Hierarchy Level" value={level} onChange={(e) => handleLevelChange(e.target.value)} disabled={!deptId}>
                <MenuItem value="">Select Level</MenuItem>
                {levelOptions.map((o) => <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>)}
              </TextField>
              <TextField select label="Role" value={roleId} onChange={(e) => setRoleId(e.target.value)} disabled={!deptId}>
                <MenuItem value="">Select Role</MenuItem>
                {filteredRoles.map((r) => <MenuItem key={r.id} value={r.id}>{r.name}</MenuItem>)}
              </TextField>
            </Box>
            {selectedRole && (
              <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 2 }}>
                <Typography variant="body2" color="text.secondary">Selection:</Typography>
                <Chip label={selectedDept?.name} size="small" color="primary" variant="outlined" />
                <Chip label={level} size="small" color="primary" variant="outlined" />
                <Chip label={selectedRole.name} size="small" color="primary" />
              </Stack>
            )}
          </Card>
        )}

        {activeStep === 1 && (
          <Card sx={{ p: 3 }}>
            <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2.5 }}>
              <Typography variant="subtitle1">Select Modules</Typography>
              <TextField
                size="small"
                placeholder="Search modules..."
                value={moduleSearch}
                onChange={(e) => setModuleSearch(e.target.value)}
                sx={{ minWidth: 260 }}
                InputProps={{
                  startAdornment: <Iconify icon="solar:magnifer-bold" width={18} style={{ marginRight: 8, opacity: 0.5 }} />,
                }}
              />
            </Stack>

            <Box display="grid" gridTemplateColumns={{ xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr' }} gap={2}>
              {filteredModuleCards.map((mod) => (
                <Card
                  key={mod.moduleId}
                  variant="outlined"
                  sx={{
                    p: 2,
                    cursor: 'pointer',
                    borderColor: mod.selected ? 'primary.main' : 'divider',
                    borderWidth: mod.selected ? 2 : 1,
                    bgcolor: mod.selected ? 'action.selected' : 'background.paper',
                    transition: 'all 0.15s',
                    '&:hover': { borderColor: mod.selected ? 'primary.main' : 'text.disabled' },
                  }}
                  onClick={() => toggleModule(mod.moduleId)}
                >
                  <Stack direction="row" alignItems="flex-start" spacing={1.5}>
                    <Checkbox checked={mod.selected} sx={{ mt: -0.5 }} />
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <Iconify icon={mod.moduleIcon} width={22} color="primary.main" />
                        <Typography variant="subtitle2" noWrap>{mod.moduleName}</Typography>
                      </Stack>
                    </Box>
                  </Stack>
                  {mod.selected && (
                    <Box sx={{ mt: 1.5, ml: 4 }}>
                      {mod.subModules.length === 0 ? (
                        <Typography variant="caption" color="text.disabled">No sub-modules</Typography>
                      ) : (
                        <Stack spacing={0.5}>
                          {mod.subModules.map((sm) => (
                            <Stack key={sm.subModuleId} direction="row" alignItems="center" spacing={0.5}>
                              <Iconify icon="solar:alt-arrow-right-bold" width={12} color="text.disabled" />
                              <Typography variant="caption" color="text.secondary">{sm.subModuleName}</Typography>
                            </Stack>
                          ))}
                        </Stack>
                      )}
                    </Box>
                  )}
                </Card>
              ))}
            </Box>
            <Typography variant="caption" color="text.disabled" sx={{ display: 'block', mt: 2, textAlign: 'center' }}>
              {wizardModules.filter((m) => m.selected).length} module(s) selected
            </Typography>
          </Card>
        )}

        {activeStep === 2 && (
          <Card sx={{ p: 3 }}>
            <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2.5 }} flexWrap="wrap" spacing={1}>
              <Typography variant="subtitle1">Configure Permissions</Typography>
              <Stack direction="row" spacing={1} alignItems="center">
                <ToggleButtonGroup value={viewMode} exclusive onChange={(_, v) => v && setViewMode(v)} size="small">
                  <ToggleButton value="tree">Tree View</ToggleButton>
                  <ToggleButton value="matrix">Matrix View</ToggleButton>
                </ToggleButtonGroup>
              </Stack>
            </Stack>

            {selectedModules.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Iconify icon="solar:shield-warning-bold" width={40} color="text.disabled" />
                <Typography variant="body2" color="text.disabled" sx={{ mt: 1 }}>No modules selected. Go back to Step 2.</Typography>
              </Box>
            ) : (
              <>
                {viewMode === 'tree' && (
                  <Card variant="outlined" sx={{ p: 2 }}>
                    {selectedModules.map((mod) => (
                      <Box key={mod.moduleId} sx={{ '&:not(:last-child)': { mb: 2, pb: 2, borderBottom: '1px solid', borderColor: 'divider' } }}>
                        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 0.5 }}>
                          <Iconify icon={mod.moduleIcon} width={20} color="primary.main" />
                          <Typography variant="subtitle2">{mod.moduleName}</Typography>
                        </Stack>
                        {mod.subModules.map((sm) => (
                          <Box key={sm.subModuleId} sx={{ ml: 4, mb: 0.5 }}>
                            <Typography variant="caption" fontWeight={600} color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                              {sm.subModuleName} <Typography variant="caption" color="text.disabled">(optional)</Typography>
                            </Typography>
                            <Stack direction="row" spacing={0.5} flexWrap="wrap">
                              {ALL_ACTIONS.map((action) => (
                                <Chip
                                  key={action}
                                  label={action}
                                  size="small"
                                  variant={sm.actionIds.includes(action) ? 'filled' : 'outlined'}
                                  color={sm.actionIds.includes(action) ? 'primary' : 'default'}
                                  onClick={() => toggleAction(mod.moduleId, sm.subModuleId, action)}
                                  sx={{ cursor: 'pointer' }}
                                />
                              ))}
                            </Stack>
                          </Box>
                        ))}
                      </Box>
                    ))}
                  </Card>
                )}

                {viewMode === 'matrix' && (
                  <Card variant="outlined" sx={{ overflowX: 'auto' }}>
                    <TableContainer>
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell sx={{ fontWeight: 700, minWidth: 180 }}>Module / Sub Module</TableCell>
                            {ALL_ACTIONS.map((a) => (
                              <TableCell key={a} align="center" sx={{ fontWeight: 700, px: 1 }}>{a}</TableCell>
                            ))}
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {selectedModules.map((mod) => (
                            <TableRow key={`${mod.moduleId}-header`} sx={{ bgcolor: 'action.hover' }}>
                              <TableCell sx={{ fontWeight: 600 }}>
                                <Stack direction="row" alignItems="center" spacing={1}>
                                  <Iconify icon={mod.moduleIcon} width={18} color="primary.main" />
                                  <Typography variant="body2" fontWeight={600}>{mod.moduleName}</Typography>
                                </Stack>
                              </TableCell>
                              {ALL_ACTIONS.map((action) => {
                                const allChecked = mod.subModules.every((sm) => sm.actionIds.includes(action));
                                const someChecked = mod.subModules.some((sm) => sm.actionIds.includes(action));
                                return (
                                  <TableCell key={action} align="center" sx={{ px: 1 }}>
                                    <Checkbox
                                      size="small"
                                      checked={allChecked}
                                      indeterminate={!allChecked && someChecked}
                                      onChange={() => {
                                        mod.subModules.forEach((sm) => setSubModuleActions(mod.moduleId, sm.subModuleId, allChecked ? [] : [action]));
                                      }}
                                    />
                                  </TableCell>
                                );
                              })}
                            </TableRow>
                          ))}
                          {selectedModules.map((mod) =>
                            mod.subModules.map((sm) => (
                              <TableRow key={sm.subModuleId}>
                                <TableCell sx={{ pl: 5 }}>
                                  <Typography variant="body2">{sm.subModuleName}</Typography>
                                </TableCell>
                                {ALL_ACTIONS.map((action) => (
                                  <TableCell key={action} align="center" sx={{ px: 1 }}>
                                    <Checkbox
                                      size="small"
                                      checked={sm.actionIds.includes(action)}
                                      onChange={() => toggleAction(mod.moduleId, sm.subModuleId, action)}
                                    />
                                  </TableCell>
                                ))}
                              </TableRow>
                            ))
                          )}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Card>
                )}
              </>
            )}
          </Card>
        )}

        {activeStep === 3 && (
          <>
            <Card sx={{ p: 3 }}>
              <Typography variant="subtitle1" sx={{ mb: 2 }}>Mapping Summary</Typography>
              <Stack spacing={1} sx={{ maxWidth: 400 }}>
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="body2" color="text.secondary">Department</Typography>
                  <Typography variant="body2" fontWeight={600}>{selectedDept?.name}</Typography>
                </Stack>
                <Divider />
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="body2" color="text.secondary">Hierarchy Level</Typography>
                  <Typography variant="body2" fontWeight={600}>{level}</Typography>
                </Stack>
                <Divider />
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="body2" color="text.secondary">Role</Typography>
                  <Typography variant="body2" fontWeight={600}>{selectedRole?.name}</Typography>
                </Stack>
                <Divider />
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="body2" color="text.secondary">Modules Selected</Typography>
                  <Typography variant="body2" fontWeight={600}>{selectedModules.length}</Typography>
                </Stack>
                <Divider />
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="body2" color="text.secondary">Submodules Count</Typography>
                  <Typography variant="body2" fontWeight={600}>{totalSubmodules}</Typography>
                </Stack>
                <Divider />
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="body2" color="text.secondary">Actions Count</Typography>
                  <Typography variant="body2" fontWeight={600}>{totalActions}</Typography>
                </Stack>
              </Stack>
            </Card>

            <Card sx={{ p: 3 }}>
              <Typography variant="subtitle1" sx={{ mb: 2 }}>Module Overview</Typography>
              <Stack spacing={2}>
                {selectedModules.map((mod) =>
                  mod.subModules
                    .filter((sm) => sm.actionIds.length > 0)
                    .map((sm) => (
                      <Box key={sm.subModuleId}>
                        <Stack direction="row" justifyContent="space-between" alignItems="center">
                          <Stack direction="row" spacing={1} alignItems="center">
                            <Iconify icon={mod.moduleIcon} width={18} color="primary.main" />
                            <Box>
                              <Typography variant="body2" fontWeight={600}>{mod.moduleName}</Typography>
                              <Typography variant="caption" color="text.secondary">{sm.subModuleName}</Typography>
                            </Box>
                          </Stack>
                          <Typography variant="caption" color="primary">{sm.actionIds.length} Actions</Typography>
                        </Stack>
                        <Stack direction="row" spacing={0.5} sx={{ ml: 4, mt: 0.5 }} flexWrap="wrap">
                          {sm.actionIds.map((aid) => (
                            <Chip key={aid} label={aid} size="small" color="primary" variant="outlined" />
                          ))}
                        </Stack>
                      </Box>
                    ))
                )}
              </Stack>
            </Card>

            <Card sx={{ p: 3 }}>
              <Typography variant="subtitle1" sx={{ mb: 2 }}>Additional Settings</Typography>
              <Stack spacing={2}>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <Iconify icon="solar:document-bold" width={18} color="text.disabled" />
                  <Box>
                    <Typography variant="body2">Signature Upload Required</Typography>
                    <Typography variant="caption" color="text.disabled">Placeholder — not yet functional</Typography>
                  </Box>
                </Stack>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <Iconify icon="solar:checklist-bold" width={18} color="text.disabled" />
                  <Box>
                    <Typography variant="body2">Approval Required</Typography>
                    <Typography variant="caption" color="text.disabled">Placeholder — not yet functional</Typography>
                  </Box>
                </Stack>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <Iconify icon="solar:clock-circle-bold" width={18} color="text.disabled" />
                  <Box>
                    <Typography variant="body2">Time Restriction</Typography>
                    <Typography variant="caption" color="text.disabled">Placeholder — not yet functional</Typography>
                  </Box>
                </Stack>
              </Stack>
            </Card>
          </>
        )}

        <Box sx={{ position: 'sticky', bottom: 0, zIndex: 10, bgcolor: 'background.default', borderTop: '1px solid', borderColor: 'divider', py: 2, px: 0, mt: 3 }}>
          <Stack direction="row" spacing={1.5} justifyContent="flex-end">
            {activeStep === 0 ? (
              <Button variant="outlined" onClick={() => navigate(paths.dashboard.permissionMatrix)} size="large">Cancel</Button>
            ) : (
              <Button variant="outlined" onClick={handleBack} size="large" startIcon={<Iconify icon="solar:alt-arrow-left-bold" />}>Back</Button>
            )}
            <Button
              variant="contained"
              onClick={handleNext}
              disabled={!canGoNext || saving}
              size="large"
              endIcon={activeStep === STEPS.length - 1 ? <Iconify icon="solar:check-circle-bold" /> : <Iconify icon="solar:alt-arrow-right-bold" />}
            >
              {activeStep === STEPS.length - 1 ? 'Save Mapping' : 'Next'}
            </Button>
          </Stack>
        </Box>
      </PageContainer>

      <Snackbar open={showSuccess} autoHideDuration={2000} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
        <Alert severity="success" variant="filled" sx={{ width: 1 }}>
          Permission mapping saved successfully
        </Alert>
      </Snackbar>
    </>
  );
}
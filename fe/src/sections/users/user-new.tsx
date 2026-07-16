
import dayjs from 'dayjs';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import { useMemo, useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Step from '@mui/material/Step';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Stepper from '@mui/material/Stepper';
import Divider from '@mui/material/Divider';
import Checkbox from '@mui/material/Checkbox';
import MenuItem from '@mui/material/MenuItem';
import StepLabel from '@mui/material/StepLabel';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import DialogTitle from '@mui/material/DialogTitle';
import Autocomplete from '@mui/material/Autocomplete';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';

import { paths } from 'src/routes/paths';

import { CONFIG } from 'src/config-global';
import { userApi } from 'src/services/api/user-api';
import { isApiMode } from 'src/services/data-source';
import { useZones, useProjects, useDepartments, roleMappingApi } from 'src/services/api-adapters';
import {
  mockRoles, mockZones, mockUsers, mockModules, mockProjects, mockDepartments,
  mockPermissionMappings, mockPermissionModuleProjects
} from 'src/services/mock-data';

import { Iconify } from 'src/components/iconify';
import { PageHeader, PageContainer } from 'src/components/page-layout';

const EMPLOYEE_DIRECTORY = [
  { employeeId: 'EMP-001', name: 'Rohit Palkar', email: 'rohit@puravankara.com', mobile: '+91-9876543210' },
  { employeeId: 'EMP-002', name: 'Priya Sharma', email: 'priya@puravankara.com', mobile: '+91-9876543211' },
  { employeeId: 'EMP-003', name: 'Amit Verma', email: 'amit@puravankara.com', mobile: '+91-9876543212' },
  { employeeId: 'EMP-004', name: 'Sneha Patel', email: 'sneha@puravankara.com', mobile: '+91-9876543213' },
  { employeeId: 'EMP-005', name: 'Vikas Gupta', email: 'vikas@puravankara.com', mobile: '+91-9876543214' },
  { employeeId: 'EMP-006', name: 'Anita Desai', email: 'anita@puravankara.com', mobile: '+91-9876543215' },
  { employeeId: 'EMP-007', name: 'Rajesh Kumar', email: 'rajesh@puravankara.com', mobile: '+91-9876543216' },
  { employeeId: 'EMP-008', name: 'Meera Nair', email: 'meera@puravankara.com', mobile: '+91-9876543217' },
];

const STEPS = ['Basic Information', 'Organization & Hierarchy', 'Access Configuration'];

const EMPLOYMENT_OPTIONS = [
  { value: 'permanent', label: 'Permanent' },
  { value: 'contract', label: 'Contract' },
  { value: 'serving_notice_period', label: 'Serving Notice Period' },
];

const USER_GROUP_OPTIONS = [
  { value: 'operations', label: 'Operations' },
  { value: 'management', label: 'Management' },
  { value: 'executive', label: 'Executive' },
  { value: 'admin', label: 'Admin' },
];

export default function UserNewPage() {
  const navigate = useNavigate();

  const { data: apiDepartments } = useDepartments();
  const { data: apiZones } = useZones();
  const { data: apiProjects } = useProjects();

  const [activeStep, setActiveStep] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);
  const [createdId, setCreatedId] = useState('');
  const [createdEmail, setCreatedEmail] = useState('');
  const [tempPassword] = useState(() => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
    return Array.from({ length: 12 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  });

  const [employeeId, setEmployeeId] = useState('');
  const [employeeName, setEmployeeName] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [employmentStatus, setEmploymentStatus] = useState('permanent');
  const [isLookedUp, setIsLookedUp] = useState(false);
  const [lookupError, setLookupError] = useState('');

  const [selectedZoneIds, setSelectedZoneIds] = useState<string[]>([]);
  const [departmentId, setDepartmentId] = useState('');
  const [level, setLevel] = useState('');
  const [primaryRoleId, setPrimaryRoleId] = useState('');
  const [secondaryRoleId, setSecondaryRoleId] = useState('');
  const [hierarchyReports, setHierarchyReports] = useState<Record<string, string>>({});
  const [userGroup, setUserGroup] = useState('operations');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const [moduleAccess, setModuleAccess] = useState<Record<string, string[]>>({});
  const [expandedModules, setExpandedModules] = useState<Record<string, boolean>>({});
  const [projectSearch, setProjectSearch] = useState('');

  const [deptRoles, setDeptRoles] = useState<any[]>([]);
  const [roleMappingModulesData, setRoleMappingModulesData] = useState<any[]>([]);

  const departments = isApiMode() ? apiDepartments : mockDepartments;
  const zones = isApiMode() ? apiZones : mockZones;

  useEffect(() => {
    if (!departmentId) { setDeptRoles([]); return; }
    if (isApiMode()) {
      roleMappingApi.getDepartmentsRoles(Number(departmentId))
        .then(setDeptRoles)
        .catch(() => setDeptRoles([]));
    } else {
      setDeptRoles(mockRoles.filter((r) => r.departmentId === departmentId));
    }
  }, [departmentId]);

  useEffect(() => {
    if (!primaryRoleId || !departmentId) { setRoleMappingModulesData([]); return; }
    if (isApiMode()) {
      roleMappingApi.getById(primaryRoleId)
        .then((data: any) => {
          const modules = (data.modules || []).map((m: any) => ({
            moduleId: String(m.id),
            moduleName: m.name,
            moduleIcon: 'solar:widget-bold-duotone',
            hasSignature: false,
          }));
          setRoleMappingModulesData(modules);
        })
        .catch(() => setRoleMappingModulesData([]));
    } else {
      const mapping = mockPermissionMappings.find(
        (m) => m.roleId === primaryRoleId && m.departmentId === departmentId && m.level === level
      );
      if (mapping) {
        setRoleMappingModulesData(mapping.modules.map((mod) => {
          const fullMod = mockModules.find((m) => m.id === mod.moduleId);
          return {
            moduleId: mod.moduleId,
            moduleName: mod.moduleName,
            moduleIcon: fullMod?.icon ?? 'solar:widget-bold-duotone',
            hasSignature: mod.subModules.some((sm) => sm.actionNames.includes('Signature')),
          };
        }));
      } else {
        setRoleMappingModulesData([]);
      }
    }
  }, [primaryRoleId, departmentId, level]);

  const selectedDept = departments.find((d: any) => d.id === departmentId);
  const levelOptions = selectedDept
    ? Array.from({ length: selectedDept.maxHierarchyLevels }, (_, i) => ({ value: `L${i + 1}`, label: `Level ${i + 1}` }))
    : [];

  const filteredPrimaryRoles = useMemo(() => {
    if (!departmentId || !level) return [];
    const lvlNum = parseInt(level.replace('L', ''), 10);
    return deptRoles.filter((r: any) => {
      const rLevel = r.level ? parseInt(r.level.replace('L', ''), 10) : r.hierarchyLevelRank || 0;
      return rLevel === lvlNum;
    });
  }, [deptRoles, departmentId, level]);

  const selectedRole = deptRoles.find((r: any) => r.id === primaryRoleId);

  const secondaryRoleOptions = useMemo(() => {
    if (!selectedRole) return [];
    const userLevelNum = selectedRole.level
      ? parseInt(selectedRole.level.replace('L', ''), 10)
      : selectedRole.hierarchyLevelRank || 0;
    return deptRoles.filter((r: any) => {
      const rLevelNum = r.level ? parseInt(r.level.replace('L', ''), 10) : r.hierarchyLevelRank || 0;
      return rLevelNum < userLevelNum;
    });
  }, [selectedRole, deptRoles]);

  const hierarchyLevels = useMemo(() => {
    if (!selectedRole) return [];
    const userLevelNum = selectedRole.level
      ? parseInt(selectedRole.level.replace('L', ''), 10)
      : selectedRole.hierarchyLevelRank || 0;
    const levelsAbove: { label: string; levelNum: number }[] = [];
    for (let i = userLevelNum - 1; i >= 1; i -= 1) {
      const levelRoles = deptRoles.filter((r: any) => {
        const rLevel = r.level ? parseInt(r.level.replace('L', ''), 10) : r.hierarchyLevelRank || 0;
        return rLevel === i;
      });
      if (levelRoles.length > 0) {
        levelsAbove.push({ label: `L${i} - ${levelRoles[0].name}`, levelNum: i });
      }
    }
    return levelsAbove;
  }, [selectedRole, deptRoles]);

  const hierarchyUserOptions = useMemo(() => mockUsers
    .filter((u) => u.departmentId === departmentId)
    .map((u) => ({ value: u.id, label: `${u.name} (${u.employeeId})` })), [departmentId]);

  const allZoneProjects = useMemo(() => {
    const source = isApiMode() ? apiProjects : mockProjects;
    if (!selectedZoneIds || selectedZoneIds.length === 0) return [];
    return source.filter((p) => selectedZoneIds.includes(p.zoneId));
  }, [selectedZoneIds, apiProjects]);

  const filteredProjects = useMemo(() => {
    if (!projectSearch) return allZoneProjects;
    return allZoneProjects.filter((p) => p.name.toLowerCase().includes(projectSearch.toLowerCase()));
  }, [projectSearch, allZoneProjects]);

  const roleMappingModules = roleMappingModulesData;

  const handleEmployeeLookup = () => {
    if (!employeeId.trim()) { setLookupError('Enter Employee ID'); return; }
    const found = EMPLOYEE_DIRECTORY.find((e) => e.employeeId === employeeId.trim());
    if (!found) { setLookupError('Employee not found in directory'); return; }
    setEmployeeName(found.name);
    setEmail(found.email);
    setMobile(found.mobile);
    setIsLookedUp(true);
    setLookupError('');
  };

  const handleClearLookup = () => {
    setEmployeeId('');
    setEmployeeName('');
    setEmail('');
    setMobile('');
    setIsLookedUp(false);
    setLookupError('');
  };

  const canGoNext = useMemo(() => {
    if (activeStep === 0) return Boolean(employeeId.trim() && employeeName.trim() && email.trim() && mobile.trim());
    if (activeStep === 1) return selectedZoneIds.length > 0 && Boolean(departmentId && primaryRoleId);
    if (activeStep === 2) return Object.keys(moduleAccess).length > 0;
    return true;
  }, [activeStep, employeeId, employeeName, email, mobile, selectedZoneIds, departmentId, primaryRoleId, moduleAccess]);

  const handleModuleToggle = (moduleId: string, checked: boolean) => {
    if (checked) {
      setModuleAccess((prev) => ({ ...prev, [moduleId]: [] }));
    } else {
      const next = { ...moduleAccess };
      delete next[moduleId];
      setModuleAccess(next);
      const exp = { ...expandedModules };
      delete exp[moduleId];
      setExpandedModules(exp);
    }
  };

  const handleProjectToggle = (moduleId: string, projectId: string) => {
    setModuleAccess((prev) => {
      const current = prev[moduleId] ?? [];
      const next = current.includes(projectId) ? current.filter((id) => id !== projectId) : [...current, projectId];
      return { ...prev, [moduleId]: next };
    });
  };

  const handleSave = useCallback(async () => {
    if (isApiMode()) {
      try {
        const secondaryRoles: number[] = [];
        if (secondaryRoleId) secondaryRoles.push(Number(secondaryRoleId));
        const reporting: Array<{ levelRank: number; managerId: string }> = [];
        Object.entries(hierarchyReports).forEach(([key, val]) => {
          if (val) {
            const lvlNum = parseInt(key.replace('L', ''), 10);
            reporting.push({ levelRank: lvlNum, managerId: val });
          }
        });
        const result = await userApi.createFull({
          basic: {
            name: employeeName,
            email,
            departmentId: Number(departmentId),
            employeeId,
            mobile,
            employmentStatus,
            isActive: true,
          },
          organization: {
            zones: selectedZoneIds.map(Number),
            primaryRole: Number(primaryRoleId),
            secondaryRoles: secondaryRoles.length > 0 ? secondaryRoles : undefined,
            reporting: reporting.length > 0 ? reporting : undefined,
          },
        });
        setCreatedId(result?.user?.empId || employeeId);
        setCreatedEmail(email);
        setShowSuccess(true);
      } catch (e) {
        console.error('User creation failed:', e);
      }
      return;
    }

    const role = mockRoles.find((r) => r.id === primaryRoleId);
    const levelVal = role?.level ?? '';
    const newUser: any = {
      id: String(Date.now()),
      employeeId,
      firstName: employeeName.split(' ')[0],
      lastName: employeeName.split(' ').slice(1).join(' '),
      name: employeeName,
      email,
      phone: mobile,
      departmentId,
      departmentName: selectedDept?.name,
      roleId: primaryRoleId,
      roleName: selectedRole?.name,
      secondaryRoleId: secondaryRoleId || undefined,
      secondaryRoleName: secondaryRoleId ? mockRoles.find((r) => r.id === secondaryRoleId)?.name : undefined,
      level: levelVal,
      employmentStatus,
      userGroup,
      startDate,
      endDate: employmentStatus === 'permanent' ? '' : endDate,
      reportingManagerId: Object.values(hierarchyReports).find((v) => v) || undefined,
      reportingManagerName: undefined,
      zoneIds: selectedZoneIds,
      zoneNames: selectedZoneIds.map((zid) => mockZones.find((z) => z.id === zid)?.name ?? ''),
      createdBy: 'You',
      status: 'active',
      projects: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    mockUsers.unshift(newUser);
    setCreatedId(employeeId);
    setCreatedEmail(email);
    setShowSuccess(true);
  }, [employeeId, employeeName, email, mobile, departmentId, selectedDept, primaryRoleId, selectedRole, secondaryRoleId, employmentStatus, userGroup, startDate, endDate, hierarchyReports, selectedZoneIds]);

  return (
    <>
      <Helmet><title>Create User - {CONFIG.appName}</title></Helmet>
      <PageContainer>
        <PageHeader title="Create User" description="Assign who gets access and where" />
        <Card sx={{ overflow: 'hidden' }}>
          <Stepper activeStep={activeStep} sx={{ px: 4, pt: 4, pb: 2 }}>
            {STEPS.map((label) => (
              <Step key={label}><StepLabel>{label}</StepLabel></Step>
            ))}
          </Stepper>

          {activeStep === 0 && (
            <Box sx={{ p: 3 }}>
              <Typography variant="subtitle1" sx={{ mb: 2 }}>Basic Information</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Enter Employee ID and click Fetch to auto-populate, or enter details manually.
              </Typography>
              <Stack direction="row" spacing={1} alignItems="flex-start" sx={{ mb: 3 }}>
                <TextField
                  label="Employee ID"
                  value={employeeId}
                  onChange={(e) => { setEmployeeId(e.target.value); setLookupError(''); }}
                  error={!!lookupError}
                  helperText={lookupError}
                  size="small"
                  sx={{ minWidth: 200 }}
                />
                {!isLookedUp ? (
                  <Button variant="outlined" onClick={handleEmployeeLookup} startIcon={<Iconify icon="solar:user-search-bold" width={16} />} sx={{ mt: 0.5 }}>
                    Fetch Employee
                  </Button>
                ) : (
                  <Button size="small" color="inherit" onClick={handleClearLookup} startIcon={<Iconify icon="solar:close-circle-bold" width={16} />} sx={{ mt: 0.5 }}>
                    Clear
                  </Button>
                )}
              </Stack>
              <Box display="grid" gridTemplateColumns={{ xs: '1fr', sm: '1fr 1fr' }} gap={2.5}>
                <TextField label="Employee Name" value={employeeName} onChange={(e) => setEmployeeName(e.target.value)} InputProps={{ readOnly: isLookedUp }} />
                <TextField label="Employee ID (Auto)" value={employeeId} disabled />
                <TextField label="Email" value={email} onChange={(e) => setEmail(e.target.value)} InputProps={{ readOnly: isLookedUp }} />
                <TextField label="Mobile Number" value={mobile} onChange={(e) => setMobile(e.target.value)} InputProps={{ readOnly: isLookedUp }} />
                <TextField select label="Employment Status" value={employmentStatus} onChange={(e) => setEmploymentStatus(e.target.value)}>
                  {EMPLOYMENT_OPTIONS.map((o) => <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>)}
                </TextField>
              </Box>
            </Box>
          )}

          {activeStep === 1 && (
            <Box sx={{ p: 3 }}>
              <Typography variant="subtitle1" sx={{ mb: 2 }}>Location Access</Typography>
                <Autocomplete
                  multiple
                  options={zones.map((z: any) => z.id)}
                  getOptionLabel={(option: string) => zones.find((z: any) => z.id === option)?.name ?? option}
                  value={selectedZoneIds}
                  onChange={(_, newValue) => setSelectedZoneIds(newValue)}
                  renderTags={(value, getTagProps) =>
                    value.map((option, index) => (
                      <Chip
                        label={zones.find((z: any) => z.id === option)?.name ?? option}
                        size="small"
                        {...getTagProps({ index })}
                        sx={{ bgcolor: '#e8dff5', color: '#7c4dff', borderRadius: 1, '& .MuiChip-deleteIcon': { color: '#7c4dff' } }}
                      />
                    ))
                  }
                  renderInput={(params) => <TextField {...params} label="Zone" placeholder="Select zones" />}
                  sx={{ mb: 3 }}
                />

              <Typography variant="subtitle1" sx={{ mb: 2 }}>Role Assignment</Typography>
              <Box display="grid" gridTemplateColumns={{ xs: '1fr', sm: '1fr 1fr 1fr' }} gap={2.5} sx={{ mb: 3 }}>
                <TextField select label="Department" value={departmentId} onChange={(e) => { setDepartmentId(e.target.value); setLevel(''); setPrimaryRoleId(''); }}>
                  <MenuItem value="">Select Department</MenuItem>
                  {departments.map((d: any) => <MenuItem key={d.id} value={d.id}>{d.name}</MenuItem>)}
                </TextField>
                <TextField select label="Level" value={level} onChange={(e) => { setLevel(e.target.value); setPrimaryRoleId(''); }} disabled={!departmentId}>
                  <MenuItem value="">Select Level</MenuItem>
                  {levelOptions.map((o) => <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>)}
                </TextField>
                <TextField select label="Primary Role" value={primaryRoleId} onChange={(e) => setPrimaryRoleId(e.target.value)} disabled={!level}>
                  <MenuItem value="">Select Role</MenuItem>
                  {filteredPrimaryRoles.map((r: any) => <MenuItem key={r.id} value={r.id}>{r.name}</MenuItem>)}
                </TextField>
              </Box>

              {selectedRole && (
                <TextField
                  select
                  label="Secondary Role (optional)"
                  value={secondaryRoleId}
                  onChange={(e) => setSecondaryRoleId(e.target.value)}
                  fullWidth
                  sx={{ mb: 3, maxWidth: 360 }}
                >
                  <MenuItem value="">None</MenuItem>
                  {secondaryRoleOptions.map((r: any) => <MenuItem key={r.id} value={r.id}>{r.name} ({r.level || `L${r.hierarchyLevelRank}`})</MenuItem>)}
                </TextField>
              )}

              {hierarchyLevels.length > 0 && (
                <>
                  <Divider sx={{ my: 3 }} />
                  <Typography variant="subtitle1" sx={{ mb: 2 }}>
                    Reporting Hierarchy
                    <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                      (User Level: {selectedRole?.level})
                    </Typography>
                  </Typography>
                  <Box display="grid" gridTemplateColumns={{ xs: '1fr', sm: '1fr 1fr 1fr' }} gap={2.5} sx={{ mb: 3 }}>
                    {hierarchyLevels.map((hl) => (
                      <TextField
                        key={hl.label}
                        select
                        label={hl.label}
                        value={hierarchyReports[hl.label] ?? ''}
                        onChange={(e) => setHierarchyReports((prev) => ({ ...prev, [hl.label]: e.target.value }))}
                      >
                        <MenuItem value="">Select user</MenuItem>
                        {hierarchyUserOptions.map((u) => <MenuItem key={u.value} value={u.value}>{u.label}</MenuItem>)}
                      </TextField>
                    ))}
                  </Box>
                </>
              )}

              <Divider sx={{ my: 3 }} />
              <Typography variant="subtitle1" sx={{ mb: 2 }}>Lifecycle Details</Typography>
              <Box display="grid" gridTemplateColumns={{ xs: '1fr', sm: '1fr 1fr 1fr' }} gap={2.5}>
                <TextField select label="User Group" value={userGroup} onChange={(e) => setUserGroup(e.target.value)}>
                  {USER_GROUP_OPTIONS.map((o) => <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>)}
                </TextField>
                <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="en">
                  <DatePicker
                    label="Start Date"
                    format="DD/MM/YYYY"
                    value={startDate ? dayjs(startDate, 'DD/MM/YYYY') : null}
                    onChange={(date) => setStartDate(date ? date.format('DD/MM/YYYY') : '')}
                    slotProps={{ textField: { size: 'small', fullWidth: true } }}
                    sx={{ '& .MuiInputBase-root': { height: 40 } }}
                  />
                </LocalizationProvider>
                <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="en">
                  <DatePicker
                    format="DD/MM/YYYY"
                    label="End Date"
                    value={endDate ? dayjs(endDate, 'DD/MM/YYYY') : null}
                    onChange={(date) => setEndDate(date ? date.format('DD/MM/YYYY') : '')}
                    disabled={employmentStatus === 'permanent'}
                    slotProps={{ textField: { size: 'small', fullWidth: true } }}
                    sx={{ '& .MuiInputBase-root': { height: 40 } }}
                  />
                </LocalizationProvider>
              </Box>
              {employmentStatus === 'permanent' && (
                <Typography variant="caption" color="text.disabled" sx={{ display: 'block', mt: 1 }}>
                  End Date disabled for Permanent employees
                </Typography>
              )}
            </Box>
          )}

          {activeStep === 2 && (
            <Box sx={{ p: 3 }}>
              <Typography variant="subtitle1" sx={{ mb: 2 }}>
                Access Configuration
                <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                  (from {selectedRole?.name ?? ''} Permission Mapping)
                </Typography>
              </Typography>

              {roleMappingModules.length === 0 && selectedRole && (
                <Alert severity="info" sx={{ mb: 2 }}>
                  No permission mapping found for {selectedRole?.name}. Create a Permission Mapping first.
                </Alert>
              )}

              {roleMappingModules.length > 0 && (
                <Box display="grid" gridTemplateColumns={{ xs: '1fr', md: '1fr 1fr' }} gap={3}>
                  <Card variant="outlined" sx={{ p: 2 }}>
                    <Typography variant="subtitle2" sx={{ mb: 1 }}>Module</Typography>
                    {roleMappingModules.map((mod) => (
                      <Stack key={mod.moduleId} direction="row" alignItems="center" spacing={1} sx={{ py: 0.5 }}>
                        <Checkbox
                          size="small"
                          checked={moduleAccess[mod.moduleId] !== undefined}
                          onChange={(e) => handleModuleToggle(mod.moduleId, e.target.checked)}
                        />
                        <Iconify icon={mod.moduleIcon} width={18} color="primary.main" />
                        <Typography variant="body2">{mod.moduleName}</Typography>
                      </Stack>
                    ))}
                  </Card>

                  <Stack spacing={2}>
                    {selectedZoneIds.length === 0 && (
                      <Alert severity="info">Select zones in Step 2 to see projects</Alert>
                    )}
                    {roleMappingModules.filter((mod) => moduleAccess[mod.moduleId] !== undefined).map((mod) => {
                      const selectedProjectIds = moduleAccess[mod.moduleId] ?? [];
                      const isExpanded = expandedModules[mod.moduleId] ?? true;
                      const moduleProjects = filteredProjects.filter((p) =>
                        (mockPermissionModuleProjects[mod.moduleId] ?? []).includes(p.id)
                      );

                      return (
                        <Card key={mod.moduleId} variant="outlined" sx={{ p: 2 }}>
                          <Stack direction="row" alignItems="center" justifyContent="space-between">
                            <Stack direction="row" spacing={1} alignItems="center">
                              <Iconify icon={mod.moduleIcon} width={20} color="primary.main" />
                              <Typography variant="subtitle2">{mod.moduleName}</Typography>
                              <Chip label={`${selectedProjectIds.length} projects`} size="small" color="primary" variant="outlined" />
                            </Stack>
                            <IconButton size="small" onClick={() => setExpandedModules((prev) => ({ ...prev, [mod.moduleId]: !prev[mod.moduleId] }))}>
                              <Iconify icon={isExpanded ? 'solar:alt-arrow-up-bold' : 'solar:alt-arrow-down-bold'} width={18} />
                            </IconButton>
                          </Stack>

                          {isExpanded && (
                            <Box sx={{ mt: 1.5 }}>
                              <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                                <TextField
                                  size="small"
                                  placeholder="Search projects..."
                                  value={projectSearch}
                                  onChange={(e) => setProjectSearch(e.target.value)}
                                  sx={{ flex: 1 }}
                                />
                                <Button
                                  size="small"
                                  variant="text"
                                  onClick={() => {
                                    const allIds = moduleProjects.map((p) => p.id);
                                    setModuleAccess((prev) => ({ ...prev, [mod.moduleId]: selectedProjectIds.length === allIds.length ? [] : allIds }));
                                  }}
                                >
                                  {selectedProjectIds.length === moduleProjects.length ? 'Clear All' : 'Select All'}
                                </Button>
                              </Stack>

                              <Box sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1, p: 1.5, maxHeight: 200, overflow: 'auto' }}>
                                <Box display="grid" gridTemplateColumns="repeat(2, 1fr)" gap={0.5}>
                                  {moduleProjects.map((project) => (
                                    <Chip
                                      key={project.id}
                                      label={project.name}
                                      size="small"
                                      variant={selectedProjectIds.includes(project.id) ? 'filled' : 'outlined'}
                                      color={selectedProjectIds.includes(project.id) ? 'primary' : 'default'}
                                      onClick={() => handleProjectToggle(mod.moduleId, project.id)}
                                      onDelete={selectedProjectIds.includes(project.id) ? () => handleProjectToggle(mod.moduleId, project.id) : undefined}
                                      sx={{ justifyContent: 'flex-start', cursor: 'pointer' }}
                                    />
                                  ))}
                                </Box>
                              </Box>

                              {selectedProjectIds.length > 0 && (
                                <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap sx={{ mt: 1.5 }}>
                                  {selectedProjectIds.map((pid) => {
                                    const projectSource = isApiMode() ? apiProjects : mockProjects;
                                    const p = projectSource.find((pj) => pj.id === pid);
                                    return (
                                      <Chip
                                        key={pid}
                                        label={p?.name ?? pid}
                                        size="small"
                                        onDelete={() => handleProjectToggle(mod.moduleId, pid)}
                                        sx={{ bgcolor: '#e8dff5', color: '#7c4dff', borderRadius: 1, '& .MuiChip-deleteIcon': { color: '#7c4dff' } }}
                                      />
                                    );
                                  })}
                                </Stack>
                              )}

                              {mod.hasSignature && (
                                <Box sx={{ mt: 2, p: 1.5, borderRadius: 1, bgcolor: '#fff3e0', border: '1px solid', borderColor: '#ffe0b2' }}>
                                  <Typography variant="caption" fontWeight={600}>Signature Upload Required</Typography>
                                  <Button variant="outlined" size="small" startIcon={<Iconify icon="solar:upload-bold" width={16} />} sx={{ mt: 0.5, display: 'block' }}>
                                    Upload Signature Image
                                  </Button>
                                </Box>
                              )}
                            </Box>
                          )}
                        </Card>
                      );
                    })}
                  </Stack>
                </Box>
              )}
            </Box>
          )}

          <Stack direction="row" justifyContent="space-between" sx={{ p: 3, borderTop: '1px solid', borderColor: 'divider' }}>
            <Button color="inherit" onClick={() => navigate(paths.dashboard.userManagement)}>Cancel</Button>
            <Stack direction="row" spacing={1}>
              <Button disabled={activeStep === 0} onClick={() => setActiveStep((p) => p - 1)} color="inherit">Previous</Button>
              <Button
                variant="contained"
                onClick={() => {
                  if (activeStep === STEPS.length - 1) handleSave();
                  else setActiveStep((p) => p + 1);
                }}
                disabled={!canGoNext}
              >
                {activeStep === STEPS.length - 1 ? 'Create User' : 'Next'}
              </Button>
            </Stack>
          </Stack>
        </Card>
      </PageContainer>

      <Dialog open={showSuccess} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Stack direction="row" alignItems="center" spacing={1}>
            <Iconify icon="solar:check-circle-bold" width={28} color="success.main" />
            <Typography variant="h6">User Created Successfully</Typography>
          </Stack>
        </DialogTitle>
        <DialogContent>
          <Stack spacing={1.5} sx={{ mt: 1 }}>
            <Stack direction="row" justifyContent="space-between">
              <Typography variant="body2" color="text.secondary">Employee ID</Typography>
              <Typography variant="body2" fontWeight={600}>{createdId}</Typography>
            </Stack>
            <Divider />
            <Stack direction="row" justifyContent="space-between">
              <Typography variant="body2" color="text.secondary">Email</Typography>
              <Typography variant="body2" fontWeight={600}>{createdEmail}</Typography>
            </Stack>
            <Divider />
            <Stack direction="row" justifyContent="space-between">
              <Typography variant="body2" color="text.secondary">Temporary Password</Typography>
              <Typography variant="body2" fontWeight={600} sx={{ fontFamily: 'monospace', letterSpacing: 1 }}>{tempPassword}</Typography>
            </Stack>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button color="inherit" onClick={() => navigate(paths.dashboard.userManagement)}>Close</Button>
          <Button variant="contained" startIcon={<Iconify icon="solar:copy-bold" width={16} />} onClick={() => {
            navigator.clipboard.writeText(`Employee ID: ${createdId}\nEmail: ${createdEmail}\nPassword: ${tempPassword}`);
          }}>
            Copy Credentials
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

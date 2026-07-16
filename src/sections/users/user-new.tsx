import { useState, useCallback, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Card from '@mui/material/Card';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import TextField from '@mui/material/TextField';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import Alert from '@mui/material/Alert';
import Snackbar from '@mui/material/Snackbar';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';

import Autocomplete from '@mui/material/Autocomplete';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z as zod } from 'zod';
import { CONFIG } from 'src/config-global';
import { Form, Field } from 'src/components/hook-form';
import { PageContainer, PageHeader } from 'src/components/page-layout';
import { Iconify } from 'src/components/iconify';
import { mockDepartments, mockRoles, mockZones, mockProjects, mockUsers, mockUserGroups } from 'src/services/mock-data';
import { paths } from 'src/routes/paths';

const STEPS = ['Basic Information', 'Project Mapping', 'Organisation & Hierarchy', 'Review & Create'];

const EMPLOYMENT_OPTIONS = [
  { value: 'contract', label: 'Contract' },
  { value: 'permanent', label: 'Permanent' },
  { value: 'serving_notice_period', label: 'Serving Notice Period' },
];

const ACCESS_MODULES = [
  { id: 'crm', name: 'CRM' },
  { id: 'finance', name: 'Finance' },
  { id: 'eoi', name: 'EOI' },
  { id: 'inventory', name: 'Inventory' },
  { id: 'reports', name: 'Reports' },
  { id: 'approvals', name: 'Approvals' },
  { id: 'iom', name: 'IOM' },
];

const SAP_EMPLOYEES: Record<string, { name: string; email: string; mobile: string }> = {
  'EMP-005': { name: 'Vikas Gupta', email: 'vikas.gupta@puravankara.com', mobile: '+91-9876543214' },
  'EMP-006': { name: 'Neha Jain', email: 'neha.jain@puravankara.com', mobile: '+91-9876543215' },
  'EMP-007': { name: 'Arun Kumar', email: 'arun.kumar@puravankara.com', mobile: '+91-9876543216' },
  'EMP-008': { name: 'Pooja Singh', email: 'pooja.singh@puravankara.com', mobile: '+91-9876543217' },
};

const formSchema = zod.object({
  employeeId: zod.string().min(1, 'Employee ID is required'),
  employeeName: zod.string().min(1, 'Employee name is required'),
  email: zod.string().email('Invalid email address'),
  mobile: zod.string().min(10, 'Valid mobile number required'),
  employmentStatus: zod.enum(['contract', 'permanent', 'serving_notice_period']),
  zoneIds: zod.array(zod.string()).min(1, 'At least one zone is required'),
  departmentId: zod.string().min(1, 'Department is required'),
  primaryRoleId: zod.string().min(1, 'Primary role is required'),
  secondaryRoleId: zod.string().optional(),
  reportingManagerId: zod.string().min(1, 'Reporting manager is required'),
  teamLeadId: zod.string().min(1, 'Team lead is required'),
  deptAdminId: zod.string().min(1, 'Department admin is required'),
  userGroupId: zod.string().min(1, 'User group is required'),
  startDate: zod.string().min(1, 'Start date is required'),
  endDate: zod.string().min(1, 'End date is required'),
});

type FormData = zod.infer<typeof formSchema>;

const defaults: FormData = {
  employeeId: '',
  employeeName: '',
  email: '',
  mobile: '',
  employmentStatus: 'permanent',
  zoneIds: [],
  departmentId: '',
  primaryRoleId: '',
  secondaryRoleId: '',
  reportingManagerId: '',
  teamLeadId: '',
  deptAdminId: '',
  userGroupId: '1',
  startDate: '',
  endDate: '',
};

// -- Step 2 types --
type ModuleAccess = {
  moduleId: string;
  accessType: 'ALL_PROJECTS' | 'SELECT_PROJECTS';
  selectedProjectIds: string[];
};

export default function UserNewPage() {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);
  const [sapFetchError, setSapFetchError] = useState('');
  const [tempPassword] = useState(() => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
    return Array.from({ length: 12 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  });

  const methods = useForm<FormData>({ resolver: zodResolver(formSchema), defaultValues: defaults });

  const selectedDeptId = methods.watch('departmentId');

  const filteredPrimaryRoles = useMemo(
    () => mockRoles.filter((r) => r.departmentId === selectedDeptId),
    [selectedDeptId],
  );

  const userOptions = useMemo(
    () => mockUsers.map((u) => ({ value: u.id, label: u.name })),
    [],
  );

  // Step 2 state
  const [moduleAccess, setModuleAccess] = useState<ModuleAccess[]>([]);
  const [expandedModules, setExpandedModules] = useState<Record<string, boolean>>({});
  const [projectSearch, setProjectSearch] = useState('');

  const handleModuleToggle = (moduleId: string, checked: boolean) => {
    if (checked) {
      setModuleAccess((prev) => [...prev, { moduleId, accessType: 'SELECT_PROJECTS', selectedProjectIds: [] }]);
    } else {
      setModuleAccess((prev) => prev.filter((m) => m.moduleId !== moduleId));
      setExpandedModules((prev) => { const n = { ...prev }; delete n[moduleId]; return n; });
    }
  };

  const handleAccessTypeChange = (moduleId: string, accessType: 'ALL_PROJECTS' | 'SELECT_PROJECTS') => {
    setModuleAccess((prev) => prev.map((m) => m.moduleId === moduleId ? { ...m, accessType, selectedProjectIds: [] } : m));
  };

  const handleProjectToggle = (moduleId: string, projectId: string) => {
    setModuleAccess((prev) => prev.map((m) => {
      if (m.moduleId !== moduleId) return m;
      const ids = m.selectedProjectIds.includes(projectId)
        ? m.selectedProjectIds.filter((id) => id !== projectId)
        : [...m.selectedProjectIds, projectId];
      return { ...m, selectedProjectIds: ids };
    }));
  };

  const filteredProjects = useMemo(
    () => projectSearch ? mockProjects.filter((p) => p.name.toLowerCase().includes(projectSearch.toLowerCase())) : mockProjects,
    [projectSearch],
  );

  const handleSapFetch = useCallback(() => {
    const empId = methods.getValues('employeeId');
    if (!empId) { setSapFetchError('Enter an Employee ID first'); return; }
    const result = SAP_EMPLOYEES[empId];
    if (result) {
      methods.setValue('employeeName', result.name);
      methods.setValue('email', result.email);
      methods.setValue('mobile', result.mobile);
      setSapFetchError('');
    } else {
      setSapFetchError('Employee not found in SAP system. Enter details manually.');
    }
  }, [methods]);

  const handleNext = useCallback(async () => {
    const fieldsByStep: Record<number, (keyof FormData)[]> = {
      0: ['employeeId', 'employeeName', 'email', 'mobile'],
      1: ['zoneIds', 'departmentId', 'primaryRoleId'],
      2: ['employmentStatus', 'reportingManagerId', 'teamLeadId', 'deptAdminId', 'userGroupId', 'startDate', 'endDate'],
    };

    const fields = fieldsByStep[activeStep];
    if (fields) {
      const valid = await methods.trigger(fields);
      if (!valid) return;
    }

    if (activeStep === STEPS.length - 1) {
      if (moduleAccess.length === 0) return;
      setShowSuccess(true);
      setTimeout(() => navigate(paths.dashboard.userManagement), 2000);
      return;
    }

    setActiveStep((prev) => prev + 1);
  }, [activeStep, methods, moduleAccess, navigate]);

  const handleBack = useCallback(() => {
    setActiveStep((prev) => prev - 1);
  }, []);

  const formValues = methods.watch();

  const reviewData = useMemo(() => {
    const zoneNames = formValues.zoneIds.map((id) => mockZones.find((z) => z.id === id)?.name ?? id);
    const deptName = mockDepartments.find((d) => d.id === formValues.departmentId)?.name ?? '';
    const roleName = filteredPrimaryRoles.find((r) => r.id === formValues.primaryRoleId)?.name ?? '';
    const secondaryName = formValues.secondaryRoleId
      ? filteredPrimaryRoles.find((r) => r.id === formValues.secondaryRoleId)?.name ?? ''
      : '';
    const rmName = mockUsers.find((u) => u.id === formValues.reportingManagerId)?.name ?? '';
    const tlName = mockUsers.find((u) => u.id === formValues.teamLeadId)?.name ?? '';
    const daName = mockUsers.find((u) => u.id === formValues.deptAdminId)?.name ?? '';
    const groupName = mockUserGroups.find((g) => g.id === formValues.userGroupId)?.name ?? '';
    const empStatusLabel = EMPLOYMENT_OPTIONS.find((o) => o.value === formValues.employmentStatus)?.label ?? '';
    return {
      zoneNames, deptName, roleName, secondaryName,
      rmName, tlName, daName, groupName, empStatusLabel,
    };
  }, [formValues, filteredPrimaryRoles]);

  return (
    <>
      <Helmet><title>Create User - {CONFIG.appName}</title></Helmet>
      <PageContainer>
        <PageHeader title="Create User" description="Set up a new user with role, hierarchy, and access permissions" />
        <Card sx={{ overflow: 'hidden' }}>
          <Stepper activeStep={activeStep} sx={{ px: 4, pt: 4, pb: 2 }}>
            {STEPS.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          <Form methods={methods} onSubmit={() => {}}>
            {/* Step 1: Basic Information */}
            {activeStep === 0 && (
              <Box sx={{ p: 3 }}>
                <Typography variant="subtitle1" sx={{ mb: 2 }}>Employee Information</Typography>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
                  Enter the Employee ID to fetch details from SAP, or fill in the fields manually.
                </Typography>
                <Box display="grid" gridTemplateColumns={{ xs: '1fr', sm: '1fr 1fr' }} gap={2.5}>
                  <Field.Text
                    name="employeeId"
                    label="Employee ID"
                    placeholder="e.g. EMP-005"
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <Button
                            size="small"
                            variant="contained"
                            onClick={handleSapFetch}
                            sx={{ minWidth: 60, height: 30, fontSize: 12 }}
                          >
                            Fetch
                          </Button>
                        </InputAdornment>
                      ),
                    }}
                  />
                  <Box />
                  {sapFetchError && (
                    <Alert severity="warning" sx={{ gridColumn: '1 / -1' }}>{sapFetchError}</Alert>
                  )}
                  <Field.Text name="employeeName" label="Employee Name" placeholder="Enter Employee Name" />
                  <Field.Text name="email" label="Email ID" placeholder="Enter Email Address" />
                  <Field.Text name="mobile" label="Mobile Number" placeholder="+91 XXXXX XXXXX" />
                </Box>
              </Box>
            )}

            {/* Step 2: Project Mapping */}
            {activeStep === 1 && (
              <Box sx={{ p: 3 }}>
                <Typography variant="subtitle1" sx={{ mb: 2 }}>Project Assignment</Typography>
                <Box display="grid" gridTemplateColumns={{ xs: '1fr', sm: '1fr 1fr' }} gap={2.5}>
                  <Controller
                    name="zoneIds"
                    control={methods.control}
                    render={({ field, fieldState }) => (
                      <Autocomplete
                        multiple
                        options={mockZones.map((z) => z.id)}
                        getOptionLabel={(option) => mockZones.find((z) => z.id === option)?.name ?? option}
                        value={field.value ?? []}
                        onChange={(_, newValue) => field.onChange(newValue)}
                        renderTags={(value, getTagProps) =>
                          value.map((option, index) => {
                            const zone = mockZones.find((z) => z.id === option);
                            return (
                              <Chip
                                label={zone?.name ?? option}
                                size="small"
                                {...getTagProps({ index })}
                                sx={{
                                  bgcolor: '#e8dff5',
                                  color: '#7c4dff',
                                  borderRadius: 1,
                                  '& .MuiChip-deleteIcon': { color: '#7c4dff', borderRadius: '50%' },
                                }}
                              />
                            );
                          })
                        }
                        renderInput={(params) => (
                          <TextField {...params} label="Zone *" error={!!fieldState.error} helperText={fieldState.error?.message} />
                        )}
                      />
                    )}
                  />
                  <Field.Select name="departmentId" label="Department *" options={mockDepartments.map((d) => ({ value: d.id, label: d.name }))} />
                  <Field.Select name="primaryRoleId" label="Primary Role *" options={filteredPrimaryRoles.map((r) => ({ value: r.id, label: r.name }))} />
                  <Field.Select name="secondaryRoleId" label="Secondary Role (optional)" options={filteredPrimaryRoles.map((r) => ({ value: r.id, label: r.name }))} />
                </Box>

                <Divider sx={{ my: 3 }} />
                <Typography variant="subtitle1" sx={{ mb: 2 }}>Module Access</Typography>
                <Box display="grid" gridTemplateColumns={{ xs: '1fr', lg: '30fr 70fr' }} gap={3}>
                  <Card variant="outlined" sx={{ p: 2 }}>
                    <Typography variant="subtitle2" sx={{ mb: 0.5 }}>Select Modules</Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1.5 }}>
                      Select the modules this user will have access to
                    </Typography>
                    <FormControlLabel
                      label="Select All"
                      control={
                        <Checkbox
                          size="small"
                          checked={moduleAccess.length === ACCESS_MODULES.length}
                          indeterminate={moduleAccess.length > 0 && moduleAccess.length < ACCESS_MODULES.length}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setModuleAccess(ACCESS_MODULES.map((m) => ({ moduleId: m.id, accessType: 'SELECT_PROJECTS' as const, selectedProjectIds: [] })));
                            } else {
                              setModuleAccess([]);
                              setExpandedModules({});
                            }
                          }}
                        />
                      }
                    />
                    <Divider sx={{ my: 1 }} />
                    <Stack spacing={0.5}>
                      {ACCESS_MODULES.map((mod) => (
                        <FormControlLabel
                          key={mod.id}
                          label={mod.name}
                          control={
                            <Checkbox
                              size="small"
                              checked={moduleAccess.some((m) => m.moduleId === mod.id)}
                              onChange={(e) => handleModuleToggle(mod.id, e.target.checked)}
                            />
                          }
                        />
                      ))}
                    </Stack>
                  </Card>

                  <Stack spacing={2}>
                    {moduleAccess.length === 0 && (
                      <Typography variant="body2" color="text.secondary" sx={{ py: 4, textAlign: 'center' }}>
                        Select modules from the left panel
                      </Typography>
                    )}
                    {moduleAccess.map((ma) => {
                      const mod = ACCESS_MODULES.find((m) => m.id === ma.moduleId);
                      const isExpanded = expandedModules[ma.moduleId] ?? false;
                      const isConfigured = ma.accessType === 'ALL_PROJECTS' || ma.selectedProjectIds.length > 0;
                      const statusLabel = ma.accessType === 'ALL_PROJECTS'
                        ? 'All Projects'
                        : ma.selectedProjectIds.length > 0
                          ? `${ma.selectedProjectIds.length} Project${ma.selectedProjectIds.length > 1 ? 's' : ''} Selected`
                          : 'Not Configured';

                      return (
                        <Card key={ma.moduleId} variant="outlined" sx={{ p: 2 }}>
                          <Stack direction="row" alignItems="center" justifyContent="space-between">
                            <Typography variant="subtitle2">{mod?.name}</Typography>
                            <Stack direction="row" spacing={0.5} alignItems="center">
                              <Chip
                                label={statusLabel}
                                size="small"
                                sx={{
                                  bgcolor: isConfigured ? 'action.selected' : '#fff3e0',
                                  color: isConfigured ? 'text.primary' : '#e65100',
                                  borderRadius: 1,
                                  fontWeight: 500,
                                }}
                              />
                              <IconButton size="small" onClick={() => handleModuleToggle(ma.moduleId, false)}>
                                <Iconify icon="solar:trash-bin-trash-bold" width={18} />
                              </IconButton>
                              <IconButton size="small" onClick={() => setExpandedModules((prev) => ({ ...prev, [ma.moduleId]: !prev[ma.moduleId] }))}>
                                <Iconify icon={isExpanded ? 'solar:alt-arrow-down-bold' : 'solar:alt-arrow-right-bold'} width={18} />
                              </IconButton>
                            </Stack>
                          </Stack>

                          {isExpanded && (
                            <Box sx={{ mt: 2 }}>
                              <Stack direction="row" alignItems="center" spacing={0.5}>
                                <Typography variant="caption" color="text.secondary">Access Type:</Typography>
                                <RadioGroup
                                  value={ma.accessType}
                                  onChange={(e) => handleAccessTypeChange(ma.moduleId, e.target.value as 'ALL_PROJECTS' | 'SELECT_PROJECTS')}
                                  sx={{ flexDirection: 'row', display: 'inline-flex' }}
                                >
                                  <FormControlLabel value="SELECT_PROJECTS" control={<Radio size="small" />} label="Select Projects" />
                                  <FormControlLabel value="ALL_PROJECTS" control={<Radio size="small" />} label="All Projects" />
                                </RadioGroup>
                              </Stack>

                              {ma.accessType === 'SELECT_PROJECTS' && (
                                <Box sx={{ mt: 1.5 }}>
                                  <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                                    <TextField
                                      size="small"
                                      placeholder="Search projects..."
                                      value={projectSearch}
                                      onChange={(e) => setProjectSearch(e.target.value)}
                                      sx={{ flex: 1 }}
                                    />
                                    <FormControlLabel
                                      label="Select All"
                                      control={
                                        <Checkbox
                                          size="small"
                                          checked={ma.selectedProjectIds.length === mockProjects.length}
                                          indeterminate={ma.selectedProjectIds.length > 0 && ma.selectedProjectIds.length < mockProjects.length}
                                          onChange={(e) => {
                                            setModuleAccess((prev) => prev.map((m) => m.moduleId === ma.moduleId ? { ...m, selectedProjectIds: e.target.checked ? mockProjects.map((p) => p.id) : [] } : m));
                                          }}
                                        />
                                      }
                                      sx={{ m: 0 }}
                                    />
                                  </Stack>
                                  <Box sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1, p: 1.5, maxHeight: 220, overflow: 'auto' }}>
                                    <Box display="grid" gridTemplateColumns="repeat(3, 1fr)" gap={0.5}>
                                      {filteredProjects.map((project) => (
                                        <FormControlLabel
                                          key={project.id}
                                          label={project.name}
                                          control={
                                            <Checkbox
                                              size="small"
                                              checked={ma.selectedProjectIds.includes(project.id)}
                                              onChange={() => handleProjectToggle(ma.moduleId, project.id)}
                                            />
                                          }
                                          sx={{ m: 0 }}
                                        />
                                      ))}
                                    </Box>
                                  </Box>
                                  {ma.selectedProjectIds.length > 0 && (
                                    <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap sx={{ mt: 1.5 }}>
                                      {ma.selectedProjectIds.map((pid) => {
                                        const p = mockProjects.find((pj) => pj.id === pid);
                                        return (
                                          <Chip
                                            key={pid}
                                            label={p?.name ?? pid}
                                            size="small"
                                            onDelete={() => handleProjectToggle(ma.moduleId, pid)}
                                            sx={{ bgcolor: '#e8dff5', color: '#7c4dff', borderRadius: 1, '& .MuiChip-deleteIcon': { color: '#7c4dff' } }}
                                          />
                                        );
                                      })}
                                    </Stack>
                                  )}
                                </Box>
                              )}

                              {ma.accessType === 'ALL_PROJECTS' && (
                                <Box sx={{ mt: 1.5, bgcolor: '#e3f2fd', border: '1px solid', borderColor: '#90caf9', borderRadius: 1, p: 1.5 }}>
                                  <Stack direction="row" alignItems="flex-start" spacing={1}>
                                    <Iconify icon="solar:info-circle-bold" width={18} color="#1565c0" style={{ marginTop: 2 }} />
                                    <Typography variant="caption" color="#1565c0">
                                      User will automatically receive access to all current and future projects.
                                    </Typography>
                                  </Stack>
                                </Box>
                              )}
                            </Box>
                          )}
                        </Card>
                      );
                    })}
                  </Stack>
                </Box>
              </Box>
            )}

            {/* Step 3: Organisation & Hierarchy */}
            {activeStep === 2 && (
              <Box sx={{ p: 3 }}>
                <Typography variant="subtitle1" sx={{ mb: 2 }}>Employment Status</Typography>
                <Box display="grid" gridTemplateColumns={{ xs: '1fr', sm: '1fr 1fr' }} gap={2.5}>
                  <Field.Select name="employmentStatus" label="Employment Status" options={EMPLOYMENT_OPTIONS} />
                </Box>

                <Divider sx={{ my: 3 }} />
                <Typography variant="subtitle1" sx={{ mb: 2 }}>Reporting Hierarchy</Typography>
                <Box display="grid" gridTemplateColumns={{ xs: '1fr', sm: '1fr 1fr 1fr' }} gap={2.5}>
                  <Field.Select name="reportingManagerId" label="Reporting Manager *" options={userOptions} />
                  <Field.Select name="teamLeadId" label="Team Lead *" options={userOptions} />
                  <Field.Select name="deptAdminId" label="Department Admin *" options={userOptions} />
                </Box>

                <Divider sx={{ my: 3 }} />
                <Typography variant="subtitle1" sx={{ mb: 2 }}>User Group & Tenure</Typography>
                <Box display="grid" gridTemplateColumns={{ xs: '1fr', sm: '1fr 1fr 1fr' }} gap={2.5}>
                  <Field.Select name="userGroupId" label="User Group *" options={mockUserGroups.map((g) => ({ value: g.id, label: g.name }))} />
                  <Controller
                    name="startDate"
                    control={methods.control}
                    render={({ field, fieldState }) => (
                      <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="en">
                        <DatePicker
                          label="Start Date *"
                          format="DD/MM/YYYY"
                          value={field.value ? dayjs(field.value, 'DD/MM/YYYY') : null}
                          onChange={(date) => field.onChange(date ? date.format('DD/MM/YYYY') : '')}
                          slotProps={{
                            textField: { size: 'small', fullWidth: true, error: !!fieldState.error, helperText: fieldState.error?.message },
                          }}
                          sx={{ '& .MuiInputBase-root': { height: 40 } }}
                        />
                      </LocalizationProvider>
                    )}
                  />
                  <Controller
                    name="endDate"
                    control={methods.control}
                    render={({ field, fieldState }) => (
                      <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="en">
                        <DatePicker
                          format="DD/MM/YYYY"
                          label="End Date *"
                          value={field.value ? dayjs(field.value, 'DD/MM/YYYY') : null}
                          onChange={(date) => field.onChange(date ? date.format('DD/MM/YYYY') : '')}
                          slotProps={{
                            textField: { size: 'small', fullWidth: true, error: !!fieldState.error, helperText: fieldState.error?.message },
                          }}
                          sx={{ '& .MuiInputBase-root': { height: 40 } }}
                        />
                      </LocalizationProvider>
                    )}
                  />
                </Box>
              </Box>
            )}

            {/* Step 4: Review & Create */}
            {activeStep === 3 && (
              <Box sx={{ p: 3 }}>
                <Typography variant="subtitle1" sx={{ mb: 3 }}>Review User Details</Typography>

                <Card variant="outlined" sx={{ p: 2, mb: 2 }}>
                  <Typography variant="subtitle2" sx={{ mb: 1, color: 'text.secondary' }}>Basic Information</Typography>
                  <Box display="grid" gridTemplateColumns="1fr 1fr" gap={1}>
                    <Typography variant="caption" color="text.secondary">Employee ID</Typography>
                    <Typography variant="body2">{formValues.employeeId}</Typography>
                    <Typography variant="caption" color="text.secondary">Name</Typography>
                    <Typography variant="body2">{formValues.employeeName}</Typography>
                    <Typography variant="caption" color="text.secondary">Email</Typography>
                    <Typography variant="body2">{formValues.email}</Typography>
                    <Typography variant="caption" color="text.secondary">Mobile</Typography>
                    <Typography variant="body2">{formValues.mobile}</Typography>
                  </Box>
                </Card>

                <Card variant="outlined" sx={{ p: 2, mb: 2 }}>
                  <Typography variant="subtitle2" sx={{ mb: 1, color: 'text.secondary' }}>Project Mapping</Typography>
                  <Box display="grid" gridTemplateColumns="1fr 1fr" gap={1}>
                    <Typography variant="caption" color="text.secondary">Zones</Typography>
                    <Typography variant="body2">{reviewData.zoneNames.join(', ') || '-'}</Typography>
                    <Typography variant="caption" color="text.secondary">Department</Typography>
                    <Typography variant="body2">{reviewData.deptName}</Typography>
                    <Typography variant="caption" color="text.secondary">Primary Role</Typography>
                    <Typography variant="body2">{reviewData.roleName}</Typography>
                    {reviewData.secondaryName && (
                      <>
                        <Typography variant="caption" color="text.secondary">Secondary Role</Typography>
                        <Typography variant="body2">{reviewData.secondaryName}</Typography>
                      </>
                    )}
                    <Typography variant="caption" color="text.secondary">Modules Assigned</Typography>
                    <Typography variant="body2">
                      {moduleAccess.length > 0
                        ? moduleAccess.map((m) => ACCESS_MODULES.find((a) => a.id === m.moduleId)?.name).join(', ')
                        : 'None'}
                    </Typography>
                  </Box>
                </Card>

                <Card variant="outlined" sx={{ p: 2, mb: 2 }}>
                  <Typography variant="subtitle2" sx={{ mb: 1, color: 'text.secondary' }}>Organisation & Hierarchy</Typography>
                  <Box display="grid" gridTemplateColumns="1fr 1fr" gap={1}>
                    <Typography variant="caption" color="text.secondary">Employment Status</Typography>
                    <Typography variant="body2">{reviewData.empStatusLabel}</Typography>
                    <Typography variant="caption" color="text.secondary">Reporting Manager</Typography>
                    <Typography variant="body2">{reviewData.rmName}</Typography>
                    <Typography variant="caption" color="text.secondary">Team Lead</Typography>
                    <Typography variant="body2">{reviewData.tlName}</Typography>
                    <Typography variant="caption" color="text.secondary">Dept Admin</Typography>
                    <Typography variant="body2">{reviewData.daName}</Typography>
                    <Typography variant="caption" color="text.secondary">User Group</Typography>
                    <Typography variant="body2">{reviewData.groupName}</Typography>
                    <Typography variant="caption" color="text.secondary">Start Date</Typography>
                    <Typography variant="body2">{formValues.startDate}</Typography>
                    <Typography variant="caption" color="text.secondary">End Date</Typography>
                    <Typography variant="body2">{formValues.endDate}</Typography>
                  </Box>
                </Card>
              </Box>
            )}
          </Form>

          <Stack direction="row" justifyContent="space-between" sx={{ p: 3, borderTop: '1px solid', borderColor: 'divider' }}>
            <Button color="inherit" onClick={() => navigate(paths.dashboard.userManagement)}>
              Cancel
            </Button>
            <Stack direction="row" spacing={1}>
              <Button disabled={activeStep === 0} onClick={handleBack} color="inherit">
                Previous
              </Button>
              <Button variant="contained" onClick={handleNext}>
                {activeStep === STEPS.length - 1 ? 'Create User' : 'Next'}
              </Button>
            </Stack>
          </Stack>
        </Card>
      </PageContainer>

      <Snackbar open={showSuccess} autoHideDuration={3000} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
        <Alert severity="success" variant="filled" sx={{ width: 1 }}>
          <Typography variant="body2" fontWeight={600}>User Created Successfully</Typography>
          <Typography variant="caption">Email: {formValues.email}</Typography>
          <br />
          <Typography variant="caption">Temporary Password: {tempPassword}</Typography>
        </Alert>
      </Snackbar>
    </>
  );
}

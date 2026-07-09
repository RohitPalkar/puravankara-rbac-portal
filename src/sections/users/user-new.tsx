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
import MenuItem from '@mui/material/MenuItem';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import Alert from '@mui/material/Alert';
import Snackbar from '@mui/material/Snackbar';
import IconButton from '@mui/material/IconButton';
import Collapse from '@mui/material/Collapse';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z as zod } from 'zod';
import { CONFIG } from 'src/config-global';
import { Form, Field } from 'src/components/hook-form';
import { PageContainer, PageHeader } from 'src/components/page-layout';
import { Iconify } from 'src/components/iconify';
import { mockDepartments, mockRoles, mockZones, mockProjects, mockModules, mockUsers } from 'src/services/mock-data';
import { paths } from 'src/routes/paths';

const STEPS = ['Basic Information', 'Organization & Hierarchy', 'Access Configuration'];

const EMPLOYMENT_OPTIONS = [
  { value: 'contract', label: 'Contract' },
  { value: 'permanent', label: 'Permanent' },
  { value: 'serving_notice_period', label: 'Serving Notice Period' },
];

const USER_GROUP_OPTIONS = [
  { value: 'operations', label: 'Operations' },
  { value: 'management', label: 'Management' },
  { value: 'executive', label: 'Executive' },
  { value: 'admin', label: 'Admin' },
];

const formSchema = zod.object({
  employeeName: zod.string().min(1, 'Employee name is required'),
  employeeId: zod.string().min(1, 'Employee ID is required'),
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
  userGroup: zod.string().min(1, 'User group is required'),
  startDate: zod.string().min(1, 'Start date is required'),
  endDate: zod.string().min(1, 'End date is required'),
});

type FormData = zod.infer<typeof formSchema>;

function generateEmployeeId(): string {
  const maxNum = mockUsers.reduce((max, u) => {
    const match = u.employeeId.match(/EMP-(\d+)/);
    return match ? Math.max(max, parseInt(match[1], 10)) : max;
  }, 0);
  return `EMP-${String(maxNum + 1).padStart(3, '0')}`;
}

const defaults: FormData = {
  employeeName: '',
  employeeId: generateEmployeeId(),
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
  userGroup: 'operations',
  startDate: '',
  endDate: '',
};

// -- Step 3 types --
type ModuleAccess = {
  moduleId: string;
  accessType: 'ALL_PROJECTS' | 'SELECT_PROJECTS';
  selectedProjectIds: string[];
};

export default function UserNewPage() {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);
  const [tempPassword] = useState(() => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
    return Array.from({ length: 12 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  });

  const methods = useForm<FormData>({ resolver: zodResolver(formSchema), defaultValues: defaults });

  // Step 2 dependents
  const selectedDeptId = methods.watch('departmentId');
  const selectedZoneIds = methods.watch('zoneIds');

  const filteredPrimaryRoles = useMemo(
    () => mockRoles.filter((r) => r.departmentId === selectedDeptId),
    [selectedDeptId],
  );

  const userOptions = useMemo(
    () => mockUsers.map((u) => ({ value: u.id, label: u.name })),
    [],
  );

  // Step 3 state
  const [moduleAccess, setModuleAccess] = useState<ModuleAccess[]>([]);
  const [expandedModules, setExpandedModules] = useState<Record<string, boolean>>({});
  const [projectSearch, setProjectSearch] = useState('');

  const handleZoneToggle = (zoneId: string) => {
    const current: string[] = methods.getValues('zoneIds') ?? [];
    const next = current.includes(zoneId) ? current.filter((id) => id !== zoneId) : [...current, zoneId];
    methods.setValue('zoneIds', next, { shouldValidate: true });
  };

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

  const handleNext = useCallback(async () => {
    const fieldsByStep: Record<number, (keyof FormData)[]> = {
      0: ['employeeName', 'employeeId', 'email', 'mobile', 'employmentStatus'],
      1: ['zoneIds', 'departmentId', 'primaryRoleId', 'reportingManagerId', 'teamLeadId', 'deptAdminId', 'userGroup', 'startDate', 'endDate'],
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

  const step1Data = methods.watch();

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
            {activeStep === 0 && (
              <Box sx={{ p: 3 }}>
                <Typography variant="subtitle1" sx={{ mb: 2 }}>User Details</Typography>
                <Box display="grid" gridTemplateColumns={{ xs: '1fr', sm: '1fr 1fr' }} gap={2.5}>
                  <Field.Text name="employeeName" label="Employee Name" placeholder="Enter Employee Name" />
                  <Field.Text name="employeeId" label="Employee ID" disabled helperText="Auto-generated from backend" />
                  <Field.Text name="email" label="Email ID" />
                  <Field.Text name="mobile" label="Mobile Number" placeholder="+91 XXXXX XXXXX" />
                  <Field.Select name="employmentStatus" label="Employment Status" options={EMPLOYMENT_OPTIONS} />
                </Box>
              </Box>
            )}

            {activeStep === 1 && (
              <Box sx={{ p: 3 }}>
                <Typography variant="subtitle1" sx={{ mb: 2 }}>Organization Details</Typography>
                <Box display="grid" gridTemplateColumns={{ xs: '1fr', sm: '1fr 1fr' }} gap={2.5}>
                  {/* Zone */}
                  <Box>
                    <Typography variant="body2" sx={{ mb: 1, color: 'text.secondary' }}>Zone *</Typography>
                    <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap sx={{ mb: 1 }}>
                      {selectedZoneIds?.map((zoneId) => {
                        const zone = mockZones.find((z) => z.id === zoneId);
                        return (
                          <Chip
                            key={zoneId}
                            label={zone?.name ?? zoneId}
                            size="small"
                            onDelete={() => handleZoneToggle(zoneId)}
                          />
                        );
                      })}
                    </Stack>
                    <TextField select size="small" fullWidth value="" onChange={(e) => handleZoneToggle(e.target.value)}>
                      {mockZones.filter((z) => !selectedZoneIds?.includes(z.id)).map((z) => (
                        <MenuItem key={z.id} value={z.id}>{z.name}</MenuItem>
                      ))}
                    </TextField>
                  </Box>

                  {/* Department */}
                  <Field.Select name="departmentId" label="Department *" options={mockDepartments.map((d) => ({ value: d.id, label: d.name }))} />

                  {/* Primary Role */}
                  <Field.Select name="primaryRoleId" label="Primary Role *" options={filteredPrimaryRoles.map((r) => ({ value: r.id, label: r.name }))} />

                  {/* Secondary Role */}
                  <Field.Select name="secondaryRoleId" label="Secondary Role (optional)" options={filteredPrimaryRoles.map((r) => ({ value: r.id, label: r.name }))} />
                </Box>

                <Divider sx={{ my: 3 }} />
                <Typography variant="subtitle1" sx={{ mb: 2 }}>Reporting Hierarchy</Typography>
                <Box display="grid" gridTemplateColumns={{ xs: '1fr', sm: '1fr 1fr 1fr' }} gap={2.5}>
                  <Field.Select name="reportingManagerId" label="Reporting Manager *" options={userOptions} />
                  <Field.Select name="teamLeadId" label="Team Lead *" options={userOptions} />
                  <Field.Select name="deptAdminId" label="Department Admin *" options={userOptions} />
                </Box>

                <Divider sx={{ my: 3 }} />
                <Typography variant="subtitle1" sx={{ mb: 2 }}>User Group</Typography>
                <Box display="grid" gridTemplateColumns={{ xs: '1fr', sm: '1fr 1fr 1fr' }} gap={2.5}>
                  <Field.Select name="userGroup" label="User Group *" options={USER_GROUP_OPTIONS} />
                  <Field.Text name="startDate" label="Start Date" placeholder="DD/MM/YYYY" />
                  <Field.Text name="endDate" label="End Date" placeholder="DD/MM/YYYY" />
                </Box>
              </Box>
            )}

            {activeStep === 2 && (
              <Box sx={{ p: 3 }}>
                <Typography variant="subtitle1" sx={{ mb: 2 }}>Access Configuration</Typography>
                <Box display="grid" gridTemplateColumns={{ xs: '1fr', lg: '1fr 1fr' }} gap={3}>
                  {/* Left: Module Selection */}
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
                          checked={moduleAccess.length === mockModules.length}
                          indeterminate={moduleAccess.length > 0 && moduleAccess.length < mockModules.length}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setModuleAccess(mockModules.map((m) => ({ moduleId: m.id, accessType: 'SELECT_PROJECTS' as const, selectedProjectIds: [] })));
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
                      {mockModules.map((mod) => (
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

                  {/* Right: Module Access Cards */}
                  <Stack spacing={2}>
                    {moduleAccess.length === 0 && (
                      <Typography variant="body2" color="text.secondary" sx={{ py: 4, textAlign: 'center' }}>
                        Select modules from the left panel
                      </Typography>
                    )}
                    {moduleAccess.map((ma) => {
                      const mod = mockModules.find((m) => m.id === ma.moduleId);
                      const isExpanded = expandedModules[ma.moduleId] ?? false;
                      const isConfigured = ma.accessType === 'ALL_PROJECTS' || ma.selectedProjectIds.length > 0;

                      return (
                        <Card key={ma.moduleId} variant="outlined" sx={{ p: 2 }}>
                          <Stack direction="row" alignItems="center" justifyContent="space-between">
                            <Stack direction="row" alignItems="center" spacing={1}>
                              <IconButton size="small" onClick={() => setExpandedModules((prev) => ({ ...prev, [ma.moduleId]: !prev[ma.moduleId] }))}>
                                <Iconify icon={isExpanded ? 'solar:alt-arrow-down-bold' : 'solar:alt-arrow-right-bold'} width={16} />
                              </IconButton>
                              <Typography variant="subtitle2">{mod?.name}</Typography>
                            </Stack>
                            <Stack direction="row" spacing={0.5} alignItems="center">
                              <Chip
                                label={isConfigured ? 'Configured' : 'Not Configured'}
                                size="small"
                                color={isConfigured ? 'success' : 'default'}
                                variant="outlined"
                              />
                              <IconButton size="small" onClick={() => handleModuleToggle(ma.moduleId, false)}>
                                <Iconify icon="solar:close-circle-bold" width={18} />
                              </IconButton>
                            </Stack>
                          </Stack>

                          <Collapse in={isExpanded} sx={{ mt: 2 }}>
                            <RadioGroup
                              value={ma.accessType}
                              onChange={(e) => handleAccessTypeChange(ma.moduleId, e.target.value as 'ALL_PROJECTS' | 'SELECT_PROJECTS')}
                            >
                              <FormControlLabel value="SELECT_PROJECTS" control={<Radio size="small" />} label="Select Projects" />
                              <FormControlLabel value="ALL_PROJECTS" control={<Radio size="small" />} label="All Projects" />
                            </RadioGroup>

                            {ma.accessType === 'SELECT_PROJECTS' && (
                              <Box sx={{ mt: 1.5 }}>
                                <TextField
                                  size="small"
                                  placeholder="Search projects..."
                                  value={projectSearch}
                                  onChange={(e) => setProjectSearch(e.target.value)}
                                  fullWidth
                                  sx={{ mb: 1 }}
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
                                />
                                <Box sx={{ maxHeight: 180, overflow: 'auto', mt: 0.5 }}>
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
                                    />
                                  ))}
                                </Box>
                                {ma.selectedProjectIds.length > 0 && (
                                  <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap sx={{ mt: 1 }}>
                                    {ma.selectedProjectIds.map((pid) => {
                                      const p = mockProjects.find((pj) => pj.id === pid);
                                      return (
                                        <Chip
                                          key={pid}
                                          label={p?.name ?? pid}
                                          size="small"
                                          onDelete={() => handleProjectToggle(ma.moduleId, pid)}
                                        />
                                      );
                                    })}
                                  </Stack>
                                )}
                              </Box>
                            )}
                          </Collapse>
                        </Card>
                      );
                    })}
                  </Stack>
                </Box>
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
          <Typography variant="caption">Email: {step1Data.email}</Typography>
          <br />
          <Typography variant="caption">Temporary Password: {tempPassword}</Typography>
        </Alert>
      </Snackbar>
    </>
  );
}
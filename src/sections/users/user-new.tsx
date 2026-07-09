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
import FormGroup from '@mui/material/FormGroup';
import Alert from '@mui/material/Alert';
import Snackbar from '@mui/material/Snackbar';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import TextField from '@mui/material/TextField';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { CONFIG } from 'src/config-global';
import { Form, Field } from 'src/components/hook-form';
import { PageContainer, PageHeader } from 'src/components/page-layout';
import { PermissionTree, type PermissionSelection } from 'src/components/permission-tree';
import { mockDepartments, mockRoles, mockZones, mockProjects, mockModules, mockSubModules, mockActions, mockUsers } from 'src/services/mock-data';
import { paths } from 'src/routes/paths';

const STEPS = ['Basic Information', 'Organization & Hierarchy', 'Access Configuration'];

const STATUS_OPTIONS = [
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
];

const step1Schema = z.object({
  employeeId: z.string().min(1, 'Employee ID is required'),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Valid mobile number required').max(20),
  status: z.enum(['active', 'inactive']),
});

const step2Schema = z.object({
  departmentId: z.string().min(1, 'Department is required'),
  roleId: z.string().min(1, 'Role is required'),
  zoneIds: z.array(z.string()).min(1, 'At least one zone is required'),
  reportingManagerId: z.string().optional(),
});

const step3Schema = z.object({
  projectPermissions: z.array(z.object({
    projectId: z.string(),
    permissions: z.array(z.object({
      moduleId: z.string(),
      subModuleIds: z.array(z.string()),
      actionIds: z.array(z.string()),
    })),
  })).min(1, 'At least one project with permissions is required'),
});

type Step1Data = z.infer<typeof step1Schema>;
type Step2Data = z.infer<typeof step2Schema>;

const step1Defaults: Step1Data = { employeeId: '', firstName: '', lastName: '', email: '', phone: '', status: 'active' };
const step2Defaults: Step2Data = { departmentId: '', roleId: '', zoneIds: [], reportingManagerId: '' };

function generateEmployeeId(existing: typeof mockUsers): string {
  const maxNum = existing.reduce((max, u) => {
    const match = u.employeeId.match(/EMP-(\d+)/);
    return match ? Math.max(max, parseInt(match[1], 10)) : max;
  }, 0);
  return `EMP-${String(maxNum + 1).padStart(3, '0')}`;
}

export default function UserNewPage() {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);
  const [tempPassword] = useState(() => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
    return Array.from({ length: 12 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  });

  // Step 1 form
  const step1Methods = useForm<Step1Data>({ resolver: zodResolver(step1Schema), defaultValues: { ...step1Defaults, employeeId: generateEmployeeId(mockUsers) } });
  // Step 2 form
  const step2Methods = useForm<Step2Data>({ resolver: zodResolver(step2Schema), defaultValues: step2Defaults });

  // Step 3 state
  const [projectPermissions, setProjectPermissions] = useState<{ projectId: string; permissions: PermissionSelection[] }[]>([]);

  const selectedDeptId = step2Methods.watch('departmentId');
  const selectedRoleId = step2Methods.watch('roleId');
  const selectedZoneIds = step2Methods.watch('zoneIds');

  const filteredRoles = useMemo(
    () => mockRoles.filter((r) => r.departmentId === selectedDeptId),
    [selectedDeptId],
  );

  const selectedRole = useMemo(
    () => mockRoles.find((r) => r.id === selectedRoleId),
    [selectedRoleId],
  );

  // Reporting manager: users in same dept with level one above
  const reportingManagerOptions = useMemo(() => {
    if (!selectedRole) return [];
    const roleLevelNum = parseInt(selectedRole.level.replace('L', ''), 10);
    if (roleLevelNum <= 1) return [];
    const targetLevel = `L${roleLevelNum - 1}`;
    return mockUsers
      .filter((u) => u.level === targetLevel && u.departmentId === selectedDeptId)
      .map((u) => ({ value: u.id, label: u.name }));
  }, [selectedRole, selectedDeptId]);

  const zoneOptions = useMemo(
    () => mockZones,
    [],
  );

  const handleZoneToggle = (zoneId: string) => {
    const current = step2Methods.getValues('zoneIds') ?? [];
    const next = current.includes(zoneId) ? current.filter((id) => id !== zoneId) : [...current, zoneId];
    step2Methods.setValue('zoneIds', next);
  };

  const handleCopyPermissions = (fromProjectId: string, toProjectId: string) => {
    const source = projectPermissions.find((p) => p.projectId === fromProjectId);
    if (!source) return;
    setProjectPermissions((prev) => {
      const next = prev.filter((p) => p.projectId !== toProjectId);
      next.push({ projectId: toProjectId, permissions: source.permissions.map((p) => ({ ...p, actionIds: [...p.actionIds], subModuleIds: [...p.subModuleIds] })) });
      return next;
    });
  };

  const handleProjectToggle = (projectId: string, checked: boolean) => {
    if (checked) {
      setProjectPermissions((prev) => [...prev, { projectId, permissions: [] }]);
    } else {
      setProjectPermissions((prev) => prev.filter((p) => p.projectId !== projectId));
    }
  };

  const handlePermissionChange = (projectId: string, permissions: PermissionSelection[]) => {
    setProjectPermissions((prev) => prev.map((p) => p.projectId === projectId ? { ...p, permissions } : p));
  };

  const validateStep2 = useCallback(async () => {
    const valid = await step2Methods.trigger();
    return valid;
  }, [step2Methods]);

  const handleNext = useCallback(async () => {
    if (activeStep === 0) {
      const valid = await step1Methods.trigger();
      if (!valid) return;
    }
    if (activeStep === 1) {
      const valid = await validateStep2();
      if (!valid) return;
    }
    if (activeStep === STEPS.length - 1) {
      const hasPermissions = projectPermissions.some((p) => p.permissions.length > 0 && p.permissions.some((perm) => perm.actionIds.length > 0));
      if (!hasPermissions) return;
      setShowSuccess(true);
      setTimeout(() => navigate(paths.dashboard.userManagement), 2000);
      return;
    }
    setActiveStep((prev) => prev + 1);
  }, [activeStep, step1Methods, validateStep2, projectPermissions, navigate]);

  const handleBack = useCallback(() => {
    setActiveStep((prev) => prev - 1);
  }, []);

  const step1Data = step1Methods.watch();
  const step2Data = step2Methods.watch();

  const renderStep = () => {
    switch (activeStep) {
      case 0:
        return (
          <Box sx={{ p: 3 }}>
            <Typography variant="subtitle1" sx={{ mb: 2 }}>User Details</Typography>
            <Box display="grid" gridTemplateColumns={{ xs: '1fr', sm: '1fr 1fr' }} gap={2.5}>
              <Field.Text name="employeeId" label="Employee ID" disabled helperText="Auto-generated" />
              <Field.Text name="firstName" label="First Name" />
              <Field.Text name="lastName" label="Last Name" />
              <Field.Text name="email" label="Email" />
              <Field.Text name="phone" label="Mobile Number" />
              <Field.Select name="status" label="User Status" options={STATUS_OPTIONS} />
            </Box>
          </Box>
        );
      case 1:
        return (
          <Box sx={{ p: 3 }}>
            <Typography variant="subtitle1" sx={{ mb: 2 }}>Organization Mapping</Typography>
            <Box display="grid" gridTemplateColumns={{ xs: '1fr', sm: '1fr 1fr' }} gap={2.5}>
              <Field.Select name="departmentId" label="Department" options={mockDepartments.map((d) => ({ value: d.id, label: d.name }))} />
              <Field.Select name="roleId" label="Role" options={filteredRoles.map((r) => ({ value: r.id, label: r.name }))} />
              {selectedRole && (
                <TextField label="Hierarchy Level" value={selectedRole.level} disabled helperText="Auto-populated from role" fullWidth />
              )}
              {reportingManagerOptions.length > 0 && (
                <Field.Select name="reportingManagerId" label="Reporting Manager" options={reportingManagerOptions} />
              )}
              <Box>
                <Typography variant="body2" sx={{ mb: 1, color: 'text.secondary' }}>Zone Access *</Typography>
                <FormGroup row>
                  {zoneOptions.map((zone) => (
                    <FormControlLabel
                      key={zone.id}
                      control={<Checkbox size="small" checked={selectedZoneIds?.includes(zone.id) ?? false} onChange={() => handleZoneToggle(zone.id)} />}
                      label={zone.name}
                    />
                  ))}
                </FormGroup>
              </Box>
            </Box>
          </Box>
        );
      case 2:
        return (
          <Box sx={{ p: 3 }}>
            <Typography variant="subtitle1" sx={{ mb: 2 }}>Project & Permission Mapping</Typography>
            <Box display="grid" gridTemplateColumns={{ xs: '1fr', lg: '1fr 1fr' }} gap={3}>
              {/* Available Projects */}
              <Card variant="outlined" sx={{ p: 2 }}>
                <Typography variant="subtitle2" sx={{ mb: 1.5 }}>Available Projects</Typography>
                <Stack spacing={0.5}>
                  {mockProjects.map((project) => (
                    <FormControlLabel
                      key={project.id}
                      control={<Checkbox size="small" checked={projectPermissions.some((p) => p.projectId === project.id)} onChange={(e) => handleProjectToggle(project.id, e.target.checked)} />}
                      label={`${project.name} (${project.code})`}
                    />
                  ))}
                </Stack>
              </Card>

              {/* Selected Project Permissions */}
              <Stack spacing={2}>
                {projectPermissions.length === 0 && (
                  <Typography variant="body2" color="text.secondary" sx={{ py: 4, textAlign: 'center' }}>
                    Select a project to configure permissions
                  </Typography>
                )}
                {projectPermissions.map((pp) => {
                  const project = mockProjects.find((p) => p.id === pp.projectId);
                  return (
                    <Card key={pp.projectId} variant="outlined" sx={{ p: 2 }}>
                      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1.5 }}>
                        <Typography variant="subtitle2">{project?.name}</Typography>
                        <Stack direction="row" spacing={0.5}>
                          {projectPermissions
                            .filter((p) => p.projectId !== pp.projectId && p.permissions.length > 0)
                            .map((p) => {
                              const srcProject = mockProjects.find((pj) => pj.id === p.projectId);
                              return (
                                <Chip
                                  key={p.projectId}
                                  label={`Copy from ${srcProject?.name ?? p.projectId}`}
                                  size="small"
                                  variant="outlined"
                                  onClick={() => handleCopyPermissions(p.projectId, pp.projectId)}
                                  sx={{ cursor: 'pointer' }}
                                />
                              );
                            })}
                        </Stack>
                      </Stack>
                      <Divider sx={{ mb: 1.5 }} />
                      <PermissionTree
                        modules={mockModules}
                        subModules={mockSubModules}
                        actions={mockActions}
                        selection={pp.permissions}
                        onChange={(perm) => handlePermissionChange(pp.projectId, perm)}
                      />
                    </Card>
                  );
                })}
              </Stack>
            </Box>
          </Box>
        );
      default:
        return null;
    }
  };

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

          <Form methods={activeStep === 0 ? step1Methods : step2Methods} onSubmit={() => {}}>
            {renderStep()}
          </Form>

          <Stack direction="row" justifyContent="space-between" sx={{ p: 3, borderTop: '1px solid', borderColor: 'divider' }}>
            <Button color="inherit" onClick={() => navigate(paths.dashboard.userManagement)}>
              Cancel
            </Button>
            <Stack direction="row" spacing={1}>
              <Button disabled={activeStep === 0} onClick={handleBack} color="inherit">
                Back
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
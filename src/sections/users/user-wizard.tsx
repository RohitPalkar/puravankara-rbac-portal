import type { EmploymentStatus } from 'src/services/types/enums';
import type {
  ProjectMappingData,
  UserPermissionProfile,
  RolePermissionProfile,
  CreateUserFullRequest,
  CreatePermissionProfileEntry,
} from 'src/services/types/user';

import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import { useRef, useMemo, useState, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Step from '@mui/material/Step';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Stepper from '@mui/material/Stepper';
import Snackbar from '@mui/material/Snackbar';
import Skeleton from '@mui/material/Skeleton';
import StepLabel from '@mui/material/StepLabel';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';

import { paths } from 'src/routes/paths';

import { CONFIG } from 'src/config-global';
import { useUserById, useCreateUserFull, useUpdateUserFull } from 'src/services/hooks/use-users';

import { Iconify } from 'src/components/iconify';
import { PageHeader, PageContainer } from 'src/components/page-layout';

import ProjectMappingStep from './components/project-mapping-step';
import BasicInformationStep from './components/basic-information-step';
import OrganisationReviewStep from './components/organisation-review-step';

import type { ProjectMappingStepHandle } from './components/project-mapping-step';
import type { BasicInfoData, BasicInformationStepHandle } from './components/basic-information-step';
import type { OrganisationData, OrganisationReviewStepHandle } from './components/organisation-review-step';

const STEPS = ['Basic Information', 'Project Mapping', 'Organisation Details'];

interface EnrichedUser {
  empId: string;
  name: string;
  email: string;
  departmentId: number | null;
  departmentName?: string;
  zoneId?: number | null;
  employmentStatus: EmploymentStatus;
  isActive: boolean;
  profiles?: {
    profileType: string;
    departmentId: number | null;
    roleId: number | null;
    buddyUserId: string | null;
    modules?: {
      moduleId: number;
      subModules?: {
        subModuleId: number;
        inheritFutureProjects: boolean;
        projects?: { projectId: number }[];
      }[];
    }[];
  }[];
  userRoles?: { roleId: number; roleName?: string; departmentId: number }[];
  userZones?: { zoneId: number; zoneName?: string }[];
  reportingManager?: { empId: string; name: string } | null;
  isDepartmentAdmin?: boolean;
}

interface UserWizardProps {
  mode: 'create' | 'edit';
  userId?: string;
}

function profileToRolePermissionProfile(profile: any): RolePermissionProfile {
  const modules = profile?.modules ?? [];
  return modules.map((mod: any) => ({
    moduleId: mod.moduleId,
    subModules: (mod.subModules ?? []).map((sm: any) => ({
      subModuleId: sm.subModuleId,
      enabled: true,
      accessType: sm.inheritFutureProjects ? ('all' as const) : ('selected' as const),
      projectIds: ((sm.projects ?? []) as { projectId: number }[]).map((p) => p.projectId),
    })),
  }));
}

function userToBasicData(user: EnrichedUser): BasicInfoData {
  return {
    employeeId: user.empId,
    employeeName: user.name,
    email: user.email,
    mobile: '',
    isActive: user.isActive,
  };
}

function userToProjectData(user: EnrichedUser): ProjectMappingData {
  const profiles = (user.profiles ?? []) as any[];
  const primary = profiles.find((p) => p.profileType === 'PRIMARY');
  const secondary = profiles.find((p) => p.profileType === 'SECONDARY');
  const buddy = profiles.find((p) => p.profileType === 'BUDDY_RM');
  const userRoles = user.userRoles ?? [];

  const primaryRoleId = primary?.roleId ?? userRoles[0]?.roleId ?? null;
  const secondaryRoleId = secondary?.roleId ?? userRoles[1]?.roleId ?? null;
  const departmentId = user.departmentId ?? null;

  return {
    zoneId: user.zoneId ?? user.userZones?.[0]?.zoneId ?? null,
    departmentId,
    primaryRoleId,
    isDepartmentAdmin: !!user.isDepartmentAdmin,
    secondaryRoleId,
    assignBuddyRm: !!buddy,
    buddyRmUserId: buddy?.buddyUserId ?? undefined,
    profiles: {
      primary: { roleId: primaryRoleId ?? undefined, departmentId: departmentId ?? undefined, permissions: profileToRolePermissionProfile(primary) },
      secondary: secondaryRoleId
        ? { roleId: secondaryRoleId, departmentId: departmentId ?? undefined, permissions: profileToRolePermissionProfile(secondary) }
        : undefined,
      buddyRm: buddy
        ? { buddyUserId: buddy.buddyUserId ?? undefined, permissions: profileToRolePermissionProfile(buddy) }
        : undefined,
    },
  };
}

function userToOrganisationData(user: EnrichedUser): OrganisationData {
  return {
    employmentStatus: 'Active',
    reportingManagerId: user.reportingManager?.empId ?? '',
    effectiveFrom: new Date().toISOString().slice(0, 10),
  };
}

function toBackendProfiles(profiles: ProjectMappingData['profiles']): CreatePermissionProfileEntry[] | undefined {
  const result: CreatePermissionProfileEntry[] = [];
  const addProfile = (
    profile: UserPermissionProfile,
    profileType: string,
  ) => {
    const enabledModules = profile.permissions
      .map((m) => {
        const enabledSubs = m.subModules
          .filter((sm) => sm.enabled)
          .map((sm) => ({
            subModuleId: sm.subModuleId,
            inheritFutureProjects: sm.accessType === 'all',
            projects: sm.accessType === 'selected'
              ? sm.projectIds.map((pid) => ({ projectId: pid }))
              : [],
          }));
        if (enabledSubs.length === 0) return null;
        return { moduleId: m.moduleId, subModules: enabledSubs };
      })
      .filter((x): x is NonNullable<typeof x> => x != null);
    if (enabledModules.length === 0) return;

    const entry: CreatePermissionProfileEntry = {
      profileType,
      roleId: profile.roleId,
      departmentId: profile.departmentId,
      modules: enabledModules,
    };
    if (profileType === 'BUDDY_RM') {
      entry.buddyUserId = profile.buddyUserId;
    }
    result.push(entry);
  };

  addProfile(profiles.primary, 'PRIMARY');
  if (profiles.secondary) addProfile(profiles.secondary, 'SECONDARY');
  if (profiles.buddyRm) addProfile(profiles.buddyRm, 'BUDDY_RM');

  return result.length > 0 ? result : undefined;
}

function LoadingSkeleton() {
  return (
    <PageContainer>
      <PageHeader title="Loading..." />
      <Card sx={{ p: 4 }}>
        <Skeleton variant="rectangular" height={52} sx={{ borderRadius: 1 }} />
        <Skeleton variant="rectangular" height={52} sx={{ borderRadius: 1, mt: 2 }} />
        <Skeleton variant="rectangular" height={52} sx={{ borderRadius: 1, mt: 2 }} />
        <Skeleton variant="rectangular" height={120} sx={{ borderRadius: 1, mt: 2 }} />
      </Card>
    </PageContainer>
  );
}

export default function UserWizard({ mode, userId }: UserWizardProps) {
  const isEdit = mode === 'edit';
  const navigate = useNavigate();

  const { data: rawUser, isLoading } = useUserById(userId ?? '');

  const [activeStep, setActiveStep] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [generatedPassword, setGeneratedPassword] = useState<string | null>(null);

  const step1Ref = useRef<BasicInformationStepHandle>(null);
  const step2Ref = useRef<ProjectMappingStepHandle>(null);
  const step3Ref = useRef<OrganisationReviewStepHandle>(null);

  const [savedStep1Data, setSavedStep1Data] = useState<BasicInfoData | undefined>();
  const [savedStep2Data, setSavedStep2Data] = useState<ProjectMappingData | undefined>();

  const { mutateAsync: createUserFull } = useCreateUserFull();
  const { mutateAsync: updateUserFull } = useUpdateUserFull();

  const editUser = rawUser as EnrichedUser | undefined;

  const editInitialStep1 = useMemo(
    () => (isEdit && editUser ? userToBasicData(editUser) : undefined),
    [isEdit, editUser],
  );
  const editInitialStep2 = useMemo(
    () => (isEdit && editUser ? userToProjectData(editUser) : undefined),
    [isEdit, editUser],
  );
  const editInitialStep3 = useMemo(
    () => (isEdit && editUser ? userToOrganisationData(editUser) : undefined),
    [isEdit, editUser],
  );

  const currentStep1 = savedStep1Data ?? editInitialStep1;
  const currentStep2 = savedStep2Data ?? editInitialStep2;

  const handleNext = useCallback(() => {
    setSubmitError('');

    if (activeStep === 0) {
      const step = step1Ref.current;
      if (!step?.validate()) return;
      setSavedStep1Data(step.getData());
    }

    if (activeStep === 1) {
      const step = step2Ref.current;
      if (!step?.validate()) return;
      setSavedStep2Data(step.getData());
    }

    if (activeStep === STEPS.length - 1) {
      return;
    }

    setActiveStep((prev) => prev + 1);
  }, [activeStep]);

  const handleBack = useCallback(() => {
    setActiveStep((prev) => prev - 1);
  }, []);

  const handleSubmit = useCallback(async () => {
    setSubmitError('');

    const basicData = currentStep1;
    const projectData = currentStep2;
    if (!basicData || !projectData) return;

    const step3 = step3Ref.current;
    if (!step3?.validate()) return;

    const orgData = step3!.getData();

    if (!projectData.zoneId) {
      setSubmitError('Zone is required.');
      return;
    }
    if (!projectData.departmentId) {
      setSubmitError('Department is required.');
      return;
    }
    if (!projectData.primaryRoleId) {
      setSubmitError('Primary Role is required.');
      return;
    }

    setSubmitting(true);

    try {
      const reportingEntries: { levelRank: number; managerId: string }[] = [
        { levelRank: 1, managerId: orgData.reportingManagerId },
      ];
      if (orgData.teamLeadId) {
        reportingEntries.push({ levelRank: 2, managerId: orgData.teamLeadId });
      }

      const profiles = toBackendProfiles(projectData.profiles);

      const payload: CreateUserFullRequest = {
        basic: {
          name: basicData.employeeName,
          email: basicData.email,
          departmentId: projectData.departmentId,
          employmentStatus: isEdit
            ? editUser?.employmentStatus ?? ('PERMANENT' as EmploymentStatus)
            : ('PERMANENT' as EmploymentStatus),
          isActive: basicData.isActive,
        },
        organization: {
          zoneId: projectData.zoneId,
          primaryRole: projectData.primaryRoleId,
          isDepartmentAdmin: projectData.isDepartmentAdmin,
          secondaryRoles: projectData.secondaryRoleId
            ? [{ roleId: projectData.secondaryRoleId, departmentId: projectData.departmentId }]
            : undefined,
          reporting: reportingEntries,
        },
        profiles,
      };

      if (isEdit && userId) {
        await updateUserFull({ id: userId, data: payload });
        setShowSuccess(true);
        setTimeout(() => navigate(paths.dashboard.userManagement), 1200);
      } else {
        const result = await createUserFull(payload);
        setGeneratedPassword(result.generatedPassword);
        setShowSuccess(true);
      }
    } catch (err: any) {
      setSubmitError(err?.message ?? `Failed to ${isEdit ? 'update' : 'create'} user. Please try again.`);
    } finally {
      setSubmitting(false);
    }
  }, [currentStep1, currentStep2, isEdit, editUser, userId, createUserFull, updateUserFull, navigate]);

  const handleCreateClick = useCallback(() => {
    if (activeStep < STEPS.length - 1) {
      handleNext();
    } else {
      handleSubmit();
    }
  }, [activeStep, handleNext, handleSubmit]);

  if (isEdit && isLoading) {
    return <LoadingSkeleton />;
  }

  if (isEdit && !editUser) {
    return (
      <PageContainer>
        <PageHeader title="User Not Found" />
        <Card sx={{ p: 4 }}>
          <Typography>User with ID &quot;{userId}&quot; not found.</Typography>
          <Button onClick={() => navigate(paths.dashboard.userManagement)} sx={{ mt: 2 }}>
            Back to Users
          </Button>
        </Card>
      </PageContainer>
    );
  }

  return (
    <>
      <Helmet>
        <title>{isEdit ? `Edit User - ${editUser?.name}` : 'Create User'} - {CONFIG.appName}</title>
      </Helmet>
      <PageContainer>
        <PageHeader
          title={isEdit ? 'Edit User' : 'Create User'}
          description={isEdit ? editUser?.empId : 'Set up a new user account'}
        />

        <Card sx={{ overflow: 'hidden' }}>
          <Stepper activeStep={activeStep} sx={{ px: 4, pt: 4, pb: 2 }}>
            {STEPS.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          {submitError && (
            <Alert severity="error" sx={{ mx: 3, mb: 2 }} onClose={() => setSubmitError('')}>
              {submitError}
            </Alert>
          )}

          {activeStep === 0 && (
            <BasicInformationStep ref={step1Ref} initialData={currentStep1} mode={isEdit ? 'edit' : 'create'} />
          )}

          {activeStep === 1 && (
            <ProjectMappingStep ref={step2Ref} initialData={currentStep2} />
          )}

          {activeStep === 2 && (
            <OrganisationReviewStep
              ref={step3Ref}
              zoneId={currentStep2?.zoneId}
              departmentId={currentStep2?.departmentId}
              initialData={editInitialStep3}
            />
          )}

          <Stack direction="row" justifyContent="space-between" sx={{ p: 3, borderTop: '1px solid', borderColor: 'divider' }}>
            <Button color="inherit" onClick={() => navigate(paths.dashboard.userManagement)}>
              Cancel
            </Button>
            <Stack direction="row" spacing={1}>
              {activeStep > 0 && (
                <Button onClick={handleBack} color="inherit">
                  Previous
                </Button>
              )}
              <Button variant="contained" onClick={handleCreateClick} disabled={submitting}>
                {submitting
                  ? isEdit ? 'Saving...' : 'Creating...'
                  : activeStep === STEPS.length - 1
                    ? isEdit ? 'Save Changes' : 'Create User'
                    : 'Next'}
              </Button>
            </Stack>
          </Stack>
        </Card>
      </PageContainer>

      <Snackbar open={showSuccess} autoHideDuration={3000} anchorOrigin={{ vertical: 'top', horizontal: 'right' }}>
        <Alert severity="success" variant="filled" sx={{ width: 1 }}>
          <Typography variant="body2" fontWeight={600}>
            {isEdit ? 'User Updated Successfully' : 'User Created Successfully'}
          </Typography>
        </Alert>
      </Snackbar>

      <Dialog open={!!generatedPassword} onClose={() => { setGeneratedPassword(null); navigate(paths.dashboard.userManagement); }} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Stack direction="row" alignItems="center" spacing={1}>
            <Iconify icon="solar:key-bold" width={24} color="primary.main" />
            <Typography variant="h6">User Created Successfully</Typography>
          </Stack>
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2}>
            <DialogContentText>
              The user account has been created. Share the password below with the user. They will need it to sign in.
            </DialogContentText>
            <Box
              sx={{
                bgcolor: 'grey.100',
                p: 2,
                borderRadius: 1,
                border: '1px solid',
                borderColor: 'divider',
              }}
            >
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5, fontWeight: 600 }}>
                Generated Password
              </Typography>
              <Stack direction="row" alignItems="center" spacing={1}>
                <Typography variant="h5" sx={{ fontFamily: 'monospace', fontWeight: 700, letterSpacing: 1 }}>{generatedPassword}</Typography>
                <IconButton
                  size="small"
                  onClick={() => { navigator.clipboard.writeText(generatedPassword!); }}
                  sx={{ color: 'primary.main' }}
                >
                  <Iconify icon="solar:copy-bold" width={18} />
                </IconButton>
              </Stack>
            </Box>
            <Typography variant="caption" color="warning.main" sx={{ fontWeight: 500 }}>
              This password will not be shown again. Copy it now.
            </Typography>
            <Button variant="contained" onClick={() => { setGeneratedPassword(null); navigate(paths.dashboard.userManagement); }} sx={{ alignSelf: 'flex-end' }}>
              Done
            </Button>
          </Stack>
        </DialogContent>
      </Dialog>
    </>
  );
}

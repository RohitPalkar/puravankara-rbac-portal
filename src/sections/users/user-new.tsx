import type { EmploymentStatus } from 'src/services/types/enums';
import type { ProjectMappingData } from 'src/services/types/user';

import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import { useRef, useState, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Step from '@mui/material/Step';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Stepper from '@mui/material/Stepper';
import Snackbar from '@mui/material/Snackbar';
import StepLabel from '@mui/material/StepLabel';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';

import { paths } from 'src/routes/paths';

import { CONFIG } from 'src/config-global';
import { useCreateUserFull } from 'src/services/hooks/use-users';

import { Iconify } from 'src/components/iconify';
import { PageHeader, PageContainer } from 'src/components/page-layout';

import ProjectMappingStep from './components/project-mapping-step';
import BasicInformationStep from './components/basic-information-step';
import OrganisationReviewStep from './components/organisation-review-step';

import type { ProjectMappingStepHandle } from './components/project-mapping-step';
import type { OrganisationReviewStepHandle } from './components/organisation-review-step';
import type { BasicInfoData, BasicInformationStepHandle } from './components/basic-information-step';

const STEPS = ['Basic Information', 'Project Mapping', 'Organisation & Review'];

export default function UserNewPage() {
  const navigate = useNavigate();
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

  const handleNavigateStep = useCallback((step: number) => {
    setActiveStep(step);
  }, []);

  const handleSubmit = useCallback(async () => {
    setSubmitError('');

    const step1 = step1Ref.current;
    const step2 = step2Ref.current;
    const step3 = step3Ref.current;

    if (!step1?.validate() || !step2?.validate() || !step3?.validate()) {
      return;
    }

    const basicData = step1!.getData();
    const projectData = step2!.getData();
    const orgData = step3!.getData();

    setSubmitting(true);

    try {
      const reportingEntries: { levelRank: number; managerId: string }[] = [
        { levelRank: 1, managerId: orgData.reportingManagerId },
      ];
      if (orgData.teamLeadId) {
        reportingEntries.push({ levelRank: 2, managerId: orgData.teamLeadId });
      }

      const payload = {
        basic: {
          name: basicData.employeeName,
          email: basicData.email,
          departmentId: projectData.departmentId,
          employmentStatus: orgData.employmentStatus as unknown as EmploymentStatus,
          isActive: basicData.isActive,
        },
        organization: {
          zones: projectData.zoneIds,
          primaryRole: projectData.primaryRoleId,
          secondaryRoles: projectData.secondaryRoleId ? [projectData.secondaryRoleId] : undefined,
          reporting: reportingEntries,
        },
      };

      const result = await createUserFull(payload);
      setGeneratedPassword(result.generatedPassword);
      setShowSuccess(true);
    } catch (err: any) {
      setSubmitError(err?.message ?? 'Failed to create user. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }, [createUserFull]);

  const handleCreateClick = useCallback(() => {
    if (activeStep < STEPS.length - 1) {
      handleNext();
    } else {
      handleSubmit();
    }
  }, [activeStep, handleNext, handleSubmit]);

  return (
    <>
      <Helmet><title>Create User - {CONFIG.appName}</title></Helmet>
      <PageContainer>
        <PageHeader title="Create User" description="Set up a new user account" />

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
            <BasicInformationStep ref={step1Ref} />
          )}

          {activeStep === 1 && (
            <ProjectMappingStep ref={step2Ref} />
          )}

          {activeStep === 2 && (
            <OrganisationReviewStep
              ref={step3Ref}
              step1Data={savedStep1Data}
              step2Data={savedStep2Data}
              onNavigateStep={handleNavigateStep}
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
                {submitting ? 'Creating...' : activeStep === STEPS.length - 1 ? 'Create User' : 'Next'}
              </Button>
            </Stack>
          </Stack>
        </Card>
      </PageContainer>

      <Snackbar open={showSuccess} autoHideDuration={3000} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
        <Alert severity="success" variant="filled" sx={{ width: 1 }}>
          <Typography variant="body2" fontWeight={600}>User Created Successfully</Typography>
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

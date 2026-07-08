import { useState, useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Card from '@mui/material/Card';
import Typography from '@mui/material/Typography';
import Checkbox from '@mui/material/Checkbox';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormGroup from '@mui/material/FormGroup';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { CONFIG } from 'src/config-global';
import { Form, Field } from 'src/components/hook-form';
import { PageContainer, PageHeader } from 'src/components/page-layout';
import { mockDepartments, mockRoles, mockProjects } from 'src/services/mock-data';
import { paths } from 'src/routes/paths';

const STEPS = ['Basic Info', 'Project Access', 'Review'];

const DEPT_OPTIONS = mockDepartments.map((d) => ({ value: d.id, label: d.name }));
const ROLE_OPTIONS = mockRoles.map((r) => ({ value: r.id, label: r.name }));

const basicSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email'),
  phone: z.string().min(1, 'Phone is required'),
  departmentId: z.string().min(1, 'Department is required'),
  roleId: z.string().min(1, 'Role is required'),
});

type BasicForm = z.infer<typeof basicSchema>;
const basicDefaults: BasicForm = { name: '', email: '', phone: '', departmentId: '', roleId: '' };

export default function UserNewPage() {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [selectedProjects, setSelectedProjects] = useState<string[]>([]);

  const methods = useForm<BasicForm>({ resolver: zodResolver(basicSchema), defaultValues: basicDefaults });

  const handleToggleProject = (projectId: string) => {
    setSelectedProjects((prev) =>
      prev.includes(projectId) ? prev.filter((id) => id !== projectId) : [...prev, projectId]
    );
  };

  const handleNext = useCallback(async () => {
    if (activeStep === 0) {
      const valid = await methods.trigger();
      if (!valid) return;
    }
    if (activeStep === STEPS.length - 1) {
      navigate(paths.dashboard.userManagement);
      return;
    }
    setActiveStep((prev) => prev + 1);
  }, [activeStep, methods, navigate]);

  const handleBack = useCallback(() => {
    setActiveStep((prev) => prev - 1);
  }, []);

  const renderStep = () => {
    switch (activeStep) {
      case 0:
        return (
          <Stack spacing={2.5} sx={{ p: 3 }}>
            <Field.Text name="name" label="Full Name" />
            <Field.Text name="email" label="Email" />
            <Field.Text name="phone" label="Phone" />
            <Field.Select name="departmentId" label="Department" options={DEPT_OPTIONS} />
            <Field.Select name="roleId" label="Role" options={ROLE_OPTIONS} />
          </Stack>
        );
      case 1:
        return (
          <Stack spacing={2} sx={{ p: 3 }}>
            <Typography variant="subtitle1">Assign Projects</Typography>
            <FormGroup>
              {mockProjects.map((project) => (
                <FormControlLabel
                  key={project.id}
                  control={
                    <Checkbox
                      checked={selectedProjects.includes(project.id)}
                      onChange={() => handleToggleProject(project.id)}
                    />
                  }
                  label={`${project.name} (${project.code})`}
                />
              ))}
            </FormGroup>
          </Stack>
        );
      case 2:
        return (
          <Stack spacing={2} sx={{ p: 3 }}>
            <Typography variant="subtitle1">Review User Details</Typography>
            <Stack spacing={1}>
              <Typography variant="body2"><strong>Name:</strong> {methods.watch('name')}</Typography>
              <Typography variant="body2"><strong>Email:</strong> {methods.watch('email')}</Typography>
              <Typography variant="body2"><strong>Phone:</strong> {methods.watch('phone')}</Typography>
              <Typography variant="body2"><strong>Department:</strong> {mockDepartments.find((d) => d.id === methods.watch('departmentId'))?.name}</Typography>
              <Typography variant="body2"><strong>Role:</strong> {mockRoles.find((r) => r.id === methods.watch('roleId'))?.name}</Typography>
              <Typography variant="body2"><strong>Projects:</strong> {selectedProjects.length ? mockProjects.filter((p) => selectedProjects.includes(p.id)).map((p) => p.name).join(', ') : 'None'}</Typography>
            </Stack>
          </Stack>
        );
      default:
        return null;
    }
  };

  return (
    <>
      <Helmet><title>New User - {CONFIG.appName}</title></Helmet>
      <PageContainer>
        <PageHeader title="Create User" description="Add a new user to the system" />
        <Card sx={{ overflow: 'hidden' }}>
          <Stepper activeStep={activeStep} sx={{ px: 4, pt: 4, pb: 2 }}>
            {STEPS.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
          <Form methods={methods} onSubmit={() => {}}>
            {renderStep()}
          </Form>
          <Stack direction="row" justifyContent="space-between" sx={{ p: 3, borderTop: '1px solid', borderColor: 'divider' }}>
            <Button disabled={activeStep === 0} onClick={handleBack} color="inherit">
              Back
            </Button>
            <Button variant="contained" onClick={handleNext}>
              {activeStep === STEPS.length - 1 ? 'Create User' : 'Next'}
            </Button>
          </Stack>
        </Card>
      </PageContainer>
    </>
  );
}

import { z as zod } from 'zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import { zodResolver } from '@hookform/resolvers/zod';

import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import CardContent from '@mui/material/CardContent';

import { CONFIG } from 'src/config-global';
import { useChangePassword } from 'src/services/hooks/use-auth';

import { Iconify } from 'src/components/iconify';
import { Form, Field } from 'src/components/hook-form';
import { PageHeader, PageContainer } from 'src/components/page-layout';

const ChangePasswordSchema = zod.object({
  currentPassword: zod.string().min(1, 'Current password is required'),
  newPassword: zod.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: zod.string().min(8, 'Password must be at least 8 characters'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

type ChangePasswordValues = zod.infer<typeof ChangePasswordSchema>;

const defaultValues: ChangePasswordValues = {
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
};

export default function ChangePasswordPage() {
  const navigate = useNavigate();
  const { mutateAsync: changePassword, isPending } = useChangePassword();
  const [errorMsg, setErrorMsg] = useState('');

  const methods = useForm<ChangePasswordValues>({
    resolver: zodResolver(ChangePasswordSchema),
    defaultValues,
  });

  const {
    handleSubmit,
    reset,
  } = methods;

  const onSubmit = handleSubmit(async (data) => {
    setErrorMsg('');
    try {
      await changePassword({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });
      reset();
      navigate('/dashboard/settings');
    } catch (error: any) {
      setErrorMsg(error?.response?.data?.message ?? error?.message ?? 'Failed to change password');
    }
  });

  return (
    <>
      <Helmet><title>Change Password - {CONFIG.appName}</title></Helmet>
      <PageContainer>
        <PageHeader title="Change Password" description="Update your account password" />

        <Card sx={{ maxWidth: 560 }}>
          <CardContent sx={{ p: 4 }}>
            <Form methods={methods} onSubmit={onSubmit}>
              <Stack spacing={3}>
                {errorMsg && (
                  <Alert severity="error" icon={<Iconify icon="solar:shield-warning-bold" />}>
                    {errorMsg}
                  </Alert>
                )}

                <Field.Text
                  name="currentPassword"
                  label="Current Password"
                  type="password"
                  InputLabelProps={{ shrink: true }}
                />

                <Field.Text
                  name="newPassword"
                  label="New Password"
                  type="password"
                  helperText="Minimum 8 characters"
                  InputLabelProps={{ shrink: true }}
                />

                <Field.Text
                  name="confirmPassword"
                  label="Confirm New Password"
                  type="password"
                  InputLabelProps={{ shrink: true }}
                />

                <Stack direction="row" spacing={2}>
                  <Button
                    type="submit"
                    variant="contained"
                    startIcon={<Iconify icon="solar:lock-keyhole-bold" />}
                    disabled={isPending}
                  >
                    {isPending ? 'Updating...' : 'Update Password'}
                  </Button>
                  <Button variant="outlined" color="inherit" onClick={() => navigate('/dashboard/settings')}>
                    Cancel
                  </Button>
                </Stack>

                <Typography variant="caption" color="text.secondary">
                  You will be asked to sign in again on your next session with the new password.
                </Typography>
              </Stack>
            </Form>
          </CardContent>
        </Card>
      </PageContainer>
    </>
  );
}

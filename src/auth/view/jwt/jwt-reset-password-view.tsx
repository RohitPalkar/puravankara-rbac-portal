import { z as zod } from 'zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import LoadingButton from '@mui/lab/LoadingButton';
import InputAdornment from '@mui/material/InputAdornment';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { useBoolean } from 'src/hooks/use-boolean';

import { useResetPassword } from 'src/services/hooks';

import { Iconify } from 'src/components/iconify';
import { Form, Field } from 'src/components/hook-form';

import { FormHead } from '../../components/form-head';

// ----------------------------------------------------------------------

export type ResetPasswordSchemaType = zod.infer<typeof ResetPasswordSchema>;

export const ResetPasswordSchema = zod.object({
  password: zod
    .string()
    .min(1, { message: 'Password is required!' })
    .min(6, { message: 'Password must be at least 6 characters!' }),
  confirmPassword: zod
    .string()
    .min(1, { message: 'Confirm your password!' }),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match!',
  path: ['confirmPassword'],
});

// ----------------------------------------------------------------------

export function JwtResetPasswordView({ token }: { token?: string }) {
  const router = useRouter();
  const resetPassword = useResetPassword();

  const password = useBoolean();
  const confirmPassword = useBoolean();

  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const defaultValues = {
    password: '',
    confirmPassword: '',
  };

  const methods = useForm<ResetPasswordSchemaType>({
    resolver: zodResolver(ResetPasswordSchema),
    defaultValues,
  });

  const {
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const onSubmit = handleSubmit(async (data) => {
    try {
      await resetPassword.mutateAsync({ token: token ?? '', newPassword: data.password });
      setErrorMsg('');
      setSuccessMsg('Password reset successfully. Redirecting to sign in...');
      setTimeout(() => {
        router.replace(paths.auth.jwt.signIn);
      }, 1500);
    } catch (error) {
      setSuccessMsg('');
      setErrorMsg(typeof error === 'string' ? error : error.message);
    }
  });

  const renderForm = (
    <Form methods={methods} onSubmit={onSubmit}>
      <Box gap={3} display="flex" flexDirection="column" sx={{ mt: 3 }}>
        <Field.Text
          name="password"
          label="New Password"
          placeholder="Enter a new password"
          type={password.value ? 'text' : 'password'}
          InputLabelProps={{ shrink: true }}
          sx={{
            '& .MuiOutlinedInput-root': {
              height: 52,
              borderRadius: 1.5,
            },
          }}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={password.onToggle} edge="end">
                  <Iconify icon={password.value ? 'solar:eye-bold' : 'solar:eye-closed-bold'} />
                </IconButton>
              </InputAdornment>
            ),
          }}
        />

        <Field.Text
          name="confirmPassword"
          label="Confirm Password"
          placeholder="Re-enter the new password"
          type={confirmPassword.value ? 'text' : 'password'}
          InputLabelProps={{ shrink: true }}
          sx={{
            '& .MuiOutlinedInput-root': {
              height: 52,
              borderRadius: 1.5,
            },
          }}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={confirmPassword.onToggle} edge="end">
                  <Iconify icon={confirmPassword.value ? 'solar:eye-bold' : 'solar:eye-closed-bold'} />
                </IconButton>
              </InputAdornment>
            ),
          }}
        />

        <LoadingButton
          fullWidth
          color="inherit"
          size="large"
          type="submit"
          variant="contained"
          loading={isSubmitting}
          loadingIndicator="Resetting..."
          sx={{
            height: 52,
            borderRadius: 1.5,
            bgcolor: '#2F3C98',
            '&:hover': { bgcolor: '#252D73' },
            fontSize: 15,
            fontWeight: 600,
            textTransform: 'none',
          }}
        >
          Reset Password
        </LoadingButton>
      </Box>
    </Form>
  );

  if (!token) {
    return (
      <>
        <FormHead title="Reset your password" sx={{ textAlign: { xs: 'center', md: 'left' } }} />
        <Alert severity="error" sx={{ mt: 3, borderRadius: 1.5 }}>
          Missing reset token. Request a new token from the{' '}
          <Typography component="span" variant="body2" color="inherit" sx={{ cursor: 'pointer' }} onClick={() => router.replace(paths.auth.jwt.forgotPassword)}>
            forgot password
          </Typography>{' '}
          flow.
        </Alert>
      </>
    );
  }

  return (
    <>
      <FormHead
        title="Set a new password"
        description={
          <>
            {`Remembered it? `}
            <Typography component="span" variant="subtitle2" sx={{ cursor: 'pointer' }} onClick={() => router.replace(paths.auth.jwt.signIn)}>
              Back to sign in
            </Typography>
          </>
        }
        sx={{ textAlign: { xs: 'center', md: 'left' } }}
      />

      {!!errorMsg && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 1.5 }}>
          {errorMsg}
        </Alert>
      )}

      {!!successMsg && (
        <Alert severity="success" sx={{ mb: 3, borderRadius: 1.5 }}>
          {successMsg}
        </Alert>
      )}

      {renderForm}
    </>
  );
}
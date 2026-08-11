import { z as zod } from 'zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Alert from '@mui/material/Alert';
import Typography from '@mui/material/Typography';
import LoadingButton from '@mui/lab/LoadingButton';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';
import { RouterLink } from 'src/routes/components';

import { useForgotPassword } from 'src/services/hooks';

import { Form, Field } from 'src/components/hook-form';

import { FormHead } from '../../components/form-head';

// ----------------------------------------------------------------------

export type ForgotPasswordSchemaType = zod.infer<typeof ForgotPasswordSchema>;

export const ForgotPasswordSchema = zod.object({
  email: zod
    .string()
    .min(1, { message: 'Email is required!' })
    .email({ message: 'Email must be a valid email address!' }),
});

// ----------------------------------------------------------------------

export function JwtForgotPasswordView() {
  const router = useRouter();
  const forgotPassword = useForgotPassword();

  const [errorMsg, setErrorMsg] = useState('');
  const [resetToken, setResetToken] = useState<string | undefined>(undefined);

  const defaultValues = {
    email: '',
  };

  const methods = useForm<ForgotPasswordSchemaType>({
    resolver: zodResolver(ForgotPasswordSchema),
    defaultValues,
  });

  const {
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const onSubmit = handleSubmit(async (data) => {
    try {
      const res = await forgotPassword.mutateAsync({ email: data.email });
      setErrorMsg('');
      setResetToken(res.data?.resetToken);
    } catch (error) {
      setResetToken(undefined);
      setErrorMsg(typeof error === 'string' ? error : error.message);
    }
  });

  const renderTokenSuccess = (
    <Box gap={2} display="flex" flexDirection="column">
      <Alert severity="success" sx={{ borderRadius: 1.5 }}>
        A password reset token has been generated (demo mode: no email relay).
        Copy it and continue to set a new password.
      </Alert>

      <Box
        gap={1}
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        px={2}
        py={1.5}
        sx={{
          bgcolor: 'background.neutral',
          borderRadius: 1.5,
          border: '1px dashed',
          borderColor: 'divider',
        }}
      >
        <Typography variant="body2" sx={{ fontFamily: 'monospace', fontWeight: 600, wordBreak: 'break-all' }}>
          {resetToken}
        </Typography>
        <Link
          component="button"
          type="button"
          variant="subtitle2"
          onClick={() => {
            navigator.clipboard.writeText(resetToken!);
          }}
          sx={{ ml: 1, flexShrink: 0 }}
        >
          Copy
        </Link>
      </Box>

      <LoadingButton
        fullWidth
        color="inherit"
        size="large"
        variant="contained"
        onClick={() =>
          router.push(`${paths.auth.jwt.resetPassword}?token=${encodeURIComponent(resetToken!)}`)
        }
        sx={{ height: 52, borderRadius: 1.5, bgcolor: '#2F3C98', '&:hover': { bgcolor: '#252D73' }, textTransform: 'none', fontSize: 15, fontWeight: 600 }}
      >
        Continue to reset password
      </LoadingButton>
    </Box>
  );

  const renderForm = (
    <Box gap={3} display="flex" flexDirection="column">
      <Field.Text
        name="email"
        label="Email Address"
        placeholder="Enter your registered email"
        InputLabelProps={{ shrink: true }}
        sx={{
          '& .MuiOutlinedInput-root': {
            height: 52,
            borderRadius: 1.5,
          },
        }}
      />

      <LoadingButton
        fullWidth
        color="inherit"
        size="large"
        type="submit"
        variant="contained"
        loading={isSubmitting}
        loadingIndicator="Sending..."
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
        Send Reset Token
      </LoadingButton>
    </Box>
  );

  return (
    <>
      <FormHead
        title="Forgot your password?"
        description={
          <>
            {`Remembered it? `}
            <Link component={RouterLink} href={paths.auth.jwt.signIn} variant="subtitle2">
              Back to sign in
            </Link>
          </>
        }
        sx={{ textAlign: { xs: 'center', md: 'left' } }}
      />

      {!!errorMsg && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 1.5 }}>
          {errorMsg}
        </Alert>
      )}

      {resetToken ? (
        renderTokenSuccess
      ) : (
        <Form methods={methods} onSubmit={onSubmit}>
          {renderForm}
        </Form>
      )}
    </>
  );
}
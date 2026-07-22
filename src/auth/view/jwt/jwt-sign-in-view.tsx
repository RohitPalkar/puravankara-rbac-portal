import { z as zod } from 'zod';
import { useForm } from 'react-hook-form';
import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';

import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Alert from '@mui/material/Alert';
import Checkbox from '@mui/material/Checkbox';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import LoadingButton from '@mui/lab/LoadingButton';
import InputAdornment from '@mui/material/InputAdornment';
import FormControlLabel from '@mui/material/FormControlLabel';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';
import { RouterLink } from 'src/routes/components';

import { useBoolean } from 'src/hooks/use-boolean';

import { Iconify } from 'src/components/iconify';
import { Form, Field } from 'src/components/hook-form';

import { useAuthContext } from '../../hooks';
import { signInWithPassword } from '../../context/jwt';

export type SignInSchemaType = zod.infer<typeof SignInSchema>;

export const SignInSchema = zod.object({
  email: zod
    .string()
    .min(1, { message: 'Email is required!' })
    .email({ message: 'Email must be a valid email address!' }),
  password: zod
    .string()
    .min(1, { message: 'Password is required!' })
    .min(6, { message: 'Password must be at least 6 characters!' }),
});

export function JwtSignInView() {
  const router = useRouter();

  const { checkUserSession } = useAuthContext();

  const [errorMsg, setErrorMsg] = useState('');

  const password = useBoolean();

  const defaultValues = {
    email: '',
    password: '',
  };

  const methods = useForm<SignInSchemaType>({
    resolver: zodResolver(SignInSchema),
    defaultValues,
  });

  const {
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const onSubmit = handleSubmit(async (data) => {
    try {
      await signInWithPassword({ email: data.email, password: data.password });
      await checkUserSession?.();

      router.refresh();
    } catch (error) {
      setErrorMsg(typeof error === 'string' ? error : error.message);
    }
  });

  const renderHeader = (
    <Box
      sx={{
        position: 'fixed',
        top: 24,
        right: { xs: 24, md: 40 },
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        zIndex: 10,
      }}
    >
      <Link
        href={paths.faqs}
        component={RouterLink}
        color="text.secondary"
        sx={{ typography: 'body2', fontWeight: 500, textDecoration: 'none', '&:hover': { color: 'primary.main' } }}
      >
        Need help?
      </Link>
      <IconButton
        aria-label="settings"
        sx={{ width: 36, height: 36, color: 'text.secondary' }}
      >
        <Iconify icon="solar:settings-bold-duotone" width={20} />
      </IconButton>
    </Box>
  );

  const renderLeftPanel = (
    <Box
      sx={{
        display: { xs: 'none', md: 'block' },
        width: { md: '35%', lg: '40%' },
        height: '100vh',
        position: 'relative',
        flexShrink: 0,
      }}
    >
      <Box
        component="img"
        src="/assets/login/Login Image.png"
        alt=""
        sx={{
          width: 1,
          height: 1,
          objectFit: 'cover',
          borderTopRightRadius: 32,
          borderBottomRightRadius: 32,
        }}
      />
    </Box>
  );

  const renderForm = (
    <Box gap={3} display="flex" flexDirection="column">
      <Field.Text
        name="email"
        label="Email Address"
        placeholder="Enter your email address"
        InputLabelProps={{ shrink: true }}
        sx={{
          '& .MuiOutlinedInput-root': {
            height: 52,
            borderRadius: 1.5,
          },
        }}
      />

      <Box gap={1} display="flex" flexDirection="column">
        <Field.Text
          name="password"
          label="Password"
          placeholder="Enter your password"
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

        <Box display="flex" alignItems="center" justifyContent="space-between" mt={0.5}>
          <FormControlLabel
            control={<Checkbox size="small" sx={{ color: 'text.disabled' }} />}
            label={<Typography variant="body2" sx={{ color: 'text.secondary' }}>Remember Me</Typography>}
            sx={{ ml: -0.5 }}
          />
          <Link
            component={RouterLink}
            href="#"
            variant="body2"
            color="inherit"
            sx={{ fontWeight: 500, textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
          >
            Forgot password?
          </Link>
        </Box>
      </Box>

      <LoadingButton
        fullWidth
        color="inherit"
        size="large"
        type="submit"
        variant="contained"
        loading={isSubmitting}
        loadingIndicator="Signing in..."
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
        Sign In
      </LoadingButton>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', height: '100vh', bgcolor: 'background.default' }}>
      {renderHeader}

      {renderLeftPanel}

      <Box
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          px: 3,
          py: 8,
          position: 'relative',
        }}
      >
        <Box sx={{ width: 1, maxWidth: 440 }}>
          <Stack spacing={3.5}>
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 700, color: 'text.primary' }}>
                Sign in to your account
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary', mt: 1 }}>
                Use your corporate credentials to access the Admin Portal.
              </Typography>
            </Box>

            {!!errorMsg && (
              <Alert severity="error" onClose={() => setErrorMsg('')} sx={{ borderRadius: 1.5 }}>
                {errorMsg}
              </Alert>
            )}

            <Form methods={methods} onSubmit={onSubmit}>
              {renderForm}
            </Form>
          </Stack>
        </Box>
      </Box>
    </Box>
  );
}

import { z as zod } from 'zod';
import { useForm } from 'react-hook-form';
import { useState, useCallback } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';

import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
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

const DEMO_EMAIL = 'admin@puravankara.com';
const DEMO_PASSWORD = 'Admin@123456';

export function JwtSignInView() {
  const router = useRouter();

  const { checkUserSession } = useAuthContext();

  const [errorMsg, setErrorMsg] = useState('');

  const [copiedEmail, setCopiedEmail] = useState(false);
  const [copiedPassword, setCopiedPassword] = useState(false);

  const password = useBoolean();

  const defaultValues = {
    email: DEMO_EMAIL,
    password: DEMO_PASSWORD,
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

  const handleCopy = useCallback(async (text: string, type: 'email' | 'password') => {
    try {
      await navigator.clipboard.writeText(text);
      if (type === 'email') {
        setCopiedEmail(true);
        setTimeout(() => setCopiedEmail(false), 2000);
      } else {
        setCopiedPassword(true);
        setTimeout(() => setCopiedPassword(false), 2000);
      }
    } catch {
      // clipboard not available
    }
  }, []);

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

  const renderDemoBanner = (
    <Box
      sx={{
        bgcolor: '#EEF2FF',
        borderRadius: 1.5,
        p: 2.5,
      }}
    >
      <Typography variant="subtitle2" sx={{ color: '#2F3C98', mb: 1.5, fontWeight: 600 }}>
        Demo Credentials
      </Typography>
      <Stack spacing={1}>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box>
            <Typography variant="caption" sx={{ color: 'text.disabled', fontWeight: 500 }}>
              Email
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.primary', fontWeight: 500, mt: 0.25 }}>
              {DEMO_EMAIL}
            </Typography>
          </Box>
          <Tooltip title={copiedEmail ? 'Copied!' : 'Copy'}>
            <IconButton
              size="small"
              onClick={() => handleCopy(DEMO_EMAIL, 'email')}
              sx={{ color: copiedEmail ? 'success.main' : 'text.disabled' }}
            >
              <Iconify icon={copiedEmail ? 'solar:check-circle-bold' : 'solar:copy-bold'} width={18} />
            </IconButton>
          </Tooltip>
        </Box>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box>
            <Typography variant="caption" sx={{ color: 'text.disabled', fontWeight: 500 }}>
              Password
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.primary', fontWeight: 500, mt: 0.25 }}>
              {DEMO_PASSWORD}
            </Typography>
          </Box>
          <Tooltip title={copiedPassword ? 'Copied!' : 'Copy'}>
            <IconButton
              size="small"
              onClick={() => handleCopy(DEMO_PASSWORD, 'password')}
              sx={{ color: copiedPassword ? 'success.main' : 'text.disabled' }}
            >
              <Iconify icon={copiedPassword ? 'solar:check-circle-bold' : 'solar:copy-bold'} width={18} />
            </IconButton>
          </Tooltip>
        </Box>
      </Stack>
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

            {renderDemoBanner}

            {!!errorMsg && (
              <Alert severity="error" onClose={() => setErrorMsg('')} sx={{ borderRadius: 1.5 }}>
                {errorMsg}
              </Alert>
            )}

            <Form methods={methods} onSubmit={onSubmit}>
              {renderForm}
            </Form>

            <Typography
              variant="caption"
              sx={{ color: 'text.disabled', textAlign: 'center', display: 'block' }}
            >
              Connected to Development Server
            </Typography>
          </Stack>
        </Box>
      </Box>
    </Box>
  );
}

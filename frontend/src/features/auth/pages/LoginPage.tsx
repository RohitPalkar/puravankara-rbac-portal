import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Box,
  Card,
  CardContent,
  TextField,
  Typography,
  Alert,
  Button,
  CircularProgress,
  IconButton,
  InputAdornment,
  FormControlLabel,
  Checkbox,
  Link,
} from '@mui/material'
import { Visibility, VisibilityOff } from '@mui/icons-material'
import LockOutlinedIcon from '@mui/icons-material/LockOutlined'
import Avatar from '@mui/material/Avatar'
import { useAuthStore } from '@/stores/auth.store'
import { usePermissionStore } from '@/stores/permission.store'

const loginSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
  rememberMe: z.boolean().optional(),
})

type LoginForm = z.infer<typeof loginSchema>

export default function LoginPage() {
  const navigate = useNavigate()
  const setAuth = useAuthStore((s) => s.setAuth)
  const checkSession = useAuthStore((s) => s.checkSession)
  const bootstrapPermissions = usePermissionStore((s) => s.bootstrap)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: localStorage.getItem('rememberedEmail') || 'admin@system.local',
      password: '',
      rememberMe: !!localStorage.getItem('rememberedEmail'),
    },
  })

  const onSubmit = async (data: LoginForm) => {
    setError('')
    try {
      setAuth({
        accessToken: '',
        refreshToken: '',
        user: { empId: '', name: '', email: '', role: '', roles: [], isActive: true },
      })
      const payload = await import('@/services/api/endpoints').then((m) =>
        m.auth.login({ email: data.email, password: data.password }),
      )
      setAuth({
        accessToken: payload.accessToken,
        refreshToken: payload.refreshToken,
        user: payload.user,
      })

      if (data.rememberMe) {
        localStorage.setItem('rememberedEmail', data.email)
      } else {
        localStorage.removeItem('rememberedEmail')
      }

      await checkSession()
      bootstrapPermissions()

      navigate('/dashboard', { replace: true })
    } catch (err: any) {
      const msg = err.response?.data?.message
      setError(Array.isArray(msg) ? msg[0] : msg || 'Login failed. Please try again.')
    }
  }

  return (
    <Box
      sx={{
        display: 'flex',
        minHeight: '100vh',
        bgcolor: 'background.default',
      }}
    >
      <Box
        sx={{
          flex: { xs: 1, md: '0 0 480px' },
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          p: 4,
        }}
      >
        <Card sx={{ width: '100%', maxWidth: 420, boxShadow: 4 }}>
          <CardContent sx={{ p: { xs: 3, sm: 4 }, textAlign: 'center' }}>
            <Avatar sx={{ mx: 'auto', mb: 1.5, width: 48, height: 48, bgcolor: 'primary.main' }}>
              <LockOutlinedIcon />
            </Avatar>
            <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
              RBAC Admin
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3 }}>
              Sign in to your account
            </Typography>

            {error && (
              <Alert severity="error" sx={{ mb: 2, textAlign: 'left' }}>
                {error}
              </Alert>
            )}

            <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
              <TextField
                fullWidth
                label="Email"
                type="email"
                autoComplete="email"
                autoFocus
                margin="normal"
                error={!!errors.email}
                helperText={errors.email?.message}
                {...register('email')}
              />

              <TextField
                fullWidth
                label="Password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                margin="normal"
                error={!!errors.password}
                helperText={errors.password?.message}
                slotProps={{
                  input: {
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowPassword(!showPassword)}
                          edge="end"
                          size="small"
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  },
                }}
                {...register('password')}
              />

              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
                <FormControlLabel
                  control={<Checkbox size="small" {...register('rememberMe')} />}
                  label={<Typography variant="body2">Remember me</Typography>}
                />
                <Link
                  href="#"
                  variant="body2"
                  onClick={(e) => {
                    e.preventDefault()
                  }}
                  sx={{ cursor: 'pointer' }}
                >
                  Forgot password?
                </Link>
              </Box>

              <Button
                fullWidth
                type="submit"
                variant="contained"
                size="large"
                disabled={isSubmitting}
                sx={{ mt: 2.5, py: 1.3, fontWeight: 600 }}
              >
                {isSubmitting ? <CircularProgress size={22} color="inherit" /> : 'Sign In'}
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Box>

      <Box
        sx={{
          flex: 1,
          display: { xs: 'none', md: 'flex' },
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          bgcolor: 'primary.main',
          color: 'white',
          p: 6,
        }}
      >
        <Typography variant="h3" sx={{ fontWeight: 700, mb: 2 }}>
          Puravankara
        </Typography>
        <Typography variant="h5" sx={{ fontWeight: 300, opacity: 0.9, mb: 1 }}>
          Role-Based Access Control
        </Typography>
        <Typography variant="body1" sx={{ opacity: 0.7, maxWidth: 400, textAlign: 'center' }}>
          Enterprise platform for managing users, roles, permissions, projects, and workflows.
        </Typography>
      </Box>
    </Box>
  )
}

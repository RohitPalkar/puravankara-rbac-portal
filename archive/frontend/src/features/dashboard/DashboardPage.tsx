import { useEffect, useState } from 'react'
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Skeleton,
  Chip,
} from '@mui/material'
import PeopleIcon from '@mui/icons-material/People'
import SecurityIcon from '@mui/icons-material/Security'
import BusinessIcon from '@mui/icons-material/Business'
import LocationCityIcon from '@mui/icons-material/LocationCity'
import AssignmentIcon from '@mui/icons-material/Assignment'
import AccountTreeIcon from '@mui/icons-material/AccountTree'
import { useAuthStore } from '@/stores/auth.store'
import { usePermissionStore } from '@/stores/permission.store'
import api from '@/services/api/axios'

interface SetupStatus {
  setupCompleted: boolean
  required: string[]
  status: Record<string, { exists: boolean; count: number }>
}

const statCards = [
  { label: 'Users', icon: PeopleIcon, color: '#1976d2', key: 'user' },
  { label: 'Roles', icon: SecurityIcon, color: '#9c27b0', key: 'role' },
  { label: 'Departments', icon: BusinessIcon, color: '#2e7d32', key: 'department' },
  { label: 'Zones', icon: LocationCityIcon, color: '#ed6c02', key: 'zone' },
  { label: 'Projects', icon: AssignmentIcon, color: '#0288d1', key: 'project' },
  { label: 'Modules', icon: AccountTreeIcon, color: '#7b1fa2', key: 'module' },
]

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user)
  const { modules, projects } = usePermissionStore()
  const [setupStatus, setSetupStatus] = useState<SetupStatus | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api
      .get('/setup/status')
      .then((res) => setSetupStatus(res.data.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 1 }}>
        Welcome back, {user?.name || 'Admin'}
      </Typography>
      <Typography variant="body1" sx={{ color: 'text.secondary', mb: 3 }}>
        Role: <Chip label={user?.role || '—'} size="small" color="primary" />
        {user?.department && <> &middot; Department: {user.department}</>}
        {user?.designation && <> &middot; {user.designation}</>}
      </Typography>

      <Grid container spacing={2} sx={{ mb: 4 }}>
        {statCards.map((stat) => {
          const count = setupStatus?.status[stat.key]?.count ?? 0
          return (
            <Grid size={{ xs: 6, sm: 4, md: 2 }} key={stat.key}>
              <Card>
                <CardContent sx={{ textAlign: 'center', py: 2.5 }}>
                  {loading ? (
                    <Skeleton variant="circular" width={36} height={36} sx={{ mx: 'auto', mb: 1 }} />
                  ) : (
                    <stat.icon sx={{ fontSize: 36, color: stat.color, mb: 0.5 }} />
                  )}
                  <Typography variant="h5" sx={{ fontWeight: 700 }}>
                    {loading ? <Skeleton width={30} sx={{ mx: 'auto' }} /> : count}
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                    {stat.label}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          )
        })}
      </Grid>

      {!loading && setupStatus && !setupStatus.setupCompleted && (
        <Card sx={{ bgcolor: 'warning.light', mb: 3 }}>
          <CardContent>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, color: 'warning.dark' }}>
              Setup Incomplete
            </Typography>
            <Typography variant="body2" sx={{ color: 'warning.dark' }}>
              Missing: {setupStatus.required.join(', ')}
            </Typography>
          </CardContent>
        </Card>
      )}

      <Typography variant="h6" sx={{ mb: 2 }}>
        Available Access
      </Typography>
      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
        {modules.length > 0 ? (
          modules.map((mod) => <Chip key={mod} label={mod} size="small" variant="outlined" />)
        ) : (
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            No specific modules assigned. You have full Super Admin access.
          </Typography>
        )}
        {projects.length > 0 && (
          <Box sx={{ mt: 1, width: '100%' }}>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              Projects ({projects.length}): {projects.join(', ')}
            </Typography>
          </Box>
        )}
      </Box>
    </Box>
  )
}

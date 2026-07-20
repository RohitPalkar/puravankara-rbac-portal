import type { ReactNode } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Typography,
  Grid,
  Card,
  CardContent,
  Chip,
  Divider,
  Box,
} from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import type { UserRecord } from '@/features/users/types/user.types'

interface Props {
  user: UserRecord
  open: boolean
  onClose: () => void
}

function DetailRow({ label, value }: { label: string; value: string | ReactNode }) {
  return (
    <Grid size={{ xs: 12, sm: 6 }}>
      <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>{label}</Typography>
      <Typography variant="body2" sx={{ fontWeight: 500 }}>{value || '—'}</Typography>
    </Grid>
  )
}

export default function UserDetailPage({ user, open, onClose }: Props) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center' }}>
        <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 600 }}>{user.name}</Typography>
        <IconButton onClick={onClose} size="small"><CloseIcon /></IconButton>
      </DialogTitle>
      <Divider />
      <DialogContent>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12 }}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="subtitle2" sx={{ mb: 1.5, color: 'primary.main' }}>Profile</Typography>
                <Grid container spacing={1}>
                  <DetailRow label="Employee ID" value={user.employeeId} />
                  <DetailRow label="Name" value={user.name} />
                  <DetailRow label="Email" value={user.email} />
                  <DetailRow label="Phone" value={user.phone} />
                  <DetailRow label="Status" value={
                    <Chip label={user.isActive ? 'Active' : 'Inactive'} size="small" color={user.isActive ? 'success' : 'default'} />
                  } />
                  <DetailRow label="Employment Status" value={user.employmentStatus} />
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12 }}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="subtitle2" sx={{ mb: 1.5, color: 'primary.main' }}>Organization</Typography>
                <Grid container spacing={1}>
                  <DetailRow label="Department" value={user.departmentName} />
                  <DetailRow label="Primary Role" value={user.primaryRoleName} />
                  <DetailRow label="Secondary Roles" value={
                    user.secondaryRoleNames?.length
                      ? user.secondaryRoleNames.join(', ')
                      : 'None'
                  } />
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12 }}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="subtitle2" sx={{ mb: 1.5, color: 'primary.main' }}>Zone Access</Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {user.zones?.length
                    ? user.zones.map((z) => <Chip key={z.id} label={z.name} size="small" variant="outlined" />)
                    : <Typography variant="body2" sx={{ color: 'text.secondary' }}>No zones assigned</Typography>}
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12 }}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="subtitle2" sx={{ mb: 1.5, color: 'primary.main' }}>Reporting Structure</Typography>
                <Grid container spacing={1}>
                  <DetailRow label="Reports To (Manager)" value={user.reportingManagerName || '—'} />
                  <DetailRow label="Reports To (Head)" value={user.reportingHeadName || '—'} />
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </DialogContent>
    </Dialog>
  )
}

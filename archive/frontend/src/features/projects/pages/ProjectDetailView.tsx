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
} from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import type { Project } from '@/features/projects/types/project.types'

interface Props {
  project: Project
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

export default function ProjectDetailView({ project, open, onClose }: Props) {
  const meta = project.extendedMetadata

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center' }}>
        <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 600 }}>{project.name}</Typography>
        <IconButton onClick={onClose} size="small"><CloseIcon /></IconButton>
      </DialogTitle>
      <Divider />
      <DialogContent>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12 }}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="subtitle2" sx={{ mb: 1.5, color: 'primary.main' }}>Basic Details</Typography>
                <Grid container spacing={1}>
                  <DetailRow label="Project Name" value={project.name} />
                  <DetailRow label="City" value={project.cityName || project.cityId || '—'} />
                  <DetailRow label="Zone" value={project.zoneName || '—'} />
                  <DetailRow label="Status" value={<Chip label={project.isActive ? 'Active' : 'Inactive'} size="small" color={project.isActive ? 'success' : 'default'} />} />
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12 }}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="subtitle2" sx={{ mb: 1.5, color: 'primary.main' }}>Billing Details</Typography>
                <Grid container spacing={1}>
                  <DetailRow label="Billing Entity" value={project.billingEntityName} />
                  <DetailRow label="GSTIN" value={project.billingGstin} />
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12 }}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="subtitle2" sx={{ mb: 1.5, color: 'primary.main' }}>Configuration (Metadata)</Typography>
                <Grid container spacing={1}>
                  <DetailRow label="Phase" value={meta?.phase || project.phase} />
                  <DetailRow label="Brand" value={meta?.brand || project.brand} />
                  <DetailRow label="Company" value={meta?.company || project.company} />
                  <DetailRow label="Payment Gateway" value={meta?.payment_gateway_easebuzz ? 'Easebuzz Enabled' : 'Easebuzz Disabled'} />
                  <DetailRow label="RERA Incentive" value={meta?.is_rera_incentive_eligible ? 'Eligible' : 'Not Eligible'} />
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {(project.projectImagePath || project.jvImagePath) && (
            <Grid size={{ xs: 12 }}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="subtitle2" sx={{ mb: 1.5, color: 'primary.main' }}>Media</Typography>
                  <Grid container spacing={1}>
                    <DetailRow label="Project Image" value={project.projectImagePath} />
                    <DetailRow label="JV Image" value={project.jvImagePath} />
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          )}
        </Grid>
      </DialogContent>
    </Dialog>
  )
}

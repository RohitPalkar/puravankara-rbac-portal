import { Box, Typography, Chip, Stepper, Step, StepLabel, StepContent } from '@mui/material'
import type { ApprovalTimelineEntry } from '@/features/workflows/types/workflow.types'

interface Props {
  entries: ApprovalTimelineEntry[]
  currentStep: number
}

const statusColors: Record<string, 'warning' | 'success' | 'error' | 'default'> = {
  PENDING: 'warning',
  APPROVED: 'success',
  REJECTED: 'error',
}

export default function ApprovalTimeline({ entries, currentStep }: Props) {
  if (entries.length === 0) {
    return (
      <Typography variant="body2" sx={{ color: 'text.secondary', fontStyle: 'italic' }}>
        No timeline entries yet
      </Typography>
    )
  }

  return (
    <Stepper activeStep={currentStep - 1} orientation="vertical">
      {entries.map((entry) => (
        <Step key={entry.id} completed={entry.status === 'APPROVED'}>
        <StepLabel>
            <Typography variant="subtitle2">{entry.roleName}</Typography>
          </StepLabel>
          <StepContent>
            <Box sx={{ mb: 1 }}>
              <Chip label={entry.status} size="small" color={statusColors[entry.status] || 'default'} sx={{ mb: 0.5 }} />
              {entry.userName && (
                <Typography variant="caption" sx={{ display: 'block' }}>
                  Action by: {entry.userName}
                </Typography>
              )}
              {entry.actedAt && (
                <Typography variant="caption" sx={{ display: 'block', color: 'text.secondary' }}>
                  {new Date(entry.actedAt).toLocaleString()}
                </Typography>
              )}
              {entry.comments && (
                <Typography variant="body2" sx={{ mt: 0.5, fontStyle: 'italic' }}>
                  "{entry.comments}"
                </Typography>
              )}
            </Box>
          </StepContent>
        </Step>
      ))}
    </Stepper>
  )
}

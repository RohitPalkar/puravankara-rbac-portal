import { Box, Card, CardContent, Typography, Chip, Button } from '@mui/material'
import type { ApprovalRequest } from '@/features/workflows/types/workflow.types'

interface Props {
  approval: ApprovalRequest
  onView: () => void
  onApprove?: () => void
  onReject?: () => void
  showActions?: boolean
}

const statusColors: Record<string, 'warning' | 'success' | 'error'> = {
  PENDING: 'warning',
  APPROVED: 'success',
  REJECTED: 'error',
}

export default function ApprovalCard({ approval, onView, onApprove, onReject, showActions }: Props) {
  return (
    <Card variant="outlined" sx={{ mb: 1 }}>
      <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
              {approval.workflowName || approval.module} — {approval.entityType}
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
              Requested by {approval.requestedByName || approval.requestedBy} • {new Date(approval.createdAt).toLocaleDateString()}
            </Typography>
            <Box sx={{ display: 'flex', gap: 0.5, mt: 0.5 }}>
              <Chip label={approval.status} size="small" color={statusColors[approval.status] || 'default'} />
              <Chip label={`Step ${approval.currentStep}/${approval.totalSteps}`} size="small" variant="outlined" />
            </Box>
          </Box>
          <Box sx={{ display: 'flex', gap: 0.5 }}>
            <Button size="small" onClick={onView}>View</Button>
            {showActions && approval.status === 'PENDING' && (
              <>
                <Button size="small" variant="contained" color="success" onClick={onApprove}>
                  Approve
                </Button>
                <Button size="small" variant="outlined" color="error" onClick={onReject}>
                  Reject
                </Button>
              </>
            )}
          </Box>
        </Box>
      </CardContent>
    </Card>
  )
}

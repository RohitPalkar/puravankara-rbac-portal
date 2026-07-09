import { useState } from 'react'
import { Box, Typography, Card, Button, Dialog, DialogTitle, DialogContent, DialogActions, CircularProgress } from '@mui/material'
import ApprovalCard from '@/features/workflows/components/ApprovalCard'
import ApprovalTimeline from '@/features/workflows/components/ApprovalTimeline'
import { useSubmittedApprovals, useApprovalDetail, useApprovalTimeline } from '@/features/workflows/services/workflow.service'

export default function ApprovalHistoryPage() {
  const { data: approvals, isLoading } = useSubmittedApprovals()
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const { data: detail } = useApprovalDetail(selectedId || undefined)
  const { data: timeline } = useApprovalTimeline(selectedId || undefined)

  const list = approvals ?? []

  return (
    <Box>
      <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>Submitted Requests</Typography>

      {isLoading ? (
        <Box sx={{ textAlign: 'center', py: 4 }}><CircularProgress /></Box>
      ) : list.length === 0 ? (
        <Card sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="body1" sx={{ color: 'text.secondary' }}>No submitted requests</Typography>
        </Card>
      ) : (
        list.map((a) => (
          <ApprovalCard
            key={a.id}
            approval={a}
            onView={() => setSelectedId(a.id)}
          />
        ))
      )}

      <Dialog open={!!selectedId} onClose={() => setSelectedId(null)} maxWidth="sm" fullWidth>
        <DialogTitle>Request Details</DialogTitle>
        <DialogContent>
          {detail && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2">{detail.workflowName || detail.module}</Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                Status: {detail.status} • Step {detail.currentStep}/{detail.totalSteps}
              </Typography>
            </Box>
          )}
          <ApprovalTimeline entries={timeline ?? []} currentStep={detail?.currentStep ?? 1} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelectedId(null)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

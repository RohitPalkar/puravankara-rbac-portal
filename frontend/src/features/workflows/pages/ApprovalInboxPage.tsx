import { useState } from 'react'
import {
  Box, Typography, Card, Button, Dialog, DialogTitle, DialogContent,
  DialogActions, TextField, Snackbar, Alert, CircularProgress, Divider,
} from '@mui/material'
import ApprovalCard from '@/features/workflows/components/ApprovalCard'
import ApprovalTimeline from '@/features/workflows/components/ApprovalTimeline'
import { usePendingApprovals, useApprovalDetail, useApprovalTimeline, useApprovalAction } from '@/features/workflows/services/workflow.service'

export default function ApprovalInboxPage() {
  const { data: approvals, isLoading } = usePendingApprovals()
  const actionMut = useApprovalAction()
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const { data: detail } = useApprovalDetail(selectedId || undefined)
  const { data: timeline } = useApprovalTimeline(selectedId || undefined)
  const [actionDialog, setActionDialog] = useState<{ type: 'APPROVE' | 'REJECT' } | null>(null)
  const [comments, setComments] = useState('')
  const [toast, setToast] = useState<{ severity: 'success' | 'error'; message: string } | null>(null)

  const list = approvals ?? []

  const handleAction = async () => {
    if (!selectedId || !actionDialog) return
    try {
      await actionMut.mutateAsync({ id: selectedId, payload: { action: actionDialog.type, comments } })
      setToast({ severity: 'success', message: `${actionDialog.type === 'APPROVE' ? 'Approved' : 'Rejected'} successfully` })
      setActionDialog(null)
      setComments('')
      setSelectedId(null)
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Action failed'
      setToast({ severity: 'error', message: Array.isArray(msg) ? msg[0] : msg })
    }
  }

  return (
    <Box>
      <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>My Approvals</Typography>

      {isLoading ? (
        <Box sx={{ textAlign: 'center', py: 4 }}><CircularProgress /></Box>
      ) : list.length === 0 ? (
        <Card sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="body1" sx={{ color: 'text.secondary' }}>No pending approvals</Typography>
        </Card>
      ) : (
        list.map((a) => (
          <ApprovalCard
            key={a.id}
            approval={a}
            showActions
            onView={() => setSelectedId(a.id)}
            onApprove={() => { setSelectedId(a.id); setActionDialog({ type: 'APPROVE' }) }}
            onReject={() => { setSelectedId(a.id); setActionDialog({ type: 'REJECT' }) }}
          />
        ))
      )}

      {/* Detail Dialog */}
      <Dialog open={!!selectedId && !actionDialog} onClose={() => setSelectedId(null)} maxWidth="sm" fullWidth>
        <DialogTitle>Approval Details</DialogTitle>
        <DialogContent>
          {detail && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2">{detail.workflowName || detail.module}</Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                Requested by: {detail.requestedByName || detail.requestedBy}
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                Status: {detail.status} • Step {detail.currentStep}/{detail.totalSteps}
              </Typography>
            </Box>
          )}
          <Divider sx={{ mb: 2 }} />
          <Typography variant="subtitle2" sx={{ mb: 1 }}>Timeline</Typography>
          <ApprovalTimeline entries={timeline ?? []} currentStep={detail?.currentStep ?? 1} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelectedId(null)}>Close</Button>
          {detail?.status === 'PENDING' && (
            <>
              <Button variant="outlined" color="error" onClick={() => { setActionDialog({ type: 'REJECT' }); setComments('') }}>
                Reject
              </Button>
              <Button variant="contained" color="success" onClick={() => { setActionDialog({ type: 'APPROVE' }); setComments('') }}>
                Approve
              </Button>
            </>
          )}
        </DialogActions>
      </Dialog>

      {/* Action Confirmation Dialog */}
      <Dialog open={!!actionDialog} onClose={() => setActionDialog(null)} maxWidth="xs" fullWidth>
        <DialogTitle>{actionDialog?.type === 'APPROVE' ? 'Approve' : 'Reject'}</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            multiline
            rows={3}
            label="Comments"
            value={comments}
            onChange={(e) => setComments(e.target.value)}
            margin="normal"
            required={actionDialog?.type === 'REJECT'}
            error={actionDialog?.type === 'REJECT' && !comments.trim()}
            helperText={actionDialog?.type === 'REJECT' ? 'Comments required for rejection' : 'Optional'}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setActionDialog(null)}>Cancel</Button>
          <Button
            variant="contained"
            color={actionDialog?.type === 'APPROVE' ? 'success' : 'error'}
            onClick={handleAction}
            disabled={actionMut.isPending || (actionDialog?.type === 'REJECT' && !comments.trim())}
          >
            {actionMut.isPending ? <CircularProgress size={20} color="inherit" /> : actionDialog?.type === 'APPROVE' ? 'Approve' : 'Reject'}
          </Button>
        </DialogActions>
      </Dialog>

      {toast && (
        <Snackbar open autoHideDuration={3000} onClose={() => setToast(null)} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
          <Alert severity={toast.severity} variant="filled">{toast.message}</Alert>
        </Snackbar>
      )}
    </Box>
  )
}

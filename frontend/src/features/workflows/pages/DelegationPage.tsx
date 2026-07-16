import { useState } from 'react'
import {
  Box, Typography, Card, Button, Snackbar, Alert, CircularProgress,
  Dialog, DialogTitle, DialogContent, DialogActions,
  IconButton, Tooltip,
} from '@mui/material'
import { Add, Delete } from '@mui/icons-material'
import DataTable, { type Column } from '@/components/data-table/DataTable'
import ConfirmDialog from '@/components/dialogs/ConfirmDialog'
import DelegationForm from '@/features/workflows/components/DelegationForm'
import {
  useDelegations, useCreateDelegation, useDeleteDelegation,
} from '@/features/workflows/services/workflow.service'
import { useUsers } from '@/features/users/services/user.service'
import type { Delegation } from '@/features/workflows/types/workflow.types'

export default function DelegationPage() {
  const { data: delegations, isLoading } = useDelegations()
  const createMut = useCreateDelegation()
  const deleteMut = useDeleteDelegation()
  const { data: usersData } = useUsers({})
  const users = usersData?.items ?? []

  const [formOpen, setFormOpen] = useState(false)
  const [fromUserId, setFromUserId] = useState('')
  const [delegateUserId, setDelegateUserId] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)

  const [confirmOpen, setConfirmOpen] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [toast, setToast] = useState<{ severity: 'success' | 'error'; message: string } | null>(null)

  const list = delegations ?? []

  const resetForm = () => {
    setFromUserId('')
    setDelegateUserId('')
    setStartDate('')
    setEndDate('')
    setErrors({})
  }

  const handleChange = (field: string, value: string) => {
    setErrors((prev) => ({ ...prev, [field]: '' }))
    switch (field) {
      case 'fromUserId': setFromUserId(value); break
      case 'delegateUserId': setDelegateUserId(value); break
      case 'startDate': setStartDate(value); break
      case 'endDate': setEndDate(value); break
    }
  }

  const validate = (): boolean => {
    const errs: Record<string, string> = {}
    if (!fromUserId) errs.fromUserId = 'Required'
    if (!delegateUserId) errs.delegateUserId = 'Required'
    else if (fromUserId === delegateUserId) errs.delegateUserId = 'Cannot delegate to self'
    if (!startDate) errs.startDate = 'Required'
    if (!endDate) errs.endDate = 'Required'
    else if (startDate > endDate) errs.endDate = 'End date must be after start date'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSave = async () => {
    if (!validate()) return
    setSaving(true)
    try {
      await createMut.mutateAsync({
        fromUserId, delegateUserId, startDate, endDate,
      })
      setToast({ severity: 'success', message: 'Delegation created' })
      setFormOpen(false)
      resetForm()
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to create delegation'
      setToast({ severity: 'error', message: Array.isArray(msg) ? msg[0] : msg })
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteId) return
    await deleteMut.mutateAsync(deleteId)
    setConfirmOpen(false)
    setDeleteId(null)
    setToast({ severity: 'success', message: 'Delegation removed' })
  }

  const columns: Column<Delegation>[] = [
    { id: 'fromUser', label: 'From User', render: (r) => r.fromUserName || r.fromUserId },
    { id: 'delegate', label: 'Delegated To', render: (r) => r.delegateUserName || r.delegateUserId },
    { id: 'start', label: 'Start Date', render: (r) => new Date(r.startDate).toLocaleDateString() },
    { id: 'end', label: 'End Date', render: (r) => new Date(r.endDate).toLocaleDateString() },
    { id: 'status', label: 'Status', render: (r) => r.isActive ? 'Active' : 'Inactive' },
    {
      id: 'actions',
      label: 'Actions',
      render: (r) => (
        <Tooltip title="Remove">
          <IconButton size="small" onClick={() => { setDeleteId(r.id); setConfirmOpen(true) }}>
            <Delete fontSize="small" />
          </IconButton>
        </Tooltip>
      ),
    },
  ]

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h5" sx={{ fontWeight: 600 }}>Delegations</Typography>
        <Button variant="contained" startIcon={<Add />} onClick={() => { resetForm(); setFormOpen(true) }}>
          Create Delegation
        </Button>
      </Box>

      <Card>
        <DataTable
          columns={columns}
          rows={list}
          total={list.length}
          page={0}
          rowsPerPage={list.length || 10}
          loading={isLoading}
          onPageChange={() => {}}
          onRowsPerPageChange={() => {}}
          keyExtractor={(r) => r.id}
          emptyMessage="No delegations configured"
        />
      </Card>

      {/* Create Delegation Dialog */}
      <Dialog open={formOpen} onClose={() => setFormOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Create Delegation</DialogTitle>
        <DialogContent>
          <DelegationForm
            fromUserId={fromUserId}
            delegateUserId={delegateUserId}
            startDate={startDate}
            endDate={endDate}
            errors={errors}
            onChange={handleChange}
            users={users}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { setFormOpen(false); resetForm() }}>Cancel</Button>
          <Button variant="contained" onClick={handleSave} disabled={saving}>
            {saving ? <CircularProgress size={20} color="inherit" /> : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      <ConfirmDialog
        open={confirmOpen}
        title="Remove Delegation"
        message="Are you sure?"
        onConfirm={handleDelete}
        onCancel={() => { setConfirmOpen(false); setDeleteId(null) }}
      />

      {toast && (
        <Snackbar open autoHideDuration={3000} onClose={() => setToast(null)} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
          <Alert severity={toast.severity} variant="filled">{toast.message}</Alert>
        </Snackbar>
      )}
    </Box>
  )
}

import { useState } from 'react'
import {
  Box,
  Button,
  Typography,
  Card,
  IconButton,
  Tooltip,
  Snackbar,
  Alert,
  Switch,
} from '@mui/material'
import { Add, Edit, Visibility } from '@mui/icons-material'
import ConfirmDialog from '@/components/dialogs/ConfirmDialog'
import DataTable, { type Column } from '@/components/data-table/DataTable'
import UserStatusBadge from '@/features/users/components/UserStatusBadge'
import {
  useUsers,
  useUpdateUser,
} from '@/features/users/services/user.service'
import type { UserRecord } from '@/features/users/types/user.types'
import UserWizardPage from '@/features/users/pages/UserWizardPage'
import UserDetailPage from '@/features/users/pages/UserDetailPage'

export default function UserListPage() {
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [search, setSearch] = useState('')

  const [wizardOpen, setWizardOpen] = useState(false)
  const [editId, setEditId] = useState<string | undefined>()
  const [detailUser, setDetailUser] = useState<UserRecord | null>(null)

  const [confirmOpen, setConfirmOpen] = useState(false)
  const [confirmAction, setConfirmAction] = useState<() => void>(() => {})
  const [toast, setToast] = useState<{ severity: 'success' | 'error'; message: string } | null>(null)

  const { data, isLoading } = useUsers({ page: page + 1, limit: rowsPerPage, search: search || undefined })
  const updateMut = useUpdateUser()

  const rows = data?.items ?? []
  const total = data?.total ?? 0

  const openCreate = () => {
    setEditId(undefined)
    setWizardOpen(true)
  }

  const openEdit = (user: UserRecord) => {
    setEditId(user.id)
    setWizardOpen(true)
  }

  const handleToggleStatus = (user: UserRecord) => {
    setConfirmAction(() => async () => {
      try {
        await updateMut.mutateAsync({ id: user.id, payload: { isActive: !user.isActive } })
        setToast({ severity: 'success', message: `User ${user.isActive ? 'deactivated' : 'activated'}` })
      } catch {
        setToast({ severity: 'error', message: 'Failed to update status' })
      }
      setConfirmOpen(false)
    })
    setConfirmOpen(true)
  }

  const columns: Column<UserRecord>[] = [
    { id: 'employeeId', label: 'Employee ID', render: (r) => r.employeeId || '—', sortable: true },
    { id: 'name', label: 'Name', render: (r) => r.name, sortable: true },
    { id: 'email', label: 'Email', render: (r) => r.email },
    { id: 'department', label: 'Department', render: (r) => r.departmentName || '—' },
    { id: 'role', label: 'Role', render: (r) => r.primaryRoleName || '—' },
    { id: 'status', label: 'Status', render: (r) => <UserStatusBadge active={r.isActive} /> },
    {
      id: 'actions',
      label: 'Actions',
      render: (r) => (
        <Box sx={{ display: 'flex', gap: 0.5 }}>
          <Tooltip title="View Details">
            <IconButton size="small" onClick={() => setDetailUser(r)}><Visibility fontSize="small" /></IconButton>
          </Tooltip>
          <Tooltip title="Edit">
            <IconButton size="small" onClick={() => openEdit(r)}><Edit fontSize="small" /></IconButton>
          </Tooltip>
          <Tooltip title={r.isActive ? 'Deactivate' : 'Activate'}>
            <IconButton size="small" onClick={() => handleToggleStatus(r)}>
              <Switch checked={r.isActive} size="small" />
            </IconButton>
          </Tooltip>
        </Box>
      ),
    },
  ]

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h5" sx={{ fontWeight: 600 }}>Users</Typography>
        <Button variant="contained" startIcon={<Add />} onClick={openCreate}>Create User</Button>
      </Box>

      <Card>
        <DataTable
          columns={columns}
          rows={rows}
          total={total}
          page={page}
          rowsPerPage={rowsPerPage}
          searchValue={search}
          loading={isLoading}
          onPageChange={setPage}
          onRowsPerPageChange={(r) => { setRowsPerPage(r); setPage(0) }}
          onSearchChange={(v) => { setSearch(v); setPage(0) }}
          keyExtractor={(r) => r.id}
          emptyMessage="No users found"
          searchPlaceholder="Search users..."
        />
      </Card>

      <UserWizardPage
        open={wizardOpen}
        onClose={() => { setWizardOpen(false); setEditId(undefined) }}
        editId={editId}
      />

      {detailUser && (
        <UserDetailPage
          user={detailUser}
          open={!!detailUser}
          onClose={() => setDetailUser(null)}
        />
      )}

      <ConfirmDialog
        open={confirmOpen}
        title="Confirm"
        message="Are you sure?"
        onConfirm={confirmAction}
        onCancel={() => setConfirmOpen(false)}
      />

      {toast && (
        <Snackbar open autoHideDuration={3000} onClose={() => setToast(null)} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
          <Alert severity={toast.severity} variant="filled">{toast.message}</Alert>
        </Snackbar>
      )}
    </Box>
  )
}

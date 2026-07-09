import { useCallback, useEffect, useState } from 'react'
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
  TextField,
  FormControlLabel,
} from '@mui/material'
import { Add, Edit } from '@mui/icons-material'
import DrawerForm from '@/components/dialogs/DrawerForm'
import ConfirmDialog from '@/components/dialogs/ConfirmDialog'
import DataTable, { type Column } from '@/components/data-table/DataTable'
import StatusChip from '@/components/common/StatusChip'
import { departments } from '@/services/api/endpoints'

interface Department {
  id: string
  name: string
  hierarchyLevels: number
  isActive: boolean
  createdAt?: string
}

export default function DepartmentListPage() {
  const [rows, setRows] = useState<Department[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<Department | null>(null)
  const [name, setName] = useState('')
  const [levels, setLevels] = useState(1)
  const [active, setActive] = useState(true)
  const [saving, setSaving] = useState(false)

  const [confirmOpen, setConfirmOpen] = useState(false)
  const [confirmAction, setConfirmAction] = useState<() => void>(() => {})
  const [toast, setToast] = useState<{ severity: 'success' | 'error'; message: string } | null>(null)

  const fetch = useCallback(async () => {
    setLoading(true)
    try {
      const data = await departments.list({ page: page + 1, limit: rowsPerPage, search: search || undefined })
      const items = Array.isArray(data) ? data : data.items ?? data.data ?? []
      setRows(items)
      setTotal(data.total ?? data.totalCount ?? items.length)
    } catch {
      setRows([])
      setTotal(0)
    } finally {
      setLoading(false)
    }
  }, [page, rowsPerPage, search])

  useEffect(() => { fetch() }, [fetch])

  const openCreate = () => {
    setEditing(null)
    setName('')
    setLevels(1)
    setActive(true)
    setFormOpen(true)
  }

  const openEdit = (dept: Department) => {
    setEditing(dept)
    setName(dept.name)
    setLevels(dept.hierarchyLevels)
    setActive(dept.isActive)
    setFormOpen(true)
  }

  const handleSave = async () => {
    if (!name.trim()) return
    setSaving(true)
    try {
      if (editing) {
        await departments.update(editing.id, { name, hierarchyLevels: levels, isActive: active })
        setToast({ severity: 'success', message: 'Department updated' })
      } else {
        await departments.create({ name, hierarchyLevels: levels, isActive: active })
        setToast({ severity: 'success', message: 'Department created' })
      }
      setFormOpen(false)
      fetch()
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to save'
      setToast({ severity: 'error', message: Array.isArray(msg) ? msg[0] : msg })
    } finally {
      setSaving(false)
    }
  }

  const handleToggleStatus = (dept: Department) => {
    setConfirmAction(() => async () => {
      try {
        await departments.update(dept.id, { isActive: !dept.isActive })
        setToast({ severity: 'success', message: `Department ${dept.isActive ? 'deactivated' : 'activated'}` })
        fetch()
      } catch {
        setToast({ severity: 'error', message: 'Failed to update status' })
      }
      setConfirmOpen(false)
    })
    setConfirmOpen(true)
  }

  const columns: Column<Department>[] = [
    { id: 'name', label: 'Department', render: (r) => r.name, sortable: true },
    {
      id: 'levels',
      label: 'Levels',
      render: (r) => r.hierarchyLevels,
    },
    { id: 'status', label: 'Status', render: (r) => <StatusChip active={r.isActive} /> },
    {
      id: 'actions',
      label: 'Actions',
      render: (r) => (
        <Box sx={{ display: 'flex', gap: 0.5 }}>
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
        <Typography variant="h5" sx={{ fontWeight: 600 }}>Department Master</Typography>
        <Button variant="contained" startIcon={<Add />} onClick={openCreate}>Create Department</Button>
      </Box>

      <Card>
        <DataTable
          columns={columns}
          rows={rows}
          total={total}
          page={page}
          rowsPerPage={rowsPerPage}
          searchValue={search}
          loading={loading}
          onPageChange={setPage}
          onRowsPerPageChange={(r) => { setRowsPerPage(r); setPage(0) }}
          onSearchChange={(v) => { setSearch(v); setPage(0) }}
          keyExtractor={(r) => r.id}
          emptyMessage="No departments found"
        />
      </Card>

      <DrawerForm
        open={formOpen}
        title={editing ? 'Edit Department' : 'Create Department'}
        onClose={() => setFormOpen(false)}
        onSubmit={handleSave}
        loading={saving}
      >
        <TextField fullWidth label="Department Name" value={name} onChange={(e) => setName(e.target.value)} margin="normal" required />
        <TextField fullWidth label="Number of Levels" type="number" value={levels} onChange={(e) => setLevels(parseInt(e.target.value) || 1)} margin="normal" slotProps={{ htmlInput: { min: 1, max: 10 } }} />

        {editing && (
          <FormControlLabel control={<Switch checked={active} onChange={(e) => setActive(e.target.checked)} />} label="Active" sx={{ mt: 1 }} />
        )}

        {name && levels > 0 && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>Hierarchy Levels:</Typography>
            <Box sx={{ display: 'flex', gap: 1, mt: 0.5, flexWrap: 'wrap' }}>
              {Array.from({ length: levels }, (_, i) => (
                <Box key={i} sx={{ px: 1.5, py: 0.5, bgcolor: 'primary.main', color: 'white', borderRadius: 1, fontSize: '0.8rem' }}>
                  L{i + 1}
                </Box>
              ))}
            </Box>
          </Box>
        )}
      </DrawerForm>

      <ConfirmDialog
        open={confirmOpen}
        title={editing ? 'Confirm' : 'Confirm'}
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

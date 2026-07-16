import { useCallback, useEffect, useState } from 'react'
import {
  Box, Button, Typography, Card, IconButton, Tooltip,
  Snackbar, Alert, Switch, TextField, FormControlLabel,
} from '@mui/material'
import { Add, Edit } from '@mui/icons-material'
import DrawerForm from '@/components/dialogs/DrawerForm'
import ConfirmDialog from '@/components/dialogs/ConfirmDialog'
import DataTable, { type Column } from '@/components/data-table/DataTable'
import StatusChip from '@/components/common/StatusChip'
import { modules } from '@/services/api/endpoints'

interface ModuleItem {
  id: string
  name: string
  isActive: boolean
  createdAt?: string
}

export default function ModuleListPage() {
  const [rows, setRows] = useState<ModuleItem[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<ModuleItem | null>(null)
  const [name, setName] = useState('')
  const [active, setActive] = useState(true)
  const [saving, setSaving] = useState(false)

  const [confirmOpen, setConfirmOpen] = useState(false)
  const [confirmAction, setConfirmAction] = useState<() => void>(() => {})
  const [toast, setToast] = useState<{ severity: 'success' | 'error'; message: string } | null>(null)

  const fetch = useCallback(async () => {
    setLoading(true)
    try {
      const data = await modules.list({ page: page + 1, limit: rowsPerPage, search: search || undefined })
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

  const openCreate = () => { setEditing(null); setName(''); setActive(true); setFormOpen(true) }

  const openEdit = (item: ModuleItem) => { setEditing(item); setName(item.name); setActive(item.isActive); setFormOpen(true) }

  const handleSave = async () => {
    if (!name.trim()) return
    setSaving(true)
    try {
      if (editing) {
        await modules.update(editing.id, { name, isActive: active })
        setToast({ severity: 'success', message: 'Module updated' })
      } else {
        await modules.create({ name, isActive: active })
        setToast({ severity: 'success', message: 'Module created' })
      }
      setFormOpen(false); fetch()
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to save'
      setToast({ severity: 'error', message: Array.isArray(msg) ? msg[0] : msg })
    } finally { setSaving(false) }
  }

  const handleToggle = (item: ModuleItem) => {
    setConfirmAction(() => async () => {
      try {
        await modules.update(item.id, { isActive: !item.isActive })
        setToast({ severity: 'success', message: `Module ${item.isActive ? 'deactivated' : 'activated'}` })
        fetch()
      } catch { setToast({ severity: 'error', message: 'Failed' }) }
      setConfirmOpen(false)
    })
    setConfirmOpen(true)
  }

  const columns: Column<ModuleItem>[] = [
    { id: 'name', label: 'Module Name', render: (r) => r.name, sortable: true },
    { id: 'status', label: 'Status', render: (r) => <StatusChip active={r.isActive} /> },
    {
      id: 'actions', label: 'Actions',
      render: (r) => (
        <Box sx={{ display: 'flex', gap: 0.5 }}>
          <Tooltip title="Edit"><IconButton size="small" onClick={() => openEdit(r)}><Edit fontSize="small" /></IconButton></Tooltip>
          <Tooltip title={r.isActive ? 'Deactivate' : 'Activate'}>
            <IconButton size="small" onClick={() => handleToggle(r)}><Switch checked={r.isActive} size="small" /></IconButton>
          </Tooltip>
        </Box>
      ),
    },
  ]

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h5" sx={{ fontWeight: 600 }}>Modules</Typography>
        <Button variant="contained" startIcon={<Add />} onClick={openCreate}>Create Module</Button>
      </Box>
      <Card>
        <DataTable columns={columns} rows={rows} total={total} page={page} rowsPerPage={rowsPerPage} searchValue={search} loading={loading}
          onPageChange={setPage} onRowsPerPageChange={(r) => { setRowsPerPage(r); setPage(0) }}
          onSearchChange={(v) => { setSearch(v); setPage(0) }} keyExtractor={(r) => r.id} emptyMessage="No modules found" />
      </Card>
      <DrawerForm open={formOpen} title={editing ? 'Edit Module' : 'Create Module'} onClose={() => setFormOpen(false)} onSubmit={handleSave} loading={saving}>
        <TextField fullWidth label="Module Name" value={name} onChange={(e) => setName(e.target.value)} margin="normal" required />
        <FormControlLabel control={<Switch checked={active} onChange={(e) => setActive(e.target.checked)} />} label="Active" sx={{ mt: 1 }} />
      </DrawerForm>
      <ConfirmDialog open={confirmOpen} title="Confirm" message="Are you sure?" onConfirm={confirmAction} onCancel={() => setConfirmOpen(false)} />
      {toast && (
        <Snackbar open autoHideDuration={3000} onClose={() => setToast(null)} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
          <Alert severity={toast.severity} variant="filled">{toast.message}</Alert>
        </Snackbar>
      )}
    </Box>
  )
}

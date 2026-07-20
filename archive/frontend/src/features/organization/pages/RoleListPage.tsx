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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stepper,
  Step,
  StepLabel,
} from '@mui/material'
import { Add } from '@mui/icons-material'
import DrawerForm from '@/components/dialogs/DrawerForm'
import ConfirmDialog from '@/components/dialogs/ConfirmDialog'
import DataTable, { type Column } from '@/components/data-table/DataTable'
import StatusChip from '@/components/common/StatusChip'
import { roles, departments } from '@/services/api/endpoints'

interface Role {
  id: string
  name: string
  departmentName?: string
  hierarchyLevel?: number
  isActive: boolean
  createdAt?: string
}

interface Department {
  id: string
  name: string
  hierarchyLevels: number
  isActive?: boolean
}

const steps = ['Select Department', 'Select Level', 'Enter Role Name']

export default function RoleListPage() {
  const [rows, setRows] = useState<Role[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  const [formOpen, setFormOpen] = useState(false)
  const [saving, setSaving] = useState(false)

  // Step form
  const [activeStep, setActiveStep] = useState(0)
  const [deptList, setDeptList] = useState<Department[]>([])
  const [selectedDept, setSelectedDept] = useState('')
  const [selectedLevel, setSelectedLevel] = useState(1)
  const [roleName, setRoleName] = useState('')
  const [maxLevels, setMaxLevels] = useState(1)

  const [confirmOpen, setConfirmOpen] = useState(false)
  const [confirmAction, setConfirmAction] = useState<() => void>(() => {})
  const [toast, setToast] = useState<{ severity: 'success' | 'error'; message: string } | null>(null)

  const fetch = useCallback(async () => {
    setLoading(true)
    try {
      const data = await roles.list({ page: page + 1, limit: rowsPerPage, search: search || undefined })
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

  const loadDepts = async () => {
    try {
      const data = await departments.list()
      setDeptList(Array.isArray(data) ? data : data.items ?? data.data ?? [])
    } catch {
      setDeptList([])
    }
  }

  const openCreate = async () => {
    setActiveStep(0)
    setSelectedDept('')
    setSelectedLevel(1)
    setRoleName('')
    setMaxLevels(1)
    await loadDepts()
    setFormOpen(true)
  }

  const handleNext = () => {
    if (activeStep === 0 && selectedDept) {
      const dept = deptList.find((d) => d.id === selectedDept)
      setMaxLevels(dept?.hierarchyLevels || 1)
      setSelectedLevel(1)
    }
    setActiveStep((prev) => Math.min(prev + 1, 2))
  }

  const handleBack = () => setActiveStep((prev) => Math.max(prev - 1, 0))

  const handleSave = async () => {
    if (!roleName.trim() || !selectedDept) return
    setSaving(true)
    try {
      await roles.create({
        name: roleName,
        departmentId: selectedDept,
        hierarchyLevel: selectedLevel,
      })
      setToast({ severity: 'success', message: 'Role created' })
      setFormOpen(false)
      fetch()
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to create role'
      setToast({ severity: 'error', message: Array.isArray(msg) ? msg[0] : msg })
    } finally {
      setSaving(false)
    }
  }

  const handleToggleStatus = (role: Role) => {
    setConfirmAction(() => async () => {
      try {
        await roles.update(role.id, { isActive: !role.isActive })
        setToast({ severity: 'success', message: `Role ${role.isActive ? 'deactivated' : 'activated'}` })
        fetch()
      } catch {
        setToast({ severity: 'error', message: 'Failed to update status' })
      }
      setConfirmOpen(false)
    })
    setConfirmOpen(true)
  }

  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <FormControl fullWidth margin="normal">
            <InputLabel>Department</InputLabel>
            <Select value={selectedDept} onChange={(e) => setSelectedDept(e.target.value)} label="Department">
              {deptList.filter((d) => d.isActive !== false).map((d) => (
                <MenuItem key={d.id} value={d.id}>{d.name} ({d.hierarchyLevels} levels)</MenuItem>
              ))}
            </Select>
          </FormControl>
        )
      case 1:
        return (
          <FormControl fullWidth margin="normal">
            <InputLabel>Hierarchy Level</InputLabel>
            <Select value={selectedLevel} onChange={(e) => setSelectedLevel(Number(e.target.value))} label="Hierarchy Level">
              {Array.from({ length: maxLevels }, (_, i) => (
                <MenuItem key={i + 1} value={i + 1}>
                  L{i + 1} {i === 0 ? '(Lowest)' : i === maxLevels - 1 ? '(Highest)' : ''}
                </MenuItem>
              ))}
            </Select>
            <Typography variant="caption" sx={{ mt: 1, color: 'text.secondary' }}>
              L1 = lowest employee, L{maxLevels} = highest authority
            </Typography>
          </FormControl>
        )
      case 2:
        return (
          <TextField
            fullWidth
            label="Role Name"
            value={roleName}
            onChange={(e) => setRoleName(e.target.value)}
            margin="normal"
            required
            autoFocus
          />
        )
    }
  }

  const columns: Column<Role>[] = [
    { id: 'name', label: 'Role', render: (r) => r.name, sortable: true },
    { id: 'department', label: 'Department', render: (r) => r.departmentName || '—' },
    { id: 'level', label: 'Hierarchy Level', render: (r) => r.hierarchyLevel ? `L${r.hierarchyLevel}` : '—' },
    { id: 'status', label: 'Status', render: (r) => <StatusChip active={r.isActive} /> },
    {
      id: 'actions',
      label: 'Actions',
      render: (r) => (
        <Box sx={{ display: 'flex', gap: 0.5 }}>
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
        <Typography variant="h5" sx={{ fontWeight: 600 }}>Role Master</Typography>
        <Button variant="contained" startIcon={<Add />} onClick={openCreate}>Create Role</Button>
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
          emptyMessage="No roles found"
        />
      </Card>

      <DrawerForm
        open={formOpen}
        title="Create Role"
        onClose={() => setFormOpen(false)}
        onSubmit={activeStep === 2 ? handleSave : undefined}
        loading={saving}
        submitLabel={activeStep === 2 ? 'Create' : 'Next'}
        width={500}
      >
        <Stepper activeStep={activeStep} sx={{ mb: 3 }}>
          {steps.map((s) => <Step key={s}><StepLabel>{s}</StepLabel></Step>)}
        </Stepper>

        {renderStepContent(activeStep)}

        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
          <Button disabled={activeStep === 0} onClick={handleBack}>Back</Button>
          {activeStep < 2 ? (
            <Button variant="contained" onClick={handleNext} disabled={activeStep === 0 && !selectedDept}>
              Next
            </Button>
          ) : null}
        </Box>
      </DrawerForm>

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

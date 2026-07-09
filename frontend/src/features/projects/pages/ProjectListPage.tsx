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
  Chip,
} from '@mui/material'
import { Add, Edit, Visibility } from '@mui/icons-material'
import ConfirmDialog from '@/components/dialogs/ConfirmDialog'
import DataTable, { type Column } from '@/components/data-table/DataTable'
import StatusChip from '@/components/common/StatusChip'
import {
  useProjects,
  useUpdateProject,
} from '@/features/projects/services/project.service'
import type { Project } from '@/features/projects/types/project.types'
import ProjectFormWizard from '@/features/projects/pages/ProjectFormWizard'
import ProjectDetailView from '@/features/projects/pages/ProjectDetailView'

export default function ProjectListPage() {
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [search, setSearch] = useState('')

  const [wizardOpen, setWizardOpen] = useState(false)
  const [editId, setEditId] = useState<string | undefined>()
  const [detailProject, setDetailProject] = useState<Project | null>(null)

  const [confirmOpen, setConfirmOpen] = useState(false)
  const [confirmAction, setConfirmAction] = useState<() => void>(() => {})
  const [toast, setToast] = useState<{ severity: 'success' | 'error'; message: string } | null>(null)

  const { data, isLoading } = useProjects({ page: page + 1, limit: rowsPerPage, search: search || undefined })
  const updateMut = useUpdateProject()

  const rows = data?.items ?? []
  const total = data?.total ?? 0

  const openCreate = () => {
    setEditId(undefined)
    setWizardOpen(true)
  }

  const openEdit = (project: Project) => {
    setEditId(project.id)
    setWizardOpen(true)
  }

  const handleToggleStatus = (project: Project) => {
    setConfirmAction(() => async () => {
      try {
        await updateMut.mutateAsync({ id: project.id, payload: { isActive: !project.isActive } })
        setToast({ severity: 'success', message: `Project ${project.isActive ? 'deactivated' : 'activated'}` })
      } catch {
        setToast({ severity: 'error', message: 'Failed to update status' })
      }
      setConfirmOpen(false)
    })
    setConfirmOpen(true)
  }

  const columns: Column<Project>[] = [
    { id: 'name', label: 'Project Name', render: (r) => r.name, sortable: true },
    { id: 'city', label: 'City', render: (r) => r.cityName || '—' },
    { id: 'zone', label: 'Zone', render: (r) => r.zoneName || '—' },
    { id: 'brand', label: 'Brand', render: (r) => r.extendedMetadata?.brand || r.brand || '—' },
    { id: 'phase', label: 'Phase', render: (r) => r.extendedMetadata?.phase || r.phase || '—' },
    { id: 'billing', label: 'Billing Entity', render: (r) => r.billingEntityName || '—' },
    {
      id: 'easebuzz',
      label: 'Easebuzz',
      render: (r) => {
        const val = r.extendedMetadata?.payment_gateway_easebuzz ?? r.paymentGatewayEasebuzz
        return val ? <Chip label="Enabled" color="success" size="small" variant="outlined" /> : <Chip label="Disabled" size="small" variant="outlined" />
      },
    },
    {
      id: 'rera',
      label: 'RERA',
      render: (r) => {
        const val = r.extendedMetadata?.is_rera_incentive_eligible ?? r.isReraIncentiveEligible
        return val ? <Chip label="Eligible" color="info" size="small" variant="outlined" /> : <Chip label="N/A" size="small" variant="outlined" />
      },
    },
    { id: 'status', label: 'Status', render: (r) => <StatusChip active={r.isActive} /> },
    {
      id: 'actions',
      label: 'Actions',
      render: (r) => (
        <Box sx={{ display: 'flex', gap: 0.5 }}>
          <Tooltip title="View Details">
            <IconButton size="small" onClick={() => setDetailProject(r)}><Visibility fontSize="small" /></IconButton>
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
        <Typography variant="h5" sx={{ fontWeight: 600 }}>Projects</Typography>
        <Button variant="contained" startIcon={<Add />} onClick={openCreate}>Create Project</Button>
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
          emptyMessage="No projects found"
          searchPlaceholder="Search projects..."
        />
      </Card>

      <ProjectFormWizard
        open={wizardOpen}
        onClose={() => { setWizardOpen(false); setEditId(undefined) }}
        editId={editId}
      />

      {detailProject && (
        <ProjectDetailView
          project={detailProject}
          open={!!detailProject}
          onClose={() => setDetailProject(null)}
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

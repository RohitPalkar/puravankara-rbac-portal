import { useState } from 'react'
import { Box, Button, Typography, Card, IconButton, Tooltip } from '@mui/material'
import { Add, Edit, Delete } from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'
import DataTable, { type Column } from '@/components/data-table/DataTable'
import StatusChip from '@/components/common/StatusChip'
import ConfirmDialog from '@/components/dialogs/ConfirmDialog'
import { useWorkflows, useDeleteWorkflow } from '@/features/workflows/services/workflow.service'
import type { Workflow } from '@/features/workflows/types/workflow.types'

export default function WorkflowListPage() {
  const navigate = useNavigate()
  const { data, isLoading } = useWorkflows()
  const deleteMut = useDeleteWorkflow()
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const workflows = data ?? []

  const handleDelete = async () => {
    if (!deleteId) return
    await deleteMut.mutateAsync(deleteId)
    setConfirmOpen(false)
    setDeleteId(null)
  }

  const columns: Column<Workflow>[] = [
    { id: 'name', label: 'Name', render: (r) => r.name, sortable: true },
    { id: 'module', label: 'Module', render: (r) => r.module },
    { id: 'entityType', label: 'Entity Type', render: (r) => r.entityType },
    { id: 'steps', label: 'Steps', render: (r) => `${r.steps?.length ?? 0}` },
    { id: 'status', label: 'Status', render: (r) => <StatusChip active={r.isActive} /> },
    {
      id: 'actions',
      label: 'Actions',
      render: (r) => (
        <Box sx={{ display: 'flex', gap: 0.5 }}>
          <Tooltip title="Edit Steps">
            <IconButton size="small" onClick={() => navigate(`/workflows/builder/${r.id}`)}>
              <Edit fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete">
            <IconButton size="small" onClick={() => { setDeleteId(r.id); setConfirmOpen(true) }}>
              <Delete fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      ),
    },
  ]

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h5" sx={{ fontWeight: 600 }}>Workflows</Typography>
        <Button variant="contained" startIcon={<Add />} onClick={() => navigate('/workflows/builder')}>
          Create Workflow
        </Button>
      </Box>

      <Card>
        <DataTable
          columns={columns}
          rows={workflows}
          total={workflows.length}
          page={0}
          rowsPerPage={workflows.length || 10}
          loading={isLoading}
          onPageChange={() => {}}
          onRowsPerPageChange={() => {}}
          keyExtractor={(r) => r.id}
          emptyMessage="No workflows created yet"
        />
      </Card>

      <ConfirmDialog
        open={confirmOpen}
        title="Delete Workflow"
        message="Are you sure you want to delete this workflow?"
        onConfirm={handleDelete}
        onCancel={() => { setConfirmOpen(false); setDeleteId(null) }}
      />
    </Box>
  )
}

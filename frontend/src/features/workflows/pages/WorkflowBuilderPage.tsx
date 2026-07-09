import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Box, Typography, Card, TextField, Button, Snackbar, Alert,
  CircularProgress, FormControl, InputLabel, Select, MenuItem,
} from '@mui/material'
import WorkflowStepBuilder from '@/features/workflows/components/WorkflowStepBuilder'
import {
  useWorkflow, useCreateWorkflow, useUpdateWorkflow,
  useWorkflowSteps, useSaveWorkflowSteps,
} from '@/features/workflows/services/workflow.service'
import { useDepartmentsList, useRolesByDepartment } from '@/features/users/services/user.service'

interface StepEntry {
  key: string
  roleId: string
  approvalType: 'ANY' | 'ALL'
}

export default function WorkflowBuilderPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const isEdit = !!id

  const { data: existing } = useWorkflow(id)
  const createMut = useCreateWorkflow()
  const updateMut = useUpdateWorkflow()
  const saveStepsMut = useSaveWorkflowSteps()
  const { data: existingSteps } = useWorkflowSteps(id)

  const { data: departments } = useDepartmentsList()
  const [departmentId, setDepartmentId] = useState('')
  const { data: roles } = useRolesByDepartment(departmentId || undefined)

  const [name, setName] = useState('')
  const [module, setModule] = useState('')
  const [entityType, setEntityType] = useState('')
  const [steps, setSteps] = useState<StepEntry[]>([])
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [toast, setToast] = useState<{ severity: 'success' | 'error'; message: string } | null>(null)

  const allRoles = roles ?? []

  // Prefill on edit
  useEffect(() => {
    if (existing) {
      setName(existing.name || '')
      setModule(existing.module || '')
      setEntityType(existing.entityType || '')
    }
  }, [existing])

  useEffect(() => {
    if (existingSteps && existingSteps.length > 0) {
      setSteps(
        existingSteps.map((s) => ({
          key: `step-${s.id}`,
          roleId: s.roleId,
          approvalType: s.approvalType,
        })),
      )
    }
  }, [existingSteps])

  const handleSave = async () => {
    const errs: Record<string, string> = {}
    if (!name.trim()) errs.name = 'Name is required'
    if (!module.trim()) errs.module = 'Module is required'

    if (Object.keys(errs).length > 0) {
      setErrors(errs)
      return
    }

    setSaving(true)
    try {
      let workflowId = id

      if (isEdit && id) {
        await updateMut.mutateAsync({ id, payload: { name: name.trim(), module: module.trim(), entityType: entityType.trim() } })
      } else {
        const created = await createMut.mutateAsync({ name: name.trim(), module: module.trim(), entityType: entityType.trim() })
        workflowId = created.id
      }

      if (workflowId && steps.length > 0) {
        await saveStepsMut.mutateAsync({
          workflowId,
          steps: steps.map((s) => ({ roleId: s.roleId, approvalType: s.approvalType })),
        })
      }

      setToast({ severity: 'success', message: isEdit ? 'Workflow updated' : 'Workflow created' })
      navigate('/workflows')
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to save workflow'
      setToast({ severity: 'error', message: Array.isArray(msg) ? msg[0] : msg })
    } finally {
      setSaving(false)
    }
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h5" sx={{ fontWeight: 600 }}>
          {isEdit ? 'Edit Workflow' : 'Create Workflow'}
        </Typography>
        <Button onClick={() => navigate('/workflows')}>Back to List</Button>
      </Box>

      <Card sx={{ p: 2, mb: 2 }}>
        <Typography variant="subtitle2" sx={{ mb: 2 }}>Workflow Details</Typography>

        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <TextField
            size="small"
            label="Workflow Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            error={!!errors.name}
            helperText={errors.name}
            sx={{ minWidth: 250 }}
          />
          <TextField
            size="small"
            label="Module"
            value={module}
            onChange={(e) => setModule(e.target.value)}
            required
            error={!!errors.module}
            helperText={errors.module}
            sx={{ minWidth: 200 }}
          />
          <TextField
            size="small"
            label="Entity Type"
            value={entityType}
            onChange={(e) => setEntityType(e.target.value)}
            sx={{ minWidth: 200 }}
          />
        </Box>
      </Card>

      <Card sx={{ p: 2, mb: 2 }}>
        <FormControl size="small" sx={{ minWidth: 220, mb: 2 }}>
          <InputLabel>Department (for role selection)</InputLabel>
          <Select value={departmentId} onChange={(e) => setDepartmentId(e.target.value)} label="Department (for role selection)">
            {departments?.map((d) => <MenuItem key={d.id} value={d.id}>{d.name}</MenuItem>)}
          </Select>
        </FormControl>

        <WorkflowStepBuilder
          steps={steps}
          roles={allRoles}
          onChange={setSteps}
        />
      </Card>

      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
        <Button onClick={() => navigate('/workflows')}>Cancel</Button>
        <Button variant="contained" onClick={handleSave} disabled={saving}>
          {saving ? <CircularProgress size={20} color="inherit" /> : isEdit ? 'Update' : 'Create'}
        </Button>
      </Box>

      {toast && (
        <Snackbar open autoHideDuration={3000} onClose={() => setToast(null)} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
          <Alert severity={toast.severity} variant="filled">{toast.message}</Alert>
        </Snackbar>
      )}
    </Box>
  )
}

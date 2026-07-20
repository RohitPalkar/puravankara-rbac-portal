import { Box, Button, IconButton, Typography, FormControl, InputLabel, Select, MenuItem, Chip } from '@mui/material'
import { Add, Delete, ArrowUpward, ArrowDownward } from '@mui/icons-material'

interface StepEntry {
  key: string
  roleId: string
  approvalType: 'ANY' | 'ALL'
}

interface Props {
  steps: StepEntry[]
  roles: { id: string; name: string }[]
  onChange: (steps: StepEntry[]) => void
}

export default function WorkflowStepBuilder({ steps, roles, onChange }: Props) {
  const addStep = () => {
    const newKey = `step-${Date.now()}`
    onChange([...steps, { key: newKey, roleId: '', approvalType: 'ANY' }])
  }

  const removeStep = (key: string) => {
    onChange(steps.filter((s) => s.key !== key))
  }

  const updateStep = (key: string, field: 'roleId' | 'approvalType', value: string) => {
    onChange(steps.map((s) => (s.key === key ? { ...s, [field]: value } : s)))
  }

  const moveStep = (index: number, direction: -1 | 1) => {
    const next = [...steps]
    const target = index + direction
    if (target < 0 || target >= next.length) return
    ;[next[index], next[target]] = [next[target], next[index]]
    onChange(next)
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
        <Typography variant="subtitle2">Approval Steps</Typography>
        <Button size="small" startIcon={<Add />} onClick={addStep}>Add Step</Button>
      </Box>

      {steps.length === 0 && (
        <Typography variant="body2" sx={{ color: 'text.secondary', fontStyle: 'italic', py: 2, textAlign: 'center' }}>
          No steps configured. Click "Add Step" to define the approval chain.
        </Typography>
      )}

      {steps.map((step, index) => (
        <Box
          key={step.key}
          sx={{
            display: 'flex', gap: 1, alignItems: 'center', mb: 1, p: 1,
            border: '1px solid', borderColor: 'divider', borderRadius: 1,
          }}
        >
          <Chip label={`Step ${index + 1}`} size="small" color="primary" variant="outlined" sx={{ minWidth: 60 }} />

          <FormControl size="small" sx={{ minWidth: 180 }}>
            <InputLabel>Role</InputLabel>
            <Select
              value={step.roleId}
              onChange={(e) => updateStep(step.key, 'roleId', e.target.value)}
              label="Role"
            >
              {roles.map((r) => <MenuItem key={r.id} value={r.id}>{r.name}</MenuItem>)}
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 100 }}>
            <InputLabel>Type</InputLabel>
            <Select
              value={step.approvalType}
              onChange={(e) => updateStep(step.key, 'approvalType', e.target.value)}
              label="Type"
            >
              <MenuItem value="ANY">ANY</MenuItem>
              <MenuItem value="ALL">ALL</MenuItem>
            </Select>
          </FormControl>

          <IconButton size="small" disabled={index === 0} onClick={() => moveStep(index, -1)}>
            <ArrowUpward fontSize="small" />
          </IconButton>
          <IconButton size="small" disabled={index === steps.length - 1} onClick={() => moveStep(index, 1)}>
            <ArrowDownward fontSize="small" />
          </IconButton>
          <IconButton size="small" color="error" onClick={() => removeStep(step.key)}>
            <Delete fontSize="small" />
          </IconButton>
        </Box>
      ))}
    </Box>
  )
}

import { useEffect } from 'react'
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Chip,
  CircularProgress,
  Typography,
  OutlinedInput,
} from '@mui/material'
import { useZonesList, useDepartmentsList, useRolesByDepartment } from '@/features/users/services/user.service'

interface Props {
  zoneIds: string[]
  departmentId: string
  primaryRoleId: string
  secondaryRoleIds: string[]
  errors: Record<string, string>
  onChange: (field: string, value: string | string[]) => void
}

export default function UserOrganizationStep({
  zoneIds, departmentId, primaryRoleId, secondaryRoleIds, errors, onChange,
}: Props) {
  const { data: zones, isLoading: zonesLoading } = useZonesList()
  const { data: departments, isLoading: deptLoading } = useDepartmentsList()
  const { data: roles, isLoading: rolesLoading } = useRolesByDepartment(departmentId || undefined)

  const filteredRoles = roles ?? []
  const primaryRoleOptions = filteredRoles
  const secondaryRoleOptions = filteredRoles.filter((r) => r.id !== primaryRoleId)

  // Clear primary role when department changes
  useEffect(() => {
    if (departmentId) {
      onChange('primaryRoleId', '')
      onChange('secondaryRoleIds', [])
    }
  }, [departmentId])

  return (
    <>
      <FormControl fullWidth margin="normal" required error={!!errors.zoneIds}>
        <InputLabel>Zone Access</InputLabel>
        <Select
          multiple
          value={zoneIds}
          onChange={(e) => onChange('zoneIds', e.target.value as string[])}
          input={<OutlinedInput label="Zone Access" />}
          renderValue={(selected) => (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
              {selected.map((id) => {
                const z = zones?.find((z) => z.id === id)
                return <Chip key={id} label={z?.name || id} size="small" />
              })}
            </Box>
          )}
        >
          {zonesLoading ? (
            <MenuItem disabled><CircularProgress size={20} /></MenuItem>
          ) : (
            zones?.map((z) => (
              <MenuItem key={z.id} value={z.id}>{z.name}</MenuItem>
            ))
          )}
        </Select>
      </FormControl>

      <FormControl fullWidth margin="normal" required error={!!errors.departmentId}>
        <InputLabel>Department</InputLabel>
        <Select
          value={departmentId}
          onChange={(e) => onChange('departmentId', e.target.value)}
          label="Department"
        >
          {deptLoading ? (
            <MenuItem disabled><CircularProgress size={20} /></MenuItem>
          ) : (
            departments?.map((d) => (
              <MenuItem key={d.id} value={d.id}>{d.name}</MenuItem>
            ))
          )}
        </Select>
      </FormControl>

      <FormControl fullWidth margin="normal" required error={!!errors.primaryRoleId}>
        <InputLabel>Primary Role</InputLabel>
        <Select
          value={primaryRoleId}
          onChange={(e) => onChange('primaryRoleId', e.target.value)}
          label="Primary Role"
          disabled={!departmentId}
        >
          {rolesLoading ? (
            <MenuItem disabled><CircularProgress size={20} /></MenuItem>
          ) : (
            primaryRoleOptions.map((r) => (
              <MenuItem key={r.id} value={r.id}>{r.name}</MenuItem>
            ))
          )}
        </Select>
        {!departmentId && (
          <Typography variant="caption" sx={{ color: 'text.secondary', mt: 0.5, display: 'block' }}>
            Select a department first
          </Typography>
        )}
      </FormControl>

      <FormControl fullWidth margin="normal">
        <InputLabel>Secondary Roles (optional)</InputLabel>
        <Select
          multiple
          value={secondaryRoleIds}
          onChange={(e) => onChange('secondaryRoleIds', e.target.value as string[])}
          input={<OutlinedInput label="Secondary Roles (optional)" />}
          disabled={!departmentId}
          renderValue={(selected) => (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
              {selected.map((id) => {
                const r = roles?.find((role) => role.id === id)
                return <Chip key={id} label={r?.name || id} size="small" />
              })}
            </Box>
          )}
        >
          {secondaryRoleOptions.map((r) => (
            <MenuItem key={r.id} value={r.id}>{r.name}</MenuItem>
          ))}
        </Select>
      </FormControl>
    </>
  )
}

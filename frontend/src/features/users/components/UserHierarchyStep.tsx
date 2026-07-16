import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Typography,
  Divider,
} from '@mui/material'
import { useUsersByDepartment } from '@/features/users/services/user.service'

interface Props {
  departmentId: string
  primaryRoleId: string
  reportingManagerId: string
  reportingHeadId: string
  errors: Record<string, string>
  onChange: (field: string, value: string) => void
}

export default function UserHierarchyStep({
  departmentId, primaryRoleId, reportingManagerId, reportingHeadId, errors, onChange,
}: Props) {
  const { data: deptUsers, isLoading } = useUsersByDepartment(departmentId || undefined)

  // Fetch only when department & role are selected
  const showHierarchy = !!departmentId && !!primaryRoleId

  const userOptions = (deptUsers ?? []).filter((u) => u.isActive)

  return (
    <>
      <Typography variant="subtitle2" sx={{ mb: 1 }}>Reporting Hierarchy</Typography>
      <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
        Select the managers this user reports to. Only users in the same department are shown.
      </Typography>

      {!showHierarchy ? (
        <Typography variant="body2" sx={{ color: 'text.secondary', fontStyle: 'italic' }}>
          Select a department and primary role first to configure reporting lines.
        </Typography>
      ) : (
        <>
          <FormControl fullWidth margin="normal" error={!!errors.reportingManagerId}>
            <InputLabel>Reporting Manager</InputLabel>
            <Select
              value={reportingManagerId}
              onChange={(e) => onChange('reportingManagerId', e.target.value)}
              label="Reporting Manager"
            >
              {isLoading ? (
                <MenuItem disabled><CircularProgress size={20} /></MenuItem>
              ) : userOptions.length === 0 ? (
                <MenuItem disabled><em>No users in this department</em></MenuItem>
              ) : (
                userOptions.map((u) => (
                  <MenuItem key={u.id} value={u.id}>
                    {u.name} ({u.employeeId}) — {u.primaryRoleName || 'No role'}
                  </MenuItem>
                ))
              )}
            </Select>
          </FormControl>

          <FormControl fullWidth margin="normal" error={!!errors.reportingHeadId}>
            <InputLabel>Reporting Head</InputLabel>
            <Select
              value={reportingHeadId}
              onChange={(e) => onChange('reportingHeadId', e.target.value)}
              label="Reporting Head"
            >
              {isLoading ? (
                <MenuItem disabled><CircularProgress size={20} /></MenuItem>
              ) : userOptions.length === 0 ? (
                <MenuItem disabled><em>No users in this department</em></MenuItem>
              ) : (
                userOptions.map((u) => (
                  <MenuItem key={u.id} value={u.id}>
                    {u.name} ({u.employeeId}) — {u.primaryRoleName || 'No role'}
                  </MenuItem>
                ))
              )}
            </Select>
          </FormControl>
        </>
      )}

      <Divider sx={{ my: 2 }} />

      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
        Hierarchy levels are determined by your role's position within the department.
        The system will validate that reporting users belong to the same department
        with higher hierarchy levels.
      </Typography>
    </>
  )
}

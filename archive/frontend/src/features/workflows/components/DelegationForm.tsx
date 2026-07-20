import { Box, TextField, Typography } from '@mui/material'

interface Props {
  fromUserId: string
  delegateUserId: string
  startDate: string
  endDate: string
  errors: Record<string, string>
  onChange: (field: string, value: string) => void
  users: { id: string; name: string; employeeId: string }[]
}

export default function DelegationForm({ fromUserId, delegateUserId, startDate, endDate, errors, onChange, users }: Props) {
  return (
    <Box>
      <Typography variant="subtitle2" sx={{ mb: 1 }}>Delegation Details</Typography>

      <TextField
        fullWidth
        select
        label="From User"
        value={fromUserId}
        onChange={(e) => onChange('fromUserId', e.target.value)}
        margin="normal"
        required
        error={!!errors.fromUserId}
        helperText={errors.fromUserId}
        slotProps={{ select: { native: true } }}
      >
        <option value="">Select user</option>
        {users.map((u) => (
          <option key={u.id} value={u.id}>{u.name} ({u.employeeId})</option>
        ))}
      </TextField>

      <TextField
        fullWidth
        select
        label="Delegate To"
        value={delegateUserId}
        onChange={(e) => onChange('delegateUserId', e.target.value)}
        margin="normal"
        required
        error={!!errors.delegateUserId}
        helperText={errors.delegateUserId || 'Cannot delegate to self'}
        slotProps={{ select: { native: true } }}
      >
        <option value="">Select user</option>
        {users
          .filter((u) => u.id !== fromUserId)
          .map((u) => (
            <option key={u.id} value={u.id}>{u.name} ({u.employeeId})</option>
          ))}
      </TextField>

      <TextField
        fullWidth
        label="Start Date"
        type="date"
        value={startDate}
        onChange={(e) => onChange('startDate', e.target.value)}
        margin="normal"
        required
        error={!!errors.startDate}
        helperText={errors.startDate}
        slotProps={{ inputLabel: { shrink: true } }}
      />

      <TextField
        fullWidth
        label="End Date"
        type="date"
        value={endDate}
        onChange={(e) => onChange('endDate', e.target.value)}
        margin="normal"
        required
        error={!!errors.endDate}
        helperText={errors.endDate}
        slotProps={{ inputLabel: { shrink: true } }}
      />
    </Box>
  )
}

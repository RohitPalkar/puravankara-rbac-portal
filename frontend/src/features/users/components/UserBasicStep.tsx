import { TextField, FormControl, InputLabel, Select, MenuItem } from '@mui/material'

interface Props {
  name: string
  email: string
  phone: string
  employmentStatus: string
  errors: Record<string, string>
  onChange: (field: string, value: string) => void
}

const statusOptions = ['Permanent', 'Contract', 'Serving Notice']

export default function UserBasicStep({ name, email, phone, employmentStatus, errors, onChange }: Props) {
  return (
    <>
      <TextField
        fullWidth
        label="Employee Name"
        value={name}
        onChange={(e) => onChange('name', e.target.value)}
        margin="normal"
        required
        error={!!errors.name}
        helperText={errors.name}
      />

      <TextField
        fullWidth
        label="Email"
        type="email"
        value={email}
        onChange={(e) => onChange('email', e.target.value)}
        margin="normal"
        required
        error={!!errors.email}
        helperText={errors.email}
      />

      <TextField
        fullWidth
        label="Mobile Number"
        value={phone}
        onChange={(e) => onChange('phone', e.target.value)}
        margin="normal"
        error={!!errors.phone}
        helperText={errors.phone || 'Optional'}
      />

      <FormControl fullWidth margin="normal" required error={!!errors.employmentStatus}>
        <InputLabel>Employment Status</InputLabel>
        <Select
          value={employmentStatus}
          onChange={(e) => onChange('employmentStatus', e.target.value)}
          label="Employment Status"
        >
          {statusOptions.map((s) => (
            <MenuItem key={s} value={s}>{s}</MenuItem>
          ))}
        </Select>
      </FormControl>
    </>
  )
}

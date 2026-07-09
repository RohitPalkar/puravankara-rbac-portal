import { Checkbox, FormControlLabel } from '@mui/material'

interface Props {
  label: string
  checked: boolean
  indeterminate?: boolean
  disabled?: boolean
  onChange: () => void
}

export default function PermissionCheckbox({ label, checked, indeterminate, disabled, onChange }: Props) {
  return (
    <FormControlLabel
      control={
        <Checkbox
          checked={checked}
          indeterminate={indeterminate}
          disabled={disabled}
          onChange={onChange}
          size="small"
        />
      }
      label={label}
      sx={{ '& .MuiTypography-root': { fontSize: '0.875rem' } }}
    />
  )
}

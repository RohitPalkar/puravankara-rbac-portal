import { Chip } from '@mui/material'

interface Props {
  active: boolean
}

export default function StatusChip({ active }: Props) {
  return (
    <Chip
      label={active ? 'Active' : 'Inactive'}
      color={active ? 'success' : 'default'}
      size="small"
      variant="outlined"
    />
  )
}

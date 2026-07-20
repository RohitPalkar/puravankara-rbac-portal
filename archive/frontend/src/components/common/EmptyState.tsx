import { Box, Typography } from '@mui/material'
import InboxIcon from '@mui/icons-material/Inbox'

interface Props {
  message?: string
}

export default function EmptyState({ message = 'No records found' }: Props) {
  return (
    <Box sx={{ textAlign: 'center', py: 6 }}>
      <InboxIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
      <Typography variant="body1" sx={{ color: 'text.secondary' }}>
        {message}
      </Typography>
    </Box>
  )
}

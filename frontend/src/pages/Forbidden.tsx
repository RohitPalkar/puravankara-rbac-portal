import { useNavigate } from 'react-router-dom'
import { Box, Typography, Button } from '@mui/material'

export default function Forbidden() {
  const navigate = useNavigate()
  return (
    <Box sx={{ textAlign: 'center', py: 8 }}>
      <Typography variant="h1" sx={{ fontWeight: 700, color: 'text.disabled', fontSize: '6rem' }}>
        403
      </Typography>
      <Typography variant="h5" sx={{ mb: 1 }}>
        Access Denied
      </Typography>
      <Typography variant="body1" sx={{ color: 'text.secondary', mb: 3 }}>
        You do not have permission to access this page.
      </Typography>
      <Button variant="contained" onClick={() => navigate('/dashboard')}>
        Back to Dashboard
      </Button>
    </Box>
  )
}

import { useNavigate } from 'react-router-dom'
import { Box, Typography, Button } from '@mui/material'

export default function NotFound() {
  const navigate = useNavigate()
  return (
    <Box sx={{ textAlign: 'center', py: 8 }}>
      <Typography variant="h1" sx={{ fontWeight: 700, color: 'text.disabled', fontSize: '6rem' }}>
        404
      </Typography>
      <Typography variant="h5" sx={{ mb: 1 }}>
        Page Not Found
      </Typography>
      <Typography variant="body1" sx={{ color: 'text.secondary', mb: 3 }}>
        The page you are looking for does not exist.
      </Typography>
      <Button variant="contained" onClick={() => navigate('/dashboard')}>
        Back to Dashboard
      </Button>
    </Box>
  )
}

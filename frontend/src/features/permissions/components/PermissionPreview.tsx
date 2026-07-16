import {
  Drawer,
  Box,
  Typography,
  IconButton,
  Divider,
} from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import type { PermissionMatrix } from '@/features/permissions/types/permission.types'

interface Props {
  open: boolean
  onClose: () => void
  matrix: PermissionMatrix | null
}

export default function PermissionPreview({ open, onClose, matrix }: Props) {
  const formatted = matrix ? JSON.stringify(matrix, null, 2) : ''

  return (
    <Drawer anchor="right" open={open} onClose={onClose}>
      <Box sx={{ width: 420, display: 'flex', flexDirection: 'column', height: '100%' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', px: 2, py: 1.5 }}>
          <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 600 }}>
            Permission JSON Preview
          </Typography>
          <IconButton onClick={onClose} size="small"><CloseIcon /></IconButton>
        </Box>
        <Divider />
        <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
          <Box
            component="pre"
            sx={{
              fontFamily: 'monospace',
              fontSize: '0.75rem',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
              bgcolor: 'grey.100',
              p: 2,
              borderRadius: 1,
              m: 0,
            }}
          >
            {formatted || 'No permissions configured'}
          </Box>
        </Box>
      </Box>
    </Drawer>
  )
}

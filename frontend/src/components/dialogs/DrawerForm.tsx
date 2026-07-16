import type { ReactNode } from 'react'
import {
  Drawer,
  Box,
  Typography,
  IconButton,
  Divider,
  Button,
  CircularProgress,
} from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'

interface Props {
  open: boolean
  title: string
  children: ReactNode
  onClose: () => void
  onSubmit?: () => void
  submitLabel?: string
  loading?: boolean
  width?: number
}

export default function DrawerForm({
  open,
  title,
  children,
  onClose,
  onSubmit,
  submitLabel = 'Save',
  loading,
  width = 500,
}: Props) {
  return (
    <Drawer anchor="right" open={open} onClose={onClose}>
      <Box sx={{ width, display: 'flex', flexDirection: 'column', height: '100%' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', px: 2, py: 1.5 }}>
          <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 600 }}>
            {title}
          </Typography>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
        <Divider />
        <Box sx={{ flex: 1, overflow: 'auto', px: 2, py: 2 }}>{children}</Box>
        {onSubmit && (
          <>
            <Divider />
            <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end', px: 2, py: 1.5 }}>
              <Button onClick={onClose} disabled={loading}>
                Cancel
              </Button>
              <Button onClick={onSubmit} variant="contained" disabled={loading}>
                {loading ? <CircularProgress size={20} color="inherit" /> : submitLabel}
              </Button>
            </Box>
          </>
        )}
      </Box>
    </Drawer>
  )
}

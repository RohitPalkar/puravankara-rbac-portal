import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  IconButton,
  Avatar,
  Tooltip,
  Menu,
  MenuItem,
  Divider,
  ListItemIcon,
  Badge,
} from '@mui/material'
import {
  Logout,
  Person,
  NotificationsOutlined,
  Menu as MenuIcon,
} from '@mui/icons-material'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/stores/auth.store'
import { usePermissionStore } from '@/stores/permission.store'

interface HeaderProps {
  onToggleSidebar: () => void
}

export default function Header({ onToggleSidebar }: HeaderProps) {
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()
  const resetPermissions = usePermissionStore((s) => s.reset)
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)

  const handleMenuOpen = (e: React.MouseEvent<HTMLElement>) => setAnchorEl(e.currentTarget)
  const handleMenuClose = () => setAnchorEl(null)

  const handleLogout = async () => {
    handleMenuClose()
    await logout()
    resetPermissions()
    navigate('/login', { replace: true })
  }

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{ bgcolor: 'white', borderBottom: '1px solid', borderColor: 'divider' }}
    >
      <Toolbar>
        <IconButton
          edge="start"
          onClick={onToggleSidebar}
          sx={{ mr: 1, display: { md: 'none' } }}
        >
          <MenuIcon />
        </IconButton>

        <Typography variant="h6" sx={{ color: 'primary.main', fontWeight: 700, flexGrow: 1 }}>
          RBAC Admin
        </Typography>

        <Tooltip title="Notifications">
          <IconButton size="small" sx={{ mr: 1 }}>
            <Badge badgeContent={0} color="error">
              <NotificationsOutlined />
            </Badge>
          </IconButton>
        </Tooltip>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box sx={{ textAlign: 'right', display: { xs: 'none', sm: 'block' } }}>
            <Typography variant="body2" sx={{ fontWeight: 600, lineHeight: 1.2 }}>
              {user?.name || 'Admin'}
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              {user?.role || ''}
            </Typography>
          </Box>
          <Tooltip title="Account">
            <IconButton onClick={handleMenuOpen} size="small">
              <Avatar sx={{ width: 34, height: 34, bgcolor: 'primary.main', fontSize: 14 }}>
                {(user?.name || 'A').charAt(0).toUpperCase()}
              </Avatar>
            </IconButton>
          </Tooltip>
        </Box>

        <Menu
          anchorEl={anchorEl}
          open={!!anchorEl}
          onClose={handleMenuClose}
          transformOrigin={{ horizontal: 'right', vertical: 'top' }}
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          slotProps={{ paper: { sx: { minWidth: 180, mt: 1 } } }}
        >
          <MenuItem disabled>
            <ListItemIcon><Person fontSize="small" /></ListItemIcon>
            {user?.email || ''}
          </MenuItem>
          <Divider />
          <MenuItem onClick={handleLogout}>
            <ListItemIcon><Logout fontSize="small" /></ListItemIcon>
            Logout
          </MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  )
}

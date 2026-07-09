import { useLocation, useNavigate } from 'react-router-dom'
import {
  Box,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Collapse,
  Drawer,
  Toolbar,
  Divider,
} from '@mui/material'
import {
  Dashboard as DashboardIcon,
  People,
  Business,
  Assignment,
  AccountTree,
  Description,
  ExpandLess,
  ExpandMore,
  Lock,
  HowToReg,
} from '@mui/icons-material'
import { useState } from 'react'

interface NavItem {
  label: string
  icon: React.ReactNode
  path?: string
  children?: { label: string; path: string }[]
}

const superAdminNav: NavItem[] = [
  { label: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
  {
    label: 'Master Management',
    icon: <Business />,
    children: [
      { label: 'Zone Master', path: '/master/geography' },
      { label: 'Department Master', path: '/master/organization' },
      { label: 'Role Master', path: '/master/roles' },
    ],
  },
  {
    label: 'Product Configuration',
    icon: <AccountTree />,
    children: [
      { label: 'Modules', path: '/product-config/modules' },
      { label: 'Sub Modules', path: '/product-config/sub-modules' },
      { label: 'Actions', path: '/product-config/actions' },
    ],
  },
  { label: 'Users', icon: <People />, path: '/users' },
  { label: 'Projects', icon: <Assignment />, path: '/projects' },
  {
    label: 'Permission Management',
    icon: <Lock />,
    children: [
      { label: 'Role Permissions', path: '/permissions/roles' },
      { label: 'User Permissions', path: '/permissions/users' },
    ],
  },
  {
    label: 'Workflow Management',
    icon: <HowToReg />,
    children: [
      { label: 'Workflows', path: '/workflows' },
      { label: 'My Approvals', path: '/approvals/inbox' },
      { label: 'Submitted Requests', path: '/approvals/history' },
      { label: 'Delegations', path: '/delegations' },
    ],
  },
  {
    label: 'Operations',
    icon: <Description />,
    children: [
      { label: 'Audit Logs', path: '/audit' },
    ],
  },
]

const DRAWER_WIDTH = 270

interface SidebarProps {
  mobileOpen: boolean
  onClose: () => void
}

export default function Sidebar({ mobileOpen, onClose }: SidebarProps) {
  const location = useLocation()
  const navigate = useNavigate()
  const [expanded, setExpanded] = useState<string[]>(['Master Management', 'Product Configuration', 'Permission Management', 'Workflow Management', 'Operations'])

  const toggleExpand = (label: string) => {
    setExpanded((prev) =>
      prev.includes(label) ? prev.filter((l) => l !== label) : [...prev, label],
    )
  }

  const isActive = (path?: string) => (path ? location.pathname.startsWith(path) : false)
  const isChildActive = (children: { path: string }[]) =>
    children.some((c) => location.pathname.startsWith(c.path))

  const renderNav = (items: NavItem[]) => (
    <List component="nav" sx={{ px: 1, pt: 1 }}>
      {items.map((item) => {
        if (item.children) {
          const open = expanded.includes(item.label) || isChildActive(item.children)
          return (
            <Box key={item.label}>
              <ListItemButton
                onClick={() => toggleExpand(item.label)}
                selected={isChildActive(item.children)}
                sx={{ borderRadius: 1, mb: 0.3 }}
              >
                <ListItemIcon sx={{ minWidth: 36 }}>{item.icon}</ListItemIcon>
                <ListItemText
                  primary={item.label}
                  sx={{ '& .MuiListItemText-primary': { fontSize: '0.9rem', fontWeight: 500 } }}
                />
                {open ? <ExpandLess /> : <ExpandMore />}
              </ListItemButton>
              <Collapse in={open}>
                <List component="div" disablePadding>
                  {item.children.map((child) => (
                    <ListItemButton
                      key={child.path}
                      selected={location.pathname === child.path}
                      onClick={() => {
                        navigate(child.path)
                        onClose()
                      }}
                      sx={{ pl: 5, borderRadius: 1, mb: 0.2 }}
                    >
                      <ListItemText
                        primary={child.label}
                        sx={{ '& .MuiListItemText-primary': { fontSize: '0.85rem' } }}
                      />
                    </ListItemButton>
                  ))}
                </List>
              </Collapse>
            </Box>
          )
        }
        return (
          <ListItemButton
            key={item.label}
            selected={isActive(item.path)}
            onClick={() => {
              if (item.path) navigate(item.path)
              onClose()
            }}
            sx={{ borderRadius: 1, mb: 0.3 }}
          >
            <ListItemIcon sx={{ minWidth: 36 }}>{item.icon}</ListItemIcon>
            <ListItemText
              primary={item.label}
              sx={{ '& .MuiListItemText-primary': { fontSize: '0.9rem', fontWeight: 500 } }}
            />
          </ListItemButton>
        )
      })}
    </List>
  )

  const sidebarContent = (
    <Box>
      <Toolbar sx={{ px: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 700, color: 'primary.main' }}>
          RBAC Admin
        </Typography>
      </Toolbar>
      <Divider />
      {renderNav(superAdminNav)}
    </Box>
  )

  return (
    <>
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={onClose}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': { width: DRAWER_WIDTH },
        }}
      >
        {sidebarContent}
      </Drawer>

      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', md: 'block' },
          '& .MuiDrawer-paper': {
            width: DRAWER_WIDTH,
            borderRight: '1px solid',
            borderColor: 'divider',
            bgcolor: 'background.paper',
          },
        }}
      >
        {sidebarContent}
      </Drawer>
    </>
  )
}

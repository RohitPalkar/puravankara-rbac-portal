import { useState } from 'react'
import { Box, Typography, Tabs, Tab, Card } from '@mui/material'
import RolePermissionPage from './RolePermissionPage'
import UserPermissionPage from './UserPermissionPage'

export default function PermissionMatrixPage() {
  const [tab, setTab] = useState(0)

  return (
    <Box>
      <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>Permission Management</Typography>

      <Card sx={{ mb: 2 }}>
        <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ px: 2 }}>
          <Tab label="Role Permissions" />
          <Tab label="User Permissions" />
        </Tabs>
      </Card>

      {tab === 0 && <RolePermissionPage />}
      {tab === 1 && <UserPermissionPage />}
    </Box>
  )
}

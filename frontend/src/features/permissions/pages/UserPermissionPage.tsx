import { useState, useEffect } from 'react'
import {
  Box,
  Typography,
  Card,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Snackbar,
  Alert,
  CircularProgress,
  Divider,
  Chip,
  TextField,
} from '@mui/material'
import { Code } from '@mui/icons-material'
import PermissionTree from '@/features/permissions/components/PermissionTree'
import PermissionPreview from '@/features/permissions/components/PermissionPreview'
import ProjectSelector from '@/features/permissions/components/ProjectSelector'
import {
  useModuleTree,
  useUserProjectPermissions,
  useSaveUserProjectPermissions,
  buildEmptyMatrix,
} from '@/features/permissions/services/permission.service'
import { useUsers } from '@/features/users/services/user.service'
import { useProjects } from '@/features/projects/services/project.service'
import type { PermissionMatrix } from '@/features/permissions/types/permission.types'
import type { UserRecord } from '@/features/users/types/user.types'

export default function UserPermissionPage() {
  const [userSearch, setUserSearch] = useState('')
  const [userId, setUserId] = useState('')
  const [projectIds, setProjectIds] = useState<string[]>([])
  const [selectedProjectId, setSelectedProjectId] = useState('')
  const [matrix, setMatrix] = useState<PermissionMatrix>({ modules: {} })
  const [previewOpen, setPreviewOpen] = useState(false)
  const [toast, setToast] = useState<{ severity: 'success' | 'error'; message: string } | null>(null)

  const { data: usersData, isLoading: usersLoading } = useUsers({ search: userSearch || undefined })
  const { data: userPerms, isLoading: permsLoading } = useUserProjectPermissions(userId || undefined, selectedProjectId || undefined)
  const { data: tree } = useModuleTree()
  const saveMut = useSaveUserProjectPermissions()

  const users: UserRecord[] = usersData?.items ?? []
  const { data: projectsData } = useProjects({})
  const projects = projectsData?.items ?? []

  // Initialize matrix
  useEffect(() => {
    if (tree) {
      setMatrix(buildEmptyMatrix(tree))
    }
  }, [tree])

  // Load user-project permissions
  useEffect(() => {
    if (userPerms?.matrix) {
      setMatrix(userPerms.matrix)
    } else if (tree) {
      setMatrix(buildEmptyMatrix(tree))
    }
  }, [userPerms, tree, userId, selectedProjectId])

  const handleSave = async () => {
    if (!userId || !selectedProjectId) return
    try {
      await saveMut.mutateAsync({ userId, projectId: selectedProjectId, matrix })
      setToast({ severity: 'success', message: 'User permissions saved' })
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to save permissions'
      setToast({ severity: 'error', message: Array.isArray(msg) ? msg[0] : msg })
    }
  }

  const selectedUser = users.find((u) => u.id === userId)

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h5" sx={{ fontWeight: 600 }}>User Permissions</Typography>
        <Button
          variant="outlined"
          startIcon={<Code />}
          onClick={() => setPreviewOpen(true)}
        >
          JSON Preview
        </Button>
      </Box>

      <Card sx={{ p: 2, mb: 2 }}>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <FormControl size="small" sx={{ minWidth: 250 }}>
            <InputLabel>User</InputLabel>
            <Select
              value={userId}
              onChange={(e) => { setUserId(e.target.value); setSelectedProjectId('') }}
              label="User"
            >
              {usersLoading ? (
                <MenuItem disabled><CircularProgress size={20} /></MenuItem>
              ) : users.length === 0 ? (
                <MenuItem disabled><em>No users found</em></MenuItem>
              ) : (
                users.map((u) => (
                  <MenuItem key={u.id} value={u.id}>
                    {u.name} ({u.employeeId})
                  </MenuItem>
                ))
              )}
            </Select>
          </FormControl>

          <TextField
            size="small"
            placeholder="Search users..."
            value={userSearch}
            onChange={(e) => setUserSearch(e.target.value)}
            sx={{ maxWidth: 200 }}
          />
        </Box>

        {selectedUser && (
          <Box sx={{ mt: 1 }}>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              Selected: {selectedUser.name} ({selectedUser.employeeId}) — {selectedUser.departmentName || 'No dept'}
            </Typography>
            {selectedUser.zones && selectedUser.zones.length > 0 && (
              <Box sx={{ mt: 0.5, display: 'flex', gap: 0.5 }}>
                {selectedUser.zones.map((z) => (
                  <Chip key={z.id} label={z.name} size="small" variant="outlined" />
                ))}
              </Box>
            )}
          </Box>
        )}
      </Card>

      {userId && (
        <Card sx={{ p: 2, mb: 2 }}>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>Select Projects</Typography>
          <ProjectSelector
            selectedIds={projectIds}
            onChange={setProjectIds}
          />
          {projectIds.length > 0 && (
            <>
              <Divider sx={{ my: 1 }} />
              <FormControl size="small" sx={{ minWidth: 250 }}>
                <InputLabel>Configure permissions for</InputLabel>
                <Select
                  value={selectedProjectId}
                  onChange={(e) => setSelectedProjectId(e.target.value)}
                  label="Configure permissions for"
                >
                  {projectIds.map((pid) => {
                    const p = projects.find((pr) => pr.id === pid)
                    return <MenuItem key={pid} value={pid}>{p?.name || pid}</MenuItem>
                  })}
                </Select>
              </FormControl>
            </>
          )}
        </Card>
      )}

      {!selectedProjectId ? (
        <Card sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="body1" sx={{ color: 'text.secondary' }}>
            {!userId
              ? 'Select a user to configure permissions'
              : 'Select a project to configure permissions'}
          </Typography>
        </Card>
      ) : permsLoading ? (
        <Card sx={{ p: 4, textAlign: 'center' }}>
          <CircularProgress />
        </Card>
      ) : (
        <Card sx={{ p: 2 }}>
          <PermissionTree matrix={matrix} onChange={setMatrix} />
          <Divider sx={{ my: 2 }} />
          <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button variant="contained" onClick={handleSave} disabled={saveMut.isPending}>
              {saveMut.isPending ? <CircularProgress size={20} color="inherit" /> : 'Save Permissions'}
            </Button>
          </Box>
        </Card>
      )}

      <PermissionPreview open={previewOpen} onClose={() => setPreviewOpen(false)} matrix={matrix} />

      {toast && (
        <Snackbar open autoHideDuration={3000} onClose={() => setToast(null)} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
          <Alert severity={toast.severity} variant="filled">{toast.message}</Alert>
        </Snackbar>
      )}
    </Box>
  )
}

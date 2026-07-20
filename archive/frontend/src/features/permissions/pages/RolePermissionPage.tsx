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
} from '@mui/material'
import { Code } from '@mui/icons-material'
import PermissionTree from '@/features/permissions/components/PermissionTree'
import PermissionPreview from '@/features/permissions/components/PermissionPreview'
import { useDepartmentsList } from '@/features/users/services/user.service'
import { useRolesByDepartment } from '@/features/users/services/user.service'
import {
  useModuleTree,
  useRolePermissions,
  useSaveRolePermissions,
  buildEmptyMatrix,
} from '@/features/permissions/services/permission.service'
import type { PermissionMatrix } from '@/features/permissions/types/permission.types'

export default function RolePermissionPage() {
  const { data: departments, isLoading: deptLoading } = useDepartmentsList()
  const [departmentId, setDepartmentId] = useState('')
  const [roleId, setRoleId] = useState('')
  const [matrix, setMatrix] = useState<PermissionMatrix>({ modules: {} })
  const [previewOpen, setPreviewOpen] = useState(false)
  const [toast, setToast] = useState<{ severity: 'success' | 'error'; message: string } | null>(null)

  const { data: roles } = useRolesByDepartment(departmentId || undefined)
  const { data: rolePerms, isLoading: permsLoading } = useRolePermissions(roleId || undefined)
  const { data: tree } = useModuleTree()
  const saveMut = useSaveRolePermissions()

  const filteredRoles = roles ?? []

  // Initialize empty matrix from tree
  useEffect(() => {
    if (tree && !roleId) {
      setMatrix(buildEmptyMatrix(tree))
    }
  }, [tree, roleId])

  // Load role permissions
  useEffect(() => {
    if (rolePerms?.matrix) {
      setMatrix(rolePerms.matrix)
    } else if (tree) {
      setMatrix(buildEmptyMatrix(tree))
    }
  }, [rolePerms, tree, roleId])

  const handleSave = async () => {
    if (!roleId) return
    try {
      await saveMut.mutateAsync({ roleId, matrix })
      setToast({ severity: 'success', message: 'Role permissions saved' })
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to save permissions'
      setToast({ severity: 'error', message: Array.isArray(msg) ? msg[0] : msg })
    }
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h5" sx={{ fontWeight: 600 }}>Role Permissions</Typography>
        <Button
          variant="outlined"
          startIcon={<Code />}
          onClick={() => setPreviewOpen(true)}
        >
          JSON Preview
        </Button>
      </Box>

      <Card sx={{ p: 2, mb: 2 }}>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <FormControl size="small" sx={{ minWidth: 220 }}>
            <InputLabel>Department</InputLabel>
            <Select value={departmentId} onChange={(e) => { setDepartmentId(e.target.value); setRoleId('') }} label="Department">
              {deptLoading ? (
                <MenuItem disabled><CircularProgress size={20} /></MenuItem>
              ) : (
                departments?.map((d) => <MenuItem key={d.id} value={d.id}>{d.name}</MenuItem>)
              )}
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 220 }} disabled={!departmentId}>
            <InputLabel>Role</InputLabel>
            <Select value={roleId} onChange={(e) => { setRoleId(e.target.value) }} label="Role">
              {filteredRoles.map((r) => <MenuItem key={r.id} value={r.id}>{r.name}</MenuItem>)}
            </Select>
          </FormControl>
        </Box>
      </Card>

      {!roleId ? (
        <Card sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="body1" sx={{ color: 'text.secondary' }}>
            Select a department and role to configure permissions
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

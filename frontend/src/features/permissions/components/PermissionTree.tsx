import { useState } from 'react'
import { Box, TextField, Button, Typography, Divider } from '@mui/material'
import ModulePermissionNode from './ModulePermissionNode'
import { useModuleTree, toggleAction, getAllActionEntries } from '@/features/permissions/services/permission.service'
import type { PermissionMatrix } from '@/features/permissions/types/permission.types'

interface Props {
  matrix: PermissionMatrix
  onChange: (matrix: PermissionMatrix) => void
  inheritedMatrix?: PermissionMatrix
  readOnly?: boolean
  searchQuery?: string
}

export default function PermissionTree({ matrix, onChange, inheritedMatrix, readOnly }: Props) {
  const { data: tree } = useModuleTree()
  const [search, setSearch] = useState('')

  const handleToggle = (moduleName: string, subModuleName: string | null, actionName: string) => {
    onChange(toggleAction(matrix, moduleName, subModuleName, actionName))
  }

  const handleSelectAll = () => {
    if (!tree) return
    const entries = getAllActionEntries(tree)
    for (const entry of entries) {
      onChange(toggleAction(matrix, entry.moduleName, entry.subModuleName, entry.action))
    }
  }

  const handleClearAll = () => {
    if (!tree) return
    const entries = getAllActionEntries(tree)
    for (const entry of entries) {
      const key = entry.subModuleName ?? '__direct'
      const arr = matrix.modules[entry.moduleName]?.submodules[key]
      if (arr && arr.includes(entry.action)) {
        onChange(toggleAction(matrix, entry.moduleName, entry.subModuleName, entry.action))
      }
    }
  }

  const getInheritedActions = (moduleName: string): string[] | undefined => {
    if (!inheritedMatrix) return undefined
    const mod = inheritedMatrix.modules[moduleName]
    if (!mod) return undefined
    return Object.values(mod.submodules).flat()
  }

  if (!tree) {
    return <Typography variant="body2" sx={{ color: 'text.secondary' }}>Loading module tree...</Typography>
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', gap: 1, mb: 2, alignItems: 'center' }}>
        <TextField
          size="small"
          placeholder="Search module..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{ maxWidth: 240 }}
        />
        {!readOnly && (
          <>
            <Button size="small" onClick={handleSelectAll}>Select All</Button>
            <Button size="small" onClick={handleClearAll}>Clear All</Button>
          </>
        )}
      </Box>

      <Divider sx={{ mb: 1 }} />

      <Box sx={{ maxHeight: 480, overflow: 'auto' }}>
        {tree.map((mod) => {
          const moduleName = mod.name
          const selected = matrix.modules[moduleName]
          const actionsForModule = selected ? Object.values(selected.submodules).flat() : []
          const inherited = getInheritedActions(moduleName)

          return (
            <ModulePermissionNode
              key={mod.id}
              module={mod}
              moduleName={moduleName}
              selectedActions={actionsForModule}
              inheritedActions={inherited}
              onToggleAction={(subMod, action) => handleToggle(moduleName, subMod, action)}
              readOnly={readOnly}
              searchQuery={search}
            />
          )
        })}
      </Box>
    </Box>
  )
}

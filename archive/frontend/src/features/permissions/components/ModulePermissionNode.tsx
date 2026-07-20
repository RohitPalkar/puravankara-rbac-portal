import { useState } from 'react'
import { Box, Collapse, IconButton, Typography } from '@mui/material'
import { ExpandMore, ExpandLess } from '@mui/icons-material'
import PermissionCheckbox from './PermissionCheckbox'
import type { ModuleNode } from '@/features/permissions/types/permission.types'

interface Props {
  module: ModuleNode
  moduleName: string
  selectedActions: string[]
  inheritedActions?: string[]
  onToggleAction: (subModuleName: string | null, actionName: string) => void
  readOnly?: boolean
  searchQuery?: string
}

function getState(selected: string[], inherited: string[] | undefined, action: string): { checked: boolean; disabled: boolean } {
  const isSelected = selected.includes(action)
  const isInherited = inherited?.includes(action) ?? false
  return {
    checked: isSelected || isInherited,
    disabled: isInherited,
  }
}

export default function ModulePermissionNode({
  module, moduleName, selectedActions, inheritedActions, onToggleAction, readOnly, searchQuery,
}: Props) {
  const [expanded, setExpanded] = useState(true)

  const matchesSearch = !searchQuery || moduleName.toLowerCase().includes(searchQuery.toLowerCase())
  if (searchQuery && !matchesSearch) return null

  const subModules = module.subModules ?? []
  const directActions = module.actions ?? []

  return (
    <Box sx={{ mb: 1 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <IconButton size="small" onClick={() => setExpanded((p) => !p)}>
          {expanded ? <ExpandLess fontSize="small" /> : <ExpandMore fontSize="small" />}
        </IconButton>
        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>{moduleName}</Typography>
      </Box>

      <Collapse in={expanded}>
        <Box sx={{ pl: 4 }}>
          {subModules.length > 0 ? (
            subModules.map((sm) => (
              <Box key={sm.name} sx={{ mb: 1 }}>
                <Typography variant="caption" sx={{ fontWeight: 500, display: 'block', mb: 0.5 }}>
                  {sm.name}
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {sm.actions.map((action) => {
                    const { checked, disabled } = getState(selectedActions, inheritedActions, action)
                    return (
                      <PermissionCheckbox
                        key={action}
                        label={action}
                        checked={checked}
                        disabled={disabled || readOnly}
                        onChange={() => onToggleAction(sm.name, action)}
                      />
                    )
                  })}
                </Box>
              </Box>
            ))
          ) : directActions.length > 0 ? (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
              {directActions.map((action) => {
                const { checked, disabled } = getState(selectedActions, inheritedActions, action)
                return (
                  <PermissionCheckbox
                    key={action}
                    label={action}
                    checked={checked}
                    disabled={disabled || readOnly}
                    onChange={() => onToggleAction(null, action)}
                  />
                )
              })}
            </Box>
          ) : (
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              No actions configured
            </Typography>
          )}
        </Box>
      </Collapse>
    </Box>
  )
}

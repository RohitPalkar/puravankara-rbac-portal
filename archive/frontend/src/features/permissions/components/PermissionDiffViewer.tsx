import { Box, Typography, Chip, Divider } from '@mui/material'
import type { PermissionMatrix } from '@/features/permissions/types/permission.types'

interface Props {
  inherited: PermissionMatrix | null
  overridden: PermissionMatrix | null
}

export default function PermissionDiffViewer({ inherited, overridden }: Props) {
  if (!inherited && !overridden) {
    return <Typography variant="body2" sx={{ color: 'text.secondary' }}>No permission data to compare</Typography>
  }

  const getAllEntries = (m: PermissionMatrix) => {
    const entries: { module: string; subModule: string; action: string }[] = []
    for (const [modName, mod] of Object.entries(m.modules)) {
      for (const [subName, actions] of Object.entries(mod.submodules)) {
        for (const action of actions) {
          entries.push({ module: modName, subModule: subName, action })
        }
      }
    }
    return entries
  }

  const inheritedEntries = inherited ? getAllEntries(inherited) : []
  const overrideEntries = overridden ? getAllEntries(overridden) : []

  const added = overrideEntries.filter(
    (o) => !inheritedEntries.some((i) => i.module === o.module && i.subModule === o.subModule && i.action === o.action),
  )
  const removed = inheritedEntries.filter(
    (i) => !overrideEntries.some((o) => o.module === i.module && o.subModule === i.subModule && o.action === i.action),
  )

  if (added.length === 0 && removed.length === 0) {
    return <Typography variant="body2" sx={{ color: 'text.secondary' }}>No differences from inherited permissions</Typography>
  }

  return (
    <Box>
      <Typography variant="subtitle2" sx={{ mb: 1 }}>Permission Changes</Typography>
      <Divider sx={{ mb: 1 }} />

      {added.length > 0 && (
        <Box sx={{ mb: 1 }}>
          <Typography variant="caption" sx={{ color: 'success.main', fontWeight: 600, display: 'block', mb: 0.5 }}>
            Added ({added.length})
          </Typography>
          {added.map((a, i) => (
            <Chip
              key={`add-${i}`}
              label={`${a.module} › ${a.subModule} › ${a.action}`}
              size="small"
              color="success"
              variant="outlined"
              sx={{ m: 0.2 }}
            />
          ))}
        </Box>
      )}

      {removed.length > 0 && (
        <Box>
          <Typography variant="caption" sx={{ color: 'error.main', fontWeight: 600, display: 'block', mb: 0.5 }}>
            Removed ({removed.length})
          </Typography>
          {removed.map((r, i) => (
            <Chip
              key={`rem-${i}`}
              label={`${r.module} › ${r.subModule} › ${r.action}`}
              size="small"
              color="error"
              variant="outlined"
              sx={{ m: 0.2 }}
            />
          ))}
        </Box>
      )}
    </Box>
  )
}

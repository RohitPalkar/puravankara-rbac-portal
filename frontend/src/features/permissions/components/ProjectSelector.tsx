import { useState } from 'react'
import { Box, TextField, Chip, Typography, CircularProgress } from '@mui/material'
import { useProjects } from '@/features/projects/services/project.service'
import type { Project } from '@/features/projects/types/project.types'

interface Props {
  selectedIds: string[]
  onChange: (ids: string[]) => void
  disabled?: boolean
}

export default function ProjectSelector({ selectedIds, onChange, disabled }: Props) {
  const { data, isLoading } = useProjects({})
  const [search, setSearch] = useState('')

  const allProjects: Project[] = data?.items ?? []

  const filtered = search
    ? allProjects.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()))
    : allProjects

  const toggleProject = (id: string) => {
    if (selectedIds.includes(id)) {
      onChange(selectedIds.filter((s) => s !== id))
    } else {
      onChange([...selectedIds, id])
    }
  }

  return (
    <Box>
      <TextField
        fullWidth
        size="small"
        placeholder="Search projects..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        sx={{ mb: 1 }}
      />

      {selectedIds.length > 0 && (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 1 }}>
          {selectedIds.map((id) => {
            const p = allProjects.find((pr) => pr.id === id)
            return (
              <Chip
                key={id}
                label={p?.name || id}
                onDelete={disabled ? undefined : () => toggleProject(id)}
                size="small"
              />
            )
          })}
        </Box>
      )}

      <Box sx={{ maxHeight: 200, overflow: 'auto', display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
        {isLoading ? (
          <CircularProgress size={20} sx={{ m: 2 }} />
        ) : filtered.length === 0 ? (
          <Typography variant="body2" sx={{ color: 'text.secondary', p: 1 }}>No projects found</Typography>
        ) : (
          filtered.map((p) => (
            <Chip
              key={p.id}
              label={p.name}
              variant={selectedIds.includes(p.id) ? 'filled' : 'outlined'}
              color={selectedIds.includes(p.id) ? 'primary' : 'default'}
              onClick={disabled ? undefined : () => toggleProject(p.id)}
              size="small"
              sx={{ cursor: disabled ? 'default' : 'pointer' }}
            />
          ))
        )}
      </Box>
    </Box>
  )
}

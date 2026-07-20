import { TextField, Typography } from '@mui/material'

interface Props {
  projectImagePath: string
  jvImagePath: string
  onChange: (field: string, value: string) => void
}

export default function ProjectMediaStep({ projectImagePath, jvImagePath, onChange }: Props) {
  return (
    <>
      <Typography variant="subtitle2" sx={{ mb: 1 }}>Media & Location</Typography>

      <TextField
        fullWidth
        label="Project Image URL / Path"
        value={projectImagePath}
        onChange={(e) => onChange('projectImagePath', e.target.value)}
        margin="normal"
        placeholder="URL or upload path"
      />

      <TextField
        fullWidth
        label="JV Image URL / Path"
        value={jvImagePath}
        onChange={(e) => onChange('jvImagePath', e.target.value)}
        margin="normal"
        placeholder="URL or upload path"
      />
    </>
  )
}

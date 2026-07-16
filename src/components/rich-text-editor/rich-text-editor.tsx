import { useState, useCallback } from 'react';

import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';

type Props = {
  value: string;
  onChange: (html: string) => void;
  label?: string;
  error?: boolean;
  helperText?: string;
};

export function RichTextEditor({ value, onChange, label, error, helperText }: Props) {
  const [format, setFormat] = useState<string[]>([]);

  const handleFormat = useCallback((_e: any, v: string[]) => setFormat(v), []);

  return (
    <Stack spacing={1}>
      {label && <Typography variant="subtitle2">{label}</Typography>}
      <Stack
        sx={{
          border: 1,
          borderColor: error ? 'error.main' : 'divider',
          borderRadius: 1,
          overflow: 'hidden',
        }}
      >
        <ToggleButtonGroup
          size="small"
          value={format}
          onChange={handleFormat}
          sx={{ borderBottom: 1, borderColor: 'divider', px: 1, py: 0.5, bgcolor: 'background.neutral' }}
        >
          <ToggleButton value="bold" sx={{ border: 'none' }}>B</ToggleButton>
          <ToggleButton value="italic" sx={{ border: 'none' }}>I</ToggleButton>
          <ToggleButton value="underline" sx={{ border: 'none' }}>U</ToggleButton>
        </ToggleButtonGroup>
        <TextField
          multiline
          minRows={4}
          maxRows={12}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Enter HTML content..."
          error={error}
          helperText={helperText}
          variant="standard"
          sx={{ '& .MuiInputBase-root': { px: 1.5, py: 1 } }}
        />
      </Stack>
    </Stack>
  );
}

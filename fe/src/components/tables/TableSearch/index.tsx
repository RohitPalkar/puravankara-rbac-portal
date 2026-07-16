import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';

import { Iconify } from 'src/components/iconify';

type Props = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
};

export function TableSearch({ value, onChange, placeholder = 'Search...' }: Props) {
  return (
    <TextField
      size="small"
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      sx={{ flex: 1, maxWidth: 360 }}
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            <Iconify icon="solar:magnifer-bold" width={18} sx={{ opacity: 0.5 }} />
          </InputAdornment>
        ),
      }}
    />
  );
}
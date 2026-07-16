import { useState } from 'react';

import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';

type Option = { value: string; label: string };

type Props = {
  label: string;
  options: Option[];
  value: string[];
  onChange: (value: string[]) => void;
  maxChips?: number;
  error?: boolean;
  helperText?: string;
};

export function MultiSelectChips({
  label,
  options,
  value,
  onChange,
  maxChips = 3,
  error,
  helperText,
}: Props) {
  const [selected, setSelected] = useState<string[]>(value);

  const handleToggle = (val: string) => {
    const next = selected.includes(val)
      ? selected.filter((v) => v !== val)
      : [...selected, val];
    setSelected(next);
    onChange(next);
  };

  const visible = selected.slice(0, maxChips);
  const remaining = selected.length - maxChips;

  return (
    <Stack spacing={1}>
      <TextField
        select
        label={label}
        value={[]}
        onChange={() => {}}
        error={error}
        helperText={helperText}
        SelectProps={{ multiple: true, displayEmpty: true, renderValue: () => '' }}
        fullWidth
      >
        {options.map((o) => (
          <MenuItem key={o.value} value={o.value} onClick={() => handleToggle(o.value)}>
            {o.label}
          </MenuItem>
        ))}
      </TextField>
      {selected.length > 0 && (
        <Stack direction="row" spacing={0.5} sx={{ flexWrap: 'wrap' }}>
          {visible.map((v) => {
            const opt = options.find((o) => o.value === v);
            return (
              <Chip
                key={v}
                label={opt?.label ?? v}
                size="small"
                onDelete={() => handleToggle(v)}
                variant="outlined"
                sx={{ height: 22, fontSize: 11 }}
              />
            );
          })}
          {remaining > 0 && (
            <Chip
              label={`+${remaining} More`}
              size="small"
              color="primary"
              variant="soft"
              sx={{ height: 22, fontSize: 11 }}
            />
          )}
        </Stack>
      )}
    </Stack>
  );
}

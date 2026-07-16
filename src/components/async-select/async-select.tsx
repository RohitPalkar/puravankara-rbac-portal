import { useState, useEffect } from 'react';

import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import CircularProgress from '@mui/material/CircularProgress';

type Option = { id: string | number; label: string };

type Props = {
  label: string;
  value?: Option | null;
  options?: Option[];
  fetchFn?: () => Promise<Option[]>;
  onChange?: (value: Option | null) => void;
  error?: boolean;
  helperText?: string;
  required?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
};

export function AsyncSelect({
  label,
  value,
  options: staticOptions,
  fetchFn,
  onChange,
  error,
  helperText,
  required,
  disabled,
  fullWidth = true,
}: Props) {
  const [options, setOptions] = useState<Option[]>(staticOptions ?? []);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (fetchFn) {
      setLoading(true);
      fetchFn()
        .then(setOptions)
        .finally(() => setLoading(false));
    }
  }, [fetchFn]);

  return (
    <Autocomplete
      value={value ?? null}
      onChange={(_e, v) => onChange?.(v)}
      options={options}
      loading={loading}
      disabled={disabled}
      fullWidth={fullWidth}
      getOptionLabel={(o) => o.label}
      isOptionEqualToValue={(a, b) => a.id === b.id}
      renderInput={(params) => (
        <TextField
          {...params}
          label={label}
          required={required}
          error={error}
          helperText={helperText}
          InputProps={{
            ...params.InputProps,
            endAdornment: (
              <>
                {loading ? <CircularProgress size={20} /> : null}
                {params.InputProps.endAdornment}
              </>
            ),
          }}
        />
      )}
    />
  );
}

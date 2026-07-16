import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

import { Iconify } from 'src/components/iconify';
import { usePopover, CustomPopover } from 'src/components/custom-popover';

export type FilterOption = {
  key: string;
  label: string;
  options: { value: string; label: string }[];
};

type Props = {
  filterOptions: FilterOption[];
  filters: Record<string, string>;
  onFilter: (key: string, value: string) => void;
  onClear: () => void;
};

export function TableFilters({ filterOptions, filters, onFilter, onClear }: Props) {
  const popover = usePopover();
  const hasActiveFilters = Object.values(filters).some((v) => v);

  if (!filterOptions.length) return null;

  return (
    <>
      <Button
        size="small"
        variant={hasActiveFilters ? 'soft' : 'text'}
        color="inherit"
        startIcon={<Iconify icon="solar:filter-bold" width={16} />}
        onClick={popover.onOpen}
      >
        Filters
      </Button>
      <CustomPopover open={popover.open} anchorEl={popover.anchorEl} onClose={popover.onClose}>
        <Stack spacing={1.5} sx={{ p: 2, minWidth: 220 }}>
          <Typography variant="subtitle2">Filter By</Typography>
          {filterOptions.map((f) => (
            <TextField
              key={f.key}
              select
              size="small"
              label={f.label}
              value={filters[f.key] ?? ''}
              onChange={(e) => onFilter(f.key, e.target.value)}
              fullWidth
            >
              <MenuItem value="">All</MenuItem>
              {f.options.map((o) => (
                <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>
              ))}
            </TextField>
          ))}
          {hasActiveFilters && (
            <Button size="small" color="error" variant="text" onClick={() => { onClear(); popover.onClose(); }}>
              Clear All
            </Button>
          )}
        </Stack>
      </CustomPopover>
    </>
  );
}
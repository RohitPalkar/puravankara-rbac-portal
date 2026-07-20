import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';

import { TableSearch } from '../TableSearch';
import { TableFilters, type FilterOption } from '../TableFilters';

type Props = {
  search: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;
  filterOptions?: FilterOption[];
  filters?: Record<string, string>;
  onFilter?: (key: string, value: string) => void;
  onClearFilters?: () => void;
  actions?: React.ReactNode;
};

export function TableToolbar({
  search,
  onSearchChange,
  searchPlaceholder,
  filterOptions,
  filters = {},
  onFilter,
  onClearFilters,
  actions,
}: Props) {
  return (
    <Box sx={{ borderBottom: '1px solid', borderColor: 'divider' }}>
      <Stack direction="row" spacing={1} alignItems="center" sx={{ px: 2, py: 1.5 }}>
        <TableSearch value={search} onChange={onSearchChange} placeholder={searchPlaceholder} />
        <Stack direction="row" spacing={0.5} sx={{ ml: 'auto' }}>
          {filterOptions && onFilter && onClearFilters && (
            <TableFilters
              filterOptions={filterOptions}
              filters={filters}
              onFilter={onFilter}
              onClear={onClearFilters}
            />
          )}
          {actions}
        </Stack>
      </Stack>
    </Box>
  );
}
import { useMemo, useState, useCallback } from 'react';
import type { GridColDef } from '@mui/x-data-grid';
import { DataGrid } from '@mui/x-data-grid';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import ListItemText from '@mui/material/ListItemText';
import ListItemIcon from '@mui/material/ListItemIcon';
import Checkbox from '@mui/material/Checkbox';
import Divider from '@mui/material/Divider';
import Card from '@mui/material/Card';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { Iconify } from 'src/components/iconify';
import { CustomPopover, usePopover } from 'src/components/custom-popover';

export type SortConfig = { field: string; order: 'asc' | 'desc' };

export type FilterOption = {
  key: string;
  label: string;
  options: { value: string; label: string }[];
};

type Props = {
  columns: GridColDef[];
  rows: any[];
  loading?: boolean;
  getRowId?: (row: any) => string;
  onRowClick?: (row: any) => void;
  searchPlaceholder?: string;
  filterOptions?: FilterOption[];
  initialSort?: SortConfig;
};

export function DataTable({
  columns,
  rows,
  loading,
  getRowId,
  onRowClick,
  searchPlaceholder = 'Search...',
  filterOptions,
  initialSort = { field: 'createdAt', order: 'desc' },
}: Props) {
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<SortConfig | undefined>(initialSort);
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [hiddenColumns, setHiddenColumns] = useState<Set<string>>(new Set());

  const filterPopover = usePopover();
  const columnsPopover = usePopover();

  const visibleColumns = useMemo(() => columns.filter((col) => col.field !== 'actions'), [columns]);

  const filteredRows = useMemo(() => {
    let data = rows;
    if (search) {
      const lower = search.toLowerCase();
      data = data.filter((row) =>
        columns.some((col) => {
          if (hiddenColumns.has(col.field)) return false;
          const val = row[col.field];
          if (val == null) return false;
          return String(val).toLowerCase().includes(lower);
        })
      );
    }
    Object.entries(filters).forEach(([key, val]) => {
      if (val) {
        data = data.filter((row) => String(row[key]) === val);
      }
    });
    if (sort) {
      data = [...data].sort((a, b) => {
        const aVal = a[sort.field];
        const bVal = b[sort.field];
        if (aVal == null) return 1;
        if (bVal == null) return -1;
        const cmp = typeof aVal === 'string' ? aVal.localeCompare(bVal) : aVal - bVal;
        return sort.order === 'asc' ? cmp : -cmp;
      });
    }
    return data;
  }, [rows, search, filters, sort, columns, hiddenColumns]);

  const processedColumns = useMemo(() => {
    if (columns.length === 0) return [];
    return columns.filter((col) => !hiddenColumns.has(col.field));
  }, [columns, hiddenColumns]);

  const handleToggleColumn = useCallback((field: string) => {
    setHiddenColumns((prev) => {
      const next = new Set(prev);
      if (next.has(field)) next.delete(field);
      else next.add(field);
      return next;
    });
  }, []);

  const handleFilterChange = useCallback((key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  }, []);

  const sortableColumns = visibleColumns.filter((c) => c.field !== 'id' && c.sortable !== false);
  const hasActiveFilters = sort !== undefined || Object.values(filters).some((v) => v);

  return (
    <Card sx={{ overflow: 'hidden' }}>
      <Box sx={{ borderBottom: '1px solid', borderColor: 'divider' }}>
        <Stack direction="row" spacing={1} alignItems="center" sx={{ px: 2, py: 1.5 }}>
          <TextField
            size="small"
            placeholder={searchPlaceholder}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            sx={{ flex: 1, maxWidth: 360 }}
            InputProps={{
              startAdornment: <Iconify icon="solar:magnifer-bold" width={18} style={{ marginRight: 8, opacity: 0.5 }} />,
            }}
          />

          <Stack direction="row" spacing={0.5}>
            <Button
              size="small"
              variant={hasActiveFilters ? 'soft' : 'text'}
              color="inherit"
              startIcon={<Iconify icon="solar:filter-bold" width={16} />}
              onClick={filterPopover.onOpen}
            >
              Filters
            </Button>
            <CustomPopover open={filterPopover.open} anchorEl={filterPopover.anchorEl} onClose={filterPopover.onClose}>
              <Stack spacing={1.5} sx={{ p: 2, minWidth: 220 }}>
                <Typography variant="subtitle2">Sort By</Typography>
                <TextField
                  select
                  size="small"
                  label="Field"
                  value={sort?.field ?? ''}
                  onChange={(e) => setSort((prev) => ({ field: e.target.value, order: prev?.order ?? 'asc' }))}
                  fullWidth
                >
                  {sortableColumns.map((col) => (
                    <MenuItem key={col.field} value={col.field}>{col.headerName || col.field}</MenuItem>
                  ))}
                </TextField>
                <TextField
                  select
                  size="small"
                  label="Order"
                  value={sort?.order ?? 'asc'}
                  onChange={(e) => setSort((prev) => ({ field: prev?.field ?? 'name', order: e.target.value as 'asc' | 'desc' }))}
                  fullWidth
                >
                  <MenuItem value="asc">Ascending</MenuItem>
                  <MenuItem value="desc">Descending</MenuItem>
                </TextField>

                {filterOptions && filterOptions.length > 0 && (
                  <>
                    <Divider />
                    <Typography variant="subtitle2">Filter By</Typography>
                    {filterOptions.map((f) => (
                      <TextField
                        key={f.key}
                        select
                        size="small"
                        label={f.label}
                        value={filters[f.key] ?? ''}
                        onChange={(e) => handleFilterChange(f.key, e.target.value)}
                        fullWidth
                      >
                        <MenuItem value="">All</MenuItem>
                        {f.options.map((o) => (
                          <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>
                        ))}
                      </TextField>
                    ))}
                  </>
                )}

                {hasActiveFilters && (
                  <Button size="small" color="error" variant="text" onClick={() => { setSort(initialSort); setFilters({}); filterPopover.onClose(); }}>
                    Clear All
                  </Button>
                )}
              </Stack>
            </CustomPopover>

            <Button
              size="small"
              variant="text"
              color="inherit"
              startIcon={<Iconify icon="solar:columns-3-bold" width={16} />}
              onClick={columnsPopover.onOpen}
            >
              Columns
            </Button>
            <CustomPopover open={columnsPopover.open} anchorEl={columnsPopover.anchorEl} onClose={columnsPopover.onClose}>
              <Stack sx={{ p: 1, minWidth: 160 }}>
                {visibleColumns.map((col) => (
                  <MenuItem key={col.field} onClick={() => handleToggleColumn(col.field)}>
                    <ListItemIcon>
                      <Checkbox size="small" checked={!hiddenColumns.has(col.field)} />
                    </ListItemIcon>
                    <ListItemText primary={col.headerName || col.field} />
                  </MenuItem>
                ))}
              </Stack>
            </CustomPopover>
          </Stack>
        </Stack>
      </Box>

      <Box sx={{ overflowX: 'auto' }}>
        <DataGrid
          rows={filteredRows}
          columns={processedColumns}
          loading={loading}
          getRowId={getRowId ?? ((row) => row.id)}
          onRowClick={(params) => onRowClick?.(params.row)}
          initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
          pageSizeOptions={[5, 10, 25]}
          disableRowSelectionOnClick
          autoHeight
          disableColumnMenu
          disableColumnFilter
          disableColumnSelector
          sortingMode="server"
          filterMode="server"
          sx={{
            '& .MuiDataGrid-row': { cursor: onRowClick ? 'pointer' : 'default' },
          }}
        />
      </Box>
    </Card>
  );
}
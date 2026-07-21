import { useMemo, useState, useCallback, useEffect } from 'react';
import type { GridColDef, GridPaginationModel } from '@mui/x-data-grid';
import { DataGrid } from '@mui/x-data-grid';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import ListItemText from '@mui/material/ListItemText';
import ListItemIcon from '@mui/material/ListItemIcon';
import Checkbox from '@mui/material/Checkbox';
import Card from '@mui/material/Card';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { Iconify } from 'src/components/iconify';
import { CustomPopover, usePopover } from 'src/components/custom-popover';

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
  onFiltersChange?: (filters: Record<string, string>) => void;
  paginationMode?: 'client' | 'server';
  paginationModel?: GridPaginationModel;
  onPaginationModelChange?: (model: GridPaginationModel) => void;
  rowCount?: number;
  onSearchChange?: (value: string) => void;
  searchValue?: string;
  getRowHeight?: () => number | 'auto';
  dataGridSx?: Record<string, any>;
};

export function DataTable({
  columns,
  rows,
  loading,
  getRowId,
  onRowClick,
  searchPlaceholder = 'Search...',
  filterOptions,
  onFiltersChange,
  paginationMode = 'client',
  paginationModel,
  onPaginationModelChange,
  rowCount,
  onSearchChange,
  searchValue,
  getRowHeight,
  dataGridSx,
}: Props) {
  const [localSearch, setLocalSearch] = useState('');
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [hiddenColumns, setHiddenColumns] = useState<Set<string>>(new Set());

  useEffect(() => {
    onFiltersChange?.(filters);
  }, [filters, onFiltersChange]);

  const filterPopover = usePopover();
  const columnsPopover = usePopover();

  const isServerSide = paginationMode === 'server';

  const visibleColumns = useMemo(() => columns.filter((col) => col.field !== 'actions'), [columns]);

  const filteredRows = useMemo(() => {
    if (isServerSide) return rows;
    let data = rows;
    const search = localSearch;
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
    return data;
  }, [rows, localSearch, filters, columns, hiddenColumns, isServerSide]);

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

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (onSearchChange) {
      onSearchChange(value);
    } else {
      setLocalSearch(value);
    }
  }, [onSearchChange]);

  const hasActiveFilters = Object.values(filters).some((v) => v);

  return (
    <Card sx={{ overflow: 'hidden' }}>
      <Box sx={{ borderBottom: '1px solid', borderColor: 'divider' }}>
        <Stack direction="row" spacing={1} alignItems="center" sx={{ px: 2, py: 1.5 }}>
          <TextField
            size="small"
            placeholder={searchPlaceholder}
            value={onSearchChange ? (searchValue ?? '') : localSearch}
            onChange={handleSearchChange}
            sx={{ flex: 1, maxWidth: 360 }}
            InputProps={{
              startAdornment: <Iconify icon="solar:magnifer-bold" width={18} style={{ marginRight: 8, opacity: 0.5 }} />,
            }}
          />

          <Stack direction="row" spacing={0.5} sx={{ ml: 'auto' }}>
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
                <Typography variant="subtitle2">Filter By</Typography>
                {filterOptions && filterOptions.length > 0 ? (
                  filterOptions.map((f) => (
                    <TextField
                      key={f.key}
                      select
                      size="small"
                      label={f.label}
                      value={filters[f.key] ?? ''}
                      onChange={(e) => setFilters((prev) => ({ ...prev, [f.key]: e.target.value }))}
                      fullWidth
                    >
                      <MenuItem value="">All</MenuItem>
                      {f.options.map((o) => (
                        <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>
                      ))}
                    </TextField>
                  ))
                ) : (
                  <Typography variant="body2" color="text.secondary" sx={{ py: 1 }}>
                    No filter options available
                  </Typography>
                )}
                {hasActiveFilters && (
                  <Button size="small" color="error" variant="text" onClick={() => { setFilters({}); filterPopover.onClose(); }}>
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
          rows={isServerSide ? rows : filteredRows}
          columns={processedColumns}
          loading={loading}
          getRowId={getRowId ?? ((row) => row.id)}
          onRowClick={(params) => onRowClick?.(params.row)}
          paginationMode={paginationMode}
          {...(isServerSide && paginationModel ? { paginationModel } : {})}
          {...(isServerSide && onPaginationModelChange ? { onPaginationModelChange } : {})}
          {...(isServerSide && rowCount !== undefined ? { rowCount } : {})}
          {...(getRowHeight ? { getRowHeight } : {})}
          initialState={isServerSide ? undefined : { pagination: { paginationModel: { pageSize: 10 } } }}
          pageSizeOptions={[5, 10, 25]}
          disableRowSelectionOnClick
          disableColumnMenu
          autoHeight
          sx={{
            ...(dataGridSx || {}),
            '& .MuiDataGrid-row': {
              cursor: onRowClick ? 'pointer' : 'default',
              ...(dataGridSx?.['& .MuiDataGrid-row'] || {}),
            },
          } as any}
        />
      </Box>
    </Card>
  );
}

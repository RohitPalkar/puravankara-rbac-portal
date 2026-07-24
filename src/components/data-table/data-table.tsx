import type { GridColDef, GridPaginationModel } from '@mui/x-data-grid';

import { useMemo, useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import Checkbox from '@mui/material/Checkbox';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import ListItemText from '@mui/material/ListItemText';
import ListItemIcon from '@mui/material/ListItemIcon';
import { DataGrid, GridPagination, GridFooterContainer } from '@mui/x-data-grid';

import { Iconify } from 'src/components/iconify';
import { usePopover, CustomPopover } from 'src/components/custom-popover';

export type FilterOption = {
  key: string;
  label: string;
  options: { value: string; label: string }[];
};

export type GroupHeader = {
  label: string;
  fields: string[];
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
  groupHeaders?: GroupHeader[];
  hideColumnsButton?: boolean;
  columnHeaderHeight?: number;
};

function DataGridFooter({ rowCount, page, pageSize }: { rowCount: number; page: number; pageSize: number }) {
  const start = rowCount === 0 ? 0 : page * pageSize + 1;
  const end = Math.min((page + 1) * pageSize, rowCount);

  return (
    <GridFooterContainer>
      <Stack direction="row" alignItems="center" spacing={2} sx={{ px: 2, width: 1 }}>
        <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: 'nowrap', fontSize: '0.8125rem' }}>
          {rowCount === 0
            ? '0 records'
            : `Showing ${start}–${end} of ${rowCount} record${rowCount !== 1 ? 's' : ''}`}
        </Typography>
        <Box sx={{ flex: 1 }} />
        <GridPagination />
      </Stack>
    </GridFooterContainer>
  );
}

function EmptyStateContent({
  hasSearch,
  searchPlaceholder,
}: {
  hasSearch: boolean;
  searchPlaceholder: string;
}) {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        py: 8,
        px: 2,
      }}
    >
      <Iconify
        icon={hasSearch ? 'solar:search-cross-bold' : 'solar:clipboard-list-bold'}
        width={48}
        sx={{ color: 'text.disabled', mb: 2, opacity: 0.4 }}
      />
      <Typography variant="h6" sx={{ color: 'text.secondary', fontWeight: 500, mb: 0.5 }}>
        {hasSearch ? 'No results found' : 'No data'}
      </Typography>
      <Typography variant="body2" color="text.disabled" sx={{ textAlign: 'center' }}>
        {hasSearch
          ? `No records match your search. Try different keywords.`
          : `No records to display. Add data to get started.`}
      </Typography>
    </Box>
  );
}

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
  rowCount: totalRowCount,
  onSearchChange,
  searchValue,
  getRowHeight,
  dataGridSx,
  groupHeaders,
  hideColumnsButton,
  columnHeaderHeight,
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
    const {value} = e.target;
    if (onSearchChange) {
      onSearchChange(value);
    } else {
      setLocalSearch(value);
    }
  }, [onSearchChange]);

  const hasActiveFilters = Object.values(filters).some((v) => v);

  const groupHeaderSections = useMemo(() => {
    if (!groupHeaders || groupHeaders.length === 0) return null;
    const cols = columns.filter((c) => !hiddenColumns.has(c.field));
    const sections: { label: string | null; width: number | string }[] = [];
    cols.forEach((col) => {
      const group = groupHeaders.find((g) => g.fields.includes(col.field));
      const isFirstInGroup = group && col.field === group.fields[0];
      if (isFirstInGroup) {
        const groupFields = group.fields;
        let totalWidth = 0;
        groupFields.forEach((f) => {
          const c = cols.find((cl) => cl.field === f);
          if (c) totalWidth += typeof c.width === 'number' ? c.width : 150;
        });
        if (totalWidth > 0) {
          sections.push({ label: group.label, width: totalWidth });
        }
      } else if (!group) {
        const w = typeof col.width === 'number' ? col.width : 150;
        sections.push({ label: null, width: w });
      }
    });
    return sections.length > 0 ? sections : null;
  }, [groupHeaders, columns, hiddenColumns]);

  const displayRowCount = isServerSide ? (totalRowCount ?? 0) : filteredRows.length;
  const currentPage = isServerSide ? (paginationModel?.page ?? 0) : 0;
  const currentPageSize = isServerSide ? (paginationModel?.pageSize ?? 10) : 10;
  const isEmpty = !loading && displayRowCount === 0;
  const hasSearchActive = isServerSide ? !!searchValue : !!localSearch;

  const DEFAULT_ROW_HEIGHT = 48;
  const HEADER_FOOTER_HEIGHT = 112;
  const idealHeight = (rows.length || 10) * DEFAULT_ROW_HEIGHT + HEADER_FOOTER_HEIGHT;
  const gridMaxHeight = `min(${idealHeight}px, calc(100vh - 280px))`;

  return (
    <Card
      variant="outlined"
      sx={{
        overflow: 'hidden',
        borderRadius: 1.5,
        borderColor: 'divider',
      }}
    >
      <Box sx={{ borderBottom: '1px solid', borderColor: 'divider' }}>
        <Stack direction="row" spacing={1} alignItems="center" sx={{ px: 2, py: 1.5 }}>
          <TextField
            size="small"
            placeholder={searchPlaceholder}
            value={onSearchChange ? (searchValue ?? '') : localSearch}
            onChange={handleSearchChange}
            sx={{ maxWidth: 360, flex: { xs: 1, sm: 'unset' } }}
            InputProps={{
              sx: { height: 40 },
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
              sx={{ height: 40 }}
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

            {!hideColumnsButton && (
              <>
                <Button
                  size="small"
                  variant="text"
                  color="inherit"
                  startIcon={<Iconify icon="solar:columns-3-bold" width={16} />}
                  onClick={columnsPopover.onOpen}
                  sx={{ height: 40 }}
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
              </>
            )}
          </Stack>
        </Stack>
      </Box>

      {groupHeaderSections && (
        <Box sx={{ display: 'flex', borderBottom: '1px solid', borderColor: 'divider' }}>
          {groupHeaderSections.map((section, i) => (
            <Box
              key={i}
              sx={{
                width: section.width,
                py: 1.5,
                textAlign: 'center',
                fontWeight: 600,
                fontSize: '0.8125rem',
                color: 'text.secondary',
                borderRight: i < groupHeaderSections.length - 1 ? '1px solid' : 'none',
                borderColor: 'divider',
                bgcolor: 'grey.100',
              }}
            >
              {section.label ?? ''}
            </Box>
          ))}
        </Box>
      )}

      <Box
        sx={{
          maxHeight: gridMaxHeight,
          overflow: 'auto',
          position: 'relative',
          ...(isEmpty ? { minHeight: 200 } : {}),
        }}
      >
        <DataGrid
          rows={isServerSide ? rows : filteredRows}
          columns={processedColumns}
          loading={loading}
          getRowId={getRowId ?? ((row) => row.id)}
          onRowClick={(params) => onRowClick?.(params.row)}
          paginationMode={paginationMode}
          {...(isServerSide && paginationModel ? { paginationModel } : {})}
          {...(isServerSide && onPaginationModelChange ? { onPaginationModelChange } : {})}
          {...(isServerSide && totalRowCount !== undefined ? { rowCount: totalRowCount } : {})}
          {...(columnHeaderHeight ? { columnHeaderHeight } : {})}
          initialState={isServerSide ? undefined : { pagination: { paginationModel: { pageSize: 10 } } }}
          pageSizeOptions={[10, 25, 50]}
          disableRowSelectionOnClick
          disableColumnMenu
          disableColumnResize
          autoHeight
          slots={{
            footer: () => (
              <DataGridFooter
                rowCount={displayRowCount}
                page={currentPage}
                pageSize={currentPageSize}
              />
            ),
            noRowsOverlay: () => (
              <EmptyStateContent hasSearch={hasSearchActive} searchPlaceholder={searchPlaceholder} />
            ),
            noResultsOverlay: () => (
              <EmptyStateContent hasSearch={hasSearchActive} searchPlaceholder={searchPlaceholder} />
            ),
            loadingOverlay: () => null,
          }}
          getRowHeight={getRowHeight ?? (() => DEFAULT_ROW_HEIGHT)}
          sx={{
            borderRadius: 0,
            border: 'none',
            minWidth: processedColumns.reduce((sum, col) => sum + (typeof col.width === 'number' ? col.width : 150), 0),
            '& .MuiDataGrid-main': {
              position: 'unset',
            },
            '& .MuiDataGrid-columnHeaders': {
              position: 'sticky',
              top: 0,
              zIndex: 10,
              borderBottom: '1px solid',
              borderColor: 'divider',
              bgcolor: 'grey.100',
              minHeight: `${columnHeaderHeight ?? 48}px !important`,
              maxHeight: `${columnHeaderHeight ?? 48}px !important`,
              lineHeight: `${columnHeaderHeight ?? 48}px !important`,
            },
            '& .MuiDataGrid-columnHeader': {
              px: 2,
              py: 0,
            },
            '& .MuiDataGrid-columnHeaderTitle': {
              fontWeight: 700,
              fontSize: '0.75rem',
              color: 'text.secondary',
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
            },
            '& .MuiDataGrid-columnHeader:focus': {
              outline: 'none',
            },
            '& .MuiDataGrid-columnHeader:focus-within': {
              outline: 'none',
            },
            '& .MuiDataGrid-cell': {
              px: 2,
              py: 0,
              display: 'flex',
              alignItems: 'center',
              fontSize: '0.8125rem',
              lineHeight: `${DEFAULT_ROW_HEIGHT}px`,
              minHeight: `${DEFAULT_ROW_HEIGHT}px !important`,
              maxHeight: `${DEFAULT_ROW_HEIGHT}px !important`,
              '&:focus': { outline: 'none' },
              '&:focus-within': { outline: 'none' },
            },
            '& .MuiDataGrid-row': {
              minHeight: `${DEFAULT_ROW_HEIGHT}px !important`,
              maxHeight: `${DEFAULT_ROW_HEIGHT}px !important`,
              cursor: onRowClick ? 'pointer' : 'default',
              '&:hover': {
                bgcolor: 'primary.lighter',
              },
              '&.Mui-selected': {
                bgcolor: 'primary.lighter',
              },
              '&:nth-of-type(even)': {
                bgcolor: 'grey.50',
              },
              '&:nth-of-type(even):hover': {
                bgcolor: 'primary.lighter',
              },
              ...(dataGridSx?.['& .MuiDataGrid-row'] || {}),
            },
            '& .MuiDataGrid-cell--textLeft': { justifyContent: 'flex-start' },
            '& .MuiDataGrid-cell--textCenter': { justifyContent: 'center' },
            '& .MuiDataGrid-cell--textRight': { justifyContent: 'flex-end' },
            '& .MuiDataGrid-withBorder': { borderColor: 'divider' },
            '& .MuiDataGrid-footerContainer': {
              borderTop: '1px solid',
              borderColor: 'divider',
              bgcolor: 'background.paper',
              minHeight: 52,
            },
            '& .MuiDataGrid-overlayWrapperInner': {
              position: 'relative',
              height: 'auto',
            },
            '& .MuiDataGrid-virtualScroller': {
              overflow: 'hidden !important',
            },
            '& .MuiDataGrid-virtualScrollerContent': {
              overflow: 'hidden',
            },
            '& .MuiTablePagination-root': {
              '& .MuiTablePagination-displayedRows': {
                display: 'none',
              },
              '& .MuiTablePagination-selectLabel': {
                fontSize: '0.8125rem',
                color: 'text.secondary',
              },
              '& .MuiTablePagination-select': {
                fontSize: '0.8125rem',
              },
              '& .MuiTablePagination-actions': {
                '& .MuiButtonBase-root': {
                  fontSize: '0.8125rem',
                },
              },
            },
            ...(dataGridSx || {}),
          } as any}
        />
      </Box>
    </Card>
  );
}

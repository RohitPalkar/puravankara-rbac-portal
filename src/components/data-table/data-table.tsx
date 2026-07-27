import type { GridColDef, GridPaginationModel } from '@mui/x-data-grid';

import { useMemo, useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import Checkbox from '@mui/material/Checkbox';
import Skeleton from '@mui/material/Skeleton';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import ListItemText from '@mui/material/ListItemText';
import ListItemIcon from '@mui/material/ListItemIcon';
import TablePagination from '@mui/material/TablePagination';
import { DataGrid, GridFooterContainer } from '@mui/x-data-grid';

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

type ActionSlot = {
  label: string;
  icon: string;
  onClick: () => void;
  color?: string;
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
  emptyTitle?: string;
  emptyDescription?: string;
  emptyIcon?: string;
  createAction?: ActionSlot;
  error?: boolean;
  errorMessage?: string;
  onErrorRetry?: () => void;
};

const ROW_HEIGHT = 52;
const DEFAULT_HEADER_HEIGHT = 48;
const FOOTER_HEIGHT = 52;

function CustomFooter({
  rowCount,
  page,
  pageSize,
  onPageChange,
  onPageSizeChange,
}: {
  rowCount: number;
  page: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
}) {
  const start = rowCount === 0 ? 0 : page * pageSize + 1;
  const end = Math.min((page + 1) * pageSize, rowCount);

  return (
    <GridFooterContainer>
      <Stack direction="row" alignItems="center" sx={{ px: 2.5, width: 1 }}>
        <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8125rem', whiteSpace: 'nowrap' }}>
          {rowCount === 0
            ? '0 records'
            : `Showing ${start}–${end} of ${rowCount} record${rowCount !== 1 ? 's' : ''}`}
        </Typography>
        <Box sx={{ flex: 1 }} />
        <TablePagination
          component="div"
          count={rowCount}
          page={page}
          onPageChange={(_, p) => onPageChange(p)}
          rowsPerPage={pageSize}
          onRowsPerPageChange={(e) => onPageSizeChange(parseInt(e.target.value, 10))}
          rowsPerPageOptions={[10, 25, 50]}
          labelRowsPerPage="Rows per page"
          labelDisplayedRows={() => ''}
        />
      </Stack>
    </GridFooterContainer>
  );
}

function LoadingSkeleton({ columnCount }: { columnCount: number }) {
  return (
    <Box sx={{ px: 2.5, py: 1 }}>
      {Array.from({ length: 5 }).map((_row, i) => (
        <Box
          key={i}
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            height: ROW_HEIGHT,
            borderBottom: '1px solid',
            borderColor: 'divider',
          }}
        >
          {Array.from({ length: Math.min(columnCount, 6) }).map((_cell, j) => (
            <Skeleton key={j} variant="rectangular" height={16} sx={{ flex: j === 0 ? 2 : 1, borderRadius: 0.5 }} />
          ))}
        </Box>
      ))}
    </Box>
  );
}

function EmptyContent({
  hasSearch,
  emptyTitle,
  emptyDescription,
  emptyIcon,
  createAction,
}: {
  hasSearch: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyIcon?: string;
  createAction?: ActionSlot;
}) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', py: 8, px: 2 }}>
      <Iconify
        icon={hasSearch ? 'solar:search-cross-bold' : (emptyIcon ?? 'solar:clipboard-list-bold')}
        width={48}
        sx={{ color: 'text.disabled', mb: 2, opacity: 0.4 }}
      />
      <Typography variant="h6" sx={{ color: 'text.secondary', fontWeight: 500, mb: 0.5 }}>
        {hasSearch ? 'No results found' : (emptyTitle ?? 'No data')}
      </Typography>
      <Typography variant="body2" color="text.disabled" sx={{ textAlign: 'center', mb: createAction ? 2 : 0 }}>
        {hasSearch ? 'No records match your search. Try different keywords.' : (emptyDescription ?? 'No records to display.')}
      </Typography>
      {!hasSearch && createAction && (
        <Button
          variant="soft"
          color="primary"
          startIcon={<Iconify icon={createAction.icon} width={18} />}
          onClick={createAction.onClick}
        >
          {createAction.label}
        </Button>
      )}
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
  emptyTitle,
  emptyDescription,
  emptyIcon,
  createAction,
  error,
  errorMessage,
  onErrorRetry,
}: Props) {
  const [localSearch, setLocalSearch] = useState('');
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [hiddenColumns, setHiddenColumns] = useState<Set<string>>(new Set());
  const filterPopover = usePopover();
  const columnsPopover = usePopover();

  useEffect(() => {
    onFiltersChange?.(filters);
  }, [filters, onFiltersChange]);

  const isServerSide = paginationMode === 'server';

  const visibleColumns = useMemo(() => columns.filter((col) => col.field !== 'actions'), [columns]);

  const filteredRows = useMemo(() => {
    if (isServerSide) return rows;
    let data = rows;
    const searchText = localSearch.toLowerCase();
    if (searchText) {
      data = data.filter((row) =>
        columns.some((col) => {
          if (hiddenColumns.has(col.field)) return false;
          const val = row[col.field];
          if (val == null) return false;
          return String(val).toLowerCase().includes(searchText);
        })
      );
    }
    Object.entries(filters).forEach(([key, val]) => {
      if (val) data = data.filter((row) => String(row[key]) === val);
    });
    return data;
  }, [rows, localSearch, filters, columns, hiddenColumns, isServerSide]);

  const processedColumns = useMemo(
    () => columns.filter((col) => !hiddenColumns.has(col.field)),
    [columns, hiddenColumns]
  );

  const handleToggleColumn = useCallback((field: string) => {
    setHiddenColumns((prev) => {
      const next = new Set(prev);
      if (next.has(field)) next.delete(field);
      else next.add(field);
      return next;
    });
  }, []);

  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const { value } = e.target;
      if (onSearchChange) {
        onSearchChange(value);
      } else {
        setLocalSearch(value);
      }
    },
    [onSearchChange]
  );

  const hasActiveFilters = Object.values(filters).some((v) => v);

  const displayRowCount = isServerSide ? (totalRowCount ?? 0) : filteredRows.length;
  const currentPage = isServerSide ? (paginationModel?.page ?? 0) : 0;
  const currentPageSize = isServerSide ? (paginationModel?.pageSize ?? 10) : 10;
  const isEmpty = !loading && !error && displayRowCount === 0;
  const hasSearchActive = isServerSide ? !!searchValue : !!localSearch;

  const handlePaginationChange = useCallback(
    (page: number) => {
      onPaginationModelChange?.({ page, pageSize: currentPageSize });
    },
    [currentPageSize, onPaginationModelChange]
  );

  const handlePageSizeChange = useCallback(
    (pageSize: number) => {
      onPaginationModelChange?.({ page: 0, pageSize });
    },
    [onPaginationModelChange]
  );

  const effectiveHeaderHeight = columnHeaderHeight ?? DEFAULT_HEADER_HEIGHT;

  const gridColumns = useMemo(
    () =>
      processedColumns.map((col) => ({
        ...col,
        headerAlign: col.headerAlign ?? (col.align === 'right' ? 'right' : col.align === 'center' ? 'center' : 'left'),
        align: col.align ?? 'left',
      })),
    [processedColumns]
  );

  return (
    <Card
      variant="outlined"
      sx={{
        borderRadius: 1.5,
        borderColor: 'divider',
        overflow: 'hidden',
        width: 1,
      }}
    >
      <Box sx={{ borderBottom: '1px solid', borderColor: 'divider', bgcolor: 'background.paper' }}>
        <Stack direction="row" spacing={1} alignItems="center" sx={{ px: 2.5, py: 1.5 }}>
          <TextField
            size="small"
            placeholder={searchPlaceholder}
            value={onSearchChange ? (searchValue ?? '') : localSearch}
            onChange={handleSearchChange}
            sx={{ maxWidth: 360, flex: { xs: 1, sm: 'unset' } }}
            InputProps={{
              sx: { height: 40 },
              startAdornment: (
                <Iconify icon="solar:magnifer-bold" width={18} style={{ marginRight: 8, opacity: 0.5 }} />
              ),
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
            <CustomPopover
              open={filterPopover.open}
              anchorEl={filterPopover.anchorEl}
              onClose={filterPopover.onClose}
            >
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
                        <MenuItem key={o.value} value={o.value}>
                          {o.label}
                        </MenuItem>
                      ))}
                    </TextField>
                  ))
                ) : (
                  <Typography variant="body2" color="text.secondary" sx={{ py: 1 }}>
                    No filter options available
                  </Typography>
                )}
                {hasActiveFilters && (
                  <Button
                    size="small"
                    color="error"
                    variant="text"
                    onClick={() => {
                      setFilters({});
                      filterPopover.onClose();
                    }}
                  >
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
                <CustomPopover
                  open={columnsPopover.open}
                  anchorEl={columnsPopover.anchorEl}
                  onClose={columnsPopover.onClose}
                >
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

      {error ? (
        <Box sx={{ p: 4, textAlign: 'center' }}>
          <Stack spacing={2} alignItems="center">
            <Iconify icon="solar:danger-triangle-bold" width={40} sx={{ color: 'error.main', opacity: 0.6 }} />
            <Box>
              <Typography variant="h6" sx={{ color: 'text.secondary', fontWeight: 500 }}>
                Failed to load data
              </Typography>
              <Typography variant="body2" color="text.disabled" sx={{ mt: 0.5 }}>
                {errorMessage || 'An unexpected error occurred. Please try again.'}
              </Typography>
            </Box>
            {onErrorRetry && (
              <Button variant="outlined" size="small" onClick={onErrorRetry}>
                Retry
              </Button>
            )}
          </Stack>
        </Box>
      ) : loading && rows.length === 0 ? (
        <LoadingSkeleton columnCount={visibleColumns.length} />
      ) : isEmpty ? (
        <EmptyContent
          hasSearch={hasSearchActive}
          emptyTitle={emptyTitle}
          emptyDescription={emptyDescription}
          emptyIcon={emptyIcon}
          createAction={createAction}
        />
      ) : (
        <DataGrid
          autoHeight
          rows={isServerSide ? rows : filteredRows}
          columns={gridColumns}
          loading={loading}
          getRowId={getRowId ?? ((row: any) => row.id)}
          onRowClick={(params) => onRowClick?.(params.row)}
          paginationMode={paginationMode}
          {...(isServerSide && paginationModel ? { paginationModel } : {})}
          {...(isServerSide && onPaginationModelChange ? { onPaginationModelChange } : {})}
          {...(isServerSide && totalRowCount !== undefined ? { rowCount: totalRowCount } : {})}
          columnHeaderHeight={effectiveHeaderHeight}
          initialState={isServerSide ? undefined : { pagination: { paginationModel: { pageSize: 10 } } }}
          pageSizeOptions={[10, 25, 50]}
          disableRowSelectionOnClick
          disableColumnMenu
          disableColumnResize
          slots={{
            ...(isServerSide && {
              footer: () => (
                <CustomFooter
                  rowCount={displayRowCount}
                  page={currentPage}
                  pageSize={currentPageSize}
                  onPageChange={handlePaginationChange}
                  onPageSizeChange={handlePageSizeChange}
                />
              ),
            }),
            noRowsOverlay: () => null,
            loadingOverlay: () => null,
          }}
          getRowHeight={getRowHeight ?? (() => ROW_HEIGHT)}
          sx={{
            borderRadius: 0,
            border: 'none',
            '& .MuiDataGrid-columnHeaders': {
              borderBottom: '2px solid',
              borderColor: 'divider',
              bgcolor: 'grey.100',
              minHeight: `${effectiveHeaderHeight}px !important`,
              maxHeight: `${effectiveHeaderHeight}px !important`,
              lineHeight: `${effectiveHeaderHeight}px !important`,
            },
            '& .MuiDataGrid-columnHeader': {
              px: 2.5,
              py: 1.75,
            },
            '& .MuiDataGrid-columnHeaderTitle': {
              fontWeight: 700,
              fontSize: '0.75rem',
              color: 'text.secondary',
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
            },
            '& .MuiDataGrid-columnHeader:focus': { outline: 'none' },
            '& .MuiDataGrid-columnHeader:focus-within': { outline: 'none' },
            '& .MuiDataGrid-cell': {
              px: 2.5,
              py: 1.5,
              display: 'flex',
              alignItems: 'center',
              fontSize: '0.8125rem',
              minHeight: `${ROW_HEIGHT}px !important`,
              maxHeight: `${ROW_HEIGHT}px !important`,
              '&:focus': { outline: 'none' },
              '&:focus-within': { outline: 'none' },
            },
            '& .MuiDataGrid-row': {
              minHeight: `${ROW_HEIGHT}px !important`,
              maxHeight: `${ROW_HEIGHT}px !important`,
              cursor: onRowClick ? 'pointer' : 'default',
              '&:hover': { bgcolor: 'primary.lighter' },
              '&.Mui-selected': { bgcolor: 'primary.lighter' },
              '&:nth-of-type(even)': { bgcolor: 'grey.50' },
              '&:nth-of-type(even):hover': { bgcolor: 'primary.lighter' },
            },
            '& .MuiDataGrid-cell--textLeft': { justifyContent: 'flex-start' },
            '& .MuiDataGrid-cell--textCenter': { justifyContent: 'center' },
            '& .MuiDataGrid-cell--textRight': { justifyContent: 'flex-end' },
            '& .MuiDataGrid-withBorder': { borderColor: 'divider' },
            '& .MuiDataGrid-footerContainer': {
              borderTop: '2px solid',
              borderColor: 'divider',
              bgcolor: 'background.paper',
              minHeight: FOOTER_HEIGHT,
            },
            '& .MuiTablePagination-root': {
              '& .MuiTablePagination-selectLabel': { fontSize: '0.8125rem', color: 'text.secondary' },
              '& .MuiTablePagination-select': { fontSize: '0.8125rem' },
            },
            ...(dataGridSx || {}),
          } as any}
        />
      )}
    </Card>
  );
}

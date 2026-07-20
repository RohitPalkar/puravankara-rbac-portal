import type { ReactNode } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TableSortLabel from '@mui/material/TableSortLabel';
import Typography from '@mui/material/Typography';

import { useDataTable } from '../hooks/use-data-table';
import type { TableColumn, LeafColumn } from '../hooks/types';
import { isGroupedColumn, isLeafColumn } from '../hooks/types';
import { TableToolbar } from '../TableToolbar';
import { TablePagination } from '../TablePagination';
import { TableLoading } from '../TableLoading';
import { TableEmptyState } from '../TableEmptyState';
import type { FilterOption } from '../TableFilters';

type Props = {
  columns: TableColumn[];
  rows: any[];
  getRowId: (row: any) => string;
  loading?: boolean;
  searchPlaceholder?: string;
  searchFields?: string[];
  defaultSortField?: string;
  filterOptions?: FilterOption[];
  emptyState?: ReactNode;
  stickyHeader?: boolean;
  maxHeight?: string | number;
  pageSizeOptions?: number[];
};

function getLeafColumns(columns: TableColumn[]): LeafColumn[] {
  const result: LeafColumn[] = [];
  columns.forEach((col) => {
    if (isLeafColumn(col)) result.push(col);
    else if (isGroupedColumn(col)) result.push(...col.children);
  });
  return result;
}

export function StandardDataTable({
  columns,
  rows,
  getRowId,
  loading = false,
  searchPlaceholder = 'Search...',
  searchFields,
  defaultSortField,
  filterOptions,
  emptyState,
  stickyHeader = true,
  maxHeight,
  pageSizeOptions = [5, 10, 25, 50],
}: Props) {
  const {
    search,
    setSearch,
    sort,
    handleSort,
    filters,
    handleFilter,
    handleClearFilters,
    page,
    rowsPerPage,
    totalPages,
    handlePageChange,
    handleRowsPerPageChange,
    filteredRows,
    totalFilteredCount,
  } = useDataTable({
    columns,
    rows,
    defaultSortField,
    searchFields,
  });

  const leafCols = getLeafColumns(columns);

  return (
    <Card sx={{ overflow: 'hidden' }}>
      <TableToolbar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder={searchPlaceholder}
        filterOptions={filterOptions}
        filters={filters}
        onFilter={handleFilter}
        onClearFilters={handleClearFilters}
      />

      {loading && <TableLoading />}

      <Box sx={{ overflowX: 'auto' }}>
        <TableContainer sx={{ maxHeight: maxHeight ?? 'auto' }}>
          <Table stickyHeader={stickyHeader} size="small">
            <TableHead>
              <TableRow>
                {leafCols.map((col, idx) => (
                  <TableCell
                    key={`header-${col.field}-${idx}`}
                    align={col.align || 'left'}
                    sx={{
                      fontWeight: 600,
                      fontSize: 13,
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      color: 'text.secondary',
                      whiteSpace: 'nowrap',
                      borderBottom: '2px solid',
                      borderBottomColor: 'divider',
                      width: col.width,
                      minWidth: col.minWidth,
                      py: 1.5,
                      px: 2,
                    }}
                  >
                    {col.sortable !== false ? (
                      <TableSortLabel
                        active={sort?.field === col.field}
                        direction={sort?.field === col.field ? sort.direction : 'asc'}
                        onClick={() => handleSort(col.field)}
                        sx={{ '& .MuiTableSortLabel-icon': { opacity: 1 } }}
                      >
                        {col.title}
                      </TableSortLabel>
                    ) : (
                      col.title
                    )}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>

            <TableBody>
              {filteredRows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={leafCols.length} sx={{ borderBottom: 'none' }}>
                    {emptyState || <TableEmptyState title="No data found" />}
                  </TableCell>
                </TableRow>
              ) : (
                filteredRows.map((row) => (
                  <TableRow
                    key={getRowId(row)}
                    sx={{
                      '&:hover': { bgcolor: 'action.hover' },
                      '& td': { borderBottomStyle: 'dashed', py: 1.5, px: 2 },
                    }}
                  >
                    {leafCols.map((col, idx) => (
                      <TableCell
                        key={`cell-${col.field}-${idx}`}
                        align={col.align || 'left'}
                        sx={{ width: col.width, minWidth: col.minWidth }}
                      >
                        {col.renderCell
                          ? col.renderCell(row)
                          : (
                            <Typography variant="body2">
                              {row[col.field] ?? '—'}
                            </Typography>
                          )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>

      <TablePagination
        page={page}
        count={totalPages}
        rowsPerPage={rowsPerPage}
        totalCount={totalFilteredCount}
        onPageChange={handlePageChange}
        onRowsPerPageChange={handleRowsPerPageChange}
        rowsPerPageOptions={pageSizeOptions}
      />
    </Card>
  );
}
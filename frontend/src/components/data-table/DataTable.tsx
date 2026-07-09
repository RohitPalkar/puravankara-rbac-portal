import type { ReactNode } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TableSortLabel,
  Paper,
  TextField,
  Box,
  Skeleton,
} from '@mui/material'
import EmptyState from '@/components/common/EmptyState'

export interface Column<T> {
  id: string
  label: string
  render: (row: T) => ReactNode
  sortable?: boolean
  width?: number | string
  align?: 'left' | 'center' | 'right'
}

interface Props<T> {
  columns: Column<T>[]
  rows: T[]
  total: number
  page: number
  rowsPerPage: number
  sortField?: string
  sortDir?: 'asc' | 'desc'
  searchValue?: string
  loading?: boolean
  onPageChange: (page: number) => void
  onRowsPerPageChange: (rowsPerPage: number) => void
  onSort?: (field: string) => void
  onSearchChange?: (value: string) => void
  searchPlaceholder?: string
  keyExtractor: (row: T) => string
  emptyMessage?: string
}

export default function DataTable<T>({
  columns,
  rows,
  total,
  page,
  rowsPerPage,
  sortField,
  sortDir,
  searchValue,
  loading,
  onPageChange,
  onRowsPerPageChange,
  onSort,
  onSearchChange,
  searchPlaceholder = 'Search...',
  keyExtractor,
  emptyMessage,
}: Props<T>) {
  return (
    <Paper>
      {onSearchChange && (
        <Box sx={{ p: 2, pb: 0 }}>
          <TextField
            size="small"
            placeholder={searchPlaceholder}
            value={searchValue || ''}
            onChange={(e) => onSearchChange(e.target.value)}
            sx={{ maxWidth: 320 }}
          />
        </Box>
      )}

      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>
              {columns.map((col) => (
                <TableCell
                  key={col.id}
                  align={col.align}
                  sx={{ fontWeight: 600, whiteSpace: 'nowrap', width: col.width }}
                >
                  {col.sortable && onSort ? (
                    <TableSortLabel
                      active={sortField === col.id}
                      direction={sortField === col.id ? sortDir : 'asc'}
                      onClick={() => onSort(col.id)}
                    >
                      {col.label}
                    </TableSortLabel>
                  ) : (
                    col.label
                  )}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={`skeleton-${i}`}>
                  {columns.map((col) => (
                    <TableCell key={col.id}>
                      <Skeleton />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length}>
                  <EmptyState message={emptyMessage} />
                </TableCell>
              </TableRow>
            ) : (
              rows.map((row) => (
                <TableRow key={keyExtractor(row)} hover>
                  {columns.map((col) => (
                    <TableCell key={col.id} align={col.align}>
                      {col.render(row)}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        component="div"
        count={total}
        page={page}
        rowsPerPage={rowsPerPage}
        onPageChange={(_, p) => onPageChange(p)}
        onRowsPerPageChange={(e) => onRowsPerPageChange(parseInt(e.target.value, 10))}
        rowsPerPageOptions={[10, 25, 50]}
      />
    </Paper>
  )
}

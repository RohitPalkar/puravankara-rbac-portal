import { useMemo, useState } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import Stack from '@mui/material/Stack';
import TableRow from '@mui/material/TableRow';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TextField from '@mui/material/TextField';
import TableContainer from '@mui/material/TableContainer';
import TablePagination from '@mui/material/TablePagination';

import { Iconify } from 'src/components/iconify';
import { EmptyState } from 'src/components/empty-state';
import { TableSkeleton } from 'src/components/loading-skeleton';

export type GroupColumn = {
  group: string;
  groupSpan: number;
  children: {
    id: string;
    label: string;
    minWidth?: number;
    render: (row: any) => React.ReactNode;
  }[];
};

type Props = {
  columns: GroupColumn[];
  rows: any[];
  getRowId: (row: any) => string;
  loading?: boolean;
  searchPlaceholder?: string;
  onRowClick?: (row: any) => void;
  actions?: (row: any) => React.ReactNode;
};

export function GroupedHeaderTable({
  columns,
  rows,
  getRowId,
  loading,
  searchPlaceholder = 'Search...',
  onRowClick,
  actions,
}: Props) {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const flatColumns = useMemo(() => columns.flatMap((g) => g.children), [columns]);

  const filteredRows = useMemo(() => {
    if (!search) return rows;
    const lower = search.toLowerCase();
    return rows.filter((row) =>
      flatColumns.some((col) => {
        const val = row[col.id];
        return val != null && String(val).toLowerCase().includes(lower);
      })
    );
  }, [rows, search, flatColumns]);

  const pagedRows = useMemo(
    () => filteredRows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage),
    [filteredRows, page, rowsPerPage]
  );

  return (
    <Card sx={{ overflow: 'hidden' }}>
      <Box sx={{ borderBottom: '1px solid', borderColor: 'divider' }}>
        <Stack direction="row" spacing={1} alignItems="center" sx={{ px: 2, py: 1.5 }}>
          <TextField
            size="small"
            placeholder={searchPlaceholder}
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(0); }}
            sx={{ flex: 1, maxWidth: 360 }}
            InputProps={{
              startAdornment: <Iconify icon="solar:magnifer-bold" width={18} style={{ marginRight: 8, opacity: 0.5 }} />,
            }}
          />
        </Stack>
      </Box>

      <TableContainer sx={{ overflowX: 'auto' }}>
        <Table>
          <TableHead>
            {columns.map((group, gi) => (
              <TableRow key={gi}>
                {group.children.map((child, ci) => {
                  const isFirst = ci === 0;
                  const isLast = ci === group.children.length - 1;
                  return (
                    <TableCell
                      key={child.id}
                      sx={{
                        minWidth: child.minWidth ?? 120,
                        fontWeight: 600,
                        borderLeft: isFirst ? 'none' : '1px dashed',
                        borderLeftColor: 'divider',
                        borderRight: isLast ? 'none' : '1px dashed',
                        borderRightColor: 'divider',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {child.label}
                    </TableCell>
                  );
                })}
                {actions && <TableCell sx={{ minWidth: 60 }} />}
              </TableRow>
            ))}
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={flatColumns.length + (actions ? 1 : 0)}>
                  <TableSkeleton rows={5} columns={flatColumns.length} />
                </TableCell>
              </TableRow>
            ) : pagedRows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={flatColumns.length + (actions ? 1 : 0)}>
                  <EmptyState />
                </TableCell>
              </TableRow>
            ) : (
              pagedRows.map((row) => (
                <TableRow
                  key={getRowId(row)}
                  hover
                  onClick={() => onRowClick?.(row)}
                  sx={{ cursor: onRowClick ? 'pointer' : 'default' }}
                >
                  {flatColumns.map((col) => (
                    <TableCell key={col.id}>
                      {col.render(row)}
                    </TableCell>
                  ))}
                  {actions && (
                    <TableCell>{actions(row)}</TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        component="div"
        count={filteredRows.length}
        page={page}
        onPageChange={(_, p) => setPage(p)}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
        rowsPerPageOptions={[5, 10, 25]}
      />
    </Card>
  );
}

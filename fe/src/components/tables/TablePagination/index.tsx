import MuiPagination from '@mui/material/Pagination';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';

type Props = {
  page: number;
  count: number;
  rowsPerPage: number;
  totalCount: number;
  onPageChange: (page: number) => void;
  onRowsPerPageChange: (rowsPerPage: number) => void;
  rowsPerPageOptions?: number[];
};

export function TablePagination({
  page,
  count,
  rowsPerPage,
  totalCount,
  onPageChange,
  onRowsPerPageChange,
  rowsPerPageOptions = [5, 10, 25, 50],
}: Props) {
  if (totalCount === 0) return null;

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        px: 2,
        py: 1.5,
        borderTop: '1px dashed',
        borderColor: 'divider',
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Typography variant="body2" color="text.secondary">
          Rows per page:
        </Typography>
        <TextField
          select
          size="small"
          value={rowsPerPage}
          onChange={(e) => onRowsPerPageChange(Number(e.target.value))}
          sx={{ minWidth: 70 }}
        >
          {rowsPerPageOptions.map((opt) => (
            <MenuItem key={opt} value={opt}>{opt}</MenuItem>
          ))}
        </TextField>
        <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
          {page * rowsPerPage + 1}–{Math.min((page + 1) * rowsPerPage, totalCount)} of {totalCount}
        </Typography>
      </Box>

      <MuiPagination
        count={count}
        page={page + 1}
        onChange={(_, p) => onPageChange(p - 1)}
        shape="rounded"
        size="small"
      />
    </Box>
  );
}
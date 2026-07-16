import Box from '@mui/material/Box';
import LinearProgress from '@mui/material/LinearProgress';

export function TableLoading() {
  return (
    <Box sx={{ width: '100%' }}>
      <LinearProgress />
    </Box>
  );
}
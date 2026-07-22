import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import { CONFIG } from 'src/config-global';

export function DashboardFooter() {
  const env = import.meta.env.MODE ?? 'production';

  return (
    <Box
      component="footer"
      sx={{
        px: 4,
        py: 2,
        mt: 'auto',
        borderTop: '1px solid',
        borderColor: 'divider',
        bgcolor: 'background.default',
      }}
    >
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        justifyContent="space-between"
        alignItems={{ sm: 'center' }}
        spacing={1}
      >
        <Typography variant="caption" color="text.secondary">
          &copy; {new Date().getFullYear()} {CONFIG.appName}
        </Typography>
        <Stack direction="row" spacing={2} divider={<Divider orientation="vertical" flexItem />}>
          <Typography variant="caption" color="text.disabled">
            v{CONFIG.appVersion}
          </Typography>
          <Typography variant="caption" color="text.disabled">
            {env.charAt(0).toUpperCase() + env.slice(1)}
          </Typography>
        </Stack>
      </Stack>
    </Box>
  );
}

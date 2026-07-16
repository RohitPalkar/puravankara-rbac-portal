import type { StackProps } from '@mui/material/Stack';

import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

type Props = StackProps & {
  title: string;
  description?: string;
  action?: React.ReactNode;
};

export function PageHeader({ title, description, action, sx, ...other }: Props) {
  return (
    <Stack
      direction={{ xs: 'column', sm: 'row' }}
      alignItems={{ xs: 'flex-start', sm: 'center' }}
      justifyContent="space-between"
      spacing={{ xs: 1.5, sm: 0 }}
      sx={{ mb: 3, ...sx }}
      {...other}
    >
      <Stack spacing={0.5}>
        <Typography variant="h4">{title}</Typography>
        {description && (
          <Typography variant="body2" color="text.secondary">
            {description}
          </Typography>
        )}
      </Stack>
      {action}
    </Stack>
  );
}

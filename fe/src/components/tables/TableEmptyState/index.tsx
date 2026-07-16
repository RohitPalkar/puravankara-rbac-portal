import type { ReactNode } from 'react';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

type Props = {
  icon?: ReactNode;
  title?: string;
  description?: string;
  action?: ReactNode;
};

export function TableEmptyState({ icon, title = 'No data found', description, action }: Props) {
  return (
    <Box sx={{ textAlign: 'center', py: 8 }}>
      {icon && <Box sx={{ mb: 2 }}>{icon}</Box>}
      <Typography variant="h6" color="text.secondary">{title}</Typography>
      {description && (
        <Typography variant="body2" color="text.disabled" sx={{ mb: 3 }}>
          {description}
        </Typography>
      )}
      {action}
    </Box>
  );
}
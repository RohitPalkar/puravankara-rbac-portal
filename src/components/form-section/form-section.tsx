import type { ReactNode } from 'react';

import Stack from '@mui/material/Stack';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';

type Props = {
  title: string;
  description?: string;
  children: ReactNode;
};

export function FormSection({ title, description, children }: Props) {
  return (
    <Stack spacing={2.5}>
      <Stack spacing={0.5}>
        <Typography variant="subtitle1">{title}</Typography>
        {description && (
          <Typography variant="body2" color="text.secondary">
            {description}
          </Typography>
        )}
      </Stack>
      <Divider sx={{ borderStyle: 'dashed' }} />
      <Stack
        display="grid"
        gridTemplateColumns={{ xs: '1fr', sm: '1fr 1fr' }}
        gap={2.5}
      >
        {children}
      </Stack>
    </Stack>
  );
}

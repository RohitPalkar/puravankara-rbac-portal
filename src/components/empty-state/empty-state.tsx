import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';

import { Iconify } from 'src/components/iconify';

type ActionSlot = {
  icon: string;
  label: string;
  onClick: () => void;
};

type Props = {
  icon?: string;
  title?: string;
  description?: string;
  action?: ActionSlot;
};

export function EmptyState({
  icon = 'solar:inbox-archive-bold-duotone',
  title = 'No data found',
  description,
  action,
}: Props) {
  return (
    <Stack alignItems="center" justifyContent="center" spacing={1.5} sx={{ py: 8 }}>
      <Iconify icon={icon} width={48} sx={{ color: 'text.disabled' }} />
      <Typography variant="h6" color="text.secondary">{title}</Typography>
      {description && (
        <Typography variant="body2" color="text.disabled">{description}</Typography>
      )}
      {action && (
        <Button
          variant="soft"
          color="primary"
          startIcon={<Iconify icon={action.icon} width={18} />}
          onClick={action.onClick}
        >
          {action.label}
        </Button>
      )}
    </Stack>
  );
}

import { useNavigate } from 'react-router-dom';

import Link from '@mui/material/Link';
import Typography from '@mui/material/Typography';
import Breadcrumbs from '@mui/material/Breadcrumbs';

import { Iconify } from 'src/components/iconify';

type Crumb = {
  label: string;
  href?: string;
};

type Props = {
  items: Crumb[];
};

export function Breadcrumb({ items }: Props) {
  const navigate = useNavigate();

  return (
    <Breadcrumbs
      separator={<Iconify icon="solar:alt-arrow-right-bold" width={14} sx={{ color: 'text.disabled' }} />}
      sx={{ mb: 1.5 }}
    >
      {items.map((item, idx) => {
        const isLast = idx === items.length - 1;
        if (isLast || !item.href) {
          return (
            <Typography key={item.label} variant="body2" color="text.disabled">
              {item.label}
            </Typography>
          );
        }
        return (
          <Link
            key={item.label}
            variant="body2"
            underline="hover"
            color="text.primary"
            sx={{ cursor: 'pointer' }}
            onClick={() => navigate(item.href!)}
          >
            {item.label}
          </Link>
        );
      })}
    </Breadcrumbs>
  );
}

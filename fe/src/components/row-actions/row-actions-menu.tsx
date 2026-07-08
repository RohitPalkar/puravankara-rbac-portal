import { useState } from 'react';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import { Iconify } from 'src/components/iconify';

type ActionMenuItem = {
  label: string;
  icon: string;
  onClick: () => void;
  color?: string;
};

type Props = {
  actions: ActionMenuItem[];
};

export function RowActionsMenu({ actions }: Props) {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const open = Boolean(anchorEl);

  return (
    <>
      <IconButton
        size="small"
        onClick={(e) => { e.stopPropagation(); setAnchorEl(e.currentTarget); }}
        sx={{ mx: 'auto', display: 'flex' }}
      >
        <Iconify icon="solar:menu-dots-bold" width={18} />
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={() => setAnchorEl(null)}
        onClick={() => setAnchorEl(null)}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        slotProps={{
          paper: { sx: { minWidth: 140, '& .MuiMenuItem-root': { py: 0.75 } } },
        }}
      >
        {actions.map((action) => (
          <MenuItem key={action.label} onClick={action.onClick}>
            <ListItemIcon>
              <Iconify icon={action.icon} width={18} color={action.color ?? 'text.primary'} />
            </ListItemIcon>
            <ListItemText primary={action.label} />
          </MenuItem>
        ))}
      </Menu>
    </>
  );
}
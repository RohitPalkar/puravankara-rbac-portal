import { useState, useMemo } from 'react';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import { Iconify } from 'src/components/iconify';
import { usePermissionStore } from 'src/stores/permission-store';

type ActionMenuItem = {
  label: string;
  icon: string;
  onClick: () => void;
  color?: string;
  action?: string;
};

type Props = {
  actions: ActionMenuItem[];
  moduleCode?: string;
};

export function RowActionsMenu({ actions, moduleCode }: Props) {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const open = Boolean(anchorEl);
  const can = usePermissionStore((s) => s.can);
  const hasPermission = usePermissionStore((s) => s.hasPermission);

  const visibleActions = useMemo(() => {
    if (!moduleCode) return actions;
    const moduleAllowed = hasPermission(moduleCode);
    if (!moduleAllowed) return [];
    return actions.filter((a) => {
      if (!a.action) return true;
      return can(moduleCode, a.action);
    });
  }, [actions, moduleCode, can, hasPermission]);

  if (visibleActions.length === 0) return null;

  return (
    <>
      <IconButton
        onClick={(e) => { e.stopPropagation(); setAnchorEl(e.currentTarget); }}
        sx={{ width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      >
        <Iconify icon="solar:menu-dots-bold" width={20} sx={{ transform: 'rotate(90deg)' }} />
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
        {visibleActions.map((actionItem) => (
          <MenuItem key={actionItem.label} onClick={actionItem.onClick}>
            <ListItemIcon>
              <Iconify icon={actionItem.icon} width={18} color={actionItem.color ?? 'text.primary'} />
            </ListItemIcon>
            <ListItemText primary={actionItem.label} />
          </MenuItem>
        ))}
      </Menu>
    </>
  );
}
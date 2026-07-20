import { useState, useCallback } from 'react';

import Menu from '@mui/material/Menu';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import ListItemText from '@mui/material/ListItemText';
import ListItemIcon from '@mui/material/ListItemIcon';

import { MOCK_USER_PROFILES } from 'src/services/mock-data';
import { usePermissionStore } from 'src/stores/permission-store';

import { Iconify } from 'src/components/iconify';

export function RoleSwitcher() {
  const activeProfileId = usePermissionStore((s) => s.activeProfileId);
  const activeRoleId = usePermissionStore((s) => s.activeRoleId);
  const availableRoles = usePermissionStore((s) => s.availableRoles);
  const switchRole = usePermissionStore((s) => s.switchRole);
  const setActiveProfile = usePermissionStore((s) => s.setActiveProfile);

  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [profileAnchorEl, setProfileAnchorEl] = useState<HTMLElement | null>(null);

  const activeRole = availableRoles.find((r) => r.roleId === activeRoleId);

  const handleSwitchRole = useCallback((roleId: string) => {
    const profile = activeProfileId ? MOCK_USER_PROFILES[activeProfileId] : null;
    if (profile) {
      const res = profile.permissionResponses[roleId];
      if (res) switchRole(roleId, res);
    }
    setAnchorEl(null);
  }, [activeProfileId, switchRole]);

  const handleSwitchProfile = useCallback((profileId: string) => {
    const profile = MOCK_USER_PROFILES[profileId];
    if (profile) {
      const primaryRole = profile.roles.find((r) => r.isPrimary) ?? profile.roles[0];
      const res = profile.permissionResponses[primaryRole.roleId];
      if (res) {
        setActiveProfile(profileId, primaryRole.roleId, res, profile.roles);
      }
    }
    setProfileAnchorEl(null);
  }, [setActiveProfile]);

  if (!activeRole) return null;

  return (
    <>
      <Button
        onClick={(e) => setAnchorEl(e.currentTarget)}
        size="small"
        variant="soft"
        color="primary"
        startIcon={<Iconify icon="solar:user-speak-rounded-bold-duotone" width={18} />}
        endIcon={<Iconify icon="solar:alt-arrow-down-bold" width={14} />}
        sx={{ textTransform: 'none', fontWeight: 600, whiteSpace: 'nowrap', minWidth: 0 }}
      >
        <Typography variant="body2" fontWeight={600} noWrap sx={{ maxWidth: 140 }}>
          {activeRole.roleName}
        </Typography>
      </Button>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        slotProps={{ paper: { sx: { minWidth: 180, '& .MuiMenuItem-root': { py: 1 } } } }}
      >
        <Typography variant="caption" sx={{ px: 2, py: 0.5, color: 'text.secondary', display: 'block' }}>
          Switch Current Role
        </Typography>
        {availableRoles.map((role) => (
          <MenuItem
            key={role.roleId}
            selected={role.roleId === activeRoleId}
            onClick={() => handleSwitchRole(role.roleId)}
          >
            <ListItemIcon>
              <Iconify
                icon={role.isPrimary ? 'solar:star-bold' : 'solar:star-outline'}
                width={18}
                color={role.isPrimary ? 'warning.main' : 'text.secondary'}
              />
            </ListItemIcon>
            <ListItemText
              primary={role.roleName}
              secondary={role.isPrimary ? 'Primary' : 'Secondary'}
              secondaryTypographyProps={{ variant: 'caption' }}
            />
          </MenuItem>
        ))}
        <Typography variant="caption" sx={{ px: 2, py: 0.5, color: 'text.secondary', display: 'block', mt: 1 }}>
          Switch User (Dev)
        </Typography>
        {Object.entries(MOCK_USER_PROFILES).map(([key, profile]) => (
          <MenuItem
            key={key}
            selected={key === activeProfileId}
            onClick={() => handleSwitchProfile(key)}
          >
            <ListItemText
              primary={profile.user.name}
              secondary={profile.user.email}
              secondaryTypographyProps={{ variant: 'caption' }}
            />
          </MenuItem>
        ))}
      </Menu>
    </>
  );
}
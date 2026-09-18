import { useState, useMemo } from 'react';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import CircularProgress from '@mui/material/CircularProgress';
import Tooltip from '@mui/material/Tooltip';

import { Iconify } from 'src/components/iconify';
import { useQueryClient } from '@tanstack/react-query';

import { usePathname, useRouter } from 'src/routes/hooks';
import { paths } from 'src/routes/paths';
import { queryKeys } from 'src/services/api/query-keys';
import { useMe, useMyRoles, useSwitchRole } from 'src/services/hooks/use-auth';
import { useMyPermissions } from 'src/services/hooks/use-permissions';

// ----------------------------------------------------------------------

function roleTypeLabel(roleType: string): string {
  if (roleType === 'PRIMARY') return 'Primary Role';
  if (roleType === 'SECONDARY') return 'Secondary Role';
  if (roleType === 'BUDDY_RM') return 'Buddy Role';
  return roleType;
}

function roleTypeChipColor(roleType: string): 'primary' | 'default' | 'warning' {
  if (roleType === 'PRIMARY') return 'primary';
  if (roleType === 'BUDDY_RM') return 'warning';
  return 'default';
}

export function RoleSwitcher() {
  const router = useRouter();
  const pathname = usePathname();
  const queryClient = useQueryClient();

  const { data: me } = useMe();
  const { data: myRoles, isLoading, isFetching, refetch } = useMyRoles();
  const switchRole = useSwitchRole();

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleOpen = (event: React.MouseEvent<HTMLElement>) => {
    if (!myRoles || myRoles.roles.length <= 1) return;
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => setAnchorEl(null);

  const activeRole = useMemo(() => {
    if (!myRoles) return null;
    return myRoles.roles.find((r) => r.roleId === myRoles.activeRoleId) ?? null;
  }, [myRoles]);

  const hasMultiple = (myRoles?.roles.length ?? 0) > 1;
  const displayName = me?.name ?? 'User';
  const activeRoleName = activeRole?.roleName ?? myRoles?.activeRoleName ?? '—';

  const handleSwitch = async (roleId: number) => {
    if (roleId === myRoles?.activeRoleId) {
      handleClose();
      return;
    }
    try {
      const result = await switchRole.mutateAsync({ roleId });
      handleClose();
      // Force refetch of roles and permissions to recalc nav/scope
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.auth.myRoles }),
        queryClient.invalidateQueries({ queryKey: queryKeys.auth.me }),
        queryClient.invalidateQueries({ queryKey: queryKeys.permissions.me }),
      ]);
      await Promise.all([
        refetch(),
        queryClient.refetchQueries({ queryKey: queryKeys.permissions.me }),
      ]);

      // Post-switch: if current route becomes inaccessible, redirect to dashboard
      setTimeout(() => {
        try {
          const perms: any = queryClient.getQueryData(queryKeys.permissions.me);
          const projects: any[] = perms?.projects ?? [];
          const hasProjects = projects.length > 0;
          const isBusinessOrMaster = pathname.includes('/dashboard');
          // If role has no projects access and we are on a business module, go to dashboard
          if (isBusinessOrMaster && !hasProjects && pathname !== paths.dashboard.root && pathname !== '/') {
            router.push(paths.dashboard.root);
          }
        } catch {
          // ignore redirect errors
        }
      }, 350);

      // If backend returned new tokens, ensure permissions are refreshed with new role context
      // The switchRole onSuccess already set tokens and wiped jwt_permissions cache
      if (result?.activeRoleName) {
        // optional toast could be shown via snackbar; we keep silent per spec or use console
      }
    } catch {
      // Switch failed (e.g., expired, not assigned) — refetch roles to show current valid set
      handleClose();
      refetch();
    }
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, px: 1 }}>
        <CircularProgress size={16} />
      </Box>
    );
  }

  // Single role: show compact badge without dropdown (per spec: hidden or shows only active role)
  if (!hasMultiple) {
    // Still show active role badge but no dropdown interaction
    return (
      <Tooltip title={activeRole ? `${displayName} — ${roleTypeLabel(activeRole.roleType)}` : displayName}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            px: 1.2,
            py: 0.6,
            borderRadius: 1.5,
            bgcolor: 'background.neutral',
            border: (theme) => `1px solid ${theme.vars.palette.divider}`,
            maxWidth: 220,
          }}
        >
          <Box sx={{ minWidth: 0, display: { xs: 'none', sm: 'block' } }}>
            <Typography variant="caption" sx={{ color: 'text.secondary', lineHeight: 1, display: 'block' }} noWrap>
              {displayName}
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 600, lineHeight: 1.1 }} noWrap>
              {activeRoleName}
            </Typography>
          </Box>
          {activeRole && (
            <Chip
              size="small"
              label={roleTypeLabel(activeRole.roleType)}
              color={roleTypeChipColor(activeRole.roleType)}
              sx={{ height: 20, fontSize: '0.68rem', display: { xs: 'none', md: 'inline-flex' } }}
            />
          )}
        </Box>
      </Tooltip>
    );
  }

  return (
    <>
      <Button
        onClick={handleOpen}
        disabled={switchRole.isPending}
        endIcon={
          switchRole.isPending ? (
            <CircularProgress size={14} />
          ) : (
            <Iconify icon={open ? 'eva:chevron-up-fill' : 'eva:chevron-down-fill'} width={16} />
          )
        }
        sx={{
          textTransform: 'none',
          borderRadius: 1.5,
          px: 1.2,
          py: 0.6,
          bgcolor: 'background.neutral',
          border: (theme) => `1px solid ${theme.vars.palette.divider}`,
          color: 'text.primary',
          minWidth: 0,
          maxWidth: 260,
          '&:hover': { bgcolor: 'background.neutral' },
        }}
      >
        <Stack direction="row" alignItems="center" spacing={1} sx={{ minWidth: 0 }}>
          <Box sx={{ textAlign: 'left', minWidth: 0, display: { xs: 'none', sm: 'block' } }}>
            <Typography
              variant="caption"
              sx={{ color: 'text.secondary', lineHeight: 1, display: 'block' }}
              noWrap
            >
              {displayName}
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 600, lineHeight: 1.1 }} noWrap>
              {isFetching ? 'Switching…' : activeRoleName}
            </Typography>
          </Box>
          <Box sx={{ display: { sm: 'none' } }}>
            <Typography variant="body2" sx={{ fontWeight: 600 }} noWrap>
              {activeRoleName}
            </Typography>
          </Box>
          {activeRole && (
            <Chip
              size="small"
              label={roleTypeLabel(activeRole.roleType)}
              color={roleTypeChipColor(activeRole.roleType)}
              sx={{ height: 18, fontSize: '0.68rem', display: { xs: 'none', lg: 'inline-flex' } }}
            />
          )}
        </Stack>
      </Button>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        slotProps={{
          paper: {
            sx: {
              mt: 0.75,
              minWidth: 280,
              maxWidth: 340,
              overflow: 'hidden',
              borderRadius: 1.5,
              boxShadow: (theme) => theme.shadows[8],
            },
          },
        }}
      >
        <Box sx={{ px: 2, pt: 1.5, pb: 1 }}>
          <Typography variant="overline" sx={{ color: 'text.secondary', letterSpacing: 0.8 }}>
            Active Role
          </Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mt: 0.25 }}>
            Role permissions and project scope update automatically after switch.
          </Typography>
        </Box>

        <Divider />

        <Box sx={{ maxHeight: 320, overflowY: 'auto', py: 0.5 }}>
          {(myRoles?.roles ?? []).map((role) => {
            const isActive = role.roleId === myRoles?.activeRoleId;
            return (
              <MenuItem
                key={role.roleId}
                selected={isActive}
                onClick={() => handleSwitch(role.roleId)}
                sx={{
                  py: 1.1,
                  px: 2,
                  gap: 1.25,
                  alignItems: 'flex-start',
                  bgcolor: isActive ? 'action.selected' : 'transparent',
                  '&.Mui-selected': { bgcolor: 'action.selected' },
                }}
              >
                <Box sx={{ mt: 0.2, color: isActive ? 'primary.main' : 'transparent', minWidth: 20, display: 'flex', justifyContent: 'center' }}>
                  {isActive ? <Iconify icon="eva:checkmark-fill" width={16} /> : <Box sx={{ width: 16, height: 16 }} />}
                </Box>

                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography variant="subtitle2" noWrap sx={{ fontWeight: isActive ? 700 : 600 }}>
                    {role.roleName}
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary' }} noWrap>
                    {roleTypeLabel(role.roleType)}
                    {role.departmentName ? ` • ${role.departmentName}` : ''}
                  </Typography>
                </Box>

                <Chip
                  size="small"
                  label={role.roleType === 'PRIMARY' ? 'Primary' : role.roleType === 'BUDDY_RM' ? 'Buddy' : 'Secondary'}
                  color={role.roleType === 'PRIMARY' ? 'primary' : role.roleType === 'BUDDY_RM' ? 'warning' : 'default'}
                  variant={isActive ? 'filled' : 'outlined'}
                  sx={{ height: 20, fontSize: '0.68rem', mt: 0.2 }}
                />
              </MenuItem>
            );
          })}
        </Box>

        {switchRole.isPending && (
          <>
            <Divider />
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, py: 1 }}>
              <CircularProgress size={14} />
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                Updating permissions…
              </Typography>
            </Box>
          </>
        )}
      </Menu>
    </>
  );
}

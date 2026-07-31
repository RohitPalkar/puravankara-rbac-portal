import { useMemo } from 'react';

import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { useMyPermissions } from 'src/services/hooks/use-permissions';

import { Iconify } from 'src/components/iconify';

import { useAuthContext } from 'src/auth/hooks/use-auth-context';
import { canAccess, isSuperAdmin } from 'src/auth/utils/authorization';

const STANDARD_ACTIONS = ['VIEW', 'CREATE', 'EDIT', 'DELETE'];

export function PermissionChips({ moduleName }: { moduleName: string }) {
  const { user: authUser } = useAuthContext();
  const { data: permissions } = useMyPermissions();

  const actions = useMemo(() => {
    const allowed: Record<string, boolean> = {};
    STANDARD_ACTIONS.forEach((code) => {
      allowed[code] = isSuperAdmin(authUser) || canAccess(authUser, permissions, moduleName, code);
    });
    return allowed;
  }, [authUser, permissions, moduleName]);

  return (
    <Stack direction="row" alignItems="center" spacing={1} flexWrap="wrap">
      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
        Permissions:
      </Typography>
      {STANDARD_ACTIONS.map((code) => (
        <Chip
          key={code}
          size="small"
          label={code}
          icon={
            <Iconify
              icon={actions[code] ? 'solar:check-circle-bold' : 'solar:close-circle-bold'}
              width={14}
              color={actions[code] ? 'success.main' : 'error.main'}
            />
          }
          variant={actions[code] ? 'filled' : 'outlined'}
          color={actions[code] ? 'success' : 'default'}
          sx={{ height: 26 }}
        />
      ))}
    </Stack>
  );
}

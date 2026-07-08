import { useState, useMemo, useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import ToggleButton from '@mui/material/ToggleButton';
import Avatar from '@mui/material/Avatar';
import Chip from '@mui/material/Chip';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemText from '@mui/material/ListItemText';
import IconButton from '@mui/material/IconButton';
import Box from '@mui/material/Box';
import Tooltip from '@mui/material/Tooltip';
import { CONFIG } from 'src/config-global';
import { PageContainer, PageHeader } from 'src/components/page-layout';
import { Iconify } from 'src/components/iconify';
import { mockRoles, mockUsers } from 'src/services/mock-data';


type ViewMode = 'by-role' | 'by-user';

const stringToColor = (name: string) => {
  const colors = ['hsl(0,55%,50%)', 'hsl(160,55%,50%)', 'hsl(30,55%,50%)', 'hsl(280,55%,50%)', 'hsl(0,55%,50%)'];
  const idx = name.split('').reduce((acc, c, i) => acc + c.charCodeAt(0) + i, 0) % colors.length;
  return colors[idx];
};

function stringAvatar(name: string) {
  const initials = name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase();
  return { sx: { bgcolor: stringToColor(name), width: 32, height: 32, fontSize: 13 }, children: initials };
}

export default function UserRoleMappingPage() {
  const [view, setView] = useState<ViewMode>('by-role');
  const [search, setSearch] = useState('');
  const [expandedRole, setExpandedRole] = useState<string | null>(null);
  const [users, setUsers] = useState(mockUsers);

  const filteredRoles = useMemo(() => {
    if (!search) return mockRoles;
    const lower = search.toLowerCase();
    return mockRoles.filter(
      (r) =>
        r.name.toLowerCase().includes(lower) ||
        r.code.toLowerCase().includes(lower) ||
        users.filter((u) => u.roleId === r.id).some((u) => u.name.toLowerCase().includes(lower))
    );
  }, [search, users]);

  const filteredUsers = useMemo(() => {
    if (!search) return users;
    const lower = search.toLowerCase();
    return users.filter(
      (u) =>
        u.name.toLowerCase().includes(lower) ||
        u.email.toLowerCase().includes(lower) ||
        u.roleName?.toLowerCase().includes(lower)
    );
  }, [search, users]);

  const handleRoleChange = useCallback((userId: string, newRoleId: string) => {
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id !== userId) return u;
        const role = mockRoles.find((r) => r.id === newRoleId);
        return { ...u, roleId: newRoleId, roleName: role?.name ?? u.roleName };
      })
    );
  }, []);

  const handleRemoveUserFromRole = useCallback((userId: string) => {
    setUsers((prev) => prev.filter((u) => u.id !== userId));
  }, []);

  return (
    <>
      <Helmet><title>User Role Mapping - {CONFIG.appName}</title></Helmet>
      <PageContainer>
        <PageHeader title="User Role Mapping" description="Assign roles to users" />

        <Card sx={{ p: 2.5, mb: 3 }}>
          <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap">
            <ToggleButtonGroup
              value={view}
              exclusive
              onChange={(_, v) => { if (v) setView(v); }}
              size="small"
            >
              <ToggleButton value="by-role">
                <Iconify icon="solar:user-id-bold" width={16} style={{ marginRight: 6 }} />
                By Role
              </ToggleButton>
              <ToggleButton value="by-user">
                <Iconify icon="solar:users-group-rounded-bold" width={16} style={{ marginRight: 6 }} />
                By User
              </ToggleButton>
            </ToggleButtonGroup>
            <TextField
              label="Search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={view === 'by-role' ? 'Search roles or users...' : 'Search users or roles...'}
              sx={{ minWidth: 280 }}
              InputProps={{
                startAdornment: <Iconify icon="solar:magnifer-bold" width={18} style={{ marginRight: 8, opacity: 0.5 }} />,
              }}
            />
            <Typography variant="caption" color="text.secondary" ml="auto">
              {view === 'by-role'
                ? `${filteredRoles.length} roles · ${users.length} users`
                : `${filteredUsers.length} users`}
            </Typography>
          </Stack>
        </Card>

        {view === 'by-role' ? (
          <Stack spacing={2}>
            {filteredRoles.map((role) => {
              const assigned = users.filter((u) => u.roleId === role.id);
              const isExpanded = expandedRole === role.id;
              return (
                <Card
                  key={role.id}
                  sx={{
                    border: '1px solid',
                    borderColor: isExpanded ? 'primary.main' : 'divider',
                    transition: 'border-color 0.2s',
                  }}
                >
                  <Box
                    sx={{ p: 2.5, cursor: 'pointer', '&:hover': { bgcolor: 'action.hover' } }}
                    onClick={() => setExpandedRole(isExpanded ? null : role.id)}
                  >
                    <Stack direction="row" alignItems="center" justifyContent="space-between">
                      <Stack direction="row" spacing={1.5} alignItems="center">
                        <Iconify icon={isExpanded ? 'solar:alt-arrow-down-bold' : 'solar:alt-arrow-right-bold'} width={18} />
                        <Box>
                          <Typography variant="subtitle1">{role.name}</Typography>
                          <Stack direction="row" spacing={1} alignItems="center">
                            <Typography variant="caption" color="text.secondary">{role.code}</Typography>
                            <Chip label={role.departmentName} size="small" variant="outlined" sx={{ height: 20, fontSize: 11 }} />
                          </Stack>
                        </Box>
                      </Stack>
                      <Chip label={`${assigned.length} user${assigned.length !== 1 ? 's' : ''}`} size="small" color="primary" variant="soft" />
                    </Stack>
                  </Box>

                  {isExpanded && (
                    <Box sx={{ borderTop: '1px solid', borderColor: 'divider' }}>
                      {assigned.length === 0 ? (
                        <Typography variant="body2" color="text.secondary" sx={{ p: 3, textAlign: 'center' }}>
                          No users assigned to this role.
                        </Typography>
                      ) : (
                        <List disablePadding>
                          {assigned.map((user, idx) => (
                            <ListItem
                              key={user.id}
                              divider={idx < assigned.length - 1}
                              secondaryAction={
                                <Tooltip title="Remove from role">
                                  <IconButton edge="end" size="small" color="error" onClick={() => handleRemoveUserFromRole(user.id)}>
                                    <Iconify icon="solar:close-circle-bold" width={18} />
                                  </IconButton>
                                </Tooltip>
                              }
                            >
                              <ListItemAvatar>
                                <Avatar {...stringAvatar(user.name)} />
                              </ListItemAvatar>
                              <ListItemText
                                primary={user.name}
                                secondary={`${user.email} · ${user.departmentName}`}
                                primaryTypographyProps={{ variant: 'body2', fontWeight: 600 }}
                                secondaryTypographyProps={{ variant: 'caption' }}
                              />
                            </ListItem>
                          ))}
                        </List>
                      )}
                    </Box>
                  )}
                </Card>
              );
            })}
          </Stack>
        ) : (
          <Card>
            <List disablePadding>
              {filteredUsers.map((user, idx) => (
                <ListItem
                  key={user.id}
                  divider={idx < filteredUsers.length - 1}
                  sx={{ px: 3, py: 2 }}
                >
                  <ListItemAvatar>
                    <Avatar {...stringAvatar(user.name)} />
                  </ListItemAvatar>
                  <ListItemText
                    primary={user.name}
                    secondary={`${user.email} · ${user.departmentName}`}
                    primaryTypographyProps={{ variant: 'body2', fontWeight: 600 }}
                    secondaryTypographyProps={{ variant: 'caption' }}
                    sx={{ flex: '0 0 280px' }}
                  />
                  <Stack direction="row" spacing={1} alignItems="center" sx={{ flex: 1 }}>
                    <TextField
                      select
                      size="small"
                      value={user.roleId}
                      onChange={(e) => handleRoleChange(user.id, e.target.value)}
                      sx={{ minWidth: 180 }}
                    >
                      {mockRoles.map((r) => (
                        <MenuItem key={r.id} value={r.id}>{r.name}</MenuItem>
                      ))}
                    </TextField>
                    <Chip label={user.status} size="small" color={user.status === 'active' ? 'success' : 'default'} sx={{ height: 20, fontSize: 11 }} />
                  </Stack>
                </ListItem>
              ))}
              {filteredUsers.length === 0 && (
                <Box sx={{ p: 4, textAlign: 'center' }}>
                  <Typography variant="body2" color="text.secondary">No users found.</Typography>
                </Box>
              )}
            </List>
          </Card>
        )}
      </PageContainer>
    </>
  );
}

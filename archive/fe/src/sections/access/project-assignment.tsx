import type { UserProject } from 'src/types';

import { useState } from 'react';
import { Helmet } from 'react-helmet-async';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import List from '@mui/material/List';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Avatar from '@mui/material/Avatar';
import Dialog from '@mui/material/Dialog';
import Tooltip from '@mui/material/Tooltip';
import MenuItem from '@mui/material/MenuItem';
import ListItem from '@mui/material/ListItem';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import DialogTitle from '@mui/material/DialogTitle';
import ListItemText from '@mui/material/ListItemText';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import ListItemAvatar from '@mui/material/ListItemAvatar';

import { CONFIG } from 'src/config-global';
import { mockUsers, mockProjects } from 'src/services/mock-data';

import { Iconify } from 'src/components/iconify';
import { PageHeader, PageContainer } from 'src/components/page-layout';

const stringToColor = (name: string) => {
  const colors = ['hsl(210,55%,50%)', 'hsl(160,55%,50%)', 'hsl(30,55%,50%)', 'hsl(280,55%,50%)', 'hsl(0,55%,50%)'];
  const idx = name.split('').reduce((acc, c, i) => acc + c.charCodeAt(0) + i, 0) % colors.length;
  return colors[idx];
};

function stringAvatar(name: string) {
  const initials = name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase();
  return { sx: { bgcolor: stringToColor(name), width: 32, height: 32, fontSize: 13 }, children: initials };
}

export default function ProjectAssignmentPage() {
  const [selectedProjectId, setSelectedProjectId] = useState<string>(mockProjects[0]?.id ?? '');
  const [usersWithProjects, setUsersWithProjects] = useState(() =>
    mockUsers.map((u) => ({ ...u, assigned: u.projects?.some((p) => p.projectId === selectedProjectId) ?? false }))
  );
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string>('');

  const selectedProject = mockProjects.find((p) => p.id === selectedProjectId);

  const handleProjectChange = (projectId: string) => {
    setSelectedProjectId(projectId);
    setUsersWithProjects((prev) =>
      prev.map((u) => ({
        ...u,
        assigned: (u.projects ?? []).some((p) => p.projectId === projectId),
      }))
    );
  };

  const assignedUsers = usersWithProjects.filter((u) => u.assigned);
  const unassignedUsers = usersWithProjects.filter((u) => !u.assigned);

  const handleAssignUser = () => {
    if (!selectedUserId) return;
    setUsersWithProjects((prev) =>
      prev.map((u) => {
        if (u.id !== selectedUserId) return u;
        const projects: UserProject[] = [...(u.projects ?? [])];
        if (!projects.some((p) => p.projectId === selectedProjectId)) {
          projects.push({ projectId: selectedProjectId, projectName: selectedProject?.name });
        }
        return { ...u, projects, assigned: true };
      })
    );
    setSelectedUserId('');
    setAddDialogOpen(false);
  };

  const handleRemoveUser = (userId: string) => {
    setUsersWithProjects((prev) =>
      prev.map((u) => {
        if (u.id !== userId) return u;
        return { ...u, projects: (u.projects ?? []).filter((p) => p.projectId !== selectedProjectId), assigned: false };
      })
    );
  };

  return (
    <>
      <Helmet><title>Project Assignment - {CONFIG.appName}</title></Helmet>
      <PageContainer>
        <PageHeader title="Project Assignment" description="Assign users to projects" />

        <Card sx={{ p: 2.5, mb: 3 }}>
          <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap">
            <TextField
              label="Project"
              select
              value={selectedProjectId}
              onChange={(e) => handleProjectChange(e.target.value)}
              sx={{ minWidth: 260 }}
            >
              {mockProjects.map((p) => (
                <MenuItem key={p.id} value={p.id}>{p.name} ({p.code})</MenuItem>
              ))}
            </TextField>
            <Typography variant="body2" color="text.secondary">
              {assignedUsers.length} user{assignedUsers.length !== 1 ? 's' : ''} assigned
            </Typography>
            <Button
              variant="contained"
              startIcon={<Iconify icon="solar:add-circle-bold" />}
              onClick={() => setAddDialogOpen(true)}
              sx={{ ml: 'auto' }}
              disabled={unassignedUsers.length === 0}
            >
              Assign User
            </Button>
          </Stack>
        </Card>

        <Card>
          {assignedUsers.length === 0 ? (
            <Box sx={{ p: 4, textAlign: 'center' }}>
              <Iconify icon="solar:users-group-rounded-bold" width={48} style={{ opacity: 0.3, marginBottom: 12 }} />
              <Typography variant="body1" color="text.secondary">No users assigned to this project</Typography>
              <Typography variant="body2" color="text.disabled" sx={{ mt: 0.5 }}>
                Click &quot;Assign User&quot; to add team members
              </Typography>
            </Box>
          ) : (
            <List disablePadding>
              {assignedUsers.map((user, idx) => (
                <ListItem
                  key={user.id}
                  divider={idx < assignedUsers.length - 1}
                  sx={{ px: 3, py: 1.5 }}
                  secondaryAction={
                    <Tooltip title="Remove from project">
                      <IconButton edge="end" size="small" color="error" onClick={() => handleRemoveUser(user.id)}>
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
                    secondary={`${user.email} · ${user.roleName}`}
                    primaryTypographyProps={{ variant: 'body2', fontWeight: 600 }}
                    secondaryTypographyProps={{ variant: 'caption' }}
                  />
                  <Chip label={user.departmentName} size="small" variant="outlined" sx={{ height: 20, fontSize: 11, mr: 2 }} />
                </ListItem>
              ))}
            </List>
          )}
        </Card>

        <Dialog open={addDialogOpen} onClose={() => setAddDialogOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Assign User to {selectedProject?.name}</DialogTitle>
          <DialogContent>
            <Stack spacing={2} sx={{ mt: 1 }}>
              <TextField
                label="Select User"
                select
                value={selectedUserId}
                onChange={(e) => setSelectedUserId(e.target.value)}
                fullWidth
              >
                {unassignedUsers.map((u) => (
                  <MenuItem key={u.id} value={u.id}>{u.name} — {u.roleName}</MenuItem>
                ))}
              </TextField>
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setAddDialogOpen(false)} color="inherit">Cancel</Button>
            <Button onClick={handleAssignUser} variant="contained" disabled={!selectedUserId}>Assign</Button>
          </DialogActions>
        </Dialog>
      </PageContainer>
    </>
  );
}

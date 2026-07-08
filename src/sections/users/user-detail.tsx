import { useState, useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
import { useParams, useNavigate } from 'react-router-dom';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormGroup from '@mui/material/FormGroup';
import { CONFIG } from 'src/config-global';
import { PageContainer, PageHeader } from 'src/components/page-layout';
import { Iconify } from 'src/components/iconify';
import { mockUsers, mockDepartments, mockRoles, mockProjects } from 'src/services/mock-data';
import { paths } from 'src/routes/paths';

const TABS = ['Profile', 'Project Access', 'Permissions'];

export default function UserDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const user = mockUsers.find((u) => u.id === id);

  const [tab, setTab] = useState(0);
  const [name, setName] = useState(user?.name ?? '');
  const [email, setEmail] = useState(user?.email ?? '');
  const [phone, setPhone] = useState(user?.phone ?? '');
  const [departmentId, setDepartmentId] = useState(user?.departmentId ?? '');
  const [roleId, setRoleId] = useState(user?.roleId ?? '');
  const [selectedProjects, setSelectedProjects] = useState<string[]>(user?.projects?.map((p) => p.projectId) ?? []);

  if (!user) {
    return (
      <PageContainer>
        <PageHeader title="User Not Found" description="The requested user does not exist" />
        <Card sx={{ p: 4 }}>
          <Typography>User with ID &quot;{id}&quot; not found.</Typography>
          <Button onClick={() => navigate(paths.dashboard.userManagement)} sx={{ mt: 2 }}>Back to Users</Button>
        </Card>
      </PageContainer>
    );
  }

  const handleToggleProject = (projectId: string) => {
    setSelectedProjects((prev) =>
      prev.includes(projectId) ? prev.filter((pid) => pid !== projectId) : [...prev, projectId]
    );
  };

  return (
    <>
      <Helmet><title>{user.name} - {CONFIG.appName}</title></Helmet>
      <PageContainer>
        <PageHeader title={user.name} action={
          <Stack direction="row" spacing={1}>
            <Button variant="outlined" onClick={() => navigate(paths.dashboard.userManagement)}>
              <Iconify icon="solar:arrow-left-bold" width={16} sx={{ mr: 0.5 }} />
              Back
            </Button>
            <Button variant="contained" startIcon={<Iconify icon="solar:check-circle-bold" />}>
              Save
            </Button>
          </Stack>
        } />

        <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          {TABS.map((label) => <Tab key={label} label={label} />)}
        </Tabs>

        {tab === 0 && (
          <Card sx={{ p: 3 }}>
            <Stack spacing={2.5} maxWidth={480}>
              <TextField label="Name" value={name} onChange={(e) => setName(e.target.value)} fullWidth />
              <TextField label="Email" value={email} onChange={(e) => setEmail(e.target.value)} fullWidth />
              <TextField label="Phone" value={phone} onChange={(e) => setPhone(e.target.value)} fullWidth />
              <TextField label="Department" select value={departmentId} onChange={(e) => setDepartmentId(e.target.value)} fullWidth>
                {mockDepartments.map((d) => <MenuItem key={d.id} value={d.id}>{d.name}</MenuItem>)}
              </TextField>
              <TextField label="Role" select value={roleId} onChange={(e) => setRoleId(e.target.value)} fullWidth>
                {mockRoles.map((r) => <MenuItem key={r.id} value={r.id}>{r.name}</MenuItem>)}
              </TextField>
            </Stack>
          </Card>
        )}

        {tab === 1 && (
          <Card sx={{ p: 3 }}>
            <Typography variant="subtitle1" sx={{ mb: 2 }}>Assigned Projects</Typography>
            <FormGroup>
              {mockProjects.map((project) => (
                <FormControlLabel
                  key={project.id}
                  control={<Checkbox checked={selectedProjects.includes(project.id)} onChange={() => handleToggleProject(project.id)} />}
                  label={`${project.name} (${project.code})`}
                />
              ))}
            </FormGroup>
          </Card>
        )}

        {tab === 2 && (
          <Card sx={{ p: 3 }}>
            <Typography variant="subtitle1" sx={{ mb: 2 }}>Role-based Permissions</Typography>
            <Typography variant="body2" color="text.secondary">
              Permissions are inherited from the assigned role ({user.roleName}). Project-level overrides can be configured per project.
            </Typography>
          </Card>
        )}
      </PageContainer>
    </>
  );
}

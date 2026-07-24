import type { Role, User, Action, Module, Status, Project, SubModule, Department } from 'src/types';

import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useParams, useNavigate } from 'react-router-dom';

import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
import Tabs from '@mui/material/Tabs';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Skeleton from '@mui/material/Skeleton';
import MenuItem from '@mui/material/MenuItem';
import Checkbox from '@mui/material/Checkbox';
import TextField from '@mui/material/TextField';
import FormGroup from '@mui/material/FormGroup';
import Typography from '@mui/material/Typography';
import FormControlLabel from '@mui/material/FormControlLabel';

import { paths } from 'src/routes/paths';

import { CONFIG } from 'src/config-global';
import {
  useRoleList,
  useUserById,
  useActionList,
  useModuleList,
  useProjectList,
  useSubModuleList,
  useDepartmentList,
} from 'src/services/hooks';

import { Iconify } from 'src/components/iconify';
import { PageHeader, PageContainer } from 'src/components/page-layout';
import { PermissionTree, type PermissionSelection } from 'src/components/permission-tree';

const TABS = ['Profile', 'Project Access', 'Permissions'];
const STATUS_OPTIONS = [
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
];

export default function UserDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: rawUser, isLoading } = useUserById(id!);
  const user = rawUser as unknown as User;
  const { data: rolesData } = useRoleList();
  const { data: modulesData } = useModuleList();
  const { data: actionsData } = useActionList();
  const { data: projectsData } = useProjectList();
  const { data: subModulesData } = useSubModuleList();
  const { data: departmentsData } = useDepartmentList();

  const roles = (rolesData ?? []) as unknown as Role[];
  const projects = (projectsData ?? []) as unknown as Project[];
  const modules = (modulesData ?? []) as unknown as Module[];
  const actions = (actionsData ?? []) as unknown as Action[];
  const subModules = (subModulesData ?? []) as unknown as SubModule[];
  const departments = (departmentsData ?? []) as unknown as Department[];

  const [tab, setTab] = useState(0);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [departmentId, setDepartmentId] = useState('');
  const [roleId, setRoleId] = useState('');
  const [status, setStatus] = useState<Status>('active');
  const [selectedProjects, setSelectedProjects] = useState<string[]>([]);

  const [projectPermissions, setProjectPermissions] = useState<{ projectId: string; permissions: PermissionSelection[] }[]>([]);

  useEffect(() => {
    if (user) {
      setFirstName(user.firstName);
      setLastName(user.lastName);
      setEmail(user.email);
      setPhone(user.phone);
      setDepartmentId(user.departmentId);
      setRoleId(user.roleId);
      setStatus(user.status);
      setSelectedProjects(user.projects?.map((p) => p.projectId) ?? []);
      setProjectPermissions(
        user.projects?.map((p) => ({ projectId: p.projectId, permissions: [] as PermissionSelection[] })) ?? [],
      );
    }
  }, [user]);

  if (isLoading) {
    return (
      <PageContainer>
        <PageHeader title="Loading..." />
        <Card sx={{ p: 4 }}>
          <Skeleton variant="rectangular" height={52} sx={{ borderRadius: 1 }} />
          <Skeleton variant="rectangular" height={52} sx={{ borderRadius: 1, mt: 2 }} />
          <Skeleton variant="rectangular" height={52} sx={{ borderRadius: 1, mt: 2 }} />
          <Skeleton variant="rectangular" height={120} sx={{ borderRadius: 1, mt: 2 }} />
        </Card>
      </PageContainer>
    );
  }

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
    setProjectPermissions((prev) =>
      prev.some((p) => p.projectId === projectId)
        ? prev.filter((p) => p.projectId !== projectId)
        : [...prev, { projectId, permissions: [] }]
    );
  };

  const handlePermissionChange = (projectId: string, permissions: PermissionSelection[]) => {
    setProjectPermissions((prev) => prev.map((p) => p.projectId === projectId ? { ...p, permissions } : p));
  };

  return (
    <>
      <Helmet><title>{user.name} - {CONFIG.appName}</title></Helmet>
      <PageContainer>
        <PageHeader
          title={`${user.firstName} ${user.lastName}`}
          description={`${user.employeeId} · ${user.roleName}`}
          action={
            <Stack direction="row" spacing={1}>
              <Button variant="outlined" onClick={() => navigate(paths.dashboard.userManagement)}>
                <Iconify icon="solar:arrow-left-bold" width={16} sx={{ mr: 0.5 }} />
                Back
              </Button>
              <Button variant="contained" startIcon={<Iconify icon="solar:check-circle-bold" />}>
                Save
              </Button>
            </Stack>
          }
        />

        <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          {TABS.map((label) => <Tab key={label} label={label} />)}
        </Tabs>

        {tab === 0 && (
          <Card sx={{ p: 3 }}>
            <Typography variant="subtitle1" sx={{ mb: 2.5 }}>Profile Information</Typography>
            <Box display="grid" gridTemplateColumns={{ xs: '1fr', sm: '1fr 1fr' }} gap={2.5} maxWidth={720}>
              <TextField label="Employee ID" value={user.employeeId} fullWidth inputProps={{ readOnly: true }} />
              <TextField label="First Name" value={firstName} onChange={(e) => setFirstName(e.target.value)} fullWidth />
              <TextField label="Last Name" value={lastName} onChange={(e) => setLastName(e.target.value)} fullWidth />
              <TextField label="Email" value={email} onChange={(e) => setEmail(e.target.value)} fullWidth />
              <TextField label="Mobile Number" value={phone} onChange={(e) => setPhone(e.target.value)} fullWidth />
              <TextField label="User Status" select value={status} onChange={(e) => setStatus(e.target.value as Status)} fullWidth>
                {STATUS_OPTIONS.map((o) => <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>)}
              </TextField>
            </Box>
            <Divider sx={{ my: 3 }} />
            <Typography variant="subtitle1" sx={{ mb: 2.5 }}>Organization Mapping</Typography>
            <Box display="grid" gridTemplateColumns={{ xs: '1fr', sm: '1fr 1fr' }} gap={2.5} maxWidth={720}>
              <TextField label="Department" select value={departmentId} onChange={(e) => setDepartmentId(e.target.value)} fullWidth>
                {departments.map((d) => <MenuItem key={d.id} value={d.id}>{d.name}</MenuItem>)}
              </TextField>
              <TextField label="Role" select value={roleId} onChange={(e) => setRoleId(e.target.value)} fullWidth>
                {roles.map((r) => <MenuItem key={r.id} value={r.id}>{r.name}</MenuItem>)}
              </TextField>
              <TextField label="Hierarchy Level" value={user.level} fullWidth inputProps={{ readOnly: true }} />
              <TextField label="Reporting Manager" value={user.reportingManagerName ?? '-'} fullWidth inputProps={{ readOnly: true }} />
              <TextField
                label="Zone Access"
                value={user.zoneNames?.join(', ') ?? '-'}
                fullWidth
                inputProps={{ readOnly: true }}
              />
            </Box>
          </Card>
        )}

        {tab === 1 && (
          <Card sx={{ p: 3 }}>
            <Typography variant="subtitle1" sx={{ mb: 2 }}>Assigned Projects</Typography>
            <FormGroup>
              {projects.map((project) => (
                <FormControlLabel
                  key={project.id}
                  control={<Checkbox checked={selectedProjects.includes(project.id)} onChange={() => handleToggleProject(project.id)} />}
                  label={`${project.name} (${project.code})`}
                />
              ))}
            </FormGroup>
            {projectPermissions.filter((p) => selectedProjects.includes(p.projectId)).map((pp) => {
              const project = projects.find((pj) => pj.id === pp.projectId);
              return (
                <Card key={pp.projectId} variant="outlined" sx={{ mt: 2, p: 2 }}>
                  <Typography variant="subtitle2" sx={{ mb: 1 }}>{project?.name} Permissions</Typography>
                  <PermissionTree
                    modules={modules}
                    subModules={subModules}
                    actions={actions}
                    selection={pp.permissions}
                    onChange={(perm) => handlePermissionChange(pp.projectId, perm)}
                  />
                </Card>
              );
            })}
          </Card>
        )}

        {tab === 2 && (
          <Card sx={{ p: 3 }}>
            <Typography variant="subtitle1" sx={{ mb: 2 }}>Role-based Permissions</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Permissions are inherited from the assigned role ({user.roleName}). Project-level overrides can be configured in Project Access tab.
            </Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              <Chip label={`Level: ${user.level}`} variant="outlined" />
              <Chip label={`Department: ${user.departmentName}`} variant="outlined" />
              <Chip label={`Role: ${user.roleName}`} variant="outlined" />
            </Stack>
          </Card>
        )}
      </PageContainer>
    </>
  );
}

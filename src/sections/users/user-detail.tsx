import type { Project } from 'src/services/types/project';
import type { Module, Action, SubModule } from 'src/types';
import type { UserProjectAccess } from 'src/services/types/project-access';
import type { UserRole, RolePermissionProfile } from 'src/services/types/user';

import { Helmet } from 'react-helmet-async';
import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
import Tabs from '@mui/material/Tabs';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Alert from '@mui/material/Alert';
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
import { useUserProjectAccess, useRevokeProjectAccess, useAssignBulkProjectAccess } from 'src/services/hooks/use-project-access';
import {
  useUserById,
  useUpdateUser,
  useActionList,
  useModuleList,
  useModuleTree,
  useProjectList,
  useSubModuleList,
} from 'src/services/hooks';

import { Iconify } from 'src/components/iconify';
import { PageHeader, PageContainer } from 'src/components/page-layout';
import { PermissionTree, type PermissionSelection } from 'src/components/permission-tree';

import { PermissionProfile } from './components/permission-profile';

interface EnrichedUser {
  empId: string;
  name: string;
  email: string;
  departmentId: number;
  departmentName?: string;
  employmentStatus: string;
  isActive: boolean;
  createdBy?: string;
  updatedBy?: string;
  createdAt: string;
  updatedAt: string;
  profiles?: {
    profileType: string;
    departmentId: number | null;
    roleId: number | null;
    buddyUserId: string | null;
    modules?: {
      moduleId: number;
      module?: { id: number; name: string };
      subModules?: {
        subModuleId: number;
        inheritFutureProjects: boolean;
        subModule?: { id: number; name: string };
        projects?: { projectId: number; project?: { id: number; name: string } }[];
      }[];
    }[];
  }[];
  userRoles?: UserRole[];
  userZones?: { zoneId: number; zoneName: string }[];
  reportingManager?: { empId: string; name: string } | null;
  isDepartmentAdmin?: boolean;
  teamLead?: { empId: string; name: string } | null;
}

const TABS = ['Profile', 'Project Access', 'Permissions'];

const STATUS_OPTIONS = [
  { value: 'true', label: 'Active' },
  { value: 'false', label: 'Inactive' },
];

function InfoField({ label, value }: { label: string; value?: React.ReactNode }) {
  return (
    <Box>
      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.25 }}>
        {label}
      </Typography>
      <Typography variant="body2">{value ?? '-'}</Typography>
    </Box>
  );
}

function LoadingSkeleton() {
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

function profileToRolePermissionProfile(profile: Record<string, unknown>): RolePermissionProfile {
  const modules = profile?.modules as Record<string, unknown>[] | undefined;
  if (!modules) return [];
  return modules.map((mod) => ({
    moduleId: mod.moduleId as number,
    subModules: ((mod.subModules as Record<string, unknown>[]) ?? []).map((sm) => ({
      subModuleId: sm.subModuleId as number,
      enabled: true,
      accessType: (sm.inheritFutureProjects ? ('all' as const) : ('selected' as const)),
      projectIds: ((sm.projects as Record<string, unknown>[]) ?? []).map((p) => p.projectId as number),
    })),
  }));
}

export default function UserDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: rawUser, isLoading } = useUserById(id!);
  const updateUser = useUpdateUser();
  const { data: projectsData } = useProjectList();
  const { data: modulesData } = useModuleList();
  const { data: actionsData } = useActionList();
  const { data: subModulesData } = useSubModuleList();
  const { data: modulesTree } = useModuleTree();
  const { data: userProjectAccess } = useUserProjectAccess(id!);
  const assignBulkProjects = useAssignBulkProjectAccess();
  const revokeProjectAccess = useRevokeProjectAccess();

  const user = rawUser as EnrichedUser | undefined;
  const projects = (projectsData ?? []) as Project[];
  const modules = (modulesData ?? []) as unknown as Module[];
  const actions = (actionsData ?? []) as unknown as Action[];
  const subModules = (subModulesData ?? []) as unknown as SubModule[];
  const [tab, setTab] = useState(0);
  const [editing, setEditing] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [isActive, setIsActive] = useState(true);

  const [selectedProjects, setSelectedProjects] = useState<string[]>([]);
  const [projectPermissions, setProjectPermissions] = useState<
    { projectId: string; permissions: PermissionSelection[] }[]
  >([]);

  const [permissionProfile, setPermissionProfile] = useState<RolePermissionProfile | undefined>();

  useEffect(() => {
    if (user) {
      setName(user.name);
      setEmail(user.email);
      setIsActive(user.isActive);
    }
  }, [user]);

  useEffect(() => {
    if (userProjectAccess) {
      const accessIds = (userProjectAccess as UserProjectAccess[])
        .filter((a) => a.projectId != null)
        .map((a) => String(a.projectId));
      setSelectedProjects(accessIds);
    }
  }, [userProjectAccess]);

  useEffect(() => {
    if (user?.profiles && (user.profiles as Record<string, unknown>[]).length > 0) {
      const primaryProfile = (user.profiles as Record<string, unknown>[]).find(
        (p) => p.profileType === 'PRIMARY'
      );
      if (primaryProfile) {
        setPermissionProfile(profileToRolePermissionProfile(primaryProfile));
      }
    }
  }, [user]);

  const handleToggleProject = useCallback((projectId: string) => {
    setSelectedProjects((prev) =>
      prev.includes(projectId) ? prev.filter((pid) => pid !== projectId) : [...prev, projectId]
    );
    setProjectPermissions((prev) =>
      prev.some((p) => p.projectId === projectId)
        ? prev.filter((p) => p.projectId !== projectId)
        : [...prev, { projectId, permissions: [] }]
    );
  }, []);

  const handlePermissionChange = useCallback((projectId: string, permissions: PermissionSelection[]) => {
    setProjectPermissions((prev) => prev.map((p) => (p.projectId === projectId ? { ...p, permissions } : p)));
  }, []);

  const handlePermissionProfileChange = useCallback((data: RolePermissionProfile) => {
    setPermissionProfile(data);
  }, []);

  const handleSave = useCallback(async () => {
    if (!id) return;
    setSaveError('');
    setSaveSuccess(false);
    try {
      const data: Record<string, unknown> = {
        name,
        email,
        isActive,
      };
      await updateUser.mutateAsync({ id, data: data as any });
      setEditing(false);
      setSaveSuccess(true);
    } catch (err: any) {
      setSaveError(err?.message ?? 'Failed to save. Please try again.');
    }
  }, [id, name, email, isActive, updateUser]);

  const handleSaveProjectAccess = useCallback(async () => {
    if (!id) return;
    setSaveError('');
    setSaveSuccess(false);
    try {
      const currentIds = (userProjectAccess as UserProjectAccess[] ?? [])
        .filter((a) => a.projectId != null)
        .map((a) => a.projectId);
      const newIds = selectedProjects.map(Number).filter((n) => !Number.isNaN(n));
      const toAdd = newIds.filter((pid) => !currentIds.includes(pid));
      const toRemove = currentIds.filter((pid) => !newIds.includes(pid));
      await Promise.all(
        toRemove.map((projectId) => revokeProjectAccess.mutateAsync({ userId: id, projectId }))
      );
      if (toAdd.length > 0) {
        await assignBulkProjects.mutateAsync({ userId: id, projectIds: toAdd });
      }
      setSaveSuccess(true);
    } catch (err: any) {
      setSaveError(err?.message ?? 'Failed to save project access. Please try again.');
    }
  }, [id, selectedProjects, userProjectAccess, assignBulkProjects, revokeProjectAccess]);

  const handleCancel = useCallback(() => {
    if (user) {
      setName(user.name);
      setEmail(user.email);
      setIsActive(user.isActive);
    }
    setEditing(false);
    setSaveError('');
    setSaveSuccess(false);
  }, [user]);

  const zoneNames = user?.userZones?.map((z) => z.zoneName).join(', ') ?? '-';
  const primaryRole =
    user?.userRoles && user.userRoles.length > 0 ? user.userRoles[0].roleName : '-';
  const secondaryRoles =
    user?.userRoles && user.userRoles.length > 1
      ? user.userRoles.slice(1).map((r) => r.roleName).join(', ')
      : '-';
  const deptAdminLabel = user?.isDepartmentAdmin ? 'Yes' : 'No';
  const deptAdminColor = user?.isDepartmentAdmin ? 'success' : 'default';
  const managerName = user?.reportingManager?.name ?? '-';
  const teamLeadName = user?.teamLead?.name ?? '-';

  if (isLoading) return <LoadingSkeleton />;

  if (!user) {
    return (
      <PageContainer>
        <PageHeader title="User Not Found" />
        <Card sx={{ p: 4 }}>
          <Typography>User with ID &quot;{id}&quot; not found.</Typography>
          <Button onClick={() => navigate(paths.dashboard.userManagement)} sx={{ mt: 2 }}>
            Back to Users
          </Button>
        </Card>
      </PageContainer>
    );
  }

  return (
    <>
      <Helmet>
        <title>
          {user.name} - {CONFIG.appName}
        </title>
      </Helmet>
      <PageContainer>
        <PageHeader
          title={user.name}
          description={user.empId}
          action={
            <Stack direction="row" spacing={1}>
              <Button
                variant="outlined"
                onClick={() => navigate(paths.dashboard.userManagement)}
              >
                <Iconify icon="solar:arrow-left-bold" width={16} sx={{ mr: 0.5 }} />
                Back
              </Button>
              {tab === 1 ? (
                <Button
                  variant="contained"
                  startIcon={<Iconify icon="solar:check-circle-bold" />}
                  onClick={handleSaveProjectAccess}
                  disabled={assignBulkProjects.isPending || revokeProjectAccess.isPending}
                >
                  {assignBulkProjects.isPending || revokeProjectAccess.isPending ? 'Saving...' : 'Save Project Access'}
                </Button>
              ) : editing ? (
                <>
                  <Button variant="outlined" color="inherit" onClick={handleCancel}>
                    Cancel
                  </Button>
                  <Button
                    variant="contained"
                    startIcon={<Iconify icon="solar:check-circle-bold" />}
                    onClick={handleSave}
                    disabled={updateUser.isPending}
                  >
                    {updateUser.isPending ? 'Saving...' : 'Save'}
                  </Button>
                </>
              ) : (
                <Button
                  variant="contained"
                  startIcon={<Iconify icon="solar:pen-bold" />}
                  onClick={() => setEditing(true)}
                >
                  Edit
                </Button>
              )}
            </Stack>
          }
        />

        {saveError && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setSaveError('')}>
            {saveError}
          </Alert>
        )}

        {saveSuccess && (
          <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSaveSuccess(false)}>
            Changes saved successfully.
          </Alert>
        )}

        <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          {TABS.map((label) => (
            <Tab key={label} label={label} />
          ))}
        </Tabs>

        {/* ---------- PROFILE TAB ---------- */}
        {tab === 0 && (
          <Card sx={{ p: 3 }}>
            <Typography variant="subtitle1" sx={{ mb: 2.5 }}>
              Profile Information
            </Typography>
            <Box display="grid" gridTemplateColumns={{ xs: '1fr', sm: '1fr 1fr' }} gap={2.5} maxWidth={720}>
              {editing ? (
                <>
                  <TextField label="Employee ID" value={user.empId} fullWidth inputProps={{ readOnly: true }} />
                  <TextField label="Name" value={name} onChange={(e) => setName(e.target.value)} fullWidth />
                  <TextField label="Email" value={email} onChange={(e) => setEmail(e.target.value)} fullWidth />
                  <TextField
                    label="Status"
                    select
                    value={String(isActive)}
                    onChange={(e) => setIsActive(e.target.value === 'true')}
                    fullWidth
                  >
                    {STATUS_OPTIONS.map((o) => (
                      <MenuItem key={o.value} value={o.value}>
                        {o.label}
                      </MenuItem>
                    ))}
                  </TextField>
                  <TextField
                    label="Created By"
                    value={user.createdBy ?? '-'}
                    fullWidth
                    inputProps={{ readOnly: true }}
                  />
                  <TextField
                    label="Updated By"
                    value={user.updatedBy ?? '-'}
                    fullWidth
                    inputProps={{ readOnly: true }}
                  />
                </>
              ) : (
                <>
                  <InfoField label="Employee ID" value={user.empId} />
                  <InfoField label="Name" value={user.name} />
                  <InfoField label="Email" value={user.email} />
                  <Box>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.25 }}>
                      Status
                    </Typography>
                    <Chip
                      label={user.isActive ? 'Active' : 'Inactive'}
                      color={user.isActive ? 'success' : 'default'}
                      size="small"
                    />
                  </Box>
                  <InfoField label="Created By" value={user.createdBy} />
                  <InfoField label="Updated By" value={user.updatedBy} />
                </>
              )}
            </Box>

            <Divider sx={{ my: 3 }} />

            <Typography variant="subtitle1" sx={{ mb: 2.5 }}>
              Organization Mapping
            </Typography>
            <Box display="grid" gridTemplateColumns={{ xs: '1fr', sm: '1fr 1fr' }} gap={2.5} maxWidth={720}>
              <InfoField label="Zone(s)" value={zoneNames} />
              <InfoField label="Department" value={user.departmentName} />
              <InfoField label="Primary Role" value={primaryRole} />
              <InfoField label="Secondary Role(s)" value={secondaryRoles} />
              <Box>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.25 }}>
                  Department Administrator
                </Typography>
                <Chip label={deptAdminLabel} color={deptAdminColor} size="small" />
              </Box>
              <InfoField label="Reporting Manager" value={managerName} />
              <InfoField label="Team Lead" value={teamLeadName} />
            </Box>
          </Card>
        )}

        {/* ---------- PROJECT ACCESS TAB ---------- */}
        {tab === 1 && (
          <Card sx={{ p: 3 }}>
            <Typography variant="subtitle1" sx={{ mb: 2 }}>
              Assigned Projects
            </Typography>
            {projects.length === 0 ? (
              <Typography variant="body2" color="text.secondary" sx={{ py: 4, textAlign: 'center' }}>
                No projects available.
              </Typography>
            ) : (
              <FormGroup>
                {projects.map((project) => (
                  <FormControlLabel
                    key={project.id}
                    control={
                      <Checkbox
                        checked={selectedProjects.includes(String(project.id))}
                        onChange={() => handleToggleProject(String(project.id))}
                      />
                    }
                    label={`${project.name} (${project.codename ?? project.name})`}
                  />
                ))}
              </FormGroup>
            )}
            {projectPermissions
              .filter((p) => selectedProjects.includes(p.projectId))
              .map((pp) => {
                const project = projects.find((pj) => String(pj.id) === pp.projectId);
                return (
                  <Card key={pp.projectId} variant="outlined" sx={{ mt: 2, p: 2 }}>
                    <Typography variant="subtitle2" sx={{ mb: 1 }}>
                      {project?.name} Permissions
                    </Typography>
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

        {/* ---------- PERMISSIONS TAB ---------- */}
        {tab === 2 && (
          <Card sx={{ p: 3 }}>
            <Typography variant="subtitle1" sx={{ mb: 2 }}>
              Permission Profile
            </Typography>
            {modulesTree && modulesTree.length > 0 ? (
              <PermissionProfile
                modules={modulesTree}
                allProjects={projects}
                initialData={permissionProfile}
                onChange={handlePermissionProfileChange}
              />
            ) : (
              <Typography variant="body2" color="text.secondary" sx={{ py: 4, textAlign: 'center' }}>
                No modules configured.
              </Typography>
            )}
          </Card>
        )}
      </PageContainer>
    </>
  );
}

import type { Zone } from 'src/services/types/geography';
import type { ProjectLocation } from 'src/services/types/project';
import type { Role, Department } from 'src/services/types/organization';
import type { ProjectMappingData, RolePermissionProfile } from 'src/services/types/user';

import { useQuery } from '@tanstack/react-query';
import { useMemo, useState, forwardRef, useCallback, useImperativeHandle } from 'react';

import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import Chip from '@mui/material/Chip';
import Tabs from '@mui/material/Tabs';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import Select from '@mui/material/Select';
import Checkbox from '@mui/material/Checkbox';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import InputLabel from '@mui/material/InputLabel';
import Typography from '@mui/material/Typography';
import FormControl from '@mui/material/FormControl';
import Autocomplete from '@mui/material/Autocomplete';
import CircularProgress from '@mui/material/CircularProgress';
import FormControlLabel from '@mui/material/FormControlLabel';

import { queryKeys } from 'src/services/api/query-keys';
import { useZoneList } from 'src/services/hooks/use-geography';
import { userService } from 'src/services/services/user.service';
import { useModuleTree } from 'src/services/hooks/use-product-catalog';
import { projectService } from 'src/services/services/project.service';
import { useRoleList, useDepartmentList, useDepartmentRoleList } from 'src/services/hooks/use-organization';

import { PermissionProfile } from './permission-profile';

export interface ProjectMappingStepHandle {
  getData: () => ProjectMappingData;
  validate: () => boolean;
}

interface Props {
  initialData?: ProjectMappingData;
}

function validateStep(data: ProjectMappingData): string[] {
  const errs: string[] = [];
  if (data.zoneIds.length === 0) errs.push('At least one Zone must be selected.');
  if (!data.departmentId) errs.push('Department is required.');
  if (!data.primaryRoleId) errs.push('Primary Role is required.');

  const primaryPerms = data.profiles.primary.permissions;
  const hasEnabledSubModule = primaryPerms.some((m) =>
    m.subModules.some((sm) => sm.enabled),
  );
  if (!hasEnabledSubModule) errs.push('At least one Sub Module must be enabled for the Primary Role.');

  primaryPerms.forEach((mod) => {
    mod.subModules.forEach((sm) => {
      if (sm.enabled && sm.accessType === 'selected' && sm.projectIds.length === 0) {
        errs.push('Each enabled Sub Module with Selected Projects access must have at least one Project selected.');
      }
    });
  });

  if (data.secondaryRoleId && data.secondaryRoleId === data.primaryRoleId) {
    errs.push('Secondary Role cannot be the same as Primary Role.');
  }

  if (data.buddyRmUserId && data.profiles.buddyRm) {
    const buddyHasSubModule = data.profiles.buddyRm.permissions.some((m) =>
      m.subModules.some((sm) => sm.enabled),
    );
    if (!buddyHasSubModule) errs.push('At least one Sub Module must be enabled for Buddy RM.');
  }

  return errs;
}

export default forwardRef<ProjectMappingStepHandle, Props>(({ initialData }: Props, ref) => {
  const { data: zones } = useZoneList();
  const { data: departments } = useDepartmentList();
  const { data: roles } = useRoleList();
  const { data: deptRoles } = useDepartmentRoleList();
  const { data: moduleTree } = useModuleTree();
  const { data: allProjects } = useQuery({
    queryKey: queryKeys.projects.list({}),
    queryFn: async () => {
      const res = await projectService.list({});
      return res.data;
    },
  });

  const { data: allLocations } = useQuery({
    queryKey: queryKeys.projects.locations.all,
    queryFn: async () => {
      const res = await projectService.locations.list();
      return res.data as ProjectLocation[];
    },
  });

  const [zoneIds, setZoneIds] = useState<number[]>(initialData?.zoneIds ?? []);
  const [departmentId, setDepartmentId] = useState<number | ''>(initialData?.departmentId ?? '');
  const [primaryRoleId, setPrimaryRoleId] = useState<number | ''>(initialData?.primaryRoleId ?? '');
  const [secondaryDepartmentId, setSecondaryDepartmentId] = useState<number | ''>(initialData?.secondaryDepartmentId ?? '');
  const [secondaryRoleId, setSecondaryRoleId] = useState<number | ''>(initialData?.secondaryRoleId ?? '');
  const [assignBuddyRm, setAssignBuddyRm] = useState(initialData?.assignBuddyRm ?? false);
  const [buddyRmUserId, setBuddyRmUserId] = useState(initialData?.buddyRmUserId ?? '');
  const [buddySearch, setBuddySearch] = useState('');
  const [tabValue, setTabValue] = useState(0);
  const [errList, setErrList] = useState<string[]>([]);

  const [primaryPermissions, setPrimaryPermissions] = useState<RolePermissionProfile>(initialData?.profiles?.primary?.permissions ?? []);
  const [secondaryPermissions, setSecondaryPermissions] = useState<RolePermissionProfile>(initialData?.profiles?.secondary?.permissions ?? []);
  const [buddyPermissions, setBuddyPermissions] = useState<RolePermissionProfile>(initialData?.profiles?.buddyRm?.permissions ?? []);

  const activeModules = useMemo(() => moduleTree ?? [], [moduleTree]);
  const activeDepartments = useMemo(() => departments ?? [], [departments]);
  const activeRoles = useMemo(() => roles ?? [], [roles]);
  const projects = useMemo(() => allProjects ?? [], [allProjects]);
  const locations = useMemo(() => allLocations ?? [], [allLocations]);

  const deptRoleMap = useMemo(() => {
    const map = new Map<number, number[]>();
    (deptRoles ?? []).forEach((dr: { departmentId: number; roleId: number }) => {
      const list = map.get(dr.departmentId) ?? [];
      list.push(dr.roleId);
      map.set(dr.departmentId, list);
    });
    return map;
  }, [deptRoles]);

  const rolesForPrimaryDept = useMemo(
    () => activeRoles.filter((r) => {
      if (!departmentId) return true;
      const allowed = deptRoleMap.get(departmentId as number) ?? [];
      return allowed.includes(r.id);
    }),
    [activeRoles, departmentId, deptRoleMap],
  );

  const rolesForSecondaryDept = useMemo(
    () => activeRoles.filter((r) => {
      if (!secondaryDepartmentId) return true;
      const allowed = deptRoleMap.get(secondaryDepartmentId as number) ?? [];
      return allowed.includes(r.id);
    }),
    [activeRoles, secondaryDepartmentId, deptRoleMap],
  );

  const projectIdsByZone = useMemo(() => {
    if (zoneIds.length === 0) return new Set<number>();
    const locationZoneIds = new Set(zoneIds.map(Number));
    const ids = new Set<number>();
    locations.forEach((loc) => {
      if (locationZoneIds.has(loc.zoneId)) {
        ids.add(loc.projectId);
      }
    });
    return ids;
  }, [zoneIds, locations]);

  const zoneFilteredProjects = useMemo(
    () => projects.filter((p) => projectIdsByZone.has(p.id)),
    [projects, projectIdsByZone],
  );

  const { data: buddyResults } = useQuery({
    queryKey: ['buddy-user-search', buddySearch],
    queryFn: async () => {
      if (!buddySearch || buddySearch.length < 2) return [];
      const res = await userService.list({ search: buddySearch });
      return res.data ?? [];
    },
    enabled: assignBuddyRm && buddySearch.length >= 2,
  });

  const buddyUsers = useMemo(() => buddyResults ?? [], [buddyResults]);

  const tabs = useMemo(() => {
    const result: { label: string; value: number }[] = [{ label: 'Primary Role', value: 0 }];
    if (secondaryRoleId) result.push({ label: 'Secondary Role', value: 1 });
    if (assignBuddyRm && buddyRmUserId) result.push({ label: 'Buddy RM', value: 2 });
    return result;
  }, [secondaryRoleId, assignBuddyRm, buddyRmUserId]);

  const safeTabIndex = useMemo(() => {
    const validValues = tabs.map((t) => t.value);
    return validValues.includes(tabValue) ? tabValue : (validValues[0] ?? 0);
  }, [tabs, tabValue]);

  const getData = useCallback((): ProjectMappingData => ({
    zoneIds: zoneIds as number[],
    departmentId: departmentId as number,
    primaryRoleId: primaryRoleId as number,
    secondaryDepartmentId: secondaryDepartmentId || undefined,
    secondaryRoleId: secondaryRoleId || undefined,
    assignBuddyRm,
    buddyRmUserId: buddyRmUserId || undefined,
    profiles: {
      primary: { roleId: primaryRoleId as number, departmentId: departmentId as number, permissions: primaryPermissions },
      secondary: secondaryRoleId
        ? { roleId: secondaryRoleId as number, departmentId: secondaryDepartmentId as number, permissions: secondaryPermissions }
        : undefined,
      buddyRm: assignBuddyRm && buddyRmUserId
        ? { buddyUserId: buddyRmUserId, permissions: buddyPermissions }
        : undefined,
    },
  }), [zoneIds, departmentId, primaryRoleId, secondaryDepartmentId, secondaryRoleId, assignBuddyRm, buddyRmUserId, primaryPermissions, secondaryPermissions, buddyPermissions]);

  const validate = useCallback((): boolean => {
    const data = getData();
    const validationErrors = validateStep(data);
    setErrList(validationErrors);
    return validationErrors.length === 0;
  }, [getData]);

  useImperativeHandle(ref, () => ({ getData, validate }), [getData, validate]);

  const handlePrimaryPermissionsChange = useCallback((perms: RolePermissionProfile) => {
    setPrimaryPermissions(perms);
    setErrList([]);
  }, []);

  const handleSecondaryPermissionsChange = useCallback((perms: RolePermissionProfile) => {
    setSecondaryPermissions(perms);
    setErrList([]);
  }, []);

  const handleBuddyPermissionsChange = useCallback((perms: RolePermissionProfile) => {
    setBuddyPermissions(perms);
    setErrList([]);
  }, []);

  if (!activeModules.length || !activeDepartments.length || !activeRoles.length) {
    return (
      <Box sx={{ p: 3 }}>
        <Stack spacing={2}>
          {!activeModules.length && (
            <Alert severity="info">Loading modules...</Alert>
          )}
          {!activeDepartments.length && (
            <Alert severity="info">Loading departments...</Alert>
          )}
          {!activeRoles.length && (
            <Alert severity="info">Loading roles...</Alert>
          )}
          {(!activeModules.length || !activeDepartments.length || !activeRoles.length) && (
            <CircularProgress sx={{ alignSelf: 'center' }} />
          )}
        </Stack>
      </Box>
    );
  }

  return (
    <Stack spacing={3} sx={{ p: 3 }}>
      {errList.length > 0 && (
        <Alert severity="error" onClose={() => setErrList([])}>
          <Stack spacing={0.5}>
            {errList.map((err, i) => (
              <Typography key={i} variant="body2">{err}</Typography>
            ))}
          </Stack>
        </Alert>
      )}

      <Box display="grid" gridTemplateColumns={{ xs: '1fr', sm: '1fr 1fr' }} gap={2.5} sx={{ maxWidth: 900 }}>
        <FormControl>
          <InputLabel>Zone *</InputLabel>
          <Select
            multiple
            value={zoneIds}
            label="Zone *"
            onChange={(e) => { setZoneIds(e.target.value as number[]); setErrList([]); }}
            renderValue={(selected) => (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {(selected as number[]).map((id) => {
                  const zone = (zones ?? []).find((z: Zone) => z.id === id);
                  return <Chip key={id} label={zone?.name ?? id} size="small" />;
                })}
              </Box>
            )}
          >
            {(zones ?? []).map((zone: Zone) => (
              <MenuItem key={zone.id} value={zone.id}>{zone.name}</MenuItem>
            ))}
          </Select>
        </FormControl>

        <Box /> {/* spacer */}

        <FormControl>
          <InputLabel>Department *</InputLabel>
          <Select
            value={departmentId}
            label="Department *"
            onChange={(e) => {
              const newDeptId = e.target.value as number;
              setDepartmentId(newDeptId);
              const allowedRoles = deptRoleMap.get(newDeptId) ?? [];
              if (primaryRoleId && !allowedRoles.includes(primaryRoleId as number)) {
                setPrimaryRoleId('');
              }
              setErrList([]);
            }}
          >
            {(departments ?? []).map((dept: Department) => (
              <MenuItem key={dept.id} value={dept.id}>{dept.name}</MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl>
          <InputLabel>Primary Role *</InputLabel>
          <Select
            value={primaryRoleId}
            label="Primary Role *"
            onChange={(e) => { setPrimaryRoleId(e.target.value as number); setErrList([]); }}
          >
            {rolesForPrimaryDept.map((role: Role) => (
              <MenuItem key={role.id} value={role.id}>{role.name}</MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl>
          <InputLabel>Secondary Department (Optional)</InputLabel>
          <Select
            value={secondaryDepartmentId}
            label="Secondary Department (Optional)"
            onChange={(e) => {
              const newDeptId = e.target.value as number;
              setSecondaryDepartmentId(newDeptId);
              const allowedRoles = newDeptId ? (deptRoleMap.get(newDeptId) ?? []) : [];
              if (secondaryRoleId && !allowedRoles.includes(secondaryRoleId as number)) {
                setSecondaryRoleId('');
              }
              setErrList([]);
            }}
          >
            <MenuItem value="">None</MenuItem>
            {(departments ?? []).map((dept: Department) => (
              <MenuItem key={dept.id} value={dept.id}>{dept.name}</MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl>
          <InputLabel>Secondary Role (Optional)</InputLabel>
          <Select
            value={secondaryRoleId}
            label="Secondary Role (Optional)"
            onChange={(e) => { setSecondaryRoleId(e.target.value as number); setErrList([]); }}
          >
            <MenuItem value="">None</MenuItem>
            {rolesForSecondaryDept.map((role: Role) => (
              <MenuItem key={role.id} value={role.id}>{role.name}</MenuItem>
            ))}
          </Select>
        </FormControl>

        <Box /> {/* spacer */}
      </Box>

      <FormControlLabel
        control={
          <Checkbox
            checked={assignBuddyRm}
            onChange={(e) => { setAssignBuddyRm(e.target.checked); setErrList([]); }}
          />
        }
        label="Assign Buddy RM Access"
      />

      {assignBuddyRm && (
        <Autocomplete
          options={buddyUsers as any[]}
          getOptionLabel={(option: any) => `${option.name} (${option.empId})`}
          isOptionEqualToValue={(o: any, v: any) => o.id === v.id}
          value={buddyRmUserId ? (buddyUsers as any[]).find((u: any) => u.id === buddyRmUserId) ?? null : null}
          onChange={(_, value: any) => { setBuddyRmUserId(value?.id ?? ''); setErrList([]); }}
          onInputChange={(_, val) => setBuddySearch(val)}
          renderInput={(params) => (
            <TextField {...params} label="Search Employee Name / Employee ID" size="medium" />
          )}
          renderOption={(props, option: any) => (
            <li {...props}>
              <Box>
                <Typography variant="body2" fontWeight={600}>{option.name}</Typography>
                <Typography variant="caption" color="text.secondary">
                  {option.empId} | {option.departmentName ?? option.departmentId ?? ''}{option.roleName ? ` | ${option.roleName}` : ''}
                </Typography>
              </Box>
            </li>
          )}
          noOptionsText="Start typing to search users"
          sx={{ maxWidth: 680 }}
        />
      )}

      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs
          value={safeTabIndex}
          onChange={(_, v) => setTabValue(v)}
          aria-label="permission profile tabs"
        >
          {tabs.map((tab) => (
            <Tab key={tab.value} label={tab.label} value={tab.value} />
          ))}
        </Tabs>
      </Box>

      <Box sx={{ display: safeTabIndex === 0 ? 'block' : 'none' }}>
        {activeModules.length > 0 && (
          <PermissionProfile
            modules={activeModules}
            allProjects={zoneFilteredProjects}
            initialData={primaryPermissions}
            onChange={handlePrimaryPermissionsChange}
          />
        )}
      </Box>

      <Box sx={{ display: safeTabIndex === 1 && !!secondaryRoleId ? 'block' : 'none' }}>
        {secondaryRoleId && activeModules.length > 0 && (
          <PermissionProfile
            modules={activeModules}
            allProjects={zoneFilteredProjects}
            initialData={secondaryPermissions}
            onChange={handleSecondaryPermissionsChange}
          />
        )}
      </Box>

      <Box sx={{ display: safeTabIndex === 2 && assignBuddyRm && !!buddyRmUserId ? 'block' : 'none' }}>
        {assignBuddyRm && !!buddyRmUserId && activeModules.length > 0 && (
          <PermissionProfile
            modules={activeModules}
            allProjects={zoneFilteredProjects}
            initialData={buddyPermissions}
            onChange={handleBuddyPermissionsChange}
          />
        )}
      </Box>
    </Stack>
  );
});

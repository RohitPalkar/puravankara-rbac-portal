import type { Zone } from 'src/services/types/geography';
import type { Role } from 'src/services/types/organization';
import type { ProjectLocation } from 'src/services/types/project';
import type { ProjectMappingData, RolePermissionProfile } from 'src/services/types/user';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useMemo, useState, useEffect, forwardRef, useCallback, useImperativeHandle } from 'react';

import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import Checkbox from '@mui/material/Checkbox';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import FormControl from '@mui/material/FormControl';
import Autocomplete from '@mui/material/Autocomplete';
import FormControlLabel from '@mui/material/FormControlLabel';
import CircularProgress from '@mui/material/CircularProgress';

import { queryKeys } from 'src/services/api/query-keys';
import { useZoneList } from 'src/services/hooks/use-geography';
import { userService } from 'src/services/services/user.service';
import { useModuleTree } from 'src/services/hooks/use-product-catalog';
import { projectService } from 'src/services/services/project.service';
import { departmentService } from 'src/services/services/organization.service';
import { useRoleList, useDepartmentRoleList } from 'src/services/hooks/use-organization';

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
  if (!data.zoneId) errs.push('Zone is required.');
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
  const queryClient = useQueryClient();
  const { data: zones } = useZoneList();
  const { data: allRoles } = useRoleList();
  const { data: deptRoles } = useDepartmentRoleList();
  const { data: moduleTree } = useModuleTree();

  useEffect(() => {
    queryClient.invalidateQueries({ queryKey: queryKeys.zones.all });
    queryClient.invalidateQueries({ queryKey: queryKeys.departments.all });
    queryClient.invalidateQueries({ queryKey: queryKeys.roles.all });
    queryClient.invalidateQueries({ queryKey: queryKeys.departmentRoles.all });
  }, [queryClient]);

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

  // --- State ---
  const [zoneId, setZoneId] = useState<number | null>(initialData?.zoneId ?? null);
  const [departmentId, setDepartmentId] = useState<number | null>(initialData?.departmentId ?? null);
  const [primaryRoleId, setPrimaryRoleId] = useState<number | null>(initialData?.primaryRoleId ?? null);
  const [isDepartmentAdmin, setIsDepartmentAdmin] = useState(initialData?.isDepartmentAdmin ?? false);
  const [secondaryRoleId, setSecondaryRoleId] = useState<number | null>(initialData?.secondaryRoleId ?? null);
  const [assignBuddyRm, setAssignBuddyRm] = useState(initialData?.assignBuddyRm ?? false);
  const [buddyRmUserId, setBuddyRmUserId] = useState(initialData?.buddyRmUserId ?? '');
  const [buddySearch, setBuddySearch] = useState('');
  const [tabValue, setTabValue] = useState(0);
  const [errList, setErrList] = useState<string[]>([]);
  const [departmentSearch, setDepartmentSearch] = useState('');

  const [primaryPermissions, setPrimaryPermissions] = useState<RolePermissionProfile>(initialData?.profiles?.primary?.permissions ?? []);
  const [secondaryPermissions, setSecondaryPermissions] = useState<RolePermissionProfile>(initialData?.profiles?.secondary?.permissions ?? []);
  const [buddyPermissions, setBuddyPermissions] = useState<RolePermissionProfile>(initialData?.profiles?.buddyRm?.permissions ?? []);

  // --- Derived data ---
  const activeModules = useMemo(() => moduleTree ?? [], [moduleTree]);
  const activeZones = useMemo(() => {
    const list = (zones ?? []).filter((z: Zone) => z.isActive !== false);
    return list.sort((a: Zone, b: Zone) => a.name.localeCompare(b.name));
  }, [zones]);
  const activeRoles = useMemo(() => allRoles ?? [], [allRoles]);
  const projects = useMemo(() => allProjects ?? [], [allProjects]);
  const locations = useMemo(() => allLocations ?? [], [allLocations]);

  const selectedZoneName = useMemo(() => {
    if (!zoneId) return '';
    const zone = activeZones.find((zn: Zone) => zn.id === zoneId);
    return zone?.name ?? '';
  }, [zoneId, activeZones]);

  // Fetch departments for selected zone
  const { data: zoneDepartments, isLoading: deptsLoading } = useQuery({
    queryKey: ['departments-by-zone', zoneId],
    queryFn: async () => {
      if (!zoneId) return [];
      const res = await departmentService.list({ zoneId: String(zoneId), limit: 200 } as any);
      return res.data ?? [];
    },
    enabled: !!zoneId,
  });

  const filteredDepartments = useMemo(() => {
    const depts = zoneDepartments ?? [];
    if (!departmentSearch) return depts;
    const lower = departmentSearch.toLowerCase();
    return depts.filter((d: any) => d.name?.toLowerCase().includes(lower));
  }, [zoneDepartments, departmentSearch]);

  const deptRoleMap = useMemo(() => {
    const map = new Map<number, number[]>();
    (deptRoles ?? []).forEach((dr: { departmentId: number; roleId: number }) => {
      const list = map.get(dr.departmentId) ?? [];
      list.push(dr.roleId);
      map.set(dr.departmentId, list);
    });
    return map;
  }, [deptRoles]);

  const rolesForDepartment = useMemo(
    () => activeRoles.filter((r: Role) => {
      if (!departmentId) return false;
      const allowed = deptRoleMap.get(departmentId) ?? [];
      return allowed.includes(r.id);
    }),
    [activeRoles, departmentId, deptRoleMap],
  );

  const projectIdsByZone = useMemo(() => {
    if (!zoneId) return new Set<number>();
    const ids = new Set<number>();
    locations.forEach((loc: ProjectLocation) => {
      if (loc.zoneId === zoneId) {
        ids.add(loc.projectId);
      }
    });
    return ids;
  }, [zoneId, locations]);

  const zoneFilteredProjects = useMemo(
    () => projects.filter((p: any) => projectIdsByZone.has(p.id)),
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

  // --- Cascade clear helpers ---
  const cascadeClearZone = useCallback(() => {
    setDepartmentId(null);
    setPrimaryRoleId(null);
    setIsDepartmentAdmin(false);
    setSecondaryRoleId(null);
    setDepartmentSearch('');
    setErrList([]);
  }, []);

  const cascadeClearDepartment = useCallback(() => {
    setPrimaryRoleId(null);
    setIsDepartmentAdmin(false);
    setSecondaryRoleId(null);
    setErrList([]);
  }, []);

  // --- Handler for zone change ---
  const handleZoneChange = useCallback((newZoneId: number | null) => {
    if (newZoneId !== zoneId) {
      cascadeClearZone();
    }
    setZoneId(newZoneId);
  }, [zoneId, cascadeClearZone]);

  // --- Handler for department change ---
  const handleDepartmentChange = useCallback((newDeptId: number | null) => {
    if (newDeptId !== departmentId) {
      cascadeClearDepartment();
    }
    setDepartmentId(newDeptId);
  }, [departmentId, cascadeClearDepartment]);

  const getData = useCallback((): ProjectMappingData => ({
    zoneId,
    departmentId,
    primaryRoleId,
    isDepartmentAdmin,
    secondaryRoleId: secondaryRoleId || undefined,
    assignBuddyRm,
    buddyRmUserId: buddyRmUserId || undefined,
    profiles: {
      primary: { roleId: primaryRoleId!, departmentId: departmentId!, permissions: primaryPermissions },
      secondary: secondaryRoleId
        ? { roleId: secondaryRoleId, departmentId: departmentId!, permissions: secondaryPermissions }
        : undefined,
      buddyRm: assignBuddyRm && buddyRmUserId
        ? { buddyUserId: buddyRmUserId, permissions: buddyPermissions }
        : undefined,
    },
  }), [zoneId, departmentId, primaryRoleId, isDepartmentAdmin, secondaryRoleId, assignBuddyRm, buddyRmUserId, primaryPermissions, secondaryPermissions, buddyPermissions]);

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

  if (!activeModules.length && !activeRoles.length) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="warning">
          No master data available. Please configure Zones, Departments, Roles, and Modules in the system before creating a user.
        </Alert>
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
        {/* Zone - Searchable Autocomplete */}
        <Autocomplete
          options={activeZones}
          value={activeZones.find((z: Zone) => z.id === zoneId) ?? null}
          onChange={(_, newValue) => { handleZoneChange(newValue?.id ?? null); }}
          getOptionLabel={(option: Zone) => option.name}
          isOptionEqualToValue={(option: Zone, value: Zone) => option.id === value.id}
          renderInput={(params) => <TextField {...params} label="Zone *" placeholder="Search Zone" />}
          noOptionsText="No zones available"
          disablePortal
          fullWidth
        />

        {/* Department - Filtered by Zone, searchable */}
        <FormControl>
          <Autocomplete
            options={filteredDepartments}
            value={filteredDepartments.find((d: any) => d.id === departmentId) ?? null}
            onChange={(_, newValue) => { handleDepartmentChange(newValue?.id ?? null); }}
            getOptionLabel={(option: any) => option.name}
            isOptionEqualToValue={(option: any, value: any) => option.id === value.id}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Department *"
                placeholder="Search Department"
                InputProps={{
                  ...params.InputProps,
                  endAdornment: (
                    <>
                      {deptsLoading ? <CircularProgress size={20} /> : null}
                      {params.InputProps.endAdornment}
                    </>
                  ),
                }}
              />
            )}
            noOptionsText={!zoneId ? 'Select a Zone first' : 'No Departments available for this Zone.'}
            onInputChange={(_, val) => setDepartmentSearch(val)}
            disabled={!zoneId}
            disablePortal
            fullWidth
          />
        </FormControl>

        {/* Primary Role - Searchable Autocomplete */}
        <Autocomplete
          options={rolesForDepartment}
          value={rolesForDepartment.find((r: Role) => r.id === primaryRoleId) ?? null}
          onChange={(_, newValue) => { setPrimaryRoleId(newValue?.id ?? null); setErrList([]); }}
          getOptionLabel={(option: Role) => `${option.name} • ${selectedZoneName}`}
          isOptionEqualToValue={(option: Role, value: Role) => option.id === value.id}
          renderInput={(params) => <TextField {...params} label="Role *" placeholder="Search Role" />}
          noOptionsText={!departmentId ? 'Select a Department first' : 'No roles available for this Department'}
          disabled={!departmentId}
          disablePortal
          fullWidth
        />

        {/* Secondary Role - Searchable Autocomplete */}
        <Autocomplete
          options={rolesForDepartment}
          value={rolesForDepartment.find((r: Role) => r.id === secondaryRoleId) ?? null}
          onChange={(_, newValue) => { setSecondaryRoleId(newValue?.id ?? null); setErrList([]); }}
          getOptionLabel={(option: Role) => `${option.name} • ${selectedZoneName}`}
          isOptionEqualToValue={(option: Role, value: Role) => option.id === value.id}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Secondary Role (Optional)"
              placeholder="Search Secondary Role"
            />
          )}
          noOptionsText={!departmentId ? 'Select a Department first' : 'No roles available'}
          disabled={!departmentId}
          disablePortal
          clearOnEscape
          fullWidth
        />
      </Box>

      {/* Department Administrator Checkbox */}
      <FormControlLabel
        control={
          <Checkbox
            checked={isDepartmentAdmin}
            onChange={(e) => { setIsDepartmentAdmin(e.target.checked); setErrList([]); }}
            disabled={!departmentId}
          />
        }
        label={
          <Box>
            <Typography variant="body2" fontWeight={600}>Make this user the Department Administrator</Typography>
            <Typography variant="caption" color="text.secondary">
              Only one active Department Administrator can exist for a Department within a Zone.
              Checking this only assigns the designation. It does NOT grant permissions.
            </Typography>
          </Box>
        }
      />

      {/* Buddy RM */}
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
          isOptionEqualToValue={(o: any, v: any) => o.empId === v.empId}
          value={buddyRmUserId ? (buddyUsers as any[]).find((u: any) => u.empId === buddyRmUserId) ?? null : null}
          onChange={(_, value: any) => { setBuddyRmUserId(value?.empId ?? ''); setErrList([]); }}
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

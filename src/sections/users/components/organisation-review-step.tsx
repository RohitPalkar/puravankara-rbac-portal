import type { UserGroup } from 'src/services/types/user-group';
import type { ProjectMappingData } from 'src/services/types/user';

import { useQuery } from '@tanstack/react-query';
import { useMemo, useState, useEffect, forwardRef, useCallback, useImperativeHandle } from 'react';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Select from '@mui/material/Select';
import Divider from '@mui/material/Divider';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import InputLabel from '@mui/material/InputLabel';
import Typography from '@mui/material/Typography';
import FormControl from '@mui/material/FormControl';
import Autocomplete from '@mui/material/Autocomplete';

import { userService } from 'src/services/services/user.service';
import { useUserGroupList } from 'src/services/hooks/use-user-groups';
import { useDepartmentList, useRoleList } from 'src/services/hooks/use-organization';

import type { BasicInfoData } from './basic-information-step';

export interface OrganisationData {
  employmentStatus: 'Active' | 'Inactive';
  reportingManagerId: string;
  teamLeadId?: string;
  departmentAdminId: string;
  userGroupId?: number;
  effectiveFrom: string;
  effectiveTill?: string;
}

interface UserSearchResult {
  empId: string;
  name: string;
  email: string;
  departmentName?: string;
  roleName?: string;
  id?: string;
}

export interface OrganisationReviewStepHandle {
  getData: () => OrganisationData;
  validate: () => boolean;
}

interface Props {
  step1Data?: BasicInfoData;
  step2Data?: ProjectMappingData;
  onNavigateStep?: (step: number) => void;
}

function todayString(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export default forwardRef<OrganisationReviewStepHandle, Props>(
  ({ step1Data, step2Data, onNavigateStep }: Props, ref) => {
    const { data: userGroups } = useUserGroupList();
    const { data: departments } = useDepartmentList();
    const { data: roles } = useRoleList();

    const [employmentStatus, setEmploymentStatus] = useState<'Active' | 'Inactive'>('Active');
    const [reportingManagerId, setReportingManagerId] = useState('');
    const [reportingManagerSearch, setReportingManagerSearch] = useState('');
    const [teamLeadId, setTeamLeadId] = useState('');
    const [teamLeadSearch, setTeamLeadSearch] = useState('');
    const [departmentAdminId, setDepartmentAdminId] = useState('');
    const [departmentAdminSearch, setDepartmentAdminSearch] = useState('');
    const [userGroupId, setUserGroupId] = useState<number | ''>('');
    const [effectiveFrom, setEffectiveFrom] = useState(todayString());
    const [effectiveTill, setEffectiveTill] = useState('');
    const [errors, setErrors] = useState<string[]>([]);

    const [reportingMgrName, setReportingMgrName] = useState('');
    const [teamLeadName, setTeamLeadName] = useState('');
    const [deptAdminName, setDeptAdminName] = useState('');

    const { data: userSearchResults } = useQuery({
      queryKey: ['user-search', reportingManagerSearch],
      queryFn: async () => {
        if (reportingManagerSearch.length < 2) return [];
        const res = await userService.list({ search: reportingManagerSearch });
        return res.data ?? [];
      },
      enabled: reportingManagerSearch.length >= 2,
    });

    const { data: teamLeadResults } = useQuery({
      queryKey: ['teamlead-search', teamLeadSearch],
      queryFn: async () => {
        if (teamLeadSearch.length < 2) return [];
        const res = await userService.list({ search: teamLeadSearch });
        return res.data ?? [];
      },
      enabled: teamLeadSearch.length >= 2,
    });

    const { data: deptAdminResults } = useQuery({
      queryKey: ['deptadmin-search', departmentAdminSearch],
      queryFn: async () => {
        if (departmentAdminSearch.length < 2) return [];
        const res = await userService.list({ search: departmentAdminSearch });
        return res.data ?? [];
      },
      enabled: departmentAdminSearch.length >= 2,
    });

    const searchUsers = useMemo(() => userSearchResults ?? [], [userSearchResults]);
    const searchTeamLeads = useMemo(() => teamLeadResults ?? [], [teamLeadResults]);
    const searchDeptAdmins = useMemo(() => deptAdminResults ?? [], [deptAdminResults]);
    const groups = useMemo(() => userGroups ?? [], [userGroups]);

    useEffect(() => {
      setErrors([]);
    }, []);

    const validate = useCallback((): boolean => {
      const errs: string[] = [];
      if (!reportingManagerId) errs.push('Reporting Manager is required.');
      if (!departmentAdminId) errs.push('Department Admin is required.');
      if (!effectiveFrom) errs.push('Effective From is required.');
      if (effectiveTill && effectiveTill <= effectiveFrom) {
        errs.push('Effective Till must be after Effective From.');
      }
      setErrors(errs);
      return errs.length === 0;
    }, [reportingManagerId, departmentAdminId, effectiveFrom, effectiveTill]);

    const getData = useCallback((): OrganisationData => ({
      employmentStatus,
      reportingManagerId,
      teamLeadId: teamLeadId || undefined,
      departmentAdminId,
      userGroupId: userGroupId || undefined,
      effectiveFrom,
      effectiveTill: effectiveTill || undefined,
    }), [employmentStatus, reportingManagerId, teamLeadId, departmentAdminId, userGroupId, effectiveFrom, effectiveTill]);

    useImperativeHandle(ref, () => ({ getData, validate }), [getData, validate]);

    const moduleTreeData = step2Data;
    const basicData = step1Data;

    const selectedDepartment = step2Data?.departmentId
      ? (departments ?? []).find((d: any) => d.id === step2Data.departmentId)?.name ?? `ID: ${step2Data.departmentId}`
      : '';
    const selectedPrimaryRole = step2Data?.primaryRoleId
      ? (roles ?? []).find((r: any) => r.id === step2Data.primaryRoleId)?.name ?? `ID: ${step2Data.primaryRoleId}`
      : '';
    const selectedSecondaryRole = step2Data?.secondaryRoleId
      ? (roles ?? []).find((r: any) => r.id === step2Data.secondaryRoleId)?.name ?? `ID: ${step2Data.secondaryRoleId}`
      : '';

    return (
      <Stack spacing={2} sx={{ p: 3 }}>
        {/* ORGANISATION FORM */}
        <Typography variant="subtitle1" sx={{ mb: 1 }}>Organisation Details</Typography>

        <Box display="grid" gridTemplateColumns={{ xs: '1fr', sm: '1fr 1fr' }} gap={2.5} sx={{ maxWidth: 900 }}>
          <FormControl>
            <InputLabel>Employment Status *</InputLabel>
            <Select
              value={employmentStatus}
              label="Employment Status *"
              onChange={(e) => { setEmploymentStatus(e.target.value as 'Active' | 'Inactive'); setErrors([]); }}
            >
              <MenuItem value="Active">Active</MenuItem>
              <MenuItem value="Inactive">Inactive</MenuItem>
            </Select>
          </FormControl>

          <FormControl>
            <InputLabel>User Group</InputLabel>
            <Select
              value={userGroupId}
              label="User Group"
              onChange={(e) => { setUserGroupId(e.target.value as number); setErrors([]); }}
            >
              <MenuItem value="">None</MenuItem>
              {groups.map((g: UserGroup) => (
                <MenuItem key={g.id} value={g.id}>{g.name}</MenuItem>
              ))}
            </Select>
          </FormControl>

          <Autocomplete
            options={searchUsers as any[]}
            getOptionLabel={(option: UserSearchResult) => `${option.name} (${option.empId})`}
            isOptionEqualToValue={(o: UserSearchResult, v: UserSearchResult) => o.empId === v.empId}
            value={reportingManagerId ? (searchUsers as UserSearchResult[]).find((u) => u.empId === reportingManagerId) ?? null : null}
            onChange={(_, value: UserSearchResult | null) => {
              setReportingManagerId(value?.empId ?? '');
              setReportingMgrName(value?.name ?? '');
              setErrors([]);
            }}
            onInputChange={(_, val) => setReportingManagerSearch(val)}
            renderInput={(params) => (
              <TextField {...params} label="Reporting Manager *" size="medium" />
            )}
            renderOption={(props, option: UserSearchResult) => (
              <li {...props}>
                <Box>
                  <Typography variant="body2" fontWeight={600}>{option.name}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {option.empId}{option.departmentName ? ` | ${option.departmentName}` : ''}{option.roleName ? ` | ${option.roleName}` : ''}
                  </Typography>
                </Box>
              </li>
            )}
            noOptionsText="Start typing to search users"
          />

          <Autocomplete
            options={searchTeamLeads as any[]}
            getOptionLabel={(option: UserSearchResult) => `${option.name} (${option.empId})`}
            isOptionEqualToValue={(o: UserSearchResult, v: UserSearchResult) => o.empId === v.empId}
            value={teamLeadId ? (searchTeamLeads as UserSearchResult[]).find((u) => u.empId === teamLeadId) ?? null : null}
            onChange={(_, value: UserSearchResult | null) => {
              setTeamLeadId(value?.empId ?? '');
              setTeamLeadName(value?.name ?? '');
              setErrors([]);
            }}
            onInputChange={(_, val) => setTeamLeadSearch(val)}
            renderInput={(params) => (
              <TextField {...params} label="Team Lead (Optional)" size="medium" />
            )}
            renderOption={(props, option: UserSearchResult) => (
              <li {...props}>
                <Box>
                  <Typography variant="body2" fontWeight={600}>{option.name}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {option.empId}{option.departmentName ? ` | ${option.departmentName}` : ''}{option.roleName ? ` | ${option.roleName}` : ''}
                  </Typography>
                </Box>
              </li>
            )}
            noOptionsText="Start typing to search users"
          />

          <Autocomplete
            options={searchDeptAdmins as any[]}
            getOptionLabel={(option: UserSearchResult) => `${option.name} (${option.empId})`}
            isOptionEqualToValue={(o: UserSearchResult, v: UserSearchResult) => o.empId === v.empId}
            value={departmentAdminId ? (searchDeptAdmins as UserSearchResult[]).find((u) => u.empId === departmentAdminId) ?? null : null}
            onChange={(_, value: UserSearchResult | null) => {
              setDepartmentAdminId(value?.empId ?? '');
              setDeptAdminName(value?.name ?? '');
              setErrors([]);
            }}
            onInputChange={(_, val) => setDepartmentAdminSearch(val)}
            renderInput={(params) => (
              <TextField {...params} label="Department Admin *" size="medium" />
            )}
            renderOption={(props, option: UserSearchResult) => (
              <li {...props}>
                <Box>
                  <Typography variant="body2" fontWeight={600}>{option.name}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {option.empId}{option.departmentName ? ` | ${option.departmentName}` : ''}{option.roleName ? ` | ${option.roleName}` : ''}
                  </Typography>
                </Box>
              </li>
            )}
            noOptionsText="Start typing to search users"
          />

          <TextField
            label="Effective From *"
            type="date"
            value={effectiveFrom}
            onChange={(e) => { setEffectiveFrom(e.target.value); setErrors([]); }}
            InputLabelProps={{ shrink: true }}
            fullWidth
          />

          <TextField
            label="Effective Till (Optional)"
            type="date"
            value={effectiveTill}
            onChange={(e) => { setEffectiveTill(e.target.value); setErrors([]); }}
            InputLabelProps={{ shrink: true }}
            fullWidth
          />
        </Box>

        {errors.length > 0 && (
          <Box sx={{ color: 'error.main', typography: 'body2' }}>
            {errors.map((e, i) => <div key={i}>{e}</div>)}
          </Box>
        )}

        {/* REVIEW SECTION */}
        <Divider sx={{ my: 3 }} />

        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Typography variant="subtitle1">Review Summary</Typography>
        </Stack>

        {/* Basic Information */}
        <Box>
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>Basic Information</Typography>
            {onNavigateStep && (
              <Button size="small" variant="outlined" onClick={() => onNavigateStep(0)}>Edit</Button>
            )}
          </Stack>
          <Box display="grid" gridTemplateColumns="1fr 1fr" gap={1} sx={{ mt: 1 }}>
            <Typography variant="body2" color="text.secondary">Employee ID</Typography>
            <Typography variant="body2">{basicData?.employeeId ?? '-'}</Typography>
            <Typography variant="body2" color="text.secondary">Employee Name</Typography>
            <Typography variant="body2">{basicData?.employeeName ?? '-'}</Typography>
            <Typography variant="body2" color="text.secondary">Email</Typography>
            <Typography variant="body2">{basicData?.email ?? '-'}</Typography>
            <Typography variant="body2" color="text.secondary">Mobile Number</Typography>
            <Typography variant="body2">{basicData?.mobile ?? '-'}</Typography>
            <Typography variant="body2" color="text.secondary">Status</Typography>
            <Typography variant="body2">{basicData?.isActive ? 'Active' : 'Inactive'}</Typography>
          </Box>
        </Box>

        <Divider sx={{ my: 1.5 }} />

        {/* Project Mapping */}
        <Box>
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>Project Mapping</Typography>
            {onNavigateStep && (
              <Button size="small" variant="outlined" onClick={() => onNavigateStep(1)}>Edit</Button>
            )}
          </Stack>
          <Box display="grid" gridTemplateColumns="1fr 1fr" gap={1} sx={{ mt: 1 }}>
            <Typography variant="body2" color="text.secondary">Zones</Typography>
            <Typography variant="body2">{step2Data?.zoneIds?.length ? `${step2Data.zoneIds.length} selected` : '-'}</Typography>
            <Typography variant="body2" color="text.secondary">Department</Typography>
            <Typography variant="body2">{selectedDepartment || `ID: ${step2Data?.departmentId ?? '-'}`}</Typography>
            <Typography variant="body2" color="text.secondary">Primary Role</Typography>
            <Typography variant="body2">{selectedPrimaryRole || `ID: ${step2Data?.primaryRoleId ?? '-'}`}</Typography>
            <Typography variant="body2" color="text.secondary">Secondary Role</Typography>
            <Typography variant="body2">{step2Data?.secondaryRoleId ? (selectedSecondaryRole || `ID: ${step2Data.secondaryRoleId}`) : 'Not assigned'}</Typography>
            <Typography variant="body2" color="text.secondary">Buddy RM</Typography>
            <Typography variant="body2">{step2Data?.buddyRmUserId ? 'Assigned' : 'Not assigned'}</Typography>
          </Box>
        </Box>

        <Divider sx={{ my: 1.5 }} />

        {/* Permission Summary */}
        <Box>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>Permission Summary</Typography>

          {moduleTreeData?.profiles.primary.permissions && moduleTreeData.profiles.primary.permissions.length > 0 ? (
            <Box sx={{ mb: 1.5 }}>
              <Typography variant="body2" sx={{ fontWeight: 500 }}>Primary Role</Typography>
              <Box sx={{ pl: 2, mt: 0.5 }}>
                {moduleTreeData.profiles.primary.permissions.map((mod) => {
                  const enabledSubModules = mod.subModules.filter((sm) => sm.enabled);
                  if (enabledSubModules.length === 0) return null;
                  return (
                    <Box key={mod.moduleId} sx={{ mb: 1 }}>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>Module ID: {mod.moduleId}</Typography>
                      {enabledSubModules.map((sm) => (
                        <Box key={sm.subModuleId} sx={{ pl: 2 }}>
                          <Typography variant="body2">SubModule ID: {sm.subModuleId} — {sm.accessType === 'all' ? 'All Projects' : `${sm.projectIds.length} project(s) selected`}</Typography>
                        </Box>
                      ))}
                    </Box>
                  );
                })}
              </Box>
            </Box>
          ) : (
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>Primary Role: No modules configured</Typography>
          )}

          {step2Data?.profiles.secondary && (
            <Box sx={{ mb: 1.5 }}>
              <Typography variant="body2" sx={{ fontWeight: 500 }}>Secondary Role</Typography>
              <Box sx={{ pl: 2, mt: 0.5 }}>
                {step2Data.profiles.secondary.permissions.filter((m) => m.subModules.some((sm) => sm.enabled)).length > 0
                  ? step2Data.profiles.secondary.permissions.map((mod) => {
                      const enabledSubModules = mod.subModules.filter((sm) => sm.enabled);
                      if (enabledSubModules.length === 0) return null;
                      return (
                        <Box key={mod.moduleId} sx={{ mb: 1 }}>
                          <Typography variant="body2">Module ID: {mod.moduleId}</Typography>
                          {enabledSubModules.map((sm) => (
                            <Box key={sm.subModuleId} sx={{ pl: 2 }}>
                              <Typography variant="body2">SubModule ID: {sm.subModuleId} — {sm.accessType === 'all' ? 'All Projects' : `${sm.projectIds.length} project(s)`}</Typography>
                            </Box>
                          ))}
                        </Box>
                      );
                    })
                  : <Typography variant="body2" color="text.secondary">No modules configured</Typography>}
              </Box>
            </Box>
          )}

          {step2Data?.profiles.buddyRm && (
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 500 }}>Buddy RM</Typography>
              <Box sx={{ pl: 2, mt: 0.5 }}>
                {step2Data.profiles.buddyRm.permissions.filter((m) => m.subModules.some((sm) => sm.enabled)).length > 0
                  ? step2Data.profiles.buddyRm.permissions.map((mod) => {
                      const enabledSubModules = mod.subModules.filter((sm) => sm.enabled);
                      if (enabledSubModules.length === 0) return null;
                      return (
                        <Box key={mod.moduleId} sx={{ mb: 1 }}>
                          <Typography variant="body2">Module ID: {mod.moduleId}</Typography>
                          {enabledSubModules.map((sm) => (
                            <Box key={sm.subModuleId} sx={{ pl: 2 }}>
                              <Typography variant="body2">SubModule ID: {sm.subModuleId} — {sm.accessType === 'all' ? 'All Projects' : `${sm.projectIds.length} project(s)`}</Typography>
                            </Box>
                          ))}
                        </Box>
                      );
                    })
                  : <Typography variant="body2" color="text.secondary">No modules configured</Typography>}
              </Box>
            </Box>
          )}
        </Box>

        <Divider sx={{ my: 1.5 }} />

        {/* Organisation Summary */}
        <Box>
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>Organisation</Typography>
          </Stack>
          <Box display="grid" gridTemplateColumns="1fr 1fr" gap={1} sx={{ mt: 1 }}>
            <Typography variant="body2" color="text.secondary">Employment Status</Typography>
            <Typography variant="body2">{employmentStatus}</Typography>
            <Typography variant="body2" color="text.secondary">Reporting Manager</Typography>
            <Typography variant="body2">{reportingMgrName || reportingManagerId || '-'}</Typography>
            <Typography variant="body2" color="text.secondary">Team Lead</Typography>
            <Typography variant="body2">{teamLeadName || teamLeadId || 'Not assigned'}</Typography>
            <Typography variant="body2" color="text.secondary">Department Admin</Typography>
            <Typography variant="body2">{deptAdminName || departmentAdminId || '-'}</Typography>
            <Typography variant="body2" color="text.secondary">User Group</Typography>
            <Typography variant="body2">{userGroupId ? (groups.find((g: UserGroup) => g.id === userGroupId)?.name ?? `ID: ${userGroupId}`) : 'None'}</Typography>
            <Typography variant="body2" color="text.secondary">Effective From</Typography>
            <Typography variant="body2">{effectiveFrom || '-'}</Typography>
            <Typography variant="body2" color="text.secondary">Effective Till</Typography>
            <Typography variant="body2">{effectiveTill || 'Not set'}</Typography>
          </Box>
        </Box>
      </Stack>
    );
  },
);

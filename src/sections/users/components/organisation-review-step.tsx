import type { UserGroup } from 'src/services/types/user-group';

import dayjs from 'dayjs';
import { useMemo, useState, useEffect, forwardRef, useCallback, useImperativeHandle } from 'react';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import InputLabel from '@mui/material/InputLabel';
import Typography from '@mui/material/Typography';
import FormControl from '@mui/material/FormControl';
import Autocomplete from '@mui/material/Autocomplete';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

import { useReportingManagers } from 'src/services/hooks/use-users';
import { useUserGroupList } from 'src/services/hooks/use-user-groups';

export interface OrganisationData {
  employmentStatus: 'Active' | 'Inactive';
  reportingManagerId: string;
  teamLeadId?: string;
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
  zoneId?: number | null;
  departmentId?: number | null;
}

export default forwardRef<OrganisationReviewStepHandle, Props>(
  ({ zoneId, departmentId }: Props, ref) => {
    const { data: userGroups } = useUserGroupList();

    const [employmentStatus, setEmploymentStatus] = useState<'Active' | 'Inactive'>('Active');
    const [reportingManagerId, setReportingManagerId] = useState('');
    const [reportingManagerSearch, setReportingManagerSearch] = useState('');
    const [teamLeadId, setTeamLeadId] = useState('');
    const [teamLeadSearch, setTeamLeadSearch] = useState('');
    const [userGroupId, setUserGroupId] = useState<number | ''>('');
    const [effectiveFrom, setEffectiveFrom] = useState<dayjs.Dayjs | null>(dayjs());
    const [effectiveTill, setEffectiveTill] = useState<dayjs.Dayjs | null>(null);
    const [errors, setErrors] = useState<string[]>([]);

    const { data: potentialManagers } = useReportingManagers(
      zoneId ?? null,
      departmentId ?? null,
      reportingManagerSearch || undefined,
    );

    const userSearchResults = useMemo(() => potentialManagers ?? [], [potentialManagers]);

    const teamLeadResults = useMemo(() => {
      if (!potentialManagers) return [];
      if (!teamLeadSearch) return potentialManagers;
      const lower = teamLeadSearch.toLowerCase();
      return potentialManagers.filter((u: any) => (u.name?.toLowerCase().includes(lower) || u.empId?.toLowerCase().includes(lower)));
    }, [potentialManagers, teamLeadSearch]);

    const allUserList = useMemo(() => (potentialManagers as UserSearchResult[]) ?? [], [potentialManagers]);
    const searchUsers = useMemo(() => userSearchResults ?? [], [userSearchResults]);
    const searchTeamLeads = useMemo(() => teamLeadResults ?? [], [teamLeadResults]);
    const groups = useMemo(() => userGroups ?? [], [userGroups]);

    useEffect(() => {
      setErrors([]);
    }, []);

    const validate = useCallback((): boolean => {
      const errs: string[] = [];
      if (!effectiveFrom) errs.push('Effective From is required.');
      if (effectiveTill && effectiveFrom && effectiveTill.isBefore(effectiveFrom)) {
        errs.push('Effective Till must be after Effective From.');
      }
      setErrors(errs);
      return errs.length === 0;
    }, [effectiveFrom, effectiveTill]);

    const getData = useCallback((): OrganisationData => ({
      employmentStatus,
      reportingManagerId,
      teamLeadId: teamLeadId || undefined,
      userGroupId: userGroupId || undefined,
      effectiveFrom: effectiveFrom ? effectiveFrom.format('YYYY-MM-DD') : '',
      effectiveTill: effectiveTill ? effectiveTill.format('YYYY-MM-DD') : undefined,
    }), [employmentStatus, reportingManagerId, teamLeadId, userGroupId, effectiveFrom, effectiveTill]);

    useImperativeHandle(ref, () => ({ getData, validate }), [getData, validate]);

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
            value={reportingManagerId ? allUserList.find((u) => u.empId === reportingManagerId) ?? null : null}
            onChange={(_, value: UserSearchResult | null) => {
              setReportingManagerId(value?.empId ?? '');
              setErrors([]);
            }}
            onInputChange={(_, val) => setReportingManagerSearch(val)}
            renderInput={(params) => (
              <TextField {...params} label="Reporting Manager (Optional)" size="medium" />
            )}
            renderOption={(props, option: any) => (
              <li {...props}>
                <Box>
                  <Typography variant="body2" fontWeight={600}>{option.name}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {option.roleName ? `${option.roleName}` : ''}{option.departmentName ? ` | ${option.departmentName}` : ''}
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
            value={teamLeadId ? allUserList.find((u) => u.empId === teamLeadId) ?? null : null}
            onChange={(_, value: UserSearchResult | null) => {
              setTeamLeadId(value?.empId ?? '');
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

          <DatePicker
            label="Effective From *"
            value={effectiveFrom}
            onChange={(newValue) => { setEffectiveFrom(newValue); setErrors([]); }}
            slotProps={{ textField: { fullWidth: true, required: true } }}
          />

          <DatePicker
            label="Effective Till (Optional)"
            value={effectiveTill}
            onChange={(newValue) => { setEffectiveTill(newValue); setErrors([]); }}
            slotProps={{ textField: { fullWidth: true } }}
          />
        </Box>

        {errors.length > 0 && (
          <Box sx={{ color: 'error.main', typography: 'body2' }}>
            {errors.map((e, i) => <div key={i}>{e}</div>)}
          </Box>
        )}


      </Stack>
    );
  },
);

import { useState, useEffect, forwardRef, useCallback, useImperativeHandle } from 'react';

import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import InputLabel from '@mui/material/InputLabel';
import Typography from '@mui/material/Typography';
import FormControl from '@mui/material/FormControl';
import InputAdornment from '@mui/material/InputAdornment';
import CircularProgress from '@mui/material/CircularProgress';

import { useFetchEmployee } from 'src/services/hooks/use-users';

export interface BasicInfoData {
  employeeId: string;
  employeeName: string;
  email: string;
  mobile: string;
  isActive: boolean;
}

export interface BasicInformationStepHandle {
  getData: () => BasicInfoData;
  validate: () => boolean;
}

interface Props {
  initialData?: BasicInfoData;
}

export default forwardRef<BasicInformationStepHandle, Props>(({ initialData }: Props, ref) => {

  const [employeeId, setEmployeeId] = useState(initialData?.employeeId ?? '');
  const [employeeName, setEmployeeName] = useState(initialData?.employeeName ?? '');
  const [email, setEmail] = useState(initialData?.email ?? '');
  const [mobile, setMobile] = useState(initialData?.mobile ?? '');
  const [isActive, setIsActive] = useState(initialData?.isActive ?? true);

  const [employeeIdError, setEmployeeIdError] = useState('');
  const [employeeNameError, setEmployeeNameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [mobileError, setMobileError] = useState('');

  const [sapStatus, setSapStatus] = useState<'idle' | 'found' | 'not-found'>('idle');

  const { mutateAsync: fetchEmployee, isPending: isFetching } = useFetchEmployee();

  useEffect(() => {
    if (initialData) {
      setEmployeeId(initialData.employeeId);
      setEmployeeName(initialData.employeeName);
      setEmail(initialData.email);
      setMobile(initialData.mobile);
      setIsActive(initialData.isActive);
      if (initialData.employeeId) setSapStatus('found');
    }
  }, [initialData]);

  const handleSapFetch = useCallback(async () => {
    const id = employeeId.trim();
    if (!id) {
      setEmployeeIdError('Employee ID is required');
      return;
    }
    setEmployeeIdError('');

    try {
      const result = await fetchEmployee(id) as { employeeName?: string; email?: string; mobile?: string } | undefined;
      if (result) {
        setEmployeeName(result.employeeName ?? '');
        setEmail(result.email ?? '');
        setMobile(result.mobile ?? '');
        setSapStatus('found');
      } else {
        setSapStatus('not-found');
      }
    } catch {
      setSapStatus('not-found');
    }
  }, [employeeId, fetchEmployee]);

  const validate = useCallback((): boolean => {
    let valid = true;

    if (!employeeId.trim()) {
      setEmployeeIdError('Employee ID is required');
      valid = false;
    } else {
      setEmployeeIdError('');
    }

    if (!employeeName.trim()) {
      setEmployeeNameError('Employee name is required');
      valid = false;
    } else {
      setEmployeeNameError('');
    }

    if (!email.trim()) {
      setEmailError('Email is required');
      valid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setEmailError('Invalid email format');
      valid = false;
    } else {
      setEmailError('');
    }

    if (!mobile.trim()) {
      setMobileError('Mobile number is required');
      valid = false;
    } else if (!/^\+?\d{7,15}$/.test(mobile.trim().replace(/[\s-]/g, ''))) {
      setMobileError('Valid mobile number required');
      valid = false;
    } else {
      setMobileError('');
    }

    return valid;
  }, [employeeId, employeeName, email, mobile]);

  const getData = useCallback((): BasicInfoData => ({
    employeeId: employeeId.trim(),
    employeeName: employeeName.trim(),
    email: email.trim(),
    mobile: mobile.trim(),
    isActive,
  }), [employeeId, employeeName, email, mobile, isActive]);

  useImperativeHandle(ref, () => ({ getData, validate }), [getData, validate]);

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="subtitle1" sx={{ mb: 2 }}>Employee Information</Typography>

      <TextField
        label="Employee ID"
        value={employeeId}
        onChange={(e) => { setEmployeeId(e.target.value); setEmployeeIdError(''); setSapStatus('idle'); }}
        error={!!employeeIdError}
        helperText={employeeIdError}
        placeholder="Enter Employee ID"
        required
        fullWidth
        disabled={isFetching}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <Button
                size="small"
                variant="contained"
                onClick={handleSapFetch}
                disabled={isFetching || !employeeId.trim()}
                sx={{ minWidth: 110, height: 30, fontSize: 12 }}
              >
                {isFetching ? <CircularProgress size={16} sx={{ color: 'inherit' }} /> : 'Fetch from SAP'}
              </Button>
            </InputAdornment>
          ),
        }}
        sx={{ maxWidth: 500 }}
      />

      {sapStatus === 'found' && (
        <Alert severity="success" sx={{ mt: 2, maxWidth: 680 }}>
          Employee details fetched successfully.
        </Alert>
      )}

      {sapStatus === 'not-found' && (
        <Alert severity="info" sx={{ mt: 2, maxWidth: 680 }}>
          No employee found in SAP. Please enter employee details manually.
        </Alert>
      )}

      <Box display="grid" gridTemplateColumns={{ xs: '1fr', sm: '1fr 1fr' }} gap={2.5} sx={{ mt: 3, maxWidth: 680 }}>
        <TextField
          label="Employee Name"
          value={employeeName}
          onChange={(e) => { setEmployeeName(e.target.value); setEmployeeNameError(''); }}
          error={!!employeeNameError}
          helperText={employeeNameError}
          required
          fullWidth
          placeholder="Enter Employee Name"
        />
        <TextField
          label="Email"
          value={email}
          onChange={(e) => { setEmail(e.target.value); setEmailError(''); }}
          error={!!emailError}
          helperText={emailError}
          required
          fullWidth
          placeholder="Enter Email Address"
          type="email"
        />
        <TextField
          label="Mobile Number"
          value={mobile}
          onChange={(e) => { setMobile(e.target.value); setMobileError(''); }}
          error={!!mobileError}
          helperText={mobileError}
          required
          fullWidth
          placeholder="+91 XXXXX XXXXX"
        />
        <FormControl>
          <InputLabel>Employee Status</InputLabel>
          <Select
            value={isActive ? 'active' : 'inactive'}
            label="Employee Status"
            onChange={(e) => setIsActive(e.target.value === 'active')}
          >
            <MenuItem value="active">Active</MenuItem>
            <MenuItem value="inactive">Inactive</MenuItem>
          </Select>
        </FormControl>
      </Box>
    </Box>
  );
});

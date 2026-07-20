import { useEffect, useState } from 'react'
import {
  Drawer,
  Box,
  Typography,
  IconButton,
  Divider,
  Button,
  Stepper,
  Step,
  StepLabel,
  CircularProgress,
  Snackbar,
  Alert,
} from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import UserBasicStep from '@/features/users/components/UserBasicStep'
import UserOrganizationStep from '@/features/users/components/UserOrganizationStep'
import UserHierarchyStep from '@/features/users/components/UserHierarchyStep'
import SuccessCredentialsModal from '@/features/users/components/SuccessCredentialsModal'
import { useCreateUser, useUpdateUser, useUser } from '@/features/users/services/user.service'
import type { CreateUserPayload } from '@/features/users/types/user.types'

const STEPS = ['Basic Details', 'Organization Mapping', 'Reporting Hierarchy']

interface Props {
  open: boolean
  onClose: () => void
  editId?: string
}

export default function UserWizardPage({ open, onClose, editId }: Props) {
  const { data: existing } = useUser(editId)
  const createMut = useCreateUser()
  const updateMut = useUpdateUser()

  const [activeStep, setActiveStep] = useState(0)
  const [saving, setSaving] = useState(false)

  // Form state
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [employmentStatus, setEmploymentStatus] = useState('')
  const [zoneIds, setZoneIds] = useState<string[]>([])
  const [departmentId, setDepartmentId] = useState('')
  const [primaryRoleId, setPrimaryRoleId] = useState('')
  const [secondaryRoleIds, setSecondaryRoleIds] = useState<string[]>([])
  const [reportingManagerId, setReportingManagerId] = useState('')
  const [reportingHeadId, setReportingHeadId] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [toast, setToast] = useState<{ severity: 'success' | 'error'; message: string } | null>(null)

  // Credential modal state
  const [credentialOpen, setCredentialOpen] = useState(false)
  const [createdName, setCreatedName] = useState('')
  const [createdEmpId, setCreatedEmpId] = useState('')
  const [createdEmail, setCreatedEmail] = useState('')
  const [temporaryPassword, setTemporaryPassword] = useState('')

  // Prefill on edit
  useEffect(() => {
    if (existing) {
      setName(existing.name || '')
      setEmail(existing.email || '')
      setPhone(existing.phone || '')
      setEmploymentStatus(existing.employmentStatus || '')
      setZoneIds(existing.zoneIds ?? [])
      setDepartmentId(existing.departmentId || '')
      setPrimaryRoleId(existing.primaryRoleId || '')
      setSecondaryRoleIds(existing.secondaryRoleIds ?? [])
      setReportingManagerId(existing.reportingManagerId || '')
      setReportingHeadId(existing.reportingHeadId || '')
    }
  }, [existing])

  // Reset on open
  useEffect(() => {
    if (open && !editId) {
      setName('')
      setEmail('')
      setPhone('')
      setEmploymentStatus('')
      setZoneIds([])
      setDepartmentId('')
      setPrimaryRoleId('')
      setSecondaryRoleIds([])
      setReportingManagerId('')
      setReportingHeadId('')
      setActiveStep(0)
      setErrors({})
    }
  }, [open, editId])

  const handleChange = (field: string, value: string | string[]) => {
    setErrors((prev) => ({ ...prev, [field]: '' }))
    switch (field) {
      case 'name': setName(value as string); break
      case 'email': setEmail(value as string); break
      case 'phone': setPhone(value as string); break
      case 'employmentStatus': setEmploymentStatus(value as string); break
      case 'zoneIds': setZoneIds(value as string[]); break
      case 'departmentId': setDepartmentId(value as string); break
      case 'primaryRoleId': setPrimaryRoleId(value as string); break
      case 'secondaryRoleIds': setSecondaryRoleIds(value as string[]); break
      case 'reportingManagerId': setReportingManagerId(value as string); break
      case 'reportingHeadId': setReportingHeadId(value as string); break
    }
  }

  const validateStep = (step: number): boolean => {
    const errs: Record<string, string> = {}
    if (step === 0) {
      if (!name.trim()) errs.name = 'Employee name is required'
      if (!email.trim()) errs.email = 'Email is required'
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errs.email = 'Invalid email format'
      if (phone && !/^[0-9+\-\s()]{7,15}$/.test(phone)) errs.phone = 'Invalid phone number'
      if (!employmentStatus) errs.employmentStatus = 'Employment status is required'
    }
    if (step === 1) {
      if (zoneIds.length === 0) errs.zoneIds = 'At least one zone is required'
      if (!departmentId) errs.departmentId = 'Department is required'
      if (!primaryRoleId) errs.primaryRoleId = 'Primary role is required'
    }
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleNext = () => {
    if (validateStep(activeStep)) {
      setActiveStep((p) => Math.min(p + 1, 2))
    }
  }

  const handleBack = () => setActiveStep((p) => Math.max(p - 1, 0))

  const buildPayload = (): CreateUserPayload => ({
    name: name.trim(),
    email: email.trim(),
    phone: phone.trim() || undefined,
    employmentStatus,
    zoneIds,
    departmentId,
    primaryRoleId,
    secondaryRoleIds: secondaryRoleIds.length > 0 ? secondaryRoleIds : undefined,
    reportingManagerId: reportingManagerId || undefined,
    reportingHeadId: reportingHeadId || undefined,
  })

  const handleSave = async () => {
    setSaving(true)
    try {
      if (editId) {
        await updateMut.mutateAsync({ id: editId, payload: buildPayload() })
        setToast({ severity: 'success', message: 'User updated' })
        onClose()
      } else {
        const response: any = await createMut.mutateAsync(buildPayload())
        const userData = response?.user ?? response ?? {}
        setCreatedName(userData.name || name)
        setCreatedEmpId(userData.employeeId || userData.empId || '')
        setCreatedEmail(userData.email || email)
        setTemporaryPassword(response?.temporaryPassword || '')
        setCredentialOpen(true)
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to save user'
      setToast({ severity: 'error', message: Array.isArray(msg) ? msg[0] : msg })
    } finally {
      setSaving(false)
    }
  }

  const isLastStep = activeStep === 2

  return (
    <>
      <Drawer anchor="right" open={open} onClose={onClose}>
        <Box sx={{ width: 550, display: 'flex', flexDirection: 'column', height: '100%' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', px: 2, py: 1.5 }}>
            <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 600 }}>
              {editId ? 'Edit User' : 'Create User'}
            </Typography>
            <IconButton onClick={onClose} size="small"><CloseIcon /></IconButton>
          </Box>
          <Divider />

          <Box sx={{ px: 2, py: 2 }}>
            <Stepper activeStep={activeStep} alternativeLabel>
              {STEPS.map((s) => <Step key={s}><StepLabel>{s}</StepLabel></Step>)}
            </Stepper>
          </Box>
          <Divider />

          <Box sx={{ flex: 1, overflow: 'auto', px: 2, py: 2 }}>
            {activeStep === 0 && (
              <UserBasicStep
                name={name} email={email} phone={phone}
                employmentStatus={employmentStatus}
                errors={errors} onChange={handleChange}
              />
            )}
            {activeStep === 1 && (
              <UserOrganizationStep
                zoneIds={zoneIds} departmentId={departmentId}
                primaryRoleId={primaryRoleId} secondaryRoleIds={secondaryRoleIds}
                errors={errors} onChange={handleChange}
              />
            )}
            {activeStep === 2 && (
              <UserHierarchyStep
                departmentId={departmentId} primaryRoleId={primaryRoleId}
                reportingManagerId={reportingManagerId} reportingHeadId={reportingHeadId}
                errors={errors} onChange={handleChange}
              />
            )}
          </Box>

          <Divider />
          <Box sx={{ display: 'flex', justifyContent: 'space-between', px: 2, py: 1.5 }}>
            <Button disabled={activeStep === 0} onClick={handleBack}>Back</Button>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button onClick={onClose} disabled={saving}>Cancel</Button>
              {isLastStep ? (
                <Button variant="contained" onClick={handleSave} disabled={saving}>
                  {saving ? <CircularProgress size={20} color="inherit" /> : editId ? 'Update' : 'Create'}
                </Button>
              ) : (
                <Button variant="contained" onClick={handleNext}>Next</Button>
              )}
            </Box>
          </Box>
        </Box>
      </Drawer>

      {toast && (
        <Snackbar open autoHideDuration={3000} onClose={() => setToast(null)} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
          <Alert severity={toast.severity} variant="filled">{toast.message}</Alert>
        </Snackbar>
      )}

      <SuccessCredentialsModal
        open={credentialOpen}
        name={createdName}
        employeeId={createdEmpId}
        email={createdEmail}
        temporaryPassword={temporaryPassword}
        onClose={() => { setCredentialOpen(false); onClose() }}
      />
    </>
  )
}

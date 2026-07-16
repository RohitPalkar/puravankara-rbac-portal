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
import ProjectBasicStep from '@/features/projects/components/ProjectBasicStep'
import ProjectConfigurationStep from '@/features/projects/components/ProjectConfigurationStep'
import ProjectMediaStep from '@/features/projects/components/ProjectMediaStep'
import { useCreateProject, useUpdateProject, useProject } from '@/features/projects/services/project.service'
import type { CreateProjectPayload, ProjectMetadata } from '@/features/projects/types/project.types'

const STEPS = ['Basic Information', 'Configuration', 'Media & Location']

interface Props {
  open: boolean
  onClose: () => void
  editId?: string
}

export default function ProjectFormWizard({ open, onClose, editId }: Props) {
  const { data: existing } = useProject(editId)
  const createMut = useCreateProject()
  const updateMut = useUpdateProject()

  const [activeStep, setActiveStep] = useState(0)
  const [saving, setSaving] = useState(false)

  // Form state
  const [name, setName] = useState('')
  const [cityId, setCityId] = useState('')
  const [billingEntityName, setBillingEntityName] = useState('')
  const [billingGstin, setBillingGstin] = useState('')
  const [phase, setPhase] = useState('')
  const [brand, setBrand] = useState('')
  const [company, setCompany] = useState('')
  const [paymentGatewayEasebuzz, setPaymentGatewayEasebuzz] = useState(false)
  const [isReraIncentiveEligible, setIsReraIncentiveEligible] = useState(false)
  const [projectImagePath, setProjectImagePath] = useState('')
  const [jvImagePath, setJvImagePath] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [toast, setToast] = useState<{ severity: 'success' | 'error'; message: string } | null>(null)

  // Prefill on edit
  useEffect(() => {
    if (existing) {
      setName(existing.name || '')
      setCityId(existing.cityId || '')
      setBillingEntityName(existing.billingEntityName || '')
      setBillingGstin(existing.billingGstin || '')
      setPhase(existing.extendedMetadata?.phase || existing.phase || '')
      setBrand(existing.extendedMetadata?.brand || existing.brand || '')
      setCompany(existing.extendedMetadata?.company || existing.company || '')
      setPaymentGatewayEasebuzz(
        existing.extendedMetadata?.payment_gateway_easebuzz ?? existing.paymentGatewayEasebuzz ?? false,
      )
      setIsReraIncentiveEligible(
        existing.extendedMetadata?.is_rera_incentive_eligible ?? existing.isReraIncentiveEligible ?? false,
      )
      setProjectImagePath(existing.projectImagePath || '')
      setJvImagePath(existing.jvImagePath || '')
    }
  }, [existing])

  // Reset on open
  useEffect(() => {
    if (open && !editId) {
      setName('')
      setCityId('')
      setBillingEntityName('')
      setBillingGstin('')
      setPhase('')
      setBrand('')
      setCompany('')
      setPaymentGatewayEasebuzz(false)
      setIsReraIncentiveEligible(false)
      setProjectImagePath('')
      setJvImagePath('')
      setActiveStep(0)
      setErrors({})
    }
  }, [open, editId])

  const handleChange = (field: string, value: string | boolean) => {
    setErrors((prev) => ({ ...prev, [field]: '' }))
    switch (field) {
      case 'name': setName(value as string); break
      case 'cityId': setCityId(value as string); break
      case 'billingEntityName': setBillingEntityName(value as string); break
      case 'billingGstin': setBillingGstin(value as string); break
      case 'phase': setPhase(value as string); break
      case 'brand': setBrand(value as string); break
      case 'company': setCompany(value as string); break
      case 'paymentGatewayEasebuzz': setPaymentGatewayEasebuzz(value as boolean); break
      case 'isReraIncentiveEligible': setIsReraIncentiveEligible(value as boolean); break
      case 'projectImagePath': setProjectImagePath(value as string); break
      case 'jvImagePath': setJvImagePath(value as string); break
    }
  }

  const validateStep = (step: number): boolean => {
    const errs: Record<string, string> = {}
    if (step === 0) {
      if (!name.trim()) errs.name = 'Project name is required'
      if (!cityId) errs.cityId = 'City is required'
      if (!billingEntityName.trim()) errs.billingEntityName = 'Billing entity is required'
      if (!billingGstin.trim()) errs.billingGstin = 'GSTIN is required'
      else if (!/^[0-9A-Z]{15}$/.test(billingGstin.trim().toUpperCase())) {
        errs.billingGstin = 'GSTIN must be 15 alphanumeric characters'
      }
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

  const buildPayload = (): CreateProjectPayload => {
    const meta: ProjectMetadata = {
      phase: phase || undefined,
      brand: brand || undefined,
      company: company || undefined,
      payment_gateway_easebuzz: paymentGatewayEasebuzz,
      is_rera_incentive_eligible: isReraIncentiveEligible,
    }
    return {
      name: name.trim(),
      cityId,
      billingEntityName: billingEntityName.trim(),
      billingGstin: billingGstin.trim().toUpperCase(),
      extendedMetadata: meta,
      projectImagePath: projectImagePath || undefined,
      jvImagePath: jvImagePath || undefined,
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      if (editId) {
        await updateMut.mutateAsync({ id: editId, payload: buildPayload() })
        setToast({ severity: 'success', message: 'Project updated' })
      } else {
        await createMut.mutateAsync(buildPayload())
        setToast({ severity: 'success', message: 'Project created' })
      }
      onClose()
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to save project'
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
              {editId ? 'Edit Project' : 'Create Project'}
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
              <ProjectBasicStep
                name={name} cityId={cityId}
                billingEntityName={billingEntityName} billingGstin={billingGstin}
                errors={errors} onChange={handleChange}
              />
            )}
            {activeStep === 1 && (
              <ProjectConfigurationStep
                phase={phase} brand={brand} company={company}
                paymentGatewayEasebuzz={paymentGatewayEasebuzz}
                isReraIncentiveEligible={isReraIncentiveEligible}
                onChange={handleChange}
              />
            )}
            {activeStep === 2 && (
              <ProjectMediaStep
                projectImagePath={projectImagePath} jvImagePath={jvImagePath}
                onChange={handleChange}
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
    </>
  )
}

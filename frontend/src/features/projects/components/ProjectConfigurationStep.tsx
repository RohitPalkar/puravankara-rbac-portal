import { TextField, FormControlLabel, Switch, Typography, Box } from '@mui/material'

interface Props {
  phase: string
  brand: string
  company: string
  paymentGatewayEasebuzz: boolean
  isReraIncentiveEligible: boolean
  onChange: (field: string, value: string | boolean) => void
}

export default function ProjectConfigurationStep({
  phase, brand, company, paymentGatewayEasebuzz, isReraIncentiveEligible, onChange,
}: Props) {
  return (
    <>
      <Typography variant="subtitle2" sx={{ mb: 1 }}>Project Configuration</Typography>

      <TextField
        fullWidth
        label="Phase"
        value={phase}
        onChange={(e) => onChange('phase', e.target.value)}
        margin="normal"
        placeholder="e.g. Tower 1, Block A"
      />

      <TextField
        fullWidth
        label="Brand"
        value={brand}
        onChange={(e) => onChange('brand', e.target.value)}
        margin="normal"
        placeholder="e.g. Purva Land"
      />

      <TextField
        fullWidth
        label="Company"
        value={company}
        onChange={(e) => onChange('company', e.target.value)}
        margin="normal"
        placeholder="e.g. Puravankara Limited"
      />

      <Box sx={{ mt: 2 }}>
        <Typography variant="subtitle2" sx={{ mb: 1 }}>Feature Toggles</Typography>

        <FormControlLabel
          control={
            <Switch
              checked={paymentGatewayEasebuzz}
              onChange={(e) => onChange('paymentGatewayEasebuzz', e.target.checked)}
            />
          }
          label="Payment Gateway — Easebuzz"
        />

        <FormControlLabel
          control={
            <Switch
              checked={isReraIncentiveEligible}
              onChange={(e) => onChange('isReraIncentiveEligible', e.target.checked)}
            />
          }
          label="RERA Incentive Eligible"
        />
      </Box>
    </>
  )
}

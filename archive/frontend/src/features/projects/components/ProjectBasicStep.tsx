import { useEffect, useState } from 'react'
import { TextField, FormControl, InputLabel, Select, MenuItem } from '@mui/material'
import { cities } from '@/services/api/endpoints'

interface City {
  id: string
  name: string
}

interface Props {
  name: string
  cityId: string
  billingEntityName: string
  billingGstin: string
  errors: Record<string, string>
  onChange: (field: string, value: string) => void
}

export default function ProjectBasicStep({ name, cityId, billingEntityName, billingGstin, errors, onChange }: Props) {
  const [cityList, setCityList] = useState<City[]>([])

  useEffect(() => {
    cities.list().then((data) => {
      setCityList(Array.isArray(data) ? data : data.items ?? data.data ?? [])
    }).catch(() => {})
  }, [])

  return (
    <>
      <TextField
        fullWidth
        label="Project Name"
        value={name}
        onChange={(e) => onChange('name', e.target.value)}
        margin="normal"
        required
        error={!!errors.name}
        helperText={errors.name}
      />

      <FormControl fullWidth margin="normal" required error={!!errors.cityId}>
        <InputLabel>City</InputLabel>
        <Select value={cityId} onChange={(e) => onChange('cityId', e.target.value)} label="City">
          {cityList.map((c) => (
            <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>
          ))}
        </Select>
      </FormControl>

      <TextField
        fullWidth
        label="Billing Entity Name"
        value={billingEntityName}
        onChange={(e) => onChange('billingEntityName', e.target.value)}
        margin="normal"
        required
        error={!!errors.billingEntityName}
        helperText={errors.billingEntityName}
      />

      <TextField
        fullWidth
        label="Billing GSTIN"
        value={billingGstin}
        onChange={(e) => onChange('billingGstin', e.target.value)}
        margin="normal"
        required
        error={!!errors.billingGstin}
        helperText={errors.billingGstin || 'Format: 15 characters (e.g. 27AAAAA0000A1Z5)'}
      />
    </>
  )
}

import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  Box,
  Button,
  Typography,
  Card,
  Chip,
  IconButton,
  Tooltip,
  Snackbar,
  Alert,
  Switch,
  FormControlLabel,
  TextField,
  Checkbox,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Paper,
} from '@mui/material'
import { Add, Edit } from '@mui/icons-material'
import DrawerForm from '@/components/dialogs/DrawerForm'
import ConfirmDialog from '@/components/dialogs/ConfirmDialog'
import DataTable, { type Column } from '@/components/data-table/DataTable'
import StatusChip from '@/components/common/StatusChip'
import { zones, cities, cityZoneMappings } from '@/services/api/endpoints'

interface Zone {
  id: string
  name: string
  isActive: boolean
  createdAt?: string
}

interface City {
  id: string
  name: string
}

interface Mapping {
  id: string
  cityId: string
  zoneId: string
}

export default function ZoneListPage() {
  const [rows, setRows] = useState<Zone[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  // Form state
  const [formOpen, setFormOpen] = useState(false)
  const [editingZone, setEditingZone] = useState<Zone | null>(null)
  const [zoneName, setZoneName] = useState('')
  const [zoneActive, setZoneActive] = useState(true)
  const [saving, setSaving] = useState(false)

  // City mapping state
  const [allCities, setAllCities] = useState<City[]>([])
  const [mappedIds, setMappedIds] = useState<string[]>([])
  const [selectedAvailable, setSelectedAvailable] = useState<string[]>([])
  const [selectedMapped, setSelectedMapped] = useState<string[]>([])
  const [citySearch, setCitySearch] = useState('')

  // Confirm dialog
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [confirmAction, setConfirmAction] = useState<() => void>(() => {})
  const [confirmTitle, setConfirmTitle] = useState('')
  const [confirmMsg, setConfirmMsg] = useState('')

  // Toast
  const [toast, setToast] = useState<{ severity: 'success' | 'error'; message: string } | null>(null)

  const fetch = useCallback(async () => {
    setLoading(true)
    try {
      const data = await zones.list({ page: page + 1, limit: rowsPerPage, search: search || undefined })
      const items = Array.isArray(data) ? data : data.items ?? data.data ?? []
      const totalCount = data.total ?? data.totalCount ?? items.length
      setRows(items)
      setTotal(totalCount)
    } catch {
      setRows([])
      setTotal(0)
    } finally {
      setLoading(false)
    }
  }, [page, rowsPerPage, search])

  useEffect(() => { fetch() }, [fetch])

  const openCreate = () => {
    setEditingZone(null)
    setZoneName('')
    setZoneActive(true)
    setMappedIds([])
    setSelectedAvailable([])
    setSelectedMapped([])
    setCitySearch('')
    loadCitiesAndMappings()
    setFormOpen(true)
  }

  const openEdit = async (zone: Zone) => {
    setEditingZone(zone)
    setZoneName(zone.name)
    setZoneActive(zone.isActive)
    setSelectedAvailable([])
    setSelectedMapped([])
    setCitySearch('')
    await loadCitiesAndMappings(zone.id)
    setFormOpen(true)
  }

  const loadCitiesAndMappings = async (zoneId?: string) => {
    try {
      const [cityData, mappingData] = await Promise.all([
        cities.list(),
        zoneId ? cityZoneMappings.list({ zoneId }) : Promise.resolve([]),
      ])
      const cityList: City[] = Array.isArray(cityData) ? cityData : cityData.items ?? cityData.data ?? []
      const mappingList: Mapping[] = Array.isArray(mappingData) ? mappingData : mappingData.items ?? mappingData.data ?? []
      setAllCities(cityList)
      setMappedIds(mappingList.map((m: Mapping) => m.cityId))
    } catch {
      setAllCities([])
      setMappedIds([])
    }
  }

  const handleSaveZone = async () => {
    if (!zoneName.trim()) return
    setSaving(true)
    try {
      if (editingZone) {
        await zones.update(editingZone.id, { name: zoneName, isActive: zoneActive })
        setToast({ severity: 'success', message: 'Zone updated' })
      } else {
        await zones.create({ name: zoneName, isActive: zoneActive })
        setToast({ severity: 'success', message: 'Zone created' })
      }
      setFormOpen(false)
      fetch()
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to save zone'
      setToast({ severity: 'error', message: Array.isArray(msg) ? msg[0] : msg })
    } finally {
      setSaving(false)
    }
  }

  const handleToggleStatus = (zone: Zone) => {
    setConfirmTitle(`${zone.isActive ? 'Deactivate' : 'Activate'} Zone`)
    setConfirmMsg(`Are you sure you want to ${zone.isActive ? 'deactivate' : 'activate'} "${zone.name}"?`)
    setConfirmAction(() => async () => {
      try {
        await zones.update(zone.id, { isActive: !zone.isActive })
        setToast({ severity: 'success', message: `Zone ${zone.isActive ? 'deactivated' : 'activated'}` })
        fetch()
      } catch {
        setToast({ severity: 'error', message: 'Failed to update status' })
      }
      setConfirmOpen(false)
    })
    setConfirmOpen(true)
  }

  const availableCities = useMemo(() => {
    const filtered = allCities.filter((c) => !mappedIds.includes(c.id))
    if (citySearch) return filtered.filter((c) => c.name.toLowerCase().includes(citySearch.toLowerCase()))
    return filtered
  }, [allCities, mappedIds, citySearch])

  const mappedCities = useMemo(() => {
    return allCities.filter((c) => mappedIds.includes(c.id))
  }, [allCities, mappedIds])

  const moveToMapped = async () => {
    if (!editingZone || selectedAvailable.length === 0) return
    try {
      for (const cityId of selectedAvailable) {
        await cityZoneMappings.create({ zoneId: editingZone.id, cityId })
      }
      setMappedIds((prev) => [...prev, ...selectedAvailable])
      setSelectedAvailable([])
      setToast({ severity: 'success', message: 'Cities mapped' })
    } catch {
      setToast({ severity: 'error', message: 'Failed to map cities' })
    }
  }

  const moveToAvailable = async () => {
    if (!editingZone || selectedMapped.length === 0) return
    try {
      for (const cityId of selectedMapped) {
        await cityZoneMappings.deleteByZoneAndCity(editingZone.id, cityId)
      }
      setMappedIds((prev) => prev.filter((id) => !selectedMapped.includes(id)))
      setSelectedMapped([])
      setToast({ severity: 'success', message: 'Cities unmapped' })
    } catch {
      setToast({ severity: 'error', message: 'Failed to unmap cities' })
    }
  }

  const toggleAvailable = (id: string) => {
    setSelectedAvailable((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    )
  }

  const toggleMapped = (id: string) => {
    setSelectedMapped((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    )
  }

  const columns: Column<Zone>[] = [
    { id: 'name', label: 'Zone Name', render: (r) => r.name, sortable: true },
    {
      id: 'cities',
      label: 'Total Cities Mapped',
      render: (r) => {
        const count = r.id === editingZone?.id ? mappedIds.length : '—'
        return <Chip label={count} size="small" />
      },
    },
    { id: 'status', label: 'Status', render: (r) => <StatusChip active={r.isActive} /> },
    {
      id: 'createdAt',
      label: 'Created Date',
      render: (r) => r.createdAt ? new Date(r.createdAt).toLocaleDateString() : '—',
    },
    {
      id: 'actions',
      label: 'Actions',
      render: (r) => (
        <Box sx={{ display: 'flex', gap: 0.5 }}>
          <Tooltip title="Edit Zone">
            <IconButton size="small" onClick={() => openEdit(r)}><Edit fontSize="small" /></IconButton>
          </Tooltip>
          <Tooltip title={r.isActive ? 'Deactivate' : 'Activate'}>
            <IconButton size="small" onClick={() => handleToggleStatus(r)}>
              <Switch checked={r.isActive} size="small" />
            </IconButton>
          </Tooltip>
        </Box>
      ),
    },
  ]

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h5" sx={{ fontWeight: 600 }}>Zone Master</Typography>
        <Button variant="contained" startIcon={<Add />} onClick={openCreate}>
          Create Zone
        </Button>
      </Box>

      <Card>
        <DataTable
          columns={columns}
          rows={rows}
          total={total}
          page={page}
          rowsPerPage={rowsPerPage}
          searchValue={search}
          loading={loading}
          onPageChange={setPage}
          onRowsPerPageChange={(r) => { setRowsPerPage(r); setPage(0) }}
          onSearchChange={(v) => { setSearch(v); setPage(0) }}
          keyExtractor={(r) => r.id}
          emptyMessage="No zones found"
        />
      </Card>

      <DrawerForm
        open={formOpen}
        title={editingZone ? 'Edit Zone' : 'Create Zone'}
        onClose={() => setFormOpen(false)}
        onSubmit={editingZone ? handleSaveZone : handleSaveZone}
        loading={saving}
        submitLabel={editingZone ? 'Update' : 'Create'}
        width={650}
      >
        <TextField
          fullWidth
          label="Zone Name"
          value={zoneName}
          onChange={(e) => setZoneName(e.target.value)}
          margin="normal"
          required
        />
        <FormControlLabel
          control={<Switch checked={zoneActive} onChange={(e) => setZoneActive(e.target.checked)} />}
          label="Active"
          sx={{ mt: 1 }}
        />

        {editingZone && (
          <>
            <Typography variant="subtitle2" sx={{ mt: 3, mb: 1 }}>City Mapping</Typography>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Paper variant="outlined" sx={{ flex: 1, p: 1 }}>
                <Typography variant="caption" sx={{ fontWeight: 600, px: 1 }}>Available Cities</Typography>
                <TextField
                  size="small"
                  placeholder="Search cities..."
                  value={citySearch}
                  onChange={(e) => setCitySearch(e.target.value)}
                  fullWidth
                  sx={{ my: 1 }}
                />
                {selectedAvailable.length > 0 && (
                  <Button size="small" onClick={moveToMapped} sx={{ mb: 1 }}>
                    Move Selected &gt;
                  </Button>
                )}
                <List dense sx={{ maxHeight: 250, overflow: 'auto' }}>
                  {availableCities.map((c) => (
                    <ListItem key={c.id} dense onClick={() => toggleAvailable(c.id)} sx={{ cursor: 'pointer' }}>
                      <ListItemIcon sx={{ minWidth: 30 }}>
                        <Checkbox edge="start" checked={selectedAvailable.includes(c.id)} size="small" />
                      </ListItemIcon>
                      <ListItemText primary={c.name} />
                    </ListItem>
                  ))}
                  {availableCities.length === 0 && (
                    <Typography variant="caption" sx={{ color: 'text.secondary', px: 1 }}>
                      No available cities
                    </Typography>
                  )}
                </List>
              </Paper>

              <Paper variant="outlined" sx={{ flex: 1, p: 1 }}>
                <Typography variant="caption" sx={{ fontWeight: 600, px: 1 }}>Mapped Cities</Typography>
                {selectedMapped.length > 0 && (
                  <Button size="small" onClick={moveToAvailable} sx={{ mb: 1 }}>
                    &lt; Remove Selected
                  </Button>
                )}
                <List dense sx={{ maxHeight: 250, overflow: 'auto' }}>
                  {mappedCities.map((c) => (
                    <ListItem key={c.id} dense onClick={() => toggleMapped(c.id)} sx={{ cursor: 'pointer' }}>
                      <ListItemIcon sx={{ minWidth: 30 }}>
                        <Checkbox edge="start" checked={selectedMapped.includes(c.id)} size="small" />
                      </ListItemIcon>
                      <ListItemText primary={c.name} />
                    </ListItem>
                  ))}
                  {mappedCities.length === 0 && (
                    <Typography variant="caption" sx={{ color: 'text.secondary', px: 1 }}>
                      No cities mapped
                    </Typography>
                  )}
                </List>
              </Paper>
            </Box>
          </>
        )}
      </DrawerForm>

      <ConfirmDialog
        open={confirmOpen}
        title={confirmTitle}
        message={confirmMsg}
        onConfirm={confirmAction}
        onCancel={() => setConfirmOpen(false)}
      />

      {toast && (
        <Snackbar open autoHideDuration={3000} onClose={() => setToast(null)} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
          <Alert severity={toast.severity} variant="filled">{toast.message}</Alert>
        </Snackbar>
      )}
    </Box>
  )
}

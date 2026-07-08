import { useState, useMemo } from 'react';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import Box from '@mui/material/Box';
import { Iconify } from 'src/components/iconify';

export interface DualListItem {
  id: string;
  label: string;
}

type Props = {
  availableItems: DualListItem[];
  selectedItems: DualListItem[];
  onMove: (ids: string[]) => void;
  onRemove: (ids: string[]) => void;
  availableTitle?: string;
  selectedTitle?: string;
  availableSearchPlaceholder?: string;
  selectedSearchPlaceholder?: string;
};

export function DualListTransfer({
  availableItems,
  selectedItems,
  onMove,
  onRemove,
  availableTitle = 'Available',
  selectedTitle = 'Selected',
  availableSearchPlaceholder = 'Search...',
  selectedSearchPlaceholder = 'Search...',
}: Props) {
  const [availableSearch, setAvailableSearch] = useState('');
  const [selectedSearch, setSelectedSearch] = useState('');
  const [checkedAvailable, setCheckedAvailable] = useState<Set<string>>(new Set());
  const [checkedSelected, setCheckedSelected] = useState<Set<string>>(new Set());

  const filteredAvailable = useMemo(() => {
    if (!availableSearch) return availableItems;
    const lower = availableSearch.toLowerCase();
    return availableItems.filter((item) => item.label.toLowerCase().includes(lower));
  }, [availableItems, availableSearch]);

  const filteredSelected = useMemo(() => {
    if (!selectedSearch) return selectedItems;
    const lower = selectedSearch.toLowerCase();
    return selectedItems.filter((item) => item.label.toLowerCase().includes(lower));
  }, [selectedItems, selectedSearch]);

  const handleToggleAvailable = (id: string) => {
    setCheckedAvailable((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
    setCheckedSelected(new Set());
  };

  const handleToggleSelected = (id: string) => {
    setCheckedSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
    setCheckedAvailable(new Set());
  };

  const handleMoveRight = () => {
    if (checkedAvailable.size === 0) return;
    onMove(Array.from(checkedAvailable));
    setCheckedAvailable(new Set());
  };

  const handleMoveLeft = () => {
    if (checkedSelected.size === 0) return;
    onRemove(Array.from(checkedSelected));
    setCheckedSelected(new Set());
  };

  const handleMoveAllRight = () => {
    onMove(availableItems.map((item) => item.id));
    setCheckedAvailable(new Set());
  };

  const handleMoveAllLeft = () => {
    onRemove(selectedItems.map((item) => item.id));
    setCheckedSelected(new Set());
  };

  return (
    <Stack direction="row" spacing={2} alignItems="stretch">
      <Card sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <Typography variant="subtitle2" sx={{ px: 2, py: 1.5, borderBottom: '1px solid', borderColor: 'divider' }}>
          {availableTitle} ({availableItems.length})
        </Typography>
        <Box sx={{ px: 2, py: 1 }}>
          <TextField
            size="small"
            placeholder={availableSearchPlaceholder}
            value={availableSearch}
            onChange={(e) => setAvailableSearch(e.target.value)}
            fullWidth
            InputProps={{
              startAdornment: <Iconify icon="solar:magnifer-bold" width={16} style={{ marginRight: 6, opacity: 0.5 }} />,
            }}
          />
        </Box>
        <Box sx={{ flex: 1, overflowY: 'auto', px: 1 }}>
          {filteredAvailable.map((item) => (
            <FormControlLabel
              key={item.id}
              control={<Checkbox size="small" checked={checkedAvailable.has(item.id)} onChange={() => handleToggleAvailable(item.id)} />}
              label={item.label}
              sx={{ mx: 0, width: 1, px: 1, '&:hover': { bgcolor: 'action.hover' } }}
            />
          ))}
          {filteredAvailable.length === 0 && (
            <Typography variant="caption" color="text.disabled" sx={{ display: 'block', textAlign: 'center', py: 4 }}>
              No items available
            </Typography>
          )}
        </Box>
      </Card>

      <Stack justifyContent="center" spacing={1} sx={{ minWidth: 40 }}>
        <Button variant="outlined" size="small" onClick={handleMoveRight} disabled={checkedAvailable.size === 0} sx={{ minWidth: 40, px: 1 }}>
          <Iconify icon="solar:alt-arrow-right-bold" width={18} />
        </Button>
        <Button variant="outlined" size="small" onClick={handleMoveLeft} disabled={checkedSelected.size === 0} sx={{ minWidth: 40, px: 1 }}>
          <Iconify icon="solar:alt-arrow-left-bold" width={18} />
        </Button>
        <Button variant="text" size="small" onClick={handleMoveAllRight} disabled={availableItems.length === 0} sx={{ minWidth: 40, px: 1 }}>
          <Iconify icon="solar:double-alt-arrow-right-bold" width={18} />
        </Button>
        <Button variant="text" size="small" onClick={handleMoveAllLeft} disabled={selectedItems.length === 0} sx={{ minWidth: 40, px: 1 }}>
          <Iconify icon="solar:double-alt-arrow-left-bold" width={18} />
        </Button>
      </Stack>

      <Card sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <Typography variant="subtitle2" sx={{ px: 2, py: 1.5, borderBottom: '1px solid', borderColor: 'divider' }}>
          {selectedTitle} ({selectedItems.length})
        </Typography>
        <Box sx={{ px: 2, py: 1 }}>
          <TextField
            size="small"
            placeholder={selectedSearchPlaceholder}
            value={selectedSearch}
            onChange={(e) => setSelectedSearch(e.target.value)}
            fullWidth
            InputProps={{
              startAdornment: <Iconify icon="solar:magnifer-bold" width={16} style={{ marginRight: 6, opacity: 0.5 }} />,
            }}
          />
        </Box>
        <Box sx={{ flex: 1, overflowY: 'auto', px: 1 }}>
          {filteredSelected.map((item) => (
            <FormControlLabel
              key={item.id}
              control={<Checkbox size="small" checked={checkedSelected.has(item.id)} onChange={() => handleToggleSelected(item.id)} />}
              label={item.label}
              sx={{ mx: 0, width: 1, px: 1, '&:hover': { bgcolor: 'action.hover' } }}
            />
          ))}
          {filteredSelected.length === 0 && (
            <Typography variant="caption" color="text.disabled" sx={{ display: 'block', textAlign: 'center', py: 4 }}>
              No items selected
            </Typography>
          )}
        </Box>
      </Card>
    </Stack>
  );
}

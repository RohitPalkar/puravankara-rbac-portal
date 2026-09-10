import type { CityGenericApproval } from 'src/services/types/master';

import { useState } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';

import { Iconify } from 'src/components/iconify';

import GenericApprovalDialog from './generic-approval-dialog';

type Props = {
  value: CityGenericApproval[];
  onChange: (next: CityGenericApproval[]) => void;
  readOnly?: boolean;
};

export default function ApprovalDepartmentStep({ value, onChange, readOnly = false }: Props) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<CityGenericApproval | null>(null);
  const [editingIdx, setEditingIdx] = useState<number | null>(null);

  const handleAdd = () => {
    setEditing(null);
    setEditingIdx(null);
    setDialogOpen(true);
  };
  const handleEdit = (item: CityGenericApproval, idx: number) => {
    setEditing(item);
    setEditingIdx(idx);
    setDialogOpen(true);
  };
  const handleSave = (data: CityGenericApproval) => {
    if (editingIdx !== null) {
      const next = [...value];
      next[editingIdx] = data;
      onChange(next);
    } else {
      onChange([...value, data]);
    }
    setDialogOpen(false);
  };
  const handleDelete = (idx: number) => {
    onChange(value.filter((_, i) => i !== idx));
  };

  return (
    <Box>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
        <Box>
          <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Iconify icon="solar:clipboard-check-bold" width={20} /> Approval & Department Mapping
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {readOnly ? 'View-only — uploaded checklists, templates & samples by admin.' : 'Admin upload — Checklist / URL / Document, Templates & Sample References per department. User sees read-only.'}
          </Typography>
        </Box>
        {!readOnly && (
          <Button variant="contained" startIcon={<Iconify icon="eva:plus-fill" />} onClick={handleAdd}>
            Add Generic Approval
          </Button>
        )}
      </Stack>

      {value.length === 0 ? (
        <Card sx={{ p: 4, textAlign: 'center', borderStyle: 'dashed', bgcolor: 'grey.50' }}>
          <Iconify icon="solar:folder-with-files-bold" width={40} sx={{ color: 'text.disabled', mb: 1 }} />
          <Typography variant="subtitle2">No Generic Approvals configured</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Click “Add Generic Approval” to create a popup with departments. Each department can hold Checklist URL/file, Templates (multiple with name) & Sample Reference.
          </Typography>
          {!readOnly && (
            <Button variant="outlined" onClick={handleAdd} startIcon={<Iconify icon="eva:plus-fill" />}>
              + Add Generic Approval
            </Button>
          )}
        </Card>
      ) : (
        <Stack spacing={2}>
          {value.map((ga, idx) => (
            <Card key={ga.id} variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
              <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1.5 }}>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <Typography variant="subtitle1">{ga.title || `Generic Approval #${idx + 1}`}</Typography>
                  <Chip size="small" label={`${ga.departments.length} dept`} color="primary" variant="outlined" />
                  <Chip size="small" label={`${ga.departments.reduce((a, d) => a + d.templates.length, 0)} templates`} variant="outlined" />
                </Stack>
                {!readOnly && (
                  <Stack direction="row" spacing={0.5}>
                    <IconButton size="small" onClick={() => handleEdit(ga, idx)}><Iconify icon="solar:pen-bold" width={16} /></IconButton>
                    <IconButton size="small" color="error" onClick={() => handleDelete(idx)}><Iconify icon="solar:trash-bin-trash-bold" width={16} /></IconButton>
                  </Stack>
                )}
                {readOnly && (
                  <Chip size="small" color="success" label="View only" variant="outlined" />
                )}
              </Stack>

              <Stack spacing={1.2}>
                {ga.departments.map((dept, dIdx) => (
                  <Box key={dept.id} sx={{ p: 1.5, border: '1px solid', borderColor: 'divider', borderRadius: 1.5, bgcolor: readOnly ? 'grey.50' : 'background.paper' }}>
                    <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                      <Chip size="small" label={`Dept ${dIdx + 1}`} />
                      <Typography variant="subtitle2">{dept.departmentName}</Typography>
                      <Box sx={{ flexGrow: 1 }} />
                      {dept.checklistUrl && <Chip size="small" icon={<Iconify icon="solar:link-bold" width={12} />} label="URL" variant="outlined" />}
                      {dept.checklistFileName && <Chip size="small" label={dept.checklistFileName} variant="outlined" />}
                    </Stack>

                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mt: 1 }}>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>Checklist</Typography>
                        <Typography variant="body2" sx={{ mt: 0.5 }}>
                          {dept.checklistUrl ? <Box component="a" href={dept.checklistUrl} target="_blank" sx={{ color: 'primary.main', wordBreak: 'break-all' }}>{dept.checklistUrl}</Box> : <span style={{ color: '#999' }}>No URL</span>}
                        </Typography>
                        <Stack direction="row" spacing={1} sx={{ mt: 0.75 }} flexWrap="wrap">
                          {dept.checklistFileName && <Chip size="small" label={`Checklist: ${dept.checklistFileName}`} />}
                          {dept.documentFileName && <Chip size="small" color="primary" variant="outlined" label={`Doc: ${dept.documentFileName}`} />}
                          {!dept.checklistFileName && !dept.documentFileName && <Typography variant="caption" color="text.disabled">No files</Typography>}
                        </Stack>
                      </Box>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>Templates ({dept.templates.length})</Typography>
                        {dept.templates.length === 0 ? (
                          <Typography variant="caption" color="text.disabled">No templates</Typography>
                        ) : (
                          <Stack spacing={0.5} sx={{ mt: 0.5 }}>
                            {dept.templates.map((t) => (
                              <Stack key={t.id} direction="row" alignItems="center" spacing={1} sx={{ p: 0.75, border: '1px solid', borderColor: 'divider', borderRadius: 1, bgcolor: 'background.paper' }}>
                                <Iconify icon="solar:document-bold" width={14} />
                                <Typography variant="body2" sx={{ flex: 1, fontWeight: 500 }}>{t.name}</Typography>
                                <Chip size="small" label={t.fileName} variant="outlined" />
                              </Stack>
                            ))}
                          </Stack>
                        )}
                      </Box>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>Sample Reference</Typography>
                        <Box sx={{ mt: 0.5 }}>
                          {dept.sampleReference?.fileName ? (
                            <Chip size="small" color="success" icon={<Iconify icon="solar:file-check-bold" width={14} />} label={dept.sampleReference.fileName} />
                          ) : (
                            <Typography variant="caption" color="text.disabled">No sample</Typography>
                          )}
                        </Box>
                      </Box>
                    </Stack>
                  </Box>
                ))}
              </Stack>
            </Card>
          ))}
        </Stack>
      )}

      {!readOnly && (
        <GenericApprovalDialog
          open={dialogOpen}
          initialData={editing}
          onClose={() => setDialogOpen(false)}
          onSave={handleSave}
        />
      )}
    </Box>
  );
}

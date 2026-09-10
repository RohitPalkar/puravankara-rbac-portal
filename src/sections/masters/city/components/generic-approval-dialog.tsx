import type { CityTemplateUpload,CityGenericApproval, CityDepartmentMapping } from 'src/services/types/master';

import { useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Divider from '@mui/material/Divider';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';

import { Iconify } from 'src/components/iconify';

// helpers
const uid = () => Math.random().toString(36).slice(2, 9);
const newDepartment = (): CityDepartmentMapping => ({
  id: uid(),
  departmentName: '',
  checklistUrl: '',
  checklistFileName: '',
  documentFileName: '',
  templates: [],
});
const newTemplate = (): CityTemplateUpload => ({ id: uid(), name: '', fileName: '' });

type Props = {
  open: boolean;
  initialData?: CityGenericApproval | null;
  onClose: () => void;
  onSave: (data: CityGenericApproval) => void;
};

export default function GenericApprovalDialog({ open, initialData, onClose, onSave }: Props) {
  const [departments, setDepartments] = useState<CityDepartmentMapping[]>([newDepartment()]);
  const [title, setTitle] = useState('');

  useEffect(() => {
    if (open) {
      if (initialData) {
        setTitle(initialData.title ?? '');
        setDepartments(initialData.departments.length ? initialData.departments.map(d => ({ ...d, templates: d.templates.map(t => ({ ...t })) })) : [newDepartment()]);
      } else {
        setTitle('');
        setDepartments([newDepartment()]);
      }
    }
  }, [open, initialData]);

  const updateDept = useCallback((idx: number, patch: Partial<CityDepartmentMapping>) => {
    setDepartments(prev => prev.map((d, i) => (i === idx ? { ...d, ...patch } : d)));
  }, []);

  const addDepartment = () => setDepartments(prev => [...prev, newDepartment()]);
  const removeDepartment = (idx: number) => {
    if (departments.length === 1) return;
    setDepartments(prev => prev.filter((_, i) => i !== idx));
  };

  const addTemplate = (deptIdx: number) => {
    updateDept(deptIdx, { templates: [...departments[deptIdx].templates, newTemplate()] });
  };
  const updateTemplate = (deptIdx: number, tmplIdx: number, patch: Partial<CityTemplateUpload>) => {
    const dept = departments[deptIdx];
    const next = dept.templates.map((t, i) => (i === tmplIdx ? { ...t, ...patch } : t));
    updateDept(deptIdx, { templates: next });
  };
  const removeTemplate = (deptIdx: number, tmplIdx: number) => {
    const dept = departments[deptIdx];
    updateDept(deptIdx, { templates: dept.templates.filter((_, i) => i !== tmplIdx) });
  };

  const handleFile = (deptIdx: number, field: keyof Pick<CityDepartmentMapping, 'checklistFileName' | 'documentFileName'>, file: File | undefined) => {
    if (!file) return;
    updateDept(deptIdx, { [field]: file.name } as Partial<CityDepartmentMapping>);
  };
  const handleSampleFile = (deptIdx: number, file: File | undefined) => {
    if (!file) return;
    updateDept(deptIdx, { sampleReference: { fileName: file.name } });
  };
  const handleTemplateFile = (deptIdx: number, tmplIdx: number, file: File | undefined) => {
    if (!file) return;
    updateTemplate(deptIdx, tmplIdx, { fileName: file.name });
  };

  const canSave = departments.every(d => d.departmentName.trim().length >= 2);

  const handleSave = () => {
    if (!canSave) return;
    const cleaned: CityGenericApproval = {
      id: initialData?.id ?? uid(),
      title: title.trim() || `Approval ${new Date().toLocaleDateString()}`,
      departments: departments.map(d => ({
        ...d,
        departmentName: d.departmentName.trim(),
        checklistUrl: d.checklistUrl?.trim(),
        checklistFileName: d.checklistFileName?.trim(),
        documentFileName: d.documentFileName?.trim(),
        templates: d.templates.filter(t => t.name.trim() && t.fileName.trim()).map(t => ({ ...t, name: t.name.trim(), fileName: t.fileName.trim() })),
        sampleReference: d.sampleReference?.fileName ? { fileName: d.sampleReference.fileName } : undefined,
      })),
      createdAt: initialData?.createdAt ?? new Date().toISOString(),
    };
    onSave(cleaned);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth scroll="paper">
      <DialogTitle>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Stack direction="row" alignItems="center" spacing={1}>
            <Iconify icon="solar:clipboard-check-bold" width={22} />
            <Typography variant="h6">{initialData ? 'Edit Generic Approval' : 'Generic Approval'}</Typography>
          </Stack>
          <IconButton onClick={onClose}><Iconify icon="mingcute:close-line" width={20} /></IconButton>
        </Stack>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          Configure department-wise checklists, templates and sample references. Admin uploads here — users will view read-only.
        </Typography>
      </DialogTitle>

      <DialogContent dividers sx={{ p: 0 }}>
        <Box sx={{ p: 2.5 }}>
          <TextField
            fullWidth
            size="small"
            label="Approval Title (optional)"
            placeholder="e.g. Land Acquisition — Karnataka"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            sx={{ mb: 2.5 }}
          />

          <Stack spacing={2.5}>
            {departments.map((dept, dIdx) => (
              <Card key={dept.id} variant="outlined" sx={{ p: 2, borderRadius: 2, bgcolor: 'background.paper' }}>
                <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <Chip label={`Dept ${dIdx + 1}`} size="small" color="primary" variant="outlined" />
                    <Typography variant="subtitle2">Department Mapping</Typography>
                  </Stack>
                  <IconButton size="small" onClick={() => removeDepartment(dIdx)} disabled={departments.length === 1} color="error">
                    <Iconify icon="solar:trash-bin-trash-bold" width={18} />
                  </IconButton>
                </Stack>

                <TextField
                  fullWidth
                  required
                  label="Enter Department Name"
                  placeholder="e.g. Business Development, Legal, Finance"
                  value={dept.departmentName}
                  onChange={(e) => updateDept(dIdx, { departmentName: e.target.value })}
                  error={!!dept.departmentName && dept.departmentName.trim().length < 2}
                  helperText={dept.departmentName && dept.departmentName.trim().length < 2 ? 'At least 2 characters' : ' '}
                  size="small"
                  sx={{ mb: 2 }}
                />

                {/* Checklist + URL + Image/Document */}
                <Typography variant="subtitle2" sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 0.75 }}>
                  <Iconify icon="solar:checklist-bold" width={16} /> Checklist
                </Typography>
                <Stack spacing={1.5} sx={{ mb: 2, pl: 0.5 }}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Enter URL"
                    placeholder="https://example.com/checklist"
                    value={dept.checklistUrl ?? ''}
                    onChange={(e) => updateDept(dIdx, { checklistUrl: e.target.value })}
                  />
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} alignItems={{ xs: 'stretch', sm: 'center' }}>
                    <Button
                      variant="outlined"
                      component="label"
                      startIcon={<Iconify icon="solar:upload-bold" />}
                      sx={{ flex: 1, justifyContent: 'flex-start', textTransform: 'none' }}
                    >
                      {dept.checklistFileName ? dept.checklistFileName : 'Upload image / document'}
                      <input hidden type="file" accept=".pdf,.png,.jpg,.jpeg,.docx,.xlsx,.csv" onChange={(e) => handleFile(dIdx, 'checklistFileName', e.target.files?.[0])} />
                    </Button>
                    <Button
                      variant="outlined"
                      component="label"
                      startIcon={<Iconify icon="solar:document-add-bold" />}
                      sx={{ flex: 1, justifyContent: 'flex-start', textTransform: 'none' }}
                    >
                      {dept.documentFileName ? dept.documentFileName : 'Upload image/document'}
                      <input hidden type="file" accept=".pdf,.png,.jpg,.jpeg,.docx" onChange={(e) => handleFile(dIdx, 'documentFileName', e.target.files?.[0])} />
                    </Button>
                  </Stack>
                  {(dept.checklistFileName || dept.documentFileName) && (
                    <Stack direction="row" spacing={1} flexWrap="wrap">
                      {dept.checklistFileName && <Chip size="small" label={`Checklist: ${dept.checklistFileName}`} onDelete={() => updateDept(dIdx, { checklistFileName: '' })} />}
                      {dept.documentFileName && <Chip size="small" label={`Doc: ${dept.documentFileName}`} onDelete={() => updateDept(dIdx, { documentFileName: '' })} />}
                    </Stack>
                  )}
                </Stack>

                <Divider sx={{ my: 2 }} />

                {/* Templates — dynamic multiple with name */}
                <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
                  <Typography variant="subtitle2" sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                    <Iconify icon="solar:documents-bold" width={16} /> Template upload
                    <Chip label={`${dept.templates.length}`} size="small" />
                  </Typography>
                  <Button size="small" variant="contained" startIcon={<Iconify icon="eva:plus-fill" />} onClick={() => addTemplate(dIdx)}>
                    Add Template
                  </Button>
                </Stack>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1.5 }}>
                  Dynamic — allow multiple with name. Each template requires a name + file.
                </Typography>

                {dept.templates.length === 0 ? (
                  <Box sx={{ p: 2, border: '1px dashed', borderColor: 'divider', borderRadius: 1.5, textAlign: 'center', bgcolor: 'grey.50' }}>
                    <Typography variant="body2" color="text.secondary">No templates yet. Click “Add Template”.</Typography>
                  </Box>
                ) : (
                  <Stack spacing={1.2} sx={{ mb: 2 }}>
                    {dept.templates.map((tmpl, tIdx) => (
                      <Stack key={tmpl.id} direction={{ xs: 'column', sm: 'row' }} spacing={1} alignItems={{ xs: 'stretch', sm: 'center' }} sx={{ p: 1.2, border: '1px solid', borderColor: 'divider', borderRadius: 1.5 }}>
                        <TextField
                          size="small"
                          label="Template Name"
                          placeholder="e.g. Agreement Template"
                          value={tmpl.name}
                          onChange={(e) => updateTemplate(dIdx, tIdx, { name: e.target.value })}
                          sx={{ flex: 1 }}
                        />
                        <Button
                          variant="outlined"
                          component="label"
                          startIcon={<Iconify icon="solar:upload-bold" />}
                          sx={{ minWidth: 180, justifyContent: 'flex-start', textTransform: 'none', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                        >
                          <Box component="span" sx={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{tmpl.fileName || 'Upload file'}</Box>
                          <input hidden type="file" onChange={(e) => handleTemplateFile(dIdx, tIdx, e.target.files?.[0])} />
                        </Button>
                        <IconButton size="small" color="error" onClick={() => removeTemplate(dIdx, tIdx)}>
                          <Iconify icon="solar:trash-bin-trash-bold" width={18} />
                        </IconButton>
                      </Stack>
                    ))}
                  </Stack>
                )}

                <Divider sx={{ my: 2 }} />

                {/* Sample Reference */}
                <Typography variant="subtitle2" sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 0.75 }}>
                  <Iconify icon="solar:file-text-bold" width={16} /> Sample Reference document
                </Typography>
                <Button
                  fullWidth
                  variant="outlined"
                  component="label"
                  startIcon={<Iconify icon="solar:upload-bold" />}
                  sx={{ justifyContent: 'flex-start', textTransform: 'none', mb: 1 }}
                >
                  {dept.sampleReference?.fileName ? dept.sampleReference.fileName : 'Upload Sample Reference (PDF / Image)'}
                  <input hidden type="file" accept=".pdf,.png,.jpg,.jpeg,.docx" onChange={(e) => handleSampleFile(dIdx, e.target.files?.[0])} />
                </Button>
                {dept.sampleReference?.fileName && (
                  <Chip size="small" color="success" variant="outlined" label={dept.sampleReference.fileName} onDelete={() => updateDept(dIdx, { sampleReference: undefined })} />
                )}
              </Card>
            ))}

            <Button
              variant="outlined"
              fullWidth
              startIcon={<Iconify icon="eva:plus-fill" />}
              onClick={addDepartment}
              sx={{ borderStyle: 'dashed', py: 1.25 }}
            >
              + Add Department
            </Button>
          </Stack>
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} color="inherit">Cancel</Button>
        <Button variant="contained" onClick={handleSave} disabled={!canSave} startIcon={<Iconify icon="solar:check-circle-bold" />}>
          Save Generic Approval
        </Button>
      </DialogActions>
    </Dialog>
  );
}

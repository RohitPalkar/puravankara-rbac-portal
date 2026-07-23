import type { Project } from 'src/services/types/project';
import type { ModuleTreeNode } from 'src/services/types/product-catalog';
import type { ModuleProjectMapping, RolePermissionProfile, SubModuleProjectMapping } from 'src/services/types/user';

import { useMemo, useState, useCallback } from 'react';

import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Radio from '@mui/material/Radio';
import Stack from '@mui/material/Stack';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import TextField from '@mui/material/TextField';
import RadioGroup from '@mui/material/RadioGroup';
import Typography from '@mui/material/Typography';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';

import { Iconify } from 'src/components/iconify';

interface Props {
  modules: ModuleTreeNode[];
  allProjects: Project[];
  initialData?: RolePermissionProfile;
  onChange: (data: RolePermissionProfile) => void;
}

function buildDefaultProfile(moduleTree: ModuleTreeNode[]): RolePermissionProfile {
  return moduleTree.map((m) => ({
    moduleId: m.id,
    subModules: m.subModules.map((sm) => ({
      subModuleId: sm.id,
      enabled: false,
      accessType: 'all' as const,
      projectIds: [],
    })),
  }));
}

function updateModuleInProfile(
  profile: RolePermissionProfile,
  moduleId: number,
  updater: (mod: ModuleProjectMapping) => ModuleProjectMapping,
): RolePermissionProfile {
  return profile.map((m) => (m.moduleId === moduleId ? updater(m) : m));
}

export function PermissionProfile({ modules, allProjects, initialData, onChange }: Props) {
  const profile = useMemo(
    () => (initialData && initialData.length > 0 ? initialData : buildDefaultProfile(modules)),
    [modules, initialData],
  );

  const [selectedModuleId, setSelectedModuleId] = useState<number | null>(null);
  const [leftSearch, setLeftSearch] = useState('');

  const selectedModule = useMemo(
    () => modules.find((m) => m.id === selectedModuleId) ?? null,
    [modules, selectedModuleId],
  );

  const toggleModuleEnabled = useCallback(
    (moduleId: number) => {
      const next = updateModuleInProfile(profile, moduleId, (mod) => {
        const allEnabled = mod.subModules.every((sm) => sm.enabled);
        return {
          ...mod,
          subModules: mod.subModules.map((sm) => ({ ...sm, enabled: !allEnabled })),
        };
      });
      onChange(next);
    },
    [profile, onChange],
  );

  const toggleSubModuleEnabled = useCallback(
    (moduleId: number, subModuleId: number) => {
      const next = updateModuleInProfile(profile, moduleId, (mod) => ({
        ...mod,
        subModules: mod.subModules.map((sm) =>
          sm.subModuleId === subModuleId ? { ...sm, enabled: !sm.enabled } : sm,
        ),
      }));
      onChange(next);
    },
    [profile, onChange],
  );

  const updateSubModule = useCallback(
    (
      moduleId: number,
      subModuleId: number,
      updater: (sm: SubModuleProjectMapping) => SubModuleProjectMapping,
    ) => {
      const next = updateModuleInProfile(profile, moduleId, (mod) => ({
        ...mod,
        subModules: mod.subModules.map((sm) =>
          sm.subModuleId === subModuleId ? updater(sm) : sm,
        ),
      }));
      onChange(next);
    },
    [profile, onChange],
  );

  const filteredModules = useMemo(() => {
    if (!leftSearch) return modules;
    const lower = leftSearch.toLowerCase();
    return modules.filter((m) => m.name.toLowerCase().includes(lower));
  }, [modules, leftSearch]);

  const selectedProfileMod = useMemo(
    () => profile.find((m) => m.moduleId === selectedModuleId) ?? null,
    [profile, selectedModuleId],
  );

  if (modules.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 8 }}>
        <Typography variant="body2" color="text.secondary">No modules available.</Typography>
      </Box>
    );
  }

  return (
    <Stack direction="row" spacing={0} sx={{ minHeight: 480, border: '1px solid', borderColor: 'divider', borderRadius: 1.5, overflow: 'hidden' }}>
      {/* LEFT PANEL */}
      <Box
        sx={{
          width: 260,
          flexShrink: 0,
          borderRight: '1px solid',
          borderColor: 'divider',
          display: 'flex',
          flexDirection: 'column',
          bgcolor: 'grey.50',
        }}
      >
        <Box sx={{ p: 1.5, borderBottom: '1px solid', borderColor: 'divider' }}>
          <TextField
            fullWidth
            size="small"
            placeholder="Search modules..."
            value={leftSearch}
            onChange={(e) => setLeftSearch(e.target.value)}
            InputProps={{
              startAdornment: (
                <Iconify icon="solar:magnifer-bold" width={16} style={{ marginRight: 4, opacity: 0.5 }} />
              ),
            }}
          />
        </Box>
        <Box sx={{ flex: 1, overflow: 'auto', px: 1, py: 0.5 }}>
          {filteredModules.length === 0 ? (
            <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 6 }}>
              {leftSearch ? 'No modules match your search.' : 'No modules found.'}
            </Typography>
          ) : (
            filteredModules.map((mod) => {
              const modProfile = profile.find((m) => m.moduleId === mod.id);
              const allEnabled = modProfile?.subModules.every((sm) => sm.enabled) ?? false;
              const anyEnabled = modProfile?.subModules.some((sm) => sm.enabled) ?? false;
              const isSelected = selectedModuleId === mod.id;
              return (
                <Stack
                  key={mod.id}
                  direction="row"
                  alignItems="center"
                  spacing={0.5}
                  sx={{
                    py: 0.75,
                    px: 1,
                    borderRadius: 1,
                    cursor: 'pointer',
                    bgcolor: isSelected ? 'primary.lighter' : 'transparent',
                    borderLeft: '3px solid',
                    borderColor: isSelected ? 'primary.main' : 'transparent',
                    '&:hover': { bgcolor: isSelected ? 'primary.lighter' : 'action.hover' },
                    transition: 'background-color 0.15s',
                    mb: 0.25,
                  }}
                  onClick={() => setSelectedModuleId(mod.id)}
                >
                  <Checkbox
                    size="small"
                    checked={allEnabled}
                    indeterminate={anyEnabled && !allEnabled}
                    onChange={(e) => { e.stopPropagation(); toggleModuleEnabled(mod.id); }}
                    onClick={(e) => e.stopPropagation()}
                    sx={{ p: 0.25 }}
                  />
                  <Typography
                    variant="body2"
                    noWrap
                    sx={{ flex: 1, fontWeight: isSelected ? 600 : 400, fontSize: '0.8125rem' }}
                  >
                    {mod.name}
                  </Typography>
                </Stack>
              );
            })
          )}
        </Box>
      </Box>

      {/* RIGHT PANEL */}
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {!selectedModule ? (
          <Box sx={{ textAlign: 'center', py: 12 }}>
            <Iconify icon="solar:hand-point-left-bold" width={40} sx={{ color: 'text.disabled', mb: 1.5 }} />
            <Typography variant="body2" color="text.secondary">
              Select a Module from the left panel to configure permissions.
            </Typography>
          </Box>
        ) : (
          <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
            <Stack spacing={2}>
              {selectedProfileMod?.subModules.length === 0 && (
                <Typography variant="body2" color="text.secondary">
                  No submodules available for this module.
                </Typography>
              )}
              {selectedProfileMod?.subModules.map((sm) => {
                const smMeta = selectedModule.subModules.find((s) => s.id === sm.subModuleId);
                if (!smMeta) return null;
                return (
                  <SubModuleCard
                    key={sm.subModuleId}
                    sm={sm}
                    smMeta={smMeta}
                    moduleId={selectedModule.id}
                    allProjects={allProjects}
                    onToggleEnabled={toggleSubModuleEnabled}
                    onUpdate={updateSubModule}
                  />
                );
              })}
            </Stack>
          </Box>
        )}
      </Box>
    </Stack>
  );
}

const PROJECT_SEARCH_THRESHOLD = 8;

interface SubModuleCardProps {
  sm: SubModuleProjectMapping;
  smMeta: { id: number; name: string };
  moduleId: number;
  allProjects: Project[];
  onToggleEnabled: (moduleId: number, subModuleId: number) => void;
  onUpdate: (
    moduleId: number,
    subModuleId: number,
    updater: (sm: SubModuleProjectMapping) => SubModuleProjectMapping,
  ) => void;
}

function SubModuleCard({
  sm,
  smMeta,
  moduleId,
  allProjects,
  onToggleEnabled,
  onUpdate,
}: SubModuleCardProps) {
  const [search, setSearch] = useState('');

  const showSearch = allProjects.length > PROJECT_SEARCH_THRESHOLD && sm.accessType === 'selected' && sm.enabled;

  const filteredProjects = useMemo(() => {
    if (!search) return allProjects;
    const lower = search.toLowerCase();
    return allProjects.filter((p) => p.name.toLowerCase().includes(lower));
  }, [allProjects, search]);

  const selectedCount = sm.projectIds.length;
  const allSelected = selectedCount === allProjects.length && allProjects.length > 0;
  const noneSelected = selectedCount === 0;

  const handleSelectAll = useCallback(() => {
    onUpdate(moduleId, sm.subModuleId, (s) => ({ ...s, projectIds: allProjects.map((p) => p.id) }));
  }, [moduleId, sm.subModuleId, allProjects, onUpdate]);

  const handleClearAll = useCallback(() => {
    onUpdate(moduleId, sm.subModuleId, (s) => ({ ...s, projectIds: [] }));
  }, [moduleId, sm.subModuleId, onUpdate]);

  const toggleProject = useCallback(
    (projectId: number) => {
      onUpdate(moduleId, sm.subModuleId, (s) => {
        const ids = s.projectIds.includes(projectId)
          ? s.projectIds.filter((id) => id !== projectId)
          : [...s.projectIds, projectId];
        return { ...s, projectIds: ids };
      });
    },
    [moduleId, sm.subModuleId, onUpdate],
  );

  return (
    <Paper variant="outlined" sx={{ borderRadius: 1.5, overflow: 'hidden', borderColor: sm.enabled ? 'primary.light' : 'divider' }}>
      {/* Card Header */}
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        sx={{
          px: 2,
          py: 1.25,
          bgcolor: sm.enabled ? 'primary.lighter' : 'grey.50',
          borderBottom: '1px solid',
          borderColor: 'divider',
          transition: 'background-color 0.2s',
        }}
      >
        <Typography variant="subtitle2" sx={{ fontWeight: 600, fontSize: '0.875rem' }}>
          {smMeta.name}
        </Typography>
        <FormControlLabel
          label={<Typography variant="caption" sx={{ fontWeight: 500, color: sm.enabled ? 'primary.main' : 'text.secondary', userSelect: 'none' }}>Module Enabled</Typography>}
          control={
            <Checkbox
              size="small"
              checked={sm.enabled}
              onChange={() => onToggleEnabled(moduleId, sm.subModuleId)}
              sx={{ p: 0.25 }}
            />
          }
          sx={{ m: 0 }}
        />
      </Stack>

      {sm.enabled && (
        <Box sx={{ px: 2, py: 1.5 }}>
          {/* Project Scope */}
          <FormControl component="fieldset" sx={{ mb: 1.5 }}>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>
              Project Scope
            </Typography>
            <RadioGroup
              row
              value={sm.accessType}
              onChange={(e) =>
                onUpdate(moduleId, sm.subModuleId, (s) => ({
                  ...s,
                  accessType: e.target.value as 'all' | 'selected',
                  projectIds: e.target.value === 'all' ? [] : s.projectIds,
                }))
              }
            >
              <FormControlLabel
                value="selected"
                control={<Radio size="small" />}
                label={<Typography variant="body2" sx={{ fontWeight: 500 }}>Selected Projects</Typography>}
              />
              <FormControlLabel
                value="all"
                control={<Radio size="small" />}
                label={<Typography variant="body2" sx={{ fontWeight: 500 }}>All Projects</Typography>}
              />
            </RadioGroup>
          </FormControl>

          {sm.accessType === 'all' ? (
            <Stack direction="row" spacing={1} alignItems="center" sx={{ color: 'success.main', py: 1 }}>
              <Iconify icon="solar:check-circle-bold" width={20} />
              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                All current and future projects
              </Typography>
            </Stack>
          ) : (
            <>
              {/* Project Search */}
              {showSearch && (
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Search projects..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <Iconify icon="solar:magnifer-bold" width={16} style={{ marginRight: 4, opacity: 0.5 }} />
                    ),
                  }}
                  sx={{ mb: 1.5 }}
                />
              )}

              {/* Project Grid */}
              <Box sx={{ mb: 1.5 }}>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.75, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                  Projects
                </Typography>
                {filteredProjects.length === 0 ? (
                  <Typography variant="body2" color="text.secondary" sx={{ py: 2, textAlign: 'center' }}>
                    No projects match your search.
                  </Typography>
                ) : (
                  <Grid container spacing={0.25}>
                    {filteredProjects.map((project) => (
                      <Grid item xs={12} sm={6} key={project.id}>
                        <FormControlLabel
                          label={<Typography variant="body2" sx={{ fontSize: '0.8125rem' }}>{project.name}</Typography>}
                          control={
                            <Checkbox
                              size="small"
                              checked={sm.projectIds.includes(project.id)}
                              onChange={() => toggleProject(project.id)}
                              sx={{ p: 0.25 }}
                            />
                          }
                          sx={{ mx: 0 }}
                        />
                      </Grid>
                    ))}
                  </Grid>
                )}
              </Box>

              {/* Bulk Actions */}
              {allProjects.length > 0 && (
                <Stack
                  direction="row"
                  spacing={1.5}
                  alignItems="center"
                  sx={{ pt: 1, borderTop: '1px solid', borderColor: 'divider' }}
                >
                  <Button size="small" variant="outlined" onClick={handleSelectAll} disabled={allSelected} sx={{ minWidth: 100 }}>
                    Select All
                  </Button>
                  <Button size="small" variant="outlined" color="error" onClick={handleClearAll} disabled={noneSelected} sx={{ minWidth: 100 }}>
                    Clear All
                  </Button>
                  <Box sx={{ flex: 1 }} />
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                    {selectedCount} / {allProjects.length} selected
                  </Typography>
                </Stack>
              )}
            </>
          )}
        </Box>
      )}
    </Paper>
  );
}

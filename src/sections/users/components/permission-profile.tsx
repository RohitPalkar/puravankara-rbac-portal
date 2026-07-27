import type { Project } from 'src/services/types/project';
import type { ModuleTreeNode } from 'src/services/types/product-catalog';
import type { ModuleProjectMapping, RolePermissionProfile, SubModuleProjectMapping } from 'src/services/types/user';

import { useRef, useMemo, Fragment, useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Radio from '@mui/material/Radio';
import Stack from '@mui/material/Stack';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import Collapse from '@mui/material/Collapse';
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
      accessType: '' as const,
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

  const initialized = useRef(false);
  const [selectedModuleId, setSelectedModuleId] = useState<number | null>(null);
  const [selectedSubModuleId, setSelectedSubModuleId] = useState<number | null>(null);
  const [expandedModules, setExpandedModules] = useState<Record<number, boolean>>({});
  const [leftSearch, setLeftSearch] = useState('');

  useEffect(() => {
    if (modules.length > 0 && !initialized.current) {
      initialized.current = true;
      setExpandedModules({ [modules[0].id]: true });
      setSelectedModuleId(modules[0].id);
      if (modules[0].subModules.length > 0) {
        setSelectedSubModuleId(modules[0].subModules[0].id);
      }
    }
  }, [modules]);

  const selectedModule = useMemo(
    () => modules.find((m) => m.id === selectedModuleId) ?? null,
    [modules, selectedModuleId],
  );

  const selectedSubModule = useMemo(() => {
    if (!selectedModule || !selectedSubModuleId) return null;
    return selectedModule.subModules.find((s) => s.id === selectedSubModuleId) ?? null;
  }, [selectedModule, selectedSubModuleId]);

  const toggleModuleEnabled = useCallback(
    (moduleId: number) => {
      const next = updateModuleInProfile(profile, moduleId, (mod) => {
        const allEnabled = mod.subModules.every((sm) => sm.enabled);
        return {
          ...mod,
          subModules: mod.subModules.map((sm) => ({
            ...sm,
            enabled: !allEnabled,
            accessType: !allEnabled && !sm.accessType ? '' : sm.accessType,
          })),
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
          sm.subModuleId === subModuleId
            ? { ...sm, enabled: !sm.enabled, accessType: !sm.enabled ? '' : sm.accessType }
            : sm,
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
    return modules
      .map((m) => ({
        ...m,
        subModules: m.subModules.filter((sm) => sm.name.toLowerCase().includes(lower)),
      }))
      .filter((m) => m.subModules.length > 0 || m.name.toLowerCase().includes(lower));
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
              const isExpanded = expandedModules[mod.id] ?? false;
              return (
                <Fragment key={mod.id}>
                  <Stack
                    direction="row"
                    alignItems="center"
                    spacing={0.5}
                    sx={{
                      py: 0.75,
                      px: 1,
                      borderRadius: 1,
                      cursor: 'pointer',
                      '&:hover': { bgcolor: 'action.hover' },
                    }}
                    onClick={() => {
                      setExpandedModules({ [mod.id]: !isExpanded });
                      setSelectedModuleId(mod.id);
                    }}
                  >
                    <Box
                      component="span"
                      sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 20, height: 20, color: 'text.disabled', flexShrink: 0 }}
                    >
                      <Iconify icon={isExpanded ? 'solar:alt-arrow-down-linear' : 'solar:alt-arrow-right-linear'} width={14} />
                    </Box>
                    <Checkbox
                      size="small"
                      checked={allEnabled}
                      indeterminate={anyEnabled && !allEnabled}
                      onChange={(e) => { e.stopPropagation(); toggleModuleEnabled(mod.id); }}
                      onClick={(e) => e.stopPropagation()}
                      sx={{ p: 0.25 }}
                    />
                    <Typography variant="body2" fontWeight={600} noWrap sx={{ flex: 1, fontSize: '0.8125rem' }}>
                      {mod.name}
                    </Typography>
                  </Stack>
                  <Collapse in={isExpanded}>
                    {mod.subModules.map((sm) => {
                      const smProfile = modProfile?.subModules.find((s) => s.subModuleId === sm.id);
                      const isActive = selectedSubModuleId === sm.id && selectedModuleId === mod.id;
                      return (
                        <Stack
                          key={sm.id}
                          direction="row"
                          alignItems="center"
                          spacing={0.5}
                          sx={{
                            py: 0.5,
                            px: 1,
                            ml: 2,
                            borderRadius: 0.5,
                            cursor: 'pointer',
                            bgcolor: isActive ? 'primary.lighter' : 'transparent',
                            borderLeft: '2px solid',
                            borderColor: isActive ? 'primary.main' : 'transparent',
                            '&:hover': { bgcolor: isActive ? 'primary.lighter' : 'action.hover' },
                          }}
                        >
                          <Checkbox
                            size="small"
                            checked={smProfile?.enabled ?? false}
                            onChange={(e) => { e.stopPropagation(); toggleSubModuleEnabled(mod.id, sm.id); }}
                            onClick={(e) => e.stopPropagation()}
                            sx={{ p: 0.25 }}
                          />
                          <Typography
                            variant="body2"
                            noWrap
                            sx={{ flex: 1, fontWeight: isActive ? 600 : 400, fontSize: '0.8125rem', cursor: 'pointer' }}
                            onClick={() => { setSelectedModuleId(mod.id); setSelectedSubModuleId(sm.id); }}
                          >
                            {sm.name}
                          </Typography>
                        </Stack>
                      );
                    })}
                  </Collapse>
                </Fragment>
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
              Select a Module and Submodule from the left panel to configure permissions.
            </Typography>
          </Box>
        ) : !selectedSubModuleId || !selectedSubModule ? (
          <Box sx={{ textAlign: 'center', py: 12 }}>
            <Iconify icon="solar:hand-point-left-bold" width={40} sx={{ color: 'text.disabled', mb: 1.5 }} />
            <Typography variant="body2" color="text.secondary">
              Select a Submodule from the left panel to configure its project access.
            </Typography>
          </Box>
        ) : (
          <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
            {(() => {
              const sm = selectedProfileMod?.subModules.find((s) => s.subModuleId === selectedSubModuleId);
              if (!sm) return (
                <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 6 }}>
                  Select a submodule from the left panel.
                </Typography>
              );
              return (
                <SubModuleCard
                  sm={sm}
                  smMeta={selectedSubModule}
                  moduleId={selectedModule.id}
                  allProjects={allProjects}
                  onToggleEnabled={toggleSubModuleEnabled}
                  onUpdate={updateSubModule}
                />
              );
            })()}
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

  const useAllProjects = sm.accessType === 'all';
  const useSelectedProjects = sm.accessType === 'selected';
  const scopeNotChosen = !useAllProjects && !useSelectedProjects;

  return (
    <Paper variant="outlined" sx={{ borderRadius: 1.5, overflow: 'hidden', borderColor: 'divider' }}>
      {/* Card Header */}
      <Stack
        direction="row"
        alignItems="center"
        spacing={1}
        sx={{
          px: 1.5,
          py: 0.75,
          borderBottom: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Checkbox
          size="small"
          checked={sm.enabled}
          onChange={() => onToggleEnabled(moduleId, sm.subModuleId)}
          sx={{ p: 0.25 }}
        />
        <Typography variant="subtitle2" sx={{ fontWeight: 600, fontSize: '0.8125rem' }}>
          {smMeta.name}
        </Typography>
      </Stack>

      {sm.enabled && (
        <Box sx={{ px: 1.5, py: 1 }}>
          {/* Project Scope */}
          <FormControl component="fieldset" sx={{ mb: 1 }}>
            <RadioGroup
              row
              value={sm.accessType}
              onChange={(e) => {
                const val = e.target.value as 'all' | 'selected';
                onUpdate(moduleId, sm.subModuleId, (s) => ({
                  ...s,
                  accessType: val,
                  projectIds: val === 'all' ? [] : s.projectIds,
                }));
              }}
            >
              <FormControlLabel
                value="all"
                control={<Radio size="small" />}
                label={<Typography variant="body2" sx={{ fontWeight: 500, fontSize: '0.8125rem' }}>All Projects</Typography>}
              />
              <FormControlLabel
                value="selected"
                control={<Radio size="small" />}
                label={<Typography variant="body2" sx={{ fontWeight: 500, fontSize: '0.8125rem' }}>Selected Projects</Typography>}
              />
            </RadioGroup>
          </FormControl>

          {useAllProjects && (
            <Stack direction="row" spacing={1} alignItems="center" sx={{ color: 'text.secondary', py: 0.5 }}>
              <Iconify icon="solar:check-circle-bold" width={18} />
              <Typography variant="body2" sx={{ fontWeight: 500, fontSize: '0.8125rem' }}>
                This submodule has access to all current and future projects.
              </Typography>
            </Stack>
          )}

          {useSelectedProjects && (
            <>
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
                  sx={{ mb: 1 }}
                />
              )}

              <Box sx={{ mb: 1 }}>
                {filteredProjects.length === 0 ? (
                  <Typography variant="body2" color="text.secondary" sx={{ py: 1.5, textAlign: 'center', fontSize: '0.8125rem' }}>
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

              {allProjects.length > 0 && (
                <Stack
                  direction="row"
                  spacing={1.5}
                  alignItems="center"
                  sx={{ pt: 0.75, borderTop: '1px solid', borderColor: 'divider' }}
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

          {scopeNotChosen && (
            <Typography variant="body2" color="text.disabled" sx={{ py: 1, fontStyle: 'italic', fontSize: '0.8125rem' }}>
              Select a Project Scope to continue.
            </Typography>
          )}
        </Box>
      )}
    </Paper>
  );
}

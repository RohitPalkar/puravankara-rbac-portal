import type { Project } from 'src/services/types/project';
import type { ModuleTreeNode } from 'src/services/types/product-catalog';
import type { ModuleProjectMapping, RolePermissionProfile, SubModuleProjectMapping } from 'src/services/types/user';

import { useMemo } from 'react';

import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Radio from '@mui/material/Radio';
import Stack from '@mui/material/Stack';
import Checkbox from '@mui/material/Checkbox';
import FormLabel from '@mui/material/FormLabel';
import TextField from '@mui/material/TextField';
import RadioGroup from '@mui/material/RadioGroup';
import Typography from '@mui/material/Typography';
import FormControl from '@mui/material/FormControl';
import Autocomplete from '@mui/material/Autocomplete';
import FormControlLabel from '@mui/material/FormControlLabel';

interface Props {
  modules: ModuleTreeNode[];
  allProjects: Project[];
  initialData?: RolePermissionProfile;
  onChange: (data: RolePermissionProfile) => void;
}

function buildDefaultProfile(moduleTree: ModuleTreeNode[]): RolePermissionProfile {
  return moduleTree
    .filter((m) => m.isActive)
    .map((m) => ({
      moduleId: m.id,
      subModules: m.subModules
        .filter((sm) => sm.isActive)
        .map((sm) => ({
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
    () => initialData ?? buildDefaultProfile(modules),
    [modules, initialData],
  );

  const toggleModuleEnabled = (moduleId: number) => {
    const next = updateModuleInProfile(profile, moduleId, (mod) => {
      const allEnabled = mod.subModules.every((sm) => sm.enabled);
      return {
        ...mod,
        subModules: mod.subModules.map((sm) => ({ ...sm, enabled: !allEnabled })),
      };
    });
    onChange(next);
  };

  const toggleSubModuleEnabled = (moduleId: number, subModuleId: number) => {
    const next = updateModuleInProfile(profile, moduleId, (mod) => ({
      ...mod,
      subModules: mod.subModules.map((sm) =>
        sm.subModuleId === subModuleId ? { ...sm, enabled: !sm.enabled } : sm,
      ),
    }));
    onChange(next);
  };

  const updateSubModule = (
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
  };

  return (
    <Stack direction="row" spacing={0} sx={{ minHeight: 400, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
      <Box sx={{ width: 220, flexShrink: 0, borderRight: '1px solid', borderColor: 'divider', p: 2, overflow: 'auto', bgcolor: 'grey.50' }}>
        <Typography variant="subtitle2" sx={{ mb: 1.5 }}>Modules</Typography>
        <Stack spacing={0.5}>
          {profile.map((mod) => {
            const moduleTree = modules.find((m) => m.id === mod.moduleId);
            if (!moduleTree) return null;
            const allEnabled = mod.subModules.every((sm) => sm.enabled);
            const anyEnabled = mod.subModules.some((sm) => sm.enabled);
            return (
              <FormControlLabel
                key={mod.moduleId}
                label={<Typography variant="body2">{moduleTree.name}</Typography>}
                control={
                  <Checkbox
                    size="small"
                    checked={allEnabled}
                    indeterminate={anyEnabled && !allEnabled}
                    onChange={() => toggleModuleEnabled(mod.moduleId)}
                  />
                }
                sx={{ mx: 0 }}
              />
            );
          })}
        </Stack>
      </Box>

      <Box sx={{ flex: 1, p: 2.5, overflow: 'auto' }}>
        {profile.map((mod) => {
          const moduleTree = modules.find((m) => m.id === mod.moduleId);
          if (!moduleTree) return null;
          const anyEnabled = mod.subModules.some((sm) => sm.enabled);
          if (!anyEnabled) return null;

          return (
            <Box key={mod.moduleId} sx={{ mb: 3 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1.5 }}>
                {moduleTree.name}
              </Typography>
              <Stack divider={<Box sx={{ borderTop: '1px solid', borderColor: 'divider', my: 2 }} />}>
                {mod.subModules.map((sm) => {
                  if (!sm.enabled) return null;
                  const smMeta = moduleTree.subModules.find((s) => s.id === sm.subModuleId);
                  if (!smMeta) return null;

                  return (
                    <Box key={sm.subModuleId}>
                      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1.5 }}>
                        <Typography variant="subtitle2">Submodule: {smMeta.name}</Typography>
                        <Chip
                          label="Enabled"
                          color="success"
                          size="small"
                          onDelete={() => toggleSubModuleEnabled(mod.moduleId, sm.subModuleId)}
                        />
                      </Stack>

                      <FormControl component="fieldset" sx={{ mb: 2 }}>
                        <FormLabel component="legend" sx={{ typography: 'body2', fontWeight: 500, mb: 0.5 }}>
                          Access Type
                        </FormLabel>
                        <RadioGroup
                          row
                          value={sm.accessType}
                          onChange={(e) =>
                            updateSubModule(mod.moduleId, sm.subModuleId, (s) => ({
                              ...s,
                              accessType: e.target.value as 'all' | 'selected',
                              projectIds: e.target.value === 'all' ? [] : s.projectIds,
                            }))
                          }
                        >
                          <FormControlLabel value="all" control={<Radio size="small" />} label="All Projects" />
                          <FormControlLabel value="selected" control={<Radio size="small" />} label="Selected Projects" />
                        </RadioGroup>
                      </FormControl>

                      {sm.accessType === 'all' ? (
                        <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                          This Submodule receives access to all current and future projects.
                        </Typography>
                      ) : (
                        <Autocomplete
                          multiple
                          options={allProjects}
                          value={allProjects.filter((p) => sm.projectIds.includes(p.id))}
                          onChange={(_, selected) =>
                            updateSubModule(mod.moduleId, sm.subModuleId, (s) => ({
                              ...s,
                              projectIds: selected.map((p) => p.id),
                            }))
                          }
                          getOptionLabel={(p) => p.name}
                          isOptionEqualToValue={(o, v) => o.id === v.id}
                          renderInput={(params) => (
                            <TextField {...params} variant="outlined" size="small" placeholder="Search Projects" />
                          )}
                          renderTags={(selected, getTagProps) =>
                            selected.map((option, index) => (
                              <Chip
                                label={option.name}
                                size="small"
                                {...getTagProps({ index })}
                                key={option.id}
                              />
                            ))
                          }
                          sx={{ mb: 1 }}
                        />
                      )}
                    </Box>
                  );
                })}
              </Stack>
            </Box>
          );
        })}

        {profile.every((mod) => mod.subModules.every((sm) => !sm.enabled)) && (
          <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 8 }}>
            Select at least one Module from the left panel to configure permissions.
          </Typography>
        )}
      </Box>
    </Stack>
  );
}

import { useMemo, useState, Fragment, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import Checkbox from '@mui/material/Checkbox';
import Collapse from '@mui/material/Collapse';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import CircularProgress from '@mui/material/CircularProgress';

import { useRolePermissionsTree } from 'src/services/hooks/use-permissions';

import { Iconify } from 'src/components/iconify';

interface Props {
  roleId: number;
  onSave?: (actionIds: number[]) => void;
  saving?: boolean;
  editable?: boolean;
}

interface ActionNode {
  id: number;
  code: string;
  name: string;
  label: string | null;
  displayOrder: number;
  selected: boolean;
}

interface ActionGroupNode {
  id: number;
  name: string;
  code: string;
  displayOrder: number;
  actions: ActionNode[];
  selectedCount: number;
  totalCount: number;
}

interface SubModuleNode {
  id: number;
  name: string;
  displayOrder: number;
  hasActions: boolean;
  permissionType: 'ACTION' | 'MODULE';
  actionGroups: ActionGroupNode[];
  selectedCount: number;
  totalCount: number;
}

interface ModuleNode {
  id: number;
  name: string;
  code: string;
  subModules: SubModuleNode[];
  selectedCount: number;
  totalCount: number;
}

export default function PermissionMatrixStep2({ roleId, onSave, saving, editable = true }: Props) {
  const { data: treeData, isLoading } = useRolePermissionsTree(roleId);

  const [selectedActionIds, setSelectedActionIds] = useState<Set<number>>(new Set());
  const [expandedModules, setExpandedModules] = useState<Record<number, boolean>>({});
  const [expandedActionGroups, setExpandedActionGroups] = useState<Record<number, boolean>>({});
  const [selectedSubModuleId, setSelectedSubModuleId] = useState<number | null>(null);
  const [leftSearch, setLeftSearch] = useState('');
  const [rightSearch, setRightSearch] = useState('');

  useEffect(() => {
    if (treeData?.modules) {
      const ids = new Set<number>();
      const collect = (actions: { selected: boolean; id: number }[]) => {
        actions.forEach((a) => { if (a.selected) ids.add(a.id); });
      };
      treeData.modules.forEach((mod: ModuleNode) => {
        mod.subModules.forEach((sm) => {
          sm.actionGroups.forEach((ag) => collect(ag.actions));
        });
      });
      setSelectedActionIds(ids);

      const modExpand: Record<number, boolean> = {};
      treeData.modules.forEach((mod: ModuleNode) => { modExpand[mod.id] = true; });
      setExpandedModules(modExpand);

      setExpandedActionGroups({});

      const firstSm = treeData.modules[0]?.subModules[0];
      if (firstSm) setSelectedSubModuleId(firstSm.id);
    }
  }, [treeData]);

  const toggleAction = useCallback((actionId: number) => {
    setSelectedActionIds((prev) => {
      const next = new Set(prev);
      if (next.has(actionId)) next.delete(actionId);
      else next.add(actionId);
      return next;
    });
  }, []);

  const toggleActionGroup = useCallback((ag: ActionGroupNode) => {
    setSelectedActionIds((prev) => {
      const next = new Set(prev);
      const allSelected = ag.actions.every((a) => next.has(a.id));
      ag.actions.forEach((a) => {
        if (allSelected) next.delete(a.id);
        else next.add(a.id);
      });
      return next;
    });
  }, []);

  const toggleModulePermission = useCallback((sm: SubModuleNode) => {
    if (sm.hasActions) return;
    setSelectedActionIds((prev) => {
      const next = new Set(prev);
      const hasPermission = sm.actionGroups.some((ag) => ag.actions.some((a) => next.has(a.id)));
      if (hasPermission) {
        sm.actionGroups.forEach((ag) => ag.actions.forEach((a) => next.delete(a.id)));
      } else {
        sm.actionGroups.forEach((ag) => ag.actions.forEach((a) => next.add(a.id)));
      }
      return next;
    });
  }, []);

  const toggleSubModule = useCallback((sm: SubModuleNode) => {
    setSelectedActionIds((prev) => {
      const next = new Set(prev);
      if (!sm.hasActions) {
        const hasPermission = sm.actionGroups.some((ag) => ag.actions.some((a) => next.has(a.id)));
        sm.actionGroups.forEach((ag) => ag.actions.forEach((a) => {
          if (hasPermission) next.delete(a.id);
          else next.add(a.id);
        }));
        return next;
      }
      const allSelected = sm.actionGroups.every((ag) => ag.actions.every((a) => next.has(a.id)));
      sm.actionGroups.forEach((ag) => {
        ag.actions.forEach((a) => {
          if (allSelected) next.delete(a.id);
          else next.add(a.id);
        });
      });
      return next;
    });
  }, []);

  const toggleModule = useCallback((mod: ModuleNode) => {
    setSelectedActionIds((prev) => {
      const next = new Set(prev);
      const allSelected = mod.selectedCount > 0 && mod.selectedCount === mod.totalCount;
      mod.subModules.forEach((sm) => {
        sm.actionGroups.forEach((ag) => {
          ag.actions.forEach((a) => {
            if (allSelected) next.delete(a.id);
            else next.add(a.id);
          });
        });
      });
      return next;
    });
  }, []);

  const selectAll = useCallback(() => {
    if (!treeData?.modules || !selectedSubModuleId) return;
    const sm = findSubModule(treeData.modules, selectedSubModuleId);
    if (!sm) return;
    setSelectedActionIds((prev) => {
      const next = new Set(prev);
      sm.actionGroups.forEach((ag) => ag.actions.forEach((a) => next.add(a.id)));
      return next;
    });
  }, [treeData, selectedSubModuleId]);

  const clearAll = useCallback(() => {
    if (!treeData?.modules || !selectedSubModuleId) return;
    const sm = findSubModule(treeData.modules, selectedSubModuleId);
    if (!sm) return;
    setSelectedActionIds((prev) => {
      const next = new Set(prev);
      sm.actionGroups.forEach((ag) => ag.actions.forEach((a) => next.delete(a.id)));
      return next;
    });
  }, [treeData, selectedSubModuleId]);

  const totalSelected = selectedActionIds.size;

  const selectedSubModule = useMemo(() => {
    if (!treeData?.modules || !selectedSubModuleId) return null;
    return findSubModule(treeData.modules, selectedSubModuleId);
  }, [treeData, selectedSubModuleId]);

  const filteredModules = useMemo(() => {
    if (!treeData?.modules) return [];
    if (!leftSearch) return treeData.modules;
    const lower = leftSearch.toLowerCase();
    return treeData.modules
      .map((mod: ModuleNode) => ({
        ...mod,
        subModules: mod.subModules.filter(
          (sm) =>
            sm.name.toLowerCase().includes(lower) ||
            mod.name.toLowerCase().includes(lower),
        ),
      }))
      .filter((mod: ModuleNode) => mod.subModules.length > 0);
  }, [treeData, leftSearch]);

  const filteredActionGroups = useMemo(() => {
    if (!selectedSubModule) return [];
    if (!rightSearch) return selectedSubModule.actionGroups;
    const lower = rightSearch.toLowerCase();
    return selectedSubModule.actionGroups
      .map((ag) => ({
        ...ag,
        actions: ag.actions.filter(
          (a) =>
            a.name.toLowerCase().includes(lower) ||
            ag.name.toLowerCase().includes(lower),
        ),
      }))
      .filter((ag) => ag.actions.length > 0);
  }, [selectedSubModule, rightSearch]);

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <CircularProgress />
      </Box>
    );
  }

  const subModulePermissionEnabled = (sm: SubModuleNode): boolean => {
    if (!sm.hasActions) {
      return sm.actionGroups.some((ag) => ag.actions.some((a) => selectedActionIds.has(a.id)));
    }
    return false;
  };

  return (
    <Stack spacing={0} sx={{ minHeight: 500, borderTop: '1px solid', borderColor: 'divider' }}>
      <Box sx={{ display: 'flex', flex: 1, minHeight: 0 }}>
        {/* LEFT PANEL */}
        <Box
          sx={{
            width: 300,
            flexShrink: 0,
            borderRight: '1px solid',
            borderColor: 'divider',
            display: 'flex',
            flexDirection: 'column',
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
                  <Iconify
                    icon="solar:magnifer-bold"
                    width={16}
                    style={{ marginRight: 6, opacity: 0.5 }}
                  />
                ),
              }}
            />
          </Box>
          <Box sx={{ flex: 1, overflow: 'auto', p: 1 }}>
            {filteredModules.length === 0 ? (
              <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 6 }}>
                {leftSearch ? 'No modules match your search.' : 'No modules found.'}
              </Typography>
            ) : (
              filteredModules.map((mod: ModuleNode) => {
                const isExpanded = expandedModules[mod.id] ?? true;
                const allSelected = mod.selectedCount > 0 && mod.selectedCount === mod.totalCount;
                const someSelected = mod.selectedCount > 0 && !allSelected;
                return (
                  <Fragment key={mod.id}>
                    <Stack
                      direction="row"
                      alignItems="center"
                      spacing={0.5}
                      sx={{
                        py: 0.5,
                        px: 0.5,
                        borderRadius: 1,
                        cursor: 'pointer',
                        bgcolor: isExpanded ? 'action.selected' : 'transparent',
                        '&:hover': { bgcolor: 'action.hover' },
                      }}
                    >
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          setExpandedModules((prev) => ({ ...prev, [mod.id]: !prev[mod.id] }));
                        }}
                        sx={{ color: 'text.secondary', p: 0.25 }}
                      >
                        <Iconify
                          icon={isExpanded ? 'solar:alt-arrow-down-bold' : 'solar:alt-arrow-right-bold'}
                          width={14}
                        />
                      </IconButton>
                      <Checkbox
                        size="small"
                        checked={allSelected}
                        indeterminate={someSelected && !allSelected}
                        onChange={() => editable && toggleModule(mod)}
                        disabled={!editable}
                        onClick={(e) => e.stopPropagation()}
                        sx={{ p: 0.25 }}
                      />
                      <Typography variant="body2" fontWeight={600} noWrap sx={{ flex: 1 }}>
                        {mod.name}
                      </Typography>
                      <Tooltip title={`${mod.selectedCount} of ${mod.totalCount} permissions selected`}>
                        <Chip
                          label={`${mod.selectedCount}/${mod.totalCount}`}
                          size="small"
                          color={allSelected ? 'success' : someSelected ? 'primary' : 'default'}
                          variant={someSelected || allSelected ? 'filled' : 'outlined'}
                          sx={{ height: 20, '& .MuiChip-label': { px: 0.5, fontSize: 11, fontWeight: 600 } }}
                        />
                      </Tooltip>
                    </Stack>
                    <Collapse in={isExpanded}>
                      {mod.subModules.map((sm: SubModuleNode) => {
                        const isActive = selectedSubModuleId === sm.id;
                        const smAllSelected =
                          sm.totalCount > 0 && sm.selectedCount === sm.totalCount;
                        const smSomeSelected = sm.selectedCount > 0 && !smAllSelected;
                        const smAnySelected = sm.hasActions ? smSomeSelected : subModulePermissionEnabled(sm);
                        const smFullySelected = sm.hasActions ? smAllSelected : subModulePermissionEnabled(sm);
                        return (
                          <Stack
                            key={sm.id}
                            direction="row"
                            alignItems="center"
                            spacing={0.5}
                            sx={{
                              py: 0.25,
                              px: 0.5,
                              ml: 2,
                              borderRadius: 1,
                              cursor: 'pointer',
                              bgcolor: isActive ? 'primary.lighter' : 'transparent',
                              borderLeft: '2px solid',
                              borderColor: isActive ? 'primary.main' : 'transparent',
                              '&:hover': {
                                bgcolor: isActive ? 'primary.lighter' : 'action.hover',
                              },
                            }}
                          >
                            <Checkbox
                              size="small"
                              checked={smFullySelected}
                              indeterminate={sm.hasActions && smAnySelected && !smFullySelected}
                              onChange={() => editable && toggleSubModule(sm)}
                              disabled={!editable}
                              onClick={(e) => e.stopPropagation()}
                              sx={{ p: 0.25 }}
                            />
                            <Typography
                              variant="body2"
                              noWrap
                              sx={{
                                flex: 1,
                                fontWeight: isActive ? 600 : 400,
                                fontSize: '0.8125rem',
                                cursor: 'pointer',
                              }}
                              onClick={() => setSelectedSubModuleId(sm.id)}
                            >
                              {sm.name}
                            </Typography>
                            {sm.hasActions && (
                              <Chip
                                label={`${sm.selectedCount}/${sm.totalCount}`}
                                size="small"
                                color={
                                  smAllSelected
                                    ? 'success'
                                    : smSomeSelected
                                      ? 'primary'
                                      : 'default'
                                }
                                variant={smSomeSelected || smAllSelected ? 'filled' : 'outlined'}
                                sx={{
                                  height: 20,
                                  '& .MuiChip-label': { px: 0.5, fontSize: 11 },
                                }}
                              />
                            )}
                          </Stack>
                        );
                      })}
                    </Collapse>
                  </Fragment>);
              })
            )}
          </Box>
        </Box>

        {/* RIGHT PANEL */}
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
          {/* Toolbar */}
          <Stack
            direction="row"
            alignItems="center"
            spacing={1.5}
            sx={{
              px: 2.5,
              py: 1.25,
              borderBottom: '1px solid',
              borderColor: 'divider',
              flexWrap: 'wrap',
            }}
          >
            <Typography variant="subtitle2" noWrap sx={{ minWidth: 120 }}>
              {selectedSubModule?.name || 'Permissions'}
            </Typography>

            <TextField
              size="small"
              placeholder="Search permissions..."
              value={rightSearch}
              onChange={(e) => setRightSearch(e.target.value)}
              sx={{ minWidth: 220 }}
              InputProps={{
                startAdornment: (
                  <Iconify
                    icon="solar:magnifer-bold"
                    width={16}
                    style={{ marginRight: 6, opacity: 0.5 }}
                  />
                ),
              }}
            />

            <Chip
              label={`${totalSelected} Permissions Selected`}
              color="primary"
              size="small"
              variant="outlined"
              sx={{ fontWeight: 600 }}
            />

            <Box sx={{ flex: 1 }} />

            {editable && selectedSubModule && (
              <>
                <Button size="small" variant="outlined" onClick={selectAll}>
                  Select All
                </Button>
                <Button size="small" variant="outlined" color="error" onClick={clearAll}>
                  Clear All
                </Button>
              </>
            )}
          </Stack>

          {/* Content */}
          <Box sx={{ flex: 1, overflow: 'auto', p: 2.5 }}>
            {!selectedSubModule && (
              <Box sx={{ textAlign: 'center', py: 10 }}>
                <Iconify
                  icon="solar:hand-point-left-bold"
                  width={40}
                  sx={{ color: 'text.disabled', mb: 1.5 }}
                />
                <Typography variant="body2" color="text.secondary">
                  Select a Module and Submodule from the left panel to configure permissions. Submodules without configurable actions can be enabled directly.
                </Typography>
              </Box>
            )}

            {selectedSubModule && !selectedSubModule.hasActions && (
              <Paper variant="outlined" sx={{ p: 2.5, maxWidth: 480, mx: 'auto', mt: 3, borderRadius: 2 }}>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  This submodule does not contain configurable actions. Selecting this permission grants access to the entire submodule.
                </Typography>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <Checkbox
                    size="small"
                    checked={subModulePermissionEnabled(selectedSubModule)}
                    onChange={() => toggleModulePermission(selectedSubModule)}
                    disabled={!editable}
                    sx={{ p: 0.25 }}
                  />
                  <Typography variant="body2" fontWeight={600}>
                    Enable {selectedSubModule.name}
                  </Typography>
                </Stack>
              </Paper>
            )}

            {selectedSubModule && selectedSubModule.hasActions && (
              <>
                {filteredActionGroups.length === 0 ? (
                  <Box sx={{ textAlign: 'center', py: 8 }}>
                    <Iconify
                      icon="solar:search-cross-bold"
                      width={36}
                      sx={{ color: 'text.disabled', mb: 1 }}
                    />
                    <Typography variant="body2" color="text.secondary">
                      {rightSearch
                        ? 'No permissions match your search.'
                        : 'No action groups found for this submodule.'}
                    </Typography>
                  </Box>
                ) : (
                  <Grid container spacing={2}>
                    {filteredActionGroups.map((ag) => {
                      const isExpanded = expandedActionGroups[ag.id] ?? true;
                      const agAllSelected = ag.actions.every((a) => selectedActionIds.has(a.id));
                      const agSomeSelected = ag.actions.some((a) => selectedActionIds.has(a.id));
                      return (
                        <Grid item xs={12} sm={6} key={ag.id}>
                          <Paper
                            variant="outlined"
                            sx={{
                              borderRadius: 1.5,
                              borderColor: agAllSelected
                                ? 'success.main'
                                : agSomeSelected
                                  ? 'primary.main'
                                  : 'divider',
                              overflow: 'hidden',
                            }}
                          >
                            <Stack
                              direction="row"
                              alignItems="center"
                              spacing={0.75}
                              sx={{
                                px: 1.5,
                                py: 1,
                                bgcolor: agAllSelected
                                  ? 'success.lighter'
                                  : agSomeSelected
                                    ? 'primary.lighter'
                                    : 'grey.50',
                                borderBottom: '1px solid',
                                borderColor: 'divider',
                              }}
                            >
                              <IconButton
                                size="small"
                                onClick={() =>
                                  setExpandedActionGroups((prev) => ({
                                    ...prev,
                                    [ag.id]: !prev[ag.id],
                                  }))
                                }
                                sx={{ color: 'text.secondary' }}
                              >
                                <Iconify
                                  icon={
                                    isExpanded
                                      ? 'solar:alt-arrow-down-bold'
                                      : 'solar:alt-arrow-right-bold'
                                  }
                                  width={14}
                                />
                              </IconButton>
                              <Checkbox
                                size="small"
                                checked={agAllSelected}
                                indeterminate={agSomeSelected && !agAllSelected}
                                onChange={() => editable && toggleActionGroup(ag)}
                                disabled={!editable}
                                sx={{ p: 0.25 }}
                              />
                              <Typography variant="subtitle2" sx={{ flex: 1, fontSize: '0.8125rem' }}>
                                {ag.name}
                              </Typography>
                              <Chip
                                label={`${ag.selectedCount}/${ag.totalCount} Selected`}
                                size="small"
                                color={agAllSelected ? 'success' : agSomeSelected ? 'primary' : 'default'}
                                variant="outlined"
                                sx={{
                                  height: 20,
                                  '& .MuiChip-label': { px: 0.75, fontSize: 10, fontWeight: 600 },
                                }}
                              />
                            </Stack>
                            <Collapse in={isExpanded}>
                              <Box sx={{ px: 1.5, py: 0.75 }}>
                                {ag.actions.map((a) => (
                                  <Stack
                                    key={a.id}
                                    direction="row"
                                    alignItems="center"
                                    spacing={0.5}
                                    sx={{
                                      py: 0.25,
                                      px: 0.5,
                                      borderRadius: 0.5,
                                      '&:hover': { bgcolor: 'action.hover' },
                                    }}
                                  >
                                    <Checkbox
                                      size="small"
                                      checked={selectedActionIds.has(a.id)}
                                      onChange={() => editable && toggleAction(a.id)}
                                      disabled={!editable}
                                      sx={{ p: 0.25 }}
                                    />
                                    <Typography variant="body2" sx={{ fontSize: '0.8125rem' }}>
                                      {a.name}
                                    </Typography>
                                  </Stack>
                                ))}
                              </Box>
                            </Collapse>
                          </Paper>
                        </Grid>
                      );
                    })}
                  </Grid>
                )}
              </>
            )}
          </Box>
        </Box>
      </Box>

      {editable && (
        <Stack
          direction="row"
          justifyContent="flex-end"
          alignItems="center"
          spacing={2}
          sx={{ p: 2, borderTop: '1px solid', borderColor: 'divider', bgcolor: 'grey.50' }}
        >
          <Typography variant="body2" color="text.secondary">
            {totalSelected} permission{totalSelected !== 1 ? 's' : ''} selected
          </Typography>
          <Button
            variant="contained"
            onClick={() => onSave!(Array.from(selectedActionIds))}
            disabled={saving}
            sx={{ minWidth: 140 }}
          >
            {saving ? 'Saving...' : 'Save Permissions'}
          </Button>
        </Stack>
      )}
    </Stack>
  );
}

function findSubModule(modules: ModuleNode[], subModuleId: number): SubModuleNode | null {
  let result: SubModuleNode | null = null;
  modules.some((mod) =>
    mod.subModules.some((sm) => {
      if (sm.id === subModuleId) {
        result = sm;
        return true;
      }
      return false;
    }),
  );
  return result;
}

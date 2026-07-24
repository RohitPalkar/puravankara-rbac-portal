import { useRef, useMemo, Fragment, useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import Collapse from '@mui/material/Collapse';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
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

function computeSubModuleState(sm: SubModuleNode, selectedIds: Set<number>) {
  const allActionIds = sm.actionGroups.flatMap((ag) => ag.actions.map((a) => a.id));
  if (allActionIds.length === 0) {
    const enabled = sm.actionGroups.some((ag) => ag.actions.some((a) => selectedIds.has(a.id)));
    return { anySelected: enabled, allSelected: enabled };
  }
  const count = allActionIds.filter((id) => selectedIds.has(id)).length;
  return {
    anySelected: count > 0,
    allSelected: count === allActionIds.length,
  };
}

function computeModuleState(mod: ModuleNode, selectedIds: Set<number>) {
  const allIds = new Set<number>();
  mod.subModules.forEach((sm) => {
    sm.actionGroups.forEach((ag) => {
      ag.actions.forEach((a) => allIds.add(a.id));
    });
  });
  if (allIds.size === 0) return { anySelected: false, allSelected: false, count: 0, total: 0 };
  const count = [...allIds].filter((id) => selectedIds.has(id)).length;
  return {
    anySelected: count > 0,
    allSelected: count === allIds.size,
    count,
    total: allIds.size,
  };
}

export default function PermissionMatrixStep2({ roleId, onSave, saving, editable = true }: Props) {
  const { data: treeData, isLoading } = useRolePermissionsTree(roleId);

  const [selectedActionIds, setSelectedActionIds] = useState<Set<number>>(new Set());
  const [expandedModules, setExpandedModules] = useState<Record<number, boolean>>({});

  const [selectedSubModuleId, setSelectedSubModuleId] = useState<number | null>(null);
  const [leftSearch, setLeftSearch] = useState('');
  const [rightSearch, setRightSearch] = useState('');

  const initialized = useRef(false);

  useEffect(() => {
    if (treeData?.modules && !initialized.current) {
      initialized.current = true;
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
      if (ag.actions.length === 0) return prev;
      const allSelected = ag.actions.every((a) => next.has(a.id));
      ag.actions.forEach((a) => {
        if (allSelected) next.delete(a.id);
        else next.add(a.id);
      });
      return next;
    });
  }, []);

  const toggleSubModule = useCallback((sm: SubModuleNode) => {
    setSelectedActionIds((prev) => {
      const next = new Set(prev);
      const allActionIds = sm.actionGroups.flatMap((ag) => ag.actions.map((a) => a.id));
      if (allActionIds.length === 0) return prev;
      const allSelected = allActionIds.every((id) => next.has(id));
      allActionIds.forEach((id) => {
        if (allSelected) next.delete(id);
        else next.add(id);
      });
      return next;
    });
  }, []);

  const toggleModule = useCallback((mod: ModuleNode) => {
    setSelectedActionIds((prev) => {
      const next = new Set(prev);
      const allActionIds = new Set<number>();
      mod.subModules.forEach((sm) => {
        sm.actionGroups.forEach((ag) => {
          ag.actions.forEach((a) => allActionIds.add(a.id));
        });
      });
      if (allActionIds.size === 0) return prev;
      const allSelected = [...allActionIds].every((id) => next.has(id));
      allActionIds.forEach((id) => {
        if (allSelected) next.delete(id);
        else next.add(id);
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

  return (
    <Stack spacing={0} sx={{ minHeight: 500, borderTop: '1px solid', borderColor: 'divider' }}>
      <Box sx={{ display: 'flex', flex: 1, minHeight: 0 }}>
        {/* LEFT PANEL */}
        <Box
          sx={{
            width: 320,
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
          <Box sx={{ flex: 1, overflow: 'auto', px: 1, py: 0.5 }}>
            {filteredModules.length === 0 ? (
              <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 6 }}>
                {leftSearch ? 'No modules match your search.' : 'No modules found.'}
              </Typography>
            ) : (
              filteredModules.map((mod: ModuleNode) => {
                const isExpanded = expandedModules[mod.id] ?? true;
                const modState = computeModuleState(mod, selectedActionIds);
                return (
                  <Fragment key={mod.id}>
                    <Stack
                      direction="row"
                      alignItems="center"
                      spacing={0.5}
                      sx={{
                        py: 1,
                        px: 1,
                        borderRadius: 1,
                        cursor: 'pointer',
                        '&:hover': { bgcolor: 'action.hover' },
                      }}
                      onClick={() => setExpandedModules((prev) => ({ ...prev, [mod.id]: !prev[mod.id] }))}
                    >
                      <Box
                        component="span"
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          width: 20,
                          height: 20,
                          color: 'text.disabled',
                          flexShrink: 0,
                        }}
                      >
                        <Iconify
                          icon={isExpanded ? 'solar:alt-arrow-down-linear' : 'solar:alt-arrow-right-linear'}
                          width={14}
                        />
                      </Box>
                      <Checkbox
                        size="small"
                        checked={modState.allSelected}
                        indeterminate={modState.anySelected && !modState.allSelected}
                        onChange={() => editable && toggleModule(mod)}
                        disabled={!editable}
                        onClick={(e) => e.stopPropagation()}
                        sx={{ p: 0.25 }}
                      />
                      <Typography variant="body2" fontWeight={600} noWrap sx={{ flex: 1, fontSize: '0.8125rem' }}>
                        {mod.name}
                      </Typography>
                    </Stack>
                    <Collapse in={isExpanded}>
                      {mod.subModules.map((sm: SubModuleNode) => {
                        const isActive = selectedSubModuleId === sm.id;
                        const smState = computeSubModuleState(sm, selectedActionIds);
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
                              '&:hover': {
                                bgcolor: isActive ? 'primary.lighter' : 'action.hover',
                              },
                            }}
                          >
                            <Checkbox
                              size="small"
                              checked={smState.allSelected}
                              indeterminate={sm.hasActions && smState.anySelected && !smState.allSelected}
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
            spacing={1}
            sx={{
              px: 2,
              py: 1,
              borderBottom: '1px solid',
              borderColor: 'divider',
              flexWrap: 'wrap',
              minHeight: 52,
            }}
          >
            <Typography variant="subtitle2" noWrap sx={{ minWidth: 100, fontWeight: 600 }}>
              {selectedSubModule?.name || 'Permissions'}
            </Typography>

            <TextField
              size="small"
              placeholder="Search permissions..."
              value={rightSearch}
              onChange={(e) => setRightSearch(e.target.value)}
              sx={{ minWidth: 200 }}
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

            <Box sx={{ flex: 1 }} />

            {editable && selectedSubModule && selectedSubModule.hasActions && (
              <>
                <Button size="small" variant="outlined" onClick={selectAll} sx={{ minWidth: 80 }}>
                  Select All
                </Button>
                <Button size="small" variant="outlined" color="error" onClick={clearAll} sx={{ minWidth: 80 }}>
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
                <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 440, mx: 'auto' }}>
                  Select a Module and Submodule from the left panel to configure permissions.
                </Typography>
              </Box>
            )}

            {selectedSubModule && !selectedSubModule.hasActions && (
              <Paper variant="outlined" sx={{ p: 3, maxWidth: 520, mx: 'auto', mt: 4, borderRadius: 2, textAlign: 'center' }}>
                <Iconify icon="solar:lock-bold" width={32} sx={{ color: 'text.disabled', mb: 1.5 }} />
                <Typography variant="subtitle1" gutterBottom fontWeight={600}>
                  {selectedSubModule.name}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  This submodule does not contain configurable actions.
                </Typography>
                <Checkbox
                  size="small"
                  checked={computeSubModuleState(selectedSubModule, selectedActionIds).allSelected}
                  onChange={() => editable && toggleSubModule(selectedSubModule)}
                  disabled={!editable}
                />
                <Typography variant="body2" component="span" sx={{ ml: 1 }}>
                  Enable {selectedSubModule.name}
                </Typography>
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
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                    {filteredActionGroups.map((ag) => {
                      const agAllSelected = ag.actions.every((a) => selectedActionIds.has(a.id));
                      const agSomeSelected = ag.actions.some((a) => selectedActionIds.has(a.id));
                      return (
                        <Paper
                          variant="outlined"
                          key={ag.id}
                          sx={{
                            borderRadius: 1.5,
                            borderColor: 'divider',
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
                              bgcolor: 'grey.50',
                              borderBottom: '1px solid',
                              borderColor: 'divider',
                            }}
                          >
                            <Checkbox
                              size="small"
                              checked={agAllSelected}
                              indeterminate={agSomeSelected && !agAllSelected}
                              onChange={() => editable && toggleActionGroup(ag)}
                              disabled={!editable}
                              sx={{ p: 0.25 }}
                            />
                            <Typography variant="subtitle2" sx={{ flex: 1, fontSize: '0.8125rem', fontWeight: 600 }}>
                              {ag.name}
                            </Typography>
                          </Stack>
                          <Box sx={{ px: 1.5, py: 1 }}>
                            <Grid container spacing={0.5}>
                              {ag.actions.map((a) => (
                                <Grid item xs={12} sm={6} key={a.id}>
                                  <Stack
                                    direction="row"
                                    alignItems="center"
                                    spacing={0.5}
                                    sx={{
                                      py: 0.25,
                                      px: 0.5,
                                      borderRadius: 0.5,
                                      '&:hover': { bgcolor: 'action.hover' },
                                      cursor: 'pointer',
                                    }}
                                    onClick={() => editable && toggleAction(a.id)}
                                  >
                                    <Checkbox
                                      size="small"
                                      checked={selectedActionIds.has(a.id)}
                                      disabled={!editable}
                                      sx={{ p: 0.25 }}
                                    />
                                    <Typography variant="body2" sx={{ fontSize: '0.8125rem' }}>
                                      {a.name}
                                    </Typography>
                                  </Stack>
                                </Grid>
                              ))}
                            </Grid>
                          </Box>
                        </Paper>
                      );
                    })}
                  </Box>
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
          sx={{ px: 2.5, py: 1.5, borderTop: '1px solid', borderColor: 'divider', bgcolor: 'grey.50' }}
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

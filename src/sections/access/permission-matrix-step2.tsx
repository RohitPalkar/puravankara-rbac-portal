import { useState, useMemo, useCallback, useEffect, Fragment } from 'react';

import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Checkbox from '@mui/material/Checkbox';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Collapse from '@mui/material/Collapse';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';

import { Iconify } from 'src/components/iconify';
import { useRolePermissionsTree } from 'src/services/hooks/use-permissions';

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
      const agExpand: Record<number, boolean> = {};
      treeData.modules.forEach((mod: ModuleNode) => { modExpand[mod.id] = true; });
      setExpandedModules(modExpand);
      setExpandedActionGroups(agExpand);

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

  const expandAllAG = useCallback(() => {
    if (!treeData?.modules || !selectedSubModuleId) return;
    const sm = findSubModule(treeData.modules, selectedSubModuleId);
    if (!sm) return;
    setExpandedActionGroups((prev) => {
      const next = { ...prev };
      sm.actionGroups.forEach((ag) => { next[ag.id] = true; });
      return next;
    });
  }, [treeData, selectedSubModuleId]);

  const collapseAllAG = useCallback(() => {
    if (!treeData?.modules || !selectedSubModuleId) return;
    const sm = findSubModule(treeData.modules, selectedSubModuleId);
    if (!sm) return;
    setExpandedActionGroups((prev) => {
      const next = { ...prev };
      sm.actionGroups.forEach((ag) => { next[ag.id] = false; });
      return next;
    });
  }, [treeData, selectedSubModuleId]);

  const totalSelected = selectedActionIds.size;

  const selectedSubModule = useMemo(() => {
    if (!treeData?.modules || !selectedSubModuleId) return null;
    return findSubModule(treeData.modules, selectedSubModuleId);
  }, [treeData, selectedSubModuleId]);

  const filteredSubModules = useMemo(() => {
    if (!treeData?.modules) return [];
    if (!leftSearch) return treeData.modules;
    const lower = leftSearch.toLowerCase();
    return treeData.modules
      .map((mod: ModuleNode) => ({
        ...mod,
        subModules: mod.subModules.filter(
          (sm) => sm.name.toLowerCase().includes(lower) || mod.name.toLowerCase().includes(lower),
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
          (a) => a.name.toLowerCase().includes(lower) || ag.name.toLowerCase().includes(lower),
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
        <Box sx={{ width: 280, flexShrink: 0, borderRight: '1px solid', borderColor: 'divider', display: 'flex', flexDirection: 'column' }}>
          <Box sx={{ p: 1.5, borderBottom: '1px solid', borderColor: 'divider' }}>
            <TextField
              fullWidth
              size="small"
              placeholder="Search Modules"
              value={leftSearch}
              onChange={(e) => setLeftSearch(e.target.value)}
              InputProps={{
                startAdornment: <Iconify icon="solar:magnifer-bold" width={16} style={{ marginRight: 6, opacity: 0.5 }} />,
              }}
            />
          </Box>
          <Box sx={{ flex: 1, overflow: 'auto', p: 1 }}>
            {filteredSubModules.map((mod: ModuleNode) => {
              const isExpanded = expandedModules[mod.id] ?? true;
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
                      bgcolor: isExpanded ? 'action.hover' : 'transparent',
                      '&:hover': { bgcolor: 'action.hover' },
                    }}
                    onClick={() => setExpandedModules((prev) => ({ ...prev, [mod.id]: !prev[mod.id] }))}
                  >
                    <Iconify icon={isExpanded ? 'solar:alt-arrow-down-bold' : 'solar:alt-arrow-right-bold'} width={14} />
                    <Typography variant="body2" fontWeight={600} sx={{ flex: 1 }}>{mod.name}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {mod.selectedCount}/{mod.totalCount}
                    </Typography>
                  </Stack>
                  <Collapse in={isExpanded}>
                    {mod.subModules.map((sm: SubModuleNode) => {
                      const isActive = selectedSubModuleId === sm.id;
                      return (
                        <Stack
                          key={sm.id}
                          direction="row"
                          alignItems="center"
                          spacing={1}
                          sx={{
                            py: 0.5,
                            px: 1,
                            ml: 2,
                            borderRadius: 1,
                            cursor: 'pointer',
                            bgcolor: isActive ? 'primary.lighter' : 'transparent',
                            '&:hover': { bgcolor: isActive ? 'primary.lighter' : 'action.hover' },
                          }}
                          onClick={() => setSelectedSubModuleId(sm.id)}
                        >
                          <Typography variant="body2" sx={{ flex: 1, fontWeight: isActive ? 600 : 400 }}>
                            {sm.name}
                          </Typography>
                          <Chip label={`${sm.selectedCount}/${sm.totalCount}`} size="small" color={sm.selectedCount > 0 ? 'primary' : 'default'} variant="outlined" sx={{ height: 20, '& .MuiChip-label': { px: 0.5, fontSize: 11 } }} />
                        </Stack>
                      );
                    })}
                  </Collapse>
                </Fragment>
              );
            })}
          </Box>
        </Box>

        {/* RIGHT PANEL */}
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
          {/* Toolbar */}
          <Stack direction="row" alignItems="center" spacing={1.5} sx={{ px: 2, py: 1, borderBottom: '1px solid', borderColor: 'divider', flexWrap: 'wrap' }}>
            <TextField
              size="small"
              placeholder="Search Permissions"
              value={rightSearch}
              onChange={(e) => setRightSearch(e.target.value)}
              sx={{ minWidth: 240 }}
              InputProps={{
                startAdornment: <Iconify icon="solar:magnifer-bold" width={16} style={{ marginRight: 6, opacity: 0.5 }} />,
              }}
            />
            <Chip label={`${totalSelected} Permissions Selected`} color="primary" size="small" variant="outlined" />
            <Box sx={{ flex: 1 }} />
            {editable && (
              <>
                <Button size="small" onClick={selectAll}>Select All</Button>
                <Button size="small" onClick={clearAll}>Clear All</Button>
                <Button size="small" onClick={expandAllAG}>Expand All</Button>
                <Button size="small" onClick={collapseAllAG}>Collapse All</Button>
              </>
            )}
          </Stack>

          {/* Content */}
          <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
            {selectedSubModule ? (
              filteredActionGroups.map((ag) => {
                const isExpanded = expandedActionGroups[ag.id] ?? false;
                const agAllSelected = ag.actions.every((a) => selectedActionIds.has(a.id));
                const agSomeSelected = ag.actions.some((a) => selectedActionIds.has(a.id));
                return (
                  <Box key={ag.id} sx={{ mb: 2 }}>
                    <Stack direction="row" alignItems="center" spacing={0.5} sx={{ mb: 0.5 }}>
                      <IconButton size="small" onClick={() => setExpandedActionGroups((prev) => ({ ...prev, [ag.id]: !prev[ag.id] }))}>
                        <Iconify icon={isExpanded ? 'solar:alt-arrow-down-bold' : 'solar:alt-arrow-right-bold'} width={14} />
                      </IconButton>
                      <Checkbox
                        size="small"
                        checked={agAllSelected}
                        indeterminate={agSomeSelected && !agAllSelected}
                        onChange={() => editable && toggleActionGroup(ag)}
                        disabled={!editable}
                      />
                      <Typography variant="subtitle2">{ag.name}</Typography>
                    </Stack>
                    <Collapse in={isExpanded}>
                      <Box sx={{ ml: 7 }}>
                        {ag.actions.map((a) => (
                          <Stack key={a.id} direction="row" alignItems="center" spacing={0.5}>
                            <Checkbox
                              size="small"
                              checked={selectedActionIds.has(a.id)}
                              onChange={() => editable && toggleAction(a.id)}
                              disabled={!editable}
                            />
                            <Typography variant="body2">{a.name}</Typography>
                          </Stack>
                        ))}
                      </Box>
                    </Collapse>
                  </Box>
                );
              })
            ) : (
              <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 8 }}>
                Select a Submodule from the left panel to configure permissions.
              </Typography>
            )}
          </Box>
        </Box>
      </Box>

      {editable && (
        <Stack direction="row" justifyContent="flex-end" sx={{ p: 2, borderTop: '1px solid', borderColor: 'divider' }}>
          <Button variant="contained" onClick={() => onSave!(Array.from(selectedActionIds))} disabled={saving}>
            {saving ? 'Saving...' : 'Save Permissions'}
          </Button>
        </Stack>
      )}
    </Stack>
  );
}

function findSubModule(modules: ModuleNode[], subModuleId: number): SubModuleNode | null {
  let result: SubModuleNode | null = null;
  modules.some((mod) => mod.subModules.some((sm) => { if (sm.id === subModuleId) { result = sm; return true; } return false; }));
  return result;
}

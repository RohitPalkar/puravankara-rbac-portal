import type { Module, Action, SubModule } from 'src/types';

import { useState } from 'react';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Checkbox from '@mui/material/Checkbox';
import Collapse from '@mui/material/Collapse';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import FormControlLabel from '@mui/material/FormControlLabel';

import { Iconify } from 'src/components/iconify';

export type PermissionSelection = {
  moduleId: string;
  subModuleIds: string[];
  actionIds: string[];
};

type Props = {
  modules: Module[];
  subModules: SubModule[];
  actions: Action[];
  selection: PermissionSelection[];
  onChange: (selection: PermissionSelection[]) => void;
};

function getModuleSelection(
  selection: PermissionSelection[],
  moduleId: string,
): PermissionSelection | undefined {
  return selection.find((s) => s.moduleId === moduleId);
}

export function PermissionTree({ modules, subModules, actions, selection, onChange }: Props) {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const subModulesForModule = (moduleId: string) => subModules.filter((sm) => sm.moduleId === moduleId);
  const actionsForSubModule = (subModuleId: string) => actions.filter((a) => a.subModuleId === subModuleId);

  const isModuleSelected = (moduleId: string) => {
    const sms = subModulesForModule(moduleId);
    if (sms.length === 0) return false;
    return sms.every((sm) => {
      const acts = actionsForSubModule(sm.id);
      return acts.every((a) => {
        const modSel = getModuleSelection(selection, moduleId);
        return modSel?.actionIds.includes(a.id);
      });
    });
  };

  const isSubModuleSelected = (moduleId: string, subModuleId: string) => {
    const acts = actionsForSubModule(subModuleId);
    if (acts.length === 0) return false;
    const modSel = getModuleSelection(selection, moduleId);
    return acts.every((a) => modSel?.actionIds.includes(a.id));
  };

  const isActionSelected = (moduleId: string, actionId: string) => {
    const modSel = getModuleSelection(selection, moduleId);
    return modSel?.actionIds.includes(actionId) ?? false;
  };

  const toggleModule = (moduleId: string) => {
    const sms = subModulesForModule(moduleId);
    const allActionIds = sms.flatMap((sm) => actionsForSubModule(sm.id).map((a) => a.id));
    const existing = getModuleSelection(selection, moduleId);
    const isSelected = existing ? allActionIds.every((id) => existing.actionIds.includes(id)) : false;

    const next = selection.filter((s) => s.moduleId !== moduleId);
    if (!isSelected) {
      next.push({ moduleId, subModuleIds: sms.map((sm) => sm.id), actionIds: allActionIds });
    }
    onChange(next);
  };

  const toggleSubModule = (moduleId: string, subModuleId: string) => {
    const acts = actionsForSubModule(subModuleId);
    const existing = getModuleSelection(selection, moduleId);
    const isSelected = existing ? acts.every((a) => existing.actionIds.includes(a.id)) : false;

    const next = selection.filter((s) => s.moduleId !== moduleId);
    if (isSelected) {
      const remainingActions = existing!.actionIds.filter((id) => !acts.some((a) => a.id === id));
      if (remainingActions.length > 0) {
        next.push({ moduleId, subModuleIds: existing!.subModuleIds.filter((id) => id !== subModuleId), actionIds: remainingActions });
      }
    } else {
      const newSubModuleIds = [...(existing?.subModuleIds ?? []), subModuleId];
      const newActionIds = [...(existing?.actionIds ?? []), ...acts.map((a) => a.id)];
      next.push({ moduleId, subModuleIds: newSubModuleIds, actionIds: newActionIds });
    }
    onChange(next);
  };

  const toggleAction = (moduleId: string, actionId: string) => {
    const existing = getModuleSelection(selection, moduleId);
    const isSelected = existing?.actionIds.includes(actionId) ?? false;

    const next = selection.filter((s) => s.moduleId !== moduleId);
    if (isSelected && existing) {
      const newActions = existing.actionIds.filter((id) => id !== actionId);
      if (newActions.length > 0) {
        next.push({ ...existing, actionIds: newActions });
      }
    } else {
      const newActionIds = [...(existing?.actionIds ?? []), actionId];
      const action = actions.find((a) => a.id === actionId);
      const newSubModuleIds = action && !(existing?.subModuleIds.includes(action.subModuleId))
        ? [...(existing?.subModuleIds ?? []), action.subModuleId]
        : (existing?.subModuleIds ?? []);
      next.push({ moduleId, subModuleIds: newSubModuleIds, actionIds: newActionIds });
    }
    onChange(next);
  };

  const toggleExpand = (moduleId: string) => {
    setExpanded((prev) => ({ ...prev, [moduleId]: !prev[moduleId] }));
  };

  return (
    <Stack spacing={0.5}>
      {modules.map((mod) => {
        const sms = subModulesForModule(mod.id);
        if (sms.length === 0) return null;
        const modSel = getModuleSelection(selection, mod.id);
        const checked = isModuleSelected(mod.id);
        const indeterminate = modSel !== undefined && !checked;

        return (
          <Box key={mod.id} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
            <Stack direction="row" alignItems="center" sx={{ px: 1, py: 0.5, bgcolor: 'action.hover' }}>
              <IconButton size="small" onClick={() => toggleExpand(mod.id)}>
                <Iconify icon={expanded[mod.id] ? 'solar:alt-arrow-down-bold' : 'solar:alt-arrow-right-bold'} width={16} />
              </IconButton>
              <FormControlLabel
                label={<Typography variant="body2" sx={{ fontWeight: 600 }}>{mod.name}</Typography>}
                control={<Checkbox size="small" checked={checked} indeterminate={indeterminate} onChange={() => toggleModule(mod.id)} />}
                sx={{ mx: 0 }}
              />
            </Stack>
            <Collapse in={expanded[mod.id]}>
              <Box sx={{ pl: 4, pr: 2, py: 0.5 }}>
                {sms.map((sm) => {
                  const acts = actionsForSubModule(sm.id);
                  if (acts.length === 0) return null;
                  const smChecked = isSubModuleSelected(mod.id, sm.id);
                  const smIndeterminate = modSel?.subModuleIds.includes(sm.id) && !smChecked;

                  return (
                    <Box key={sm.id} sx={{ mb: 0.5 }}>
                      <FormControlLabel
                        label={<Typography variant="caption" sx={{ fontWeight: 500 }}>{sm.name}</Typography>}
                        control={<Checkbox size="small" checked={smChecked} indeterminate={smIndeterminate} onChange={() => toggleSubModule(mod.id, sm.id)} />}
                        sx={{ mx: 0 }}
                      />
                      <Stack direction="row" spacing={0.5} sx={{ pl: 4, flexWrap: 'wrap' }}>
                        {acts.map((act) => (
                          <FormControlLabel
                            key={act.id}
                            label={<Typography variant="caption">{act.name}</Typography>}
                            control={<Checkbox size="small" checked={isActionSelected(mod.id, act.id)} onChange={() => toggleAction(mod.id, act.id)} />}
                            sx={{ mx: 0 }}
                          />
                        ))}
                      </Stack>
                    </Box>
                  );
                })}
              </Box>
            </Collapse>
          </Box>
        );
      })}
    </Stack>
  );
}
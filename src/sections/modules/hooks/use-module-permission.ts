import { useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { useMyPermissions } from 'src/services/hooks/use-permissions';
import { useModuleTree } from 'src/services/hooks/use-product-catalog';
import type { ModulePermissions } from 'src/services/types/auth';

function slugify(text: string): string {
  return text.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
}

export function useModulePermission(actionCode?: string) {
  const { moduleCode } = useParams<{ moduleCode: string }>();
  const { data: myPermissions, isLoading: permissionsLoading } = useMyPermissions();
  const { data: moduleTree, isLoading: treeLoading } = useModuleTree();

  return useMemo(() => {
    if (!moduleCode || !myPermissions || !moduleTree || permissionsLoading || treeLoading) {
      return { moduleName: '', moduleId: null, isAllowed: false, isLoading: permissionsLoading || treeLoading };
    }

    const treeModule = moduleTree.find((m) => slugify(m.code ?? m.name) === moduleCode);
    if (!treeModule) return { moduleName: '', moduleId: null, isAllowed: false, isLoading: false };

    const foundModule: ModulePermissions | undefined = myPermissions.projects
      .map((p) => p.modules.find((m) => m.id === treeModule.id))
      .find(Boolean);

    if (!foundModule) return { moduleName: treeModule.name, moduleId: treeModule.id, isAllowed: false, isLoading: false };

    if (!actionCode) {
      const hasAny = foundModule.subModules.some((sm) => sm.actions.some((a) => a.allowed));
      return { moduleName: treeModule.name, moduleId: treeModule.id, isAllowed: hasAny, isLoading: false };
    }

    const isAllowed = foundModule.subModules.some((sm) =>
      sm.actions.some((a) => a.code === actionCode && a.allowed)
    );

    return { moduleName: treeModule.name, moduleId: treeModule.id, isAllowed, isLoading: false };
  }, [moduleCode, myPermissions, moduleTree, permissionsLoading, treeLoading, actionCode]);
}

export function useModuleActions() {
  const { moduleCode } = useParams<{ moduleCode: string }>();
  const { data: myPermissions, isLoading } = useMyPermissions();
  const { data: moduleTree } = useModuleTree();

  return useMemo(() => {
    if (!moduleCode || !myPermissions || !moduleTree || isLoading) {
      return { actions: {}, subModules: [], moduleName: '', isLoading: true };
    }

    const treeModule = moduleTree.find((m) => slugify(m.code ?? m.name) === moduleCode);
    if (!treeModule) return { actions: {}, subModules: [], moduleName: '', isLoading: false };

    const foundModule: ModulePermissions | undefined = myPermissions.projects
      .map((p) => p.modules.find((m) => m.id === treeModule.id))
      .find(Boolean);

    if (!foundModule) return { actions: {}, subModules: [], moduleName: treeModule.name, isLoading: false };

    const actions: Record<string, boolean> = {};

    foundModule.subModules.forEach((sm) => {
      sm.actions.forEach((a) => {
        if (a.allowed) actions[a.code] = true;
      });
    });

    const standardActions = ['VIEW', 'CREATE', 'EDIT', 'DELETE', 'APPROVE', 'EXPORT'];
    standardActions.forEach((code) => {
      if (!(code in actions)) actions[code] = false;
    });

    return {
      actions,
      subModules: foundModule.subModules,
      moduleName: treeModule.name,
      isLoading: false,
    };
  }, [moduleCode, myPermissions, moduleTree, isLoading]);
}

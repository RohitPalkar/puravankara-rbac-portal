import type { ModulePermissions } from 'src/services/types/auth';

import { useMemo } from 'react';
import { useParams } from 'react-router-dom';

import { useMyPermissions } from 'src/services/hooks/use-permissions';
import { useModuleTree } from 'src/services/hooks/use-product-catalog';

import { isSuperAdmin } from 'src/auth/utils/authorization';
import { useAuthContext } from 'src/auth/hooks/use-auth-context';

function slugify(text: string): string {
  return text.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
}

function safeProjects(proj: unknown): proj is { projects: unknown[] } {
  return !!proj && typeof proj === 'object' && 'projects' in proj && Array.isArray((proj as any).projects);
}

const STANDARD_ACTIONS = ['VIEW', 'CREATE', 'EDIT', 'DELETE', 'APPROVE', 'EXPORT'] as const;

export type SubModuleActions = {
  id: string | number | null;
  name: string;
  actions: { code: string; label?: string | null; allowed: boolean }[];
};

export type ModuleActionsResult = {
  moduleName: string;
  moduleId: string | number | null;
  isAllowed: boolean;
  isLoading: boolean;
  subModules: SubModuleActions[];
  actions: Record<string, boolean>;
};

function superAdminResult(moduleTree: any, treeModule: any): ModuleActionsResult {
  const subModules: SubModuleActions[] = (treeModule?.subModules ?? []).map((sm: any) => ({
    id: sm.id,
    name: sm.name,
    actions: STANDARD_ACTIONS.map((code) => ({ code, label: code, allowed: true })),
  }));

  return {
    moduleName: treeModule?.name ?? '',
    moduleId: treeModule?.id ?? null,
    isAllowed: true,
    isLoading: false,
    subModules,
    actions: Object.fromEntries(STANDARD_ACTIONS.map((code) => [code, true])),
  };
}

export function useModulePermission(actionCode?: string) {
  const { moduleCode } = useParams<{ moduleCode: string }>();
  const { user: authUser } = useAuthContext();
  const { data: myPermissions, isLoading: permissionsLoading } = useMyPermissions();
  const { data: moduleTree, isLoading: treeLoading } = useModuleTree();

  const isSA = isSuperAdmin(authUser);

  return useMemo(() => {
    if (!moduleCode || !moduleTree || permissionsLoading || treeLoading) {
      return { moduleName: '', moduleId: null, isAllowed: false, isLoading: permissionsLoading || treeLoading };
    }

    const treeModule = moduleTree.find((m) => slugify(m.name) === moduleCode);
    if (!treeModule) return { moduleName: '', moduleId: null, isAllowed: false, isLoading: false };

    if (isSA) {
      return superAdminResult(moduleTree, treeModule);
    }

    if (!myPermissions || !safeProjects(myPermissions)) {
      return { moduleName: treeModule.name, moduleId: treeModule.id, isAllowed: false, isLoading: false };
    }

    const foundModule: ModulePermissions | undefined = myPermissions.projects
      .map((p) => p.modules.find((m) => m.id === treeModule.id))
      .find(Boolean);

    if (!foundModule) return { moduleName: treeModule.name, moduleId: treeModule.id, isAllowed: false, isLoading: false };

    if (!actionCode) {
      const hasAny = (foundModule.subModules ?? []).some((sm) => (sm.actions ?? []).some((a) => a.allowed));
      return { moduleName: treeModule.name, moduleId: treeModule.id, isAllowed: hasAny, isLoading: false };
    }

    const isAllowed = (foundModule.subModules ?? []).some((sm) =>
      (sm.actions ?? []).some((a) => a.code === actionCode && a.allowed)
    );

    return { moduleName: treeModule.name, moduleId: treeModule.id, isAllowed, isLoading: false };
  }, [moduleCode, myPermissions, moduleTree, permissionsLoading, treeLoading, actionCode, isSA]);
}

export function useModuleActions() {
  const { moduleCode } = useParams<{ moduleCode: string }>();
  const { user: authUser } = useAuthContext();
  const { data: myPermissions, isLoading } = useMyPermissions();
  const { data: moduleTree } = useModuleTree();

  const isSA = isSuperAdmin(authUser);

  return useMemo((): ModuleActionsResult => {
    if (!moduleCode || !moduleTree || isLoading) {
      return { actions: {}, subModules: [], moduleName: '', moduleId: null, isAllowed: false, isLoading: true };
    }

    const treeModule = moduleTree.find((m) => slugify(m.name) === moduleCode);
    if (!treeModule) return { actions: {}, subModules: [], moduleName: '', moduleId: null, isAllowed: false, isLoading: false };

    if (isSA) {
      return superAdminResult(moduleTree, treeModule);
    }

    if (!myPermissions || !safeProjects(myPermissions)) {
      return { actions: {}, subModules: [], moduleName: treeModule.name, moduleId: treeModule.id, isAllowed: false, isLoading: false };
    }

    const foundModule: ModulePermissions | undefined = myPermissions.projects
      .map((p) => p.modules.find((m) => m.id === treeModule.id))
      .find(Boolean);

    if (!foundModule) return { actions: {}, subModules: [], moduleName: treeModule.name, moduleId: treeModule.id, isAllowed: false, isLoading: false };

    const actions: Record<string, boolean> = {};

    (foundModule.subModules ?? []).forEach((sm) => {
      (sm.actions ?? []).forEach((a) => {
        if (a.allowed) actions[a.code] = true;
      });
    });

    STANDARD_ACTIONS.forEach((code) => {
      if (!(code in actions)) actions[code] = false;
    });

    return {
      actions,
      subModules: (foundModule.subModules ?? []) as SubModuleActions[],
      moduleName: treeModule.name,
      moduleId: treeModule.id,
      isAllowed: true,
      isLoading: false,
    };
  }, [moduleCode, myPermissions, moduleTree, isLoading, isSA]);
}

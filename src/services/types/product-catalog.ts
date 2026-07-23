import type { AppBase } from './common';

export interface Module extends AppBase {
  name: string;
  code: string;
  isActive: boolean;
  subModules?: SubModule[];
  moduleActions?: ModuleAction[];
}

export interface CreateModuleRequest {
  name: string;
  isActive?: boolean;
}

export type UpdateModuleRequest = Partial<CreateModuleRequest>;

export interface SubModule extends AppBase {
  moduleId: number;
  moduleName?: string;
  name: string;
  isActive: boolean;
}

export interface CreateSubModuleRequest {
  moduleId: number;
  name: string;
  isActive?: boolean;
}

export type UpdateSubModuleRequest = Partial<CreateSubModuleRequest>;

export interface Action extends AppBase {
  code: string;
  label: string;
  isActive: boolean;
}

export interface CreateActionRequest {
  code: string;
  label: string;
  isActive?: boolean;
}

export type UpdateActionRequest = Partial<CreateActionRequest>;

export interface ModuleAction extends AppBase {
  moduleId: number;
  moduleName?: string;
  subModuleId?: number;
  subModuleName?: string;
  actionId: number;
  actionCode?: string;
  actionLabel?: string;
  isActive: boolean;
}

export interface CreateModuleActionRequest {
  moduleId: number;
  subModuleId?: number;
  actionId: number;
  isActive?: boolean;
}

export type UpdateModuleActionRequest = Partial<CreateModuleActionRequest>;

export interface ActionGroupNode {
  id: number;
  name: string;
  code: string;
  displayOrder: number;
  actions: ActionNode[];
}

export interface ActionNode {
  id: number;
  code: string;
  name: string;
  label: string;
  displayOrder: number;
}

export interface SubModuleTreeNode {
  id: number;
  name: string;
  displayOrder: number;
  hasActions: boolean;
  permissionType: 'ACTION' | 'MODULE';
  actionGroups: ActionGroupNode[];
}

export interface ModuleTreeNode {
  id: number;
  name: string;
  code: string;
  subModules: SubModuleTreeNode[];
}

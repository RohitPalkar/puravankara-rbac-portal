import { apiGet } from '../api/client';
import { createCrudService } from '../api/crud';
import { endpoints } from '../api/endpoints';
import type { ApiResponse } from '../types/api';
import type {
  Module,
  CreateModuleRequest,
  UpdateModuleRequest,
  SubModule,
  CreateSubModuleRequest,
  UpdateSubModuleRequest,
  Action,
  CreateActionRequest,
  UpdateActionRequest,
  ModuleAction,
  CreateModuleActionRequest,
  UpdateModuleActionRequest,
  ModuleTreeNode,
} from '../types/product-catalog';

export const moduleService = {
  ...createCrudService<Module, CreateModuleRequest, UpdateModuleRequest>({
    list: endpoints.modules.list,
    byId: endpoints.modules.byId,
    create: endpoints.modules.create,
    update: endpoints.modules.update,
    delete: endpoints.modules.delete,
  }),

  tree: async (): Promise<ApiResponse<ModuleTreeNode[]>> =>
    apiGet<ModuleTreeNode[]>(endpoints.modules.tree),
};

export const subModuleService = createCrudService<SubModule, CreateSubModuleRequest, UpdateSubModuleRequest>({
  list: endpoints.subModules.list,
  byId: endpoints.subModules.byId,
  create: endpoints.subModules.create,
  update: endpoints.subModules.update,
  delete: endpoints.subModules.delete,
});

export const actionService = createCrudService<Action, CreateActionRequest, UpdateActionRequest>({
  list: endpoints.actions.list,
  byId: endpoints.actions.byId,
  create: endpoints.actions.create,
  update: endpoints.actions.update,
  delete: endpoints.actions.delete,
});

export const moduleActionService = createCrudService<
  ModuleAction,
  CreateModuleActionRequest,
  UpdateModuleActionRequest
>({
  list: endpoints.moduleActions.list,
  byId: endpoints.moduleActions.byId,
  create: endpoints.moduleActions.create,
  update: endpoints.moduleActions.update,
  delete: endpoints.moduleActions.delete,
});

import { useQuery } from '@tanstack/react-query';

import { queryKeys } from '../api/query-keys';
import {
  moduleService,
  subModuleService,
  actionService,
  moduleActionService,
} from '../services/product-catalog.service';
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
} from '../types/product-catalog';
import { createCrudHooks } from './use-crud';

export const {
  useList: useModuleList,
  useById: useModuleById,
  useCreate: useCreateModule,
  useUpdate: useUpdateModule,
  useDelete: useDeleteModule,
} = createCrudHooks<Module, CreateModuleRequest, UpdateModuleRequest>({
  allKey: queryKeys.modules.all,
  listKey: queryKeys.modules.list,
  byIdKey: queryKeys.modules.byId,
  listFn: moduleService.list,
  byIdFn: moduleService.byId,
  createFn: moduleService.create,
  updateFn: moduleService.update,
  deleteFn: moduleService.delete,
});

export const {
  useList: useSubModuleList,
  useById: useSubModuleById,
  useCreate: useCreateSubModule,
  useUpdate: useUpdateSubModule,
  useDelete: useDeleteSubModule,
} = createCrudHooks<SubModule, CreateSubModuleRequest, UpdateSubModuleRequest>({
  allKey: queryKeys.subModules.all,
  listKey: queryKeys.subModules.list,
  byIdKey: queryKeys.subModules.byId,
  listFn: subModuleService.list,
  byIdFn: subModuleService.byId,
  createFn: subModuleService.create,
  updateFn: subModuleService.update,
  deleteFn: subModuleService.delete,
});

export const {
  useList: useActionList,
  useById: useActionById,
  useCreate: useCreateAction,
  useUpdate: useUpdateAction,
  useDelete: useDeleteAction,
} = createCrudHooks<Action, CreateActionRequest, UpdateActionRequest>({
  allKey: queryKeys.actions.all,
  listKey: queryKeys.actions.list,
  byIdKey: queryKeys.actions.byId,
  listFn: actionService.list,
  byIdFn: actionService.byId,
  createFn: actionService.create,
  updateFn: actionService.update,
  deleteFn: actionService.delete,
});

export const {
  useList: useModuleActionList,
  useById: useModuleActionById,
  useCreate: useCreateModuleAction,
  useUpdate: useUpdateModuleAction,
  useDelete: useDeleteModuleAction,
} = createCrudHooks<ModuleAction, CreateModuleActionRequest, UpdateModuleActionRequest>({
  allKey: queryKeys.moduleActions.all,
  listKey: queryKeys.moduleActions.list,
  byIdKey: queryKeys.moduleActions.byId,
  listFn: moduleActionService.list,
  byIdFn: moduleActionService.byId,
  createFn: moduleActionService.create,
  updateFn: moduleActionService.update,
  deleteFn: moduleActionService.delete,
});

export function useModuleTree() {
  return useQuery({
    queryKey: queryKeys.modules.tree,
    queryFn: async () => {
      const res = await moduleService.tree();
      return res.data;
    },
  });
}

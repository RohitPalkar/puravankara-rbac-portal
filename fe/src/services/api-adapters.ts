import { useState, useEffect, useCallback, useRef } from 'react';
import type { Zone, Department, Role, Project, Module, SubModule, Action, PermissionMapping, PermissionResponse, NavPermissionModule, MockUserRoleInfo, User } from 'src/types';
import { isApiMode } from './data-source';
import { zoneApi } from './api/zone-api';
import { departmentApi } from './api/department-api';
import { roleApi } from './api/role-api';
import { projectApi } from './api/project-api';
import { catalogApi } from './api/catalog-api';
import { authApi } from './api/auth-api';
import { userApi } from './api/user-api';
import { actionMapper } from './api/action-mapper';
import {
  mockZones, mockDepartments, mockRoles, mockProjects, mockModules, mockSubModules, mockActions,
  mockPermissionMappings, mockPermissionModuleProjects, mockUsers,
} from './mock-data';

function useApiData<T>(
  fetcher: () => Promise<T>,
  mockFallback: T,
): { data: T; loading: boolean; error: Error | null; refetch: () => Promise<void> } {
  const [data, setData] = useState<T>(isApiMode() ? (Array.isArray(mockFallback) ? [] as unknown as T : mockFallback) : mockFallback);
  const [loading, setLoading] = useState(isApiMode());
  const [error, setError] = useState<Error | null>(null);
  const mountedRef = useRef(true);

  const fetch = useCallback(async () => {
    if (!isApiMode()) return;
    setLoading(true);
    setError(null);
    try {
      const result = await fetcher();
      if (mountedRef.current) setData(result);
    } catch (err) {
      if (mountedRef.current) setError(err as Error);
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }, [fetcher]);

  useEffect(() => {
    mountedRef.current = true;
    fetch();
    return () => { mountedRef.current = false; };
  }, [fetch]);

  return { data, loading, error, refetch: fetch };
}

export function useZones() {
  return useApiData(() => zoneApi.list(), mockZones);
}

export function useDepartments() {
  return useApiData(() => departmentApi.list(), mockDepartments);
}

export function useRoles() {
  return useApiData(() => roleApi.list(), mockRoles);
}

export function useProjects() {
  return useApiData(() => projectApi.list(), mockProjects);
}

export function useModules() {
  return useApiData(() => catalogApi.getModules(), mockModules);
}

export function useSubModules() {
  return useApiData(() => catalogApi.getSubModules(), mockSubModules);
}

export function useActions() {
  const result = useApiData(() => catalogApi.getActions(), mockActions);
  const { data } = result;

  useEffect(() => {
    if (isApiMode() && data && data.length > 0) {
      actionMapper.initialize(data.map((a) => ({ id: Number(a.id), name: a.name, code: a.code })));
    }
  }, [data]);

  return result;
}

export function usePermissionMappings() {
  return useApiData(async () => mockPermissionMappings, mockPermissionMappings);
}

export function useUsers() {
  return useApiData(() => userApi.list(), mockUsers);
}

export interface MutationState {
  loading: boolean;
  error: Error | null;
  success: boolean;
}

export function useCreateZone() {
  const [state, setState] = useState<MutationState>({ loading: false, error: null, success: false });
  const mutate = useCallback(async (data: { name: string }) => {
    if (!isApiMode()) return { id: String(Date.now()) };
    setState({ loading: true, error: null, success: false });
    try {
      const result = await zoneApi.create(data);
      setState({ loading: false, error: null, success: true });
      return result;
    } catch (err) {
      setState({ loading: false, error: err as Error, success: false });
      throw err;
    }
  }, []);
  return { ...state, mutate };
}

export function useUpdateZone() {
  const [state, setState] = useState<MutationState>({ loading: false, error: null, success: false });
  const mutate = useCallback(async (id: string, data: { name?: string }) => {
    if (!isApiMode()) return;
    setState({ loading: true, error: null, success: false });
    try {
      await zoneApi.update(id, data);
      setState({ loading: false, error: null, success: true });
    } catch (err) {
      setState({ loading: false, error: err as Error, success: false });
      throw err;
    }
  }, []);
  return { ...state, mutate };
}

export function useDeleteZone() {
  const [state, setState] = useState<MutationState>({ loading: false, error: null, success: false });
  const mutate = useCallback(async (id: string) => {
    if (!isApiMode()) return;
    setState({ loading: true, error: null, success: false });
    try {
      await zoneApi.remove(id);
      setState({ loading: false, error: null, success: true });
    } catch (err) {
      setState({ loading: false, error: err as Error, success: false });
      throw err;
    }
  }, []);
  return { ...state, mutate };
}

export function useCreateDepartment() {
  const [state, setState] = useState<MutationState>({ loading: false, error: null, success: false });
  const mutate = useCallback(async (data: { name: string; maxHierarchyLevels?: number }) => {
    if (!isApiMode()) return { id: String(Date.now()) };
    setState({ loading: true, error: null, success: false });
    try {
      const result = await departmentApi.create(data);
      setState({ loading: false, error: null, success: true });
      return result;
    } catch (err) {
      setState({ loading: false, error: err as Error, success: false });
      throw err;
    }
  }, []);
  return { ...state, mutate };
}

export function useUpdateDepartment() {
  const [state, setState] = useState<MutationState>({ loading: false, error: null, success: false });
  const mutate = useCallback(async (id: string, data: { name?: string; maxHierarchyLevels?: number }) => {
    if (!isApiMode()) return;
    setState({ loading: true, error: null, success: false });
    try {
      await departmentApi.update(id, data);
      setState({ loading: false, error: null, success: true });
    } catch (err) {
      setState({ loading: false, error: err as Error, success: false });
      throw err;
    }
  }, []);
  return { ...state, mutate };
}

export function useCreateRole() {
  const [state, setState] = useState<MutationState>({ loading: false, error: null, success: false });
  const mutate = useCallback(async (data: { name: string; hierarchyLevelRank?: number }) => {
    if (!isApiMode()) return { id: String(Date.now()) };
    setState({ loading: true, error: null, success: false });
    try {
      const result = await roleApi.create(data);
      setState({ loading: false, error: null, success: true });
      return result;
    } catch (err) {
      setState({ loading: false, error: err as Error, success: false });
      throw err;
    }
  }, []);
  return { ...state, mutate };
}

export function useUpdateRole() {
  const [state, setState] = useState<MutationState>({ loading: false, error: null, success: false });
  const mutate = useCallback(async (id: string, data: { name?: string; hierarchyLevelRank?: number }) => {
    if (!isApiMode()) return;
    setState({ loading: true, error: null, success: false });
    try {
      await roleApi.update(id, data);
      setState({ loading: false, error: null, success: true });
    } catch (err) {
      setState({ loading: false, error: err as Error, success: false });
      throw err;
    }
  }, []);
  return { ...state, mutate };
}

export function useCreateProject() {
  const [state, setState] = useState<MutationState>({ loading: false, error: null, success: false });
  const mutate = useCallback(async (data: { name: string; billingEntityName?: string; extendedMetadata?: any }) => {
    if (!isApiMode()) return { id: String(Date.now()) };
    setState({ loading: true, error: null, success: false });
    try {
      const result = await projectApi.create(data);
      setState({ loading: false, error: null, success: true });
      return result;
    } catch (err) {
      setState({ loading: false, error: err as Error, success: false });
      throw err;
    }
  }, []);
  return { ...state, mutate };
}

export function useUpdateProject() {
  const [state, setState] = useState<MutationState>({ loading: false, error: null, success: false });
  const mutate = useCallback(async (id: string, data: { name?: string; billingEntityName?: string; extendedMetadata?: any }) => {
    if (!isApiMode()) return;
    setState({ loading: true, error: null, success: false });
    try {
      await projectApi.update(id, data);
      setState({ loading: false, error: null, success: true });
    } catch (err) {
      setState({ loading: false, error: err as Error, success: false });
      throw err;
    }
  }, []);
  return { ...state, mutate };
}

export { mockZones, mockDepartments, mockRoles, mockProjects, mockModules, mockSubModules, mockActions, mockPermissionMappings, mockPermissionModuleProjects, mockUsers };

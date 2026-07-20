import apiClient from 'src/services/api-client';

interface PermissionActionEntry {
  moduleId: number;
  subModuleId?: number;
  actionIds: number[];
}

interface CreateRoleMappingDto {
  name: string;
  hierarchyLevelRank: number;
  departmentId: number;
  permissions: PermissionActionEntry[];
}

interface RoleMappingListItem {
  id: number;
  name: string;
  hierarchyLevel: number;
  departmentName: string;
  moduleCount: number;
  permissionCount: number;
  status: string;
}

interface RoleMappingDetailModule {
  id: number;
  name: string;
  subModules: RoleMappingDetailSubModule[];
  actions: RoleMappingDetailAction[];
}

interface RoleMappingDetailSubModule {
  id: number;
  name: string;
  actions: RoleMappingDetailAction[];
}

interface RoleMappingDetailAction {
  id: number;
  code: string;
  label: string;
}

interface RoleMappingDetailResponse {
  roleId: number;
  name: string;
  hierarchyLevel: number;
  departmentId: number;
  departmentName: string;
  modules: RoleMappingDetailModule[];
  status: string;
}

function mapListItem(item: RoleMappingListItem) {
  return {
    id: String(item.id),
    departmentId: '',
    departmentName: item.departmentName,
    level: `L${item.hierarchyLevel}`,
    roleId: String(item.id),
    roleName: item.name,
    modules: [] as any[],
    createdBy: '',
    createdAt: '',
    updatedAt: '',
    status: item.status === 'ACTIVE' ? 'active' as const : 'inactive' as const,
    moduleCount: item.moduleCount,
    permissionCount: item.permissionCount,
  };
}

export const roleMappingApi = {
  async list() {
    const res = await apiClient.get('/role-mappings');
    const raw = res.data?.data || res.data || [];
    return (Array.isArray(raw) ? raw : []).map(mapListItem);
  },

  async getById(id: string) {
    const res = await apiClient.get(`/role-mappings/${id}`);
    const raw = res.data?.data || res.data;
    return raw as RoleMappingDetailResponse;
  },

  async create(dto: CreateRoleMappingDto) {
    const res = await apiClient.post('/role-mappings', dto);
    return res.data?.data || res.data;
  },

  async getDepartmentsRoles(departmentId: number) {
    const res = await apiClient.get(`/departments/${departmentId}/roles`);
    return res.data?.data || res.data;
  },

  async getAvailableSecondaryRoles(exclude?: number) {
    const params = exclude ? `?exclude=${exclude}` : '';
    const res = await apiClient.get(`/users/available-secondary-roles${params}`);
    return res.data?.data || res.data;
  },
};

export type { RoleMappingListItem, CreateRoleMappingDto, PermissionActionEntry, RoleMappingDetailModule, RoleMappingDetailAction, RoleMappingDetailResponse, RoleMappingDetailSubModule };

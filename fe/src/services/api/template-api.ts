import apiClient from 'src/services/api-client';

interface CreateTemplateDto {
  name: string;
  description?: string;
}

interface SetPermissionsDto {
  permissions: Array<{
    moduleId: number;
    subModuleId?: number;
    actionId: number;
  }>;
}

export const templateApi = {
  async create(data: CreateTemplateDto): Promise<{ id: number }> {
    const res = await apiClient.post('/permission-templates', data);
    const raw = res.data?.data || res.data;
    return raw;
  },

  async setPermissions(templateId: number, data: SetPermissionsDto): Promise<void> {
    await apiClient.post(`/permission-templates/${templateId}/permissions`, data);
  },

  async list(): Promise<any[]> {
    const res = await apiClient.get('/permission-templates');
    const raw = res.data?.data || res.data || [];
    return Array.isArray(raw) ? raw : [];
  },

  async getById(id: number): Promise<any> {
    const res = await apiClient.get(`/permission-templates/${id}`);
    return res.data?.data || res.data;
  },
};

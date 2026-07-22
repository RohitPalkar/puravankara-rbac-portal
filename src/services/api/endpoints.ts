const API_PREFIX = '/api/v1';

export const endpoints = {
  health: `${API_PREFIX}/health`,

  auth: {
    login: `${API_PREFIX}/auth/login`,
    refresh: `${API_PREFIX}/auth/refresh`,
    logout: `${API_PREFIX}/auth/logout`,
    logoutAll: `${API_PREFIX}/auth/logout-all`,
    setPassword: `${API_PREFIX}/auth/set-password`,
    me: `${API_PREFIX}/auth/me`,
  },

  setup: {
    status: `${API_PREFIX}/setup/status`,
    reset: `${API_PREFIX}/setup/reset`,
  },

  users: {
    list: `${API_PREFIX}/users`,
    byId: (id: string) => `${API_PREFIX}/users/${id}`,
    create: `${API_PREFIX}/users`,
    createFull: `${API_PREFIX}/users/full`,
    update: (id: string) => `${API_PREFIX}/users/${id}`,
    delete: (id: string) => `${API_PREFIX}/users/${id}`,
    fetchEmployee: `${API_PREFIX}/users/fetch-employee`,
    roles: {
      byUser: (userId: string) => `${API_PREFIX}/user-roles/${userId}`,
      create: `${API_PREFIX}/user-roles`,
      delete: (userId: string, departmentId: number, roleId: number) =>
        `${API_PREFIX}/user-roles/${userId}/department/${departmentId}/role/${roleId}`,
    },
    reportingLines: {
      byUser: (userId: string) => `${API_PREFIX}/user-reporting-lines/${userId}`,
      create: `${API_PREFIX}/user-reporting-lines`,
      delete: (userId: string, reportsToUserId: string, levelRank: number) =>
        `${API_PREFIX}/user-reporting-lines/${userId}/reports-to/${reportsToUserId}/level/${levelRank}`,
    },
    zones: {
      byUser: (userId: string) => `${API_PREFIX}/user-zones/${userId}`,
      assign: `${API_PREFIX}/user-zones`,
      revoke: (userId: string, zoneId: number) =>
        `${API_PREFIX}/user-zones/${userId}/zone/${zoneId}`,
    },
  },

  brands: {
    list: `${API_PREFIX}/brands`,
    byId: (id: number) => `${API_PREFIX}/brands/${id}`,
    create: `${API_PREFIX}/brands`,
    update: (id: number) => `${API_PREFIX}/brands/${id}`,
    delete: (id: number) => `${API_PREFIX}/brands/${id}`,
  },

  phases: {
    list: `${API_PREFIX}/phases`,
    byId: (id: number) => `${API_PREFIX}/phases/${id}`,
    create: `${API_PREFIX}/phases`,
    update: (id: number) => `${API_PREFIX}/phases/${id}`,
    delete: (id: number) => `${API_PREFIX}/phases/${id}`,
    launch: (id: number) => `${API_PREFIX}/phases/${id}/launch`,
  },

  channelPartnerTypes: {
    list: `${API_PREFIX}/channel-partner-types`,
    byId: (id: number) => `${API_PREFIX}/channel-partner-types/${id}`,
    create: `${API_PREFIX}/channel-partner-types`,
    update: (id: number) => `${API_PREFIX}/channel-partner-types/${id}`,
    delete: (id: number) => `${API_PREFIX}/channel-partner-types/${id}`,
  },

  channelPartners: {
    list: `${API_PREFIX}/channel-partners`,
    byId: (id: number) => `${API_PREFIX}/channel-partners/${id}`,
    create: `${API_PREFIX}/channel-partners`,
    update: (id: number) => `${API_PREFIX}/channel-partners/${id}`,
    delete: (id: number) => `${API_PREFIX}/channel-partners/${id}`,
  },

  userGroups: {
    list: `${API_PREFIX}/user-groups`,
    byId: (id: number) => `${API_PREFIX}/user-groups/${id}`,
    create: `${API_PREFIX}/user-groups`,
    update: (id: number) => `${API_PREFIX}/user-groups/${id}`,
    delete: (id: number) => `${API_PREFIX}/user-groups/${id}`,
  },

  cities: {
    list: `${API_PREFIX}/cities`,
    byId: (id: number) => `${API_PREFIX}/cities/${id}`,
    create: `${API_PREFIX}/cities`,
    update: (id: number) => `${API_PREFIX}/cities/${id}`,
    delete: (id: number) => `${API_PREFIX}/cities/${id}`,
  },

  zones: {
    list: `${API_PREFIX}/zones`,
    byId: (id: number) => `${API_PREFIX}/zones/${id}`,
    create: `${API_PREFIX}/zones`,
    update: (id: number) => `${API_PREFIX}/zones/${id}`,
    delete: (id: number) => `${API_PREFIX}/zones/${id}`,
  },

  cityZoneMappings: {
    list: `${API_PREFIX}/city-zone-mappings`,
    create: `${API_PREFIX}/city-zone-mappings`,
    delete: (cityId: number, zoneId: number) =>
      `${API_PREFIX}/city-zone-mappings/${cityId}/zone/${zoneId}`,
  },

  projects: {
    list: `${API_PREFIX}/projects`,
    byId: (id: number) => `${API_PREFIX}/projects/${id}`,
    create: `${API_PREFIX}/projects`,
    update: (id: number) => `${API_PREFIX}/projects/${id}`,
    delete: (id: number) => `${API_PREFIX}/projects/${id}`,
    locations: {
      list: `${API_PREFIX}/project-locations`,
      byProject: (projectId: number) => `${API_PREFIX}/project-locations/${projectId}`,
      byZone: (zoneId: number) => `${API_PREFIX}/project-locations/zone/${zoneId}`,
      create: `${API_PREFIX}/project-locations`,
      delete: (projectId: number, cityId: number, zoneId: number) =>
        `${API_PREFIX}/project-locations/${projectId}/city/${cityId}/zone/${zoneId}`,
    },
  },

  departments: {
    list: `${API_PREFIX}/departments`,
    byId: (id: number) => `${API_PREFIX}/departments/${id}`,
    create: `${API_PREFIX}/departments`,
    update: (id: number) => `${API_PREFIX}/departments/${id}`,
    delete: (id: number) => `${API_PREFIX}/departments/${id}`,
    hierarchyLevels: (id: number) => `${API_PREFIX}/departments/${id}/hierarchy-levels`,
  },

  roles: {
    list: `${API_PREFIX}/roles`,
    byId: (id: number) => `${API_PREFIX}/roles/${id}`,
    create: `${API_PREFIX}/roles`,
    update: (id: number) => `${API_PREFIX}/roles/${id}`,
    delete: (id: number) => `${API_PREFIX}/roles/${id}`,
    permissionsSummary: `${API_PREFIX}/roles/permissions-summary`,
    permissions: {
      byRole: (roleId: number) => `${API_PREFIX}/roles/${roleId}/permissions`,
      tree: (roleId: number) => `${API_PREFIX}/roles/${roleId}/permissions/tree`,
      set: (roleId: number) => `${API_PREFIX}/roles/${roleId}/permissions`,
    },
  },

  departmentRoles: {
    list: `${API_PREFIX}/department-roles`,
    create: `${API_PREFIX}/department-roles`,
    delete: (departmentId: number, roleId: number) =>
      `${API_PREFIX}/department-roles/${departmentId}/role/${roleId}`,
  },

  modules: {
    list: `${API_PREFIX}/modules`,
    byId: (id: number) => `${API_PREFIX}/modules/${id}`,
    create: `${API_PREFIX}/modules`,
    update: (id: number) => `${API_PREFIX}/modules/${id}`,
    delete: (id: number) => `${API_PREFIX}/modules/${id}`,
    tree: `${API_PREFIX}/modules/tree`,
  },

  subModules: {
    list: `${API_PREFIX}/sub-modules`,
    byId: (id: number) => `${API_PREFIX}/sub-modules/${id}`,
    create: `${API_PREFIX}/sub-modules`,
    update: (id: number) => `${API_PREFIX}/sub-modules/${id}`,
    delete: (id: number) => `${API_PREFIX}/sub-modules/${id}`,
  },

  actions: {
    list: `${API_PREFIX}/actions`,
    byId: (id: number) => `${API_PREFIX}/actions/${id}`,
    create: `${API_PREFIX}/actions`,
    update: (id: number) => `${API_PREFIX}/actions/${id}`,
    delete: (id: number) => `${API_PREFIX}/actions/${id}`,
  },

  moduleActions: {
    list: `${API_PREFIX}/module-actions`,
    byId: (id: number) => `${API_PREFIX}/module-actions/${id}`,
    create: `${API_PREFIX}/module-actions`,
    update: (id: number) => `${API_PREFIX}/module-actions/${id}`,
    delete: (id: number) => `${API_PREFIX}/module-actions/${id}`,
  },

  permissions: {
    me: `${API_PREFIX}/permissions/me`,
    user: (userId: string) => `${API_PREFIX}/permissions/user/${userId}`,
    compile: (userId: string) => `${API_PREFIX}/permissions/compile/${userId}`,
    compileForProject: (userId: string, projectId: number) =>
      `${API_PREFIX}/permissions/compile/${userId}/${projectId}`,
    snapshot: (userId: string, projectId: number) =>
      `${API_PREFIX}/permissions/snapshot/${userId}/${projectId}`,
    explain: `${API_PREFIX}/permissions/explain`,
    templates: {
      list: `${API_PREFIX}/permission-templates`,
      byId: (id: number) => `${API_PREFIX}/permission-templates/${id}`,
      create: `${API_PREFIX}/permission-templates`,
      update: (id: number) => `${API_PREFIX}/permission-templates/${id}`,
      delete: (id: number) => `${API_PREFIX}/permission-templates/${id}`,
      permissions: {
        list: (id: number) => `${API_PREFIX}/permission-templates/${id}/permissions`,
        set: (id: number) => `${API_PREFIX}/permission-templates/${id}/permissions`,
      },
    },
    roleProject: {
      list: `${API_PREFIX}/role-project-permissions`,
      byRole: (roleId: number) => `${API_PREFIX}/role-project-permissions/role/${roleId}`,
      byRoleAndProject: (roleId: number, projectId: number) =>
        `${API_PREFIX}/role-project-permissions/role/${roleId}/project/${projectId}`,
      create: `${API_PREFIX}/role-project-permissions`,
      delete: (id: number) => `${API_PREFIX}/role-project-permissions/${id}`,
    },
    overrides: {
      byUser: (userId: string) => `${API_PREFIX}/user-permission-overrides/${userId}`,
      byUserAndProject: (userId: string, projectId: number) =>
        `${API_PREFIX}/user-permission-overrides/${userId}/project/${projectId}`,
      create: `${API_PREFIX}/user-permission-overrides`,
      delete: (id: number) => `${API_PREFIX}/user-permission-overrides/${id}`,
    },
  },

  projectAccess: {
    byUser: (userId: string) => `${API_PREFIX}/user-project-access/${userId}`,
    assign: `${API_PREFIX}/user-project-access`,
    assignBulk: `${API_PREFIX}/user-project-access/bulk`,
    revoke: (userId: string, projectId: number) =>
      `${API_PREFIX}/user-project-access/${userId}/project/${projectId}`,
    groups: {
      list: `${API_PREFIX}/project-groups`,
      byId: (id: number) => `${API_PREFIX}/project-groups/${id}`,
      create: `${API_PREFIX}/project-groups`,
      update: (id: number) => `${API_PREFIX}/project-groups/${id}`,
      delete: (id: number) => `${API_PREFIX}/project-groups/${id}`,
      projects: {
        byGroup: (groupId: number) => `${API_PREFIX}/project-group-projects/${groupId}`,
        add: `${API_PREFIX}/project-group-projects`,
        remove: (groupId: number, projectId: number) =>
          `${API_PREFIX}/project-group-projects/${groupId}/project/${projectId}`,
      },
    },
    userGroups: {
      byUser: (userId: string) => `${API_PREFIX}/user-project-groups/${userId}`,
      assign: `${API_PREFIX}/user-project-groups`,
      remove: (userId: string, groupId: number) =>
        `${API_PREFIX}/user-project-groups/${userId}/group/${groupId}`,
    },
  },

  workflows: {
    list: `${API_PREFIX}/workflows`,
    byId: (id: number) => `${API_PREFIX}/workflows/${id}`,
    create: `${API_PREFIX}/workflows`,
    steps: (id: number) => `${API_PREFIX}/workflows/${id}/steps`,
    submit: (workflowId: number) => `${API_PREFIX}/workflows/${workflowId}/submit`,
    approvals: {
      pending: `${API_PREFIX}/approvals/pending`,
      submitted: `${API_PREFIX}/approvals/submitted`,
      byId: (id: number) => `${API_PREFIX}/approvals/${id}`,
      action: (requestId: number) => `${API_PREFIX}/approvals/${requestId}/action`,
    },
  },

  delegations: {
    list: `${API_PREFIX}/delegations`,
    byId: (id: number) => `${API_PREFIX}/delegations/${id}`,
    create: `${API_PREFIX}/delegations`,
    update: (id: number) => `${API_PREFIX}/delegations/${id}`,
    delete: (id: number) => `${API_PREFIX}/delegations/${id}`,
  },

  notifications: {
    list: `${API_PREFIX}/notifications`,
    count: `${API_PREFIX}/notifications/count`,
    preferences: {
      get: `${API_PREFIX}/notifications/preferences`,
      update: `${API_PREFIX}/notifications/preferences`,
    },
    read: (id: number) => `${API_PREFIX}/notifications/${id}/read`,
    readAll: `${API_PREFIX}/notifications/read-all`,
  },

  auditLogs: {
    list: `${API_PREFIX}/audit-logs`,
  },
} as const;

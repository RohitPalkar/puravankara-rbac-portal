export const queryKeys = {
  health: ['health'] as const,

  auth: {
    all: ['auth'] as const,
    me: ['auth', 'me'] as const,
  },

  setup: {
    status: ['setup', 'status'] as const,
  },

  users: {
    all: ['users'] as const,
    list: (params?: Record<string, unknown>) => ['users', 'list', params] as const,
    byId: (id: string) => ['users', id] as const,
    roles: (userId: string) => ['users', userId, 'roles'] as const,
    reportingLines: (userId: string) => ['users', userId, 'reporting-lines'] as const,
    zones: (userId: string) => ['users', userId, 'zones'] as const,
  },

  brands: {
    all: ['brands'] as const,
    list: (params?: Record<string, unknown>) => ['brands', 'list', params] as const,
    byId: (id: number) => ['brands', id] as const,
  },

  phases: {
    all: ['phases'] as const,
    list: (params?: Record<string, unknown>) => ['phases', 'list', params] as const,
    byId: (id: number) => ['phases', id] as const,
  },

  channelPartnerTypes: {
    all: ['channel-partner-types'] as const,
    list: (params?: Record<string, unknown>) => ['channel-partner-types', 'list', params] as const,
    byId: (id: number) => ['channel-partner-types', id] as const,
  },

  channelPartners: {
    all: ['channel-partners'] as const,
    list: (params?: Record<string, unknown>) => ['channel-partners', 'list', params] as const,
    byId: (id: number) => ['channel-partners', id] as const,
  },

  userGroups: {
    all: ['user-groups'] as const,
    list: (params?: Record<string, unknown>) => ['user-groups', 'list', params] as const,
    byId: (id: number) => ['user-groups', id] as const,
  },

  cities: {
    all: ['cities'] as const,
    list: (params?: Record<string, unknown>) => ['cities', 'list', params] as const,
    byId: (id: number) => ['cities', id] as const,
  },

  zones: {
    all: ['zones'] as const,
    list: (params?: Record<string, unknown>) => ['zones', 'list', params] as const,
    byId: (id: number) => ['zones', id] as const,
  },

  cityZoneMappings: {
    all: ['city-zone-mappings'] as const,
  },

  projects: {
    all: ['projects'] as const,
    list: (params?: Record<string, unknown>) => ['projects', 'list', params] as const,
    byId: (id: number) => ['projects', id] as const,
    locations: {
      all: ['project-locations'] as const,
      byProject: (projectId: number) => ['project-locations', projectId] as const,
      byZone: (zoneId: number) => ['project-locations', 'zone', zoneId] as const,
    },
  },

  departments: {
    all: ['departments'] as const,
    list: (params?: Record<string, unknown>) => ['departments', 'list', params] as const,
    byId: (id: number) => ['departments', id] as const,
  },

  roles: {
    all: ['roles'] as const,
    list: (params?: Record<string, unknown>) => ['roles', 'list', params] as const,
    byId: (id: number) => ['roles', id] as const,
  },

  departmentRoles: {
    all: ['department-roles'] as const,
  },

  modules: {
    all: ['modules'] as const,
    list: (params?: Record<string, unknown>) => ['modules', 'list', params] as const,
    byId: (id: number) => ['modules', id] as const,
    tree: ['modules', 'tree'] as const,
  },

  subModules: {
    all: ['sub-modules'] as const,
    list: (params?: Record<string, unknown>) => ['sub-modules', 'list', params] as const,
    byId: (id: number) => ['sub-modules', id] as const,
  },

  actions: {
    all: ['actions'] as const,
    list: (params?: Record<string, unknown>) => ['actions', 'list', params] as const,
    byId: (id: number) => ['actions', id] as const,
  },

  moduleActions: {
    all: ['module-actions'] as const,
    list: (params?: Record<string, unknown>) => ['module-actions', 'list', params] as const,
    byId: (id: number) => ['module-actions', id] as const,
  },

  permissions: {
    me: ['permissions', 'me'] as const,
    user: (userId: string) => ['permissions', 'user', userId] as const,
    snapshot: (userId: string, projectId: number) =>
      ['permissions', 'snapshot', userId, projectId] as const,
    templates: {
      all: ['permission-templates'] as const,
      byId: (id: number) => ['permission-templates', id] as const,
      permissions: (id: number) => ['permission-templates', id, 'permissions'] as const,
    },
    roleProject: {
      all: ['role-project-permissions'] as const,
      byRole: (roleId: number) => ['role-project-permissions', 'role', roleId] as const,
      byRoleAndProject: (roleId: number, projectId: number) =>
        ['role-project-permissions', 'role', roleId, 'project', projectId] as const,
    },
    overrides: {
      byUser: (userId: string) => ['permission-overrides', userId] as const,
      byUserAndProject: (userId: string, projectId: number) =>
        ['permission-overrides', userId, 'project', projectId] as const,
    },
  },

  projectAccess: {
    byUser: (userId: string) => ['project-access', userId] as const,
    groups: {
      all: ['project-groups'] as const,
      list: (params?: Record<string, unknown>) => ['project-groups', 'list', params] as const,
      byId: (id: number) => ['project-groups', id] as const,
      projects: (groupId: number) => ['project-groups', groupId, 'projects'] as const,
    },
    userGroups: {
      byUser: (userId: string) => ['user-project-groups', userId] as const,
    },
  },

  workflows: {
    all: ['workflows'] as const,
    byId: (id: number) => ['workflows', id] as const,
    steps: (id: number) => ['workflows', id, 'steps'] as const,
    approvals: {
      pending: ['approvals', 'pending'] as const,
      submitted: ['approvals', 'submitted'] as const,
      byId: (id: number) => ['approvals', id] as const,
    },
  },

  delegations: {
    all: ['delegations'] as const,
    list: (params?: Record<string, unknown>) => ['delegations', 'list', params] as const,
    byId: (id: number) => ['delegations', id] as const,
  },

  notifications: {
    all: ['notifications'] as const,
    list: (params?: Record<string, unknown>) => ['notifications', 'list', params] as const,
    count: ['notifications', 'count'] as const,
    preferences: ['notifications', 'preferences'] as const,
  },

  auditLogs: {
    list: (params?: Record<string, unknown>) => ['audit-logs', 'list', params] as const,
  },
} as const;

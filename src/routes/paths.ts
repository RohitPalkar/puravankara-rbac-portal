const ROOTS = {
  AUTH: '/auth',
  DASHBOARD: '/dashboard',
};

export const paths = {
  auth: {
    jwt: {
      signIn: `${ROOTS.AUTH}/jwt/sign-in`,
    },
  },
  dashboard: {
    root: ROOTS.DASHBOARD,
    // Masters
    zoneMaster: `${ROOTS.DASHBOARD}/zone-master`,
    zoneMasterCreate: `${ROOTS.DASHBOARD}/zone-master/create`,
    zoneMasterEdit: (id: string) => `${ROOTS.DASHBOARD}/zone-master/${id}/edit`,
    brandMaster: `${ROOTS.DASHBOARD}/brand-master`,
    brandMasterCreate: `${ROOTS.DASHBOARD}/brand-master/create`,
    brandMasterEdit: (id: string) => `${ROOTS.DASHBOARD}/brand-master/${id}/edit`,
    phaseMaster: `${ROOTS.DASHBOARD}/phase-master`,
    phaseMasterCreate: `${ROOTS.DASHBOARD}/phase-master/create`,
    phaseMasterEdit: (id: string) => `${ROOTS.DASHBOARD}/phase-master/${id}/edit`,
    channelPartnerMaster: `${ROOTS.DASHBOARD}/channel-partner-master`,
    channelPartnerMasterCreate: `${ROOTS.DASHBOARD}/channel-partner-master/create`,
    channelPartnerMasterEdit: (id: string) => `${ROOTS.DASHBOARD}/channel-partner-master/${id}/edit`,
    projectMaster: `${ROOTS.DASHBOARD}/project-master`,
    projectMasterCreate: `${ROOTS.DASHBOARD}/project-master/create`,
    projectMasterEdit: (id: string) => `${ROOTS.DASHBOARD}/project-master/${id}/edit`,
    departmentMaster: `${ROOTS.DASHBOARD}/department-master`,
    departmentMasterCreate: `${ROOTS.DASHBOARD}/department-master/create`,
    departmentMasterEdit: (id: string) => `${ROOTS.DASHBOARD}/department-master/${id}/edit`,
    // Access Management
    userManagement: `${ROOTS.DASHBOARD}/user-management`,
    userNew: `${ROOTS.DASHBOARD}/user-management/new`,

    permissionMatrix: `${ROOTS.DASHBOARD}/permission-matrix`,
    permissionMatrixNew: `${ROOTS.DASHBOARD}/permission-matrix/new`,
    permissionMatrixEdit: (id: number) => `${ROOTS.DASHBOARD}/permission-matrix/${id}/edit`,
    permissionMatrixView: (id: number) => `${ROOTS.DASHBOARD}/permission-matrix/${id}`,
    // System
    auditLogs: `${ROOTS.DASHBOARD}/audit-logs`,
    settings: `${ROOTS.DASHBOARD}/settings`,
    // Modules (RBAC Showcase)
    modules: {
      root: `${ROOTS.DASHBOARD}/modules`,
      dashboard: (code: string) => `${ROOTS.DASHBOARD}/modules/${code}`,
      list: (code: string) => `${ROOTS.DASHBOARD}/modules/${code}/list`,
    },
  },
};

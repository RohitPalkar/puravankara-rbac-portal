const ROOTS = {
  AUTH: '/auth',
  DASHBOARD: '/dashboard',
};

export const paths = {
  faqs: '/faqs',
  auth: {
    jwt: {
      signIn: `${ROOTS.AUTH}/jwt/sign-in`,
      signUp: `${ROOTS.AUTH}/jwt/sign-up`,
    },
    auth0: {
      signIn: `${ROOTS.AUTH}/auth0/sign-in`,
      signUp: `${ROOTS.AUTH}/auth0/sign-up`,
    },
    amplify: {
      signIn: `${ROOTS.AUTH}/amplify/sign-in`,
      signUp: `${ROOTS.AUTH}/amplify/sign-up`,
      verify: `${ROOTS.AUTH}/amplify/verify`,
      updatePassword: `${ROOTS.AUTH}/amplify/update-password`,
      resetPassword: `${ROOTS.AUTH}/amplify/reset-password`,
    },
    firebase: {
      signIn: `${ROOTS.AUTH}/firebase/sign-in`,
      signUp: `${ROOTS.AUTH}/firebase/sign-up`,
      verify: `${ROOTS.AUTH}/firebase/verify`,
      updatePassword: `${ROOTS.AUTH}/firebase/update-password`,
      resetPassword: `${ROOTS.AUTH}/firebase/reset-password`,
    },
    supabase: {
      signIn: `${ROOTS.AUTH}/supabase/sign-in`,
      signUp: `${ROOTS.AUTH}/supabase/sign-up`,
      verify: `${ROOTS.AUTH}/supabase/verify`,
      updatePassword: `${ROOTS.AUTH}/supabase/update-password`,
      resetPassword: `${ROOTS.AUTH}/supabase/reset-password`,
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
    channelPartnerTypeMaster: `${ROOTS.DASHBOARD}/cp-type-master`,
    channelPartnerMaster: `${ROOTS.DASHBOARD}/channel-partner-master`,
    channelPartnerMasterCreate: `${ROOTS.DASHBOARD}/channel-partner-master/create`,
    channelPartnerMasterEdit: (id: string) => `${ROOTS.DASHBOARD}/channel-partner-master/${id}/edit`,
    projectMaster: `${ROOTS.DASHBOARD}/project-master`,
    projectMasterCreate: `${ROOTS.DASHBOARD}/project-master/create`,
    projectMasterEdit: (id: string) => `${ROOTS.DASHBOARD}/project-master/${id}/edit`,
    departmentMaster: `${ROOTS.DASHBOARD}/department-master`,
    roleMaster: `${ROOTS.DASHBOARD}/role-master`,
    // Access Management
    userManagement: `${ROOTS.DASHBOARD}/user-management`,
    userNew: `${ROOTS.DASHBOARD}/user-management/new`,
    userDetail: (id: string) => `${ROOTS.DASHBOARD}/user-management/${id}`,
    userRoleMapping: `${ROOTS.DASHBOARD}/user-role-mapping`,
    projectAssignment: `${ROOTS.DASHBOARD}/project-assignment`,
    permissionMatrix: `${ROOTS.DASHBOARD}/permission-matrix`,
    // Workflow
    approvalConfig: `${ROOTS.DASHBOARD}/approval-config`,
    approvalInbox: `${ROOTS.DASHBOARD}/approval-inbox`,
    delegations: `${ROOTS.DASHBOARD}/delegations`,
    // System
    auditLogs: `${ROOTS.DASHBOARD}/audit-logs`,
    notifications: `${ROOTS.DASHBOARD}/notifications`,
  },
};

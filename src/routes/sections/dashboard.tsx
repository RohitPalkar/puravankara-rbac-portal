import { lazy, Suspense } from 'react';
import { Outlet } from 'react-router-dom';

import { CONFIG } from 'src/config-global';
import { DashboardLayout } from 'src/layouts/dashboard';
import { LoadingScreen } from 'src/components/loading-screen';
import { AuthGuard } from 'src/auth/guard';

// Masters
const ZoneMasterPage = lazy(() => import('src/sections/geography/zone-list'));
const ZoneFormPage = lazy(() => import('src/sections/geography/zone-form'));
const BrandMasterPage = lazy(() => import('src/sections/brand/brand-list'));
const BrandFormPage = lazy(() => import('src/sections/brand/brand-form'));
const PhaseMasterPage = lazy(() => import('src/sections/phase/phase-list'));
const PhaseFormPage = lazy(() => import('src/sections/phase/phase-form'));
const ChannelPartnerPage = lazy(() => import('src/sections/channel-partner/cp-list'));
const ChannelPartnerFormPage = lazy(() => import('src/sections/channel-partner/cp-form'));
const ChannelPartnerTypePage = lazy(() => import('src/sections/channel-partner/cp-type-list'));
const ProjectMasterPage = lazy(() => import('src/sections/projects/project-list'));
const ProjectFormPage = lazy(() => import('src/sections/projects/project-form'));
const DepartmentMasterPage = lazy(() => import('src/sections/organization/department-list'));
const DepartmentFormPage = lazy(() => import('src/sections/organization/department-form'));
const RoleMasterPage = lazy(() => import('src/sections/organization/role-list'));

// Access Management
const UserManagementPage = lazy(() => import('src/sections/users/user-list'));
const UserNewPage = lazy(() => import('src/sections/users/user-new'));
const UserDetailPage = lazy(() => import('src/sections/users/user-detail'));
const UserRoleMappingPage = lazy(() => import('src/sections/access/user-role-mapping'));
const ProjectAssignmentPage = lazy(() => import('src/sections/access/project-assignment'));
const PermissionMatrixPage = lazy(() => import('src/sections/access/permission-matrix'));
const PermissionMatrixCreatePage = lazy(() => import('src/sections/access/permission-matrix-create'));
const PermissionMatrixViewPage = lazy(() => import('src/sections/access/permission-matrix-view'));

// Workflow
const ApprovalConfigPage = lazy(() => import('src/sections/workflow/approval-config'));
const ApprovalInboxPage = lazy(() => import('src/sections/workflow/approval-inbox'));
const DelegationsPage = lazy(() => import('src/sections/workflow/delegations'));

// System
const AuditLogsPage = lazy(() => import('src/sections/system/audit-logs'));
const NotificationsPage = lazy(() => import('src/sections/system/notifications'));
const SettingsPage = lazy(() => import('src/sections/system/settings'));

// Modules (RBAC Showcase)
const ModuleDashboardPage = lazy(() => import('src/sections/modules/module-dashboard'));
const ModuleListPage = lazy(() => import('src/sections/modules/module-list'));
const ModuleCreatePage = lazy(() => import('src/sections/modules/module-create'));
const ModuleViewPage = lazy(() => import('src/sections/modules/module-view'));
const ModuleEditPage = lazy(() => import('src/sections/modules/module-edit'));
const ModuleDeletePage = lazy(() => import('src/sections/modules/module-delete'));

const DashboardIndex = lazy(() => import('src/pages/dashboard/index'));

const layoutContent = (
  <DashboardLayout>
    <Suspense fallback={<LoadingScreen />}>
      <Outlet />
    </Suspense>
  </DashboardLayout>
);

export const dashboardRoutes = [
  {
    path: 'dashboard',
    element: CONFIG.auth.skip ? <>{layoutContent}</> : <AuthGuard>{layoutContent}</AuthGuard>,
    children: [
      { element: <DashboardIndex />, index: true },
      // Masters
      { path: 'zone-master', element: <ZoneMasterPage /> },
      { path: 'zone-master/create', element: <ZoneFormPage /> },
      { path: 'zone-master/:id/edit', element: <ZoneFormPage /> },
      { path: 'brand-master', element: <BrandMasterPage /> },
      { path: 'brand-master/create', element: <BrandFormPage /> },
      { path: 'brand-master/:id/edit', element: <BrandFormPage /> },
      { path: 'phase-master', element: <PhaseMasterPage /> },
      { path: 'phase-master/create', element: <PhaseFormPage /> },
      { path: 'phase-master/:id/edit', element: <PhaseFormPage /> },
      { path: 'cp-type-master', element: <ChannelPartnerTypePage /> },
      { path: 'channel-partner-master', element: <ChannelPartnerPage /> },
      { path: 'channel-partner-master/create', element: <ChannelPartnerFormPage /> },
      { path: 'channel-partner-master/:id/edit', element: <ChannelPartnerFormPage /> },
      { path: 'project-master', element: <ProjectMasterPage /> },
      { path: 'project-master/create', element: <ProjectFormPage /> },
      { path: 'project-master/:id/edit', element: <ProjectFormPage /> },
      { path: 'department-master', element: <DepartmentMasterPage /> },
      { path: 'department-master/create', element: <DepartmentFormPage /> },
      { path: 'department-master/:id/edit', element: <DepartmentFormPage /> },
      { path: 'role-master', element: <RoleMasterPage /> },
      // Access Management
      { path: 'user-management', element: <UserManagementPage /> },
      { path: 'user-management/new', element: <UserNewPage /> },
      { path: 'user-management/:id', element: <UserDetailPage /> },
      { path: 'user-role-mapping', element: <UserRoleMappingPage /> },
      { path: 'project-assignment', element: <ProjectAssignmentPage /> },
      { path: 'permission-matrix', element: <PermissionMatrixPage /> },
      { path: 'permission-matrix/new', element: <PermissionMatrixCreatePage /> },
      { path: 'permission-matrix/:id', element: <PermissionMatrixViewPage /> },
      { path: 'permission-matrix/:id/edit', element: <PermissionMatrixCreatePage /> },
      // Workflow
      { path: 'approval-config', element: <ApprovalConfigPage /> },
      { path: 'approval-inbox', element: <ApprovalInboxPage /> },
      { path: 'delegations', element: <DelegationsPage /> },
      // System
      { path: 'audit-logs', element: <AuditLogsPage /> },
      { path: 'notifications', element: <NotificationsPage /> },
      { path: 'settings', element: <SettingsPage /> },
      // Modules (RBAC Showcase)
      { path: 'modules/:moduleCode', element: <ModuleDashboardPage /> },
      { path: 'modules/:moduleCode/list', element: <ModuleListPage /> },
      { path: 'modules/:moduleCode/new', element: <ModuleCreatePage /> },
      { path: 'modules/:moduleCode/:id', element: <ModuleViewPage /> },
      { path: 'modules/:moduleCode/:id/edit', element: <ModuleEditPage /> },
      { path: 'modules/:moduleCode/:id/delete', element: <ModuleDeletePage /> },
    ],
  },
];

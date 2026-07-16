import { lazy, Suspense } from 'react';
import { Outlet } from 'react-router-dom';

import { CONFIG } from 'src/config-global';
import { DashboardLayout } from 'src/layouts/dashboard';
import { LoadingScreen } from 'src/components/loading-screen';
import { AuthGuard } from 'src/auth/guard';

// Masters
const ZoneMasterPage = lazy(() => import('src/sections/geography/zone-list'));
const ZoneFormPage = lazy(() => import('src/sections/geography/zone-form'));
const ProjectMasterPage = lazy(() => import('src/sections/projects/project-list'));
const DepartmentMasterPage = lazy(() => import('src/sections/organization/department-list'));
const RoleMasterPage = lazy(() => import('src/sections/organization/role-list'));

// Access Management
const UserManagementPage = lazy(() => import('src/sections/users/user-list'));
const UserNewPage = lazy(() => import('src/sections/users/user-new'));
const UserDetailPage = lazy(() => import('src/sections/users/user-detail'));
const UserRoleMappingPage = lazy(() => import('src/sections/access/user-role-mapping'));
const ProjectAssignmentPage = lazy(() => import('src/sections/access/project-assignment'));
const PermissionMatrixPage = lazy(() => import('src/sections/access/permission-matrix'));

// Workflow
const ApprovalConfigPage = lazy(() => import('src/sections/workflow/approval-config'));
const ApprovalInboxPage = lazy(() => import('src/sections/workflow/approval-inbox'));
const DelegationsPage = lazy(() => import('src/sections/workflow/delegations'));

// System
const AuditLogsPage = lazy(() => import('src/sections/system/audit-logs'));
const NotificationsPage = lazy(() => import('src/sections/system/notifications'));

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
      { path: 'project-master', element: <ProjectMasterPage /> },
      { path: 'department-master', element: <DepartmentMasterPage /> },
      { path: 'role-master', element: <RoleMasterPage /> },
      // Access Management
      { path: 'user-management', element: <UserManagementPage /> },
      { path: 'user-management/new', element: <UserNewPage /> },
      { path: 'user-management/:id', element: <UserDetailPage /> },
      { path: 'user-role-mapping', element: <UserRoleMappingPage /> },
      { path: 'project-assignment', element: <ProjectAssignmentPage /> },
      { path: 'permission-matrix', element: <PermissionMatrixPage /> },
      // Workflow
      { path: 'approval-config', element: <ApprovalConfigPage /> },
      { path: 'approval-inbox', element: <ApprovalInboxPage /> },
      { path: 'delegations', element: <DelegationsPage /> },
      // System
      { path: 'audit-logs', element: <AuditLogsPage /> },
      { path: 'notifications', element: <NotificationsPage /> },
    ],
  },
];

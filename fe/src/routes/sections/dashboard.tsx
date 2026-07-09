import { lazy, Suspense } from 'react';
import { Outlet } from 'react-router-dom';

import { CONFIG } from 'src/config-global';
import { DashboardLayout } from 'src/layouts/dashboard';

import { LoadingScreen } from 'src/components/loading-screen';

import { AuthGuard, PermissionGuard } from 'src/auth/guard';

// Masters
const ZoneMasterPage = lazy(() => import('src/sections/geography/zone-list'));
const ZoneFormPage = lazy(() => import('src/sections/geography/zone-form'));
const ProjectMasterPage = lazy(() => import('src/sections/projects/project-list'));
const ProjectNewPage = lazy(() => import('src/sections/projects/project-new'));
const ProjectEditPage = lazy(() => import('src/sections/projects/project-new'));
const ProjectDetailPage = lazy(() => import('src/sections/projects/project-detail'));
const DepartmentMasterPage = lazy(() => import('src/sections/organization/department-list'));

// Access Management
const UserManagementPage = lazy(() => import('src/sections/users/user-list'));
const UserNewPage = lazy(() => import('src/sections/users/user-new'));
const UserDetailPage = lazy(() => import('src/sections/users/user-detail'));
const UserRoleMappingPage = lazy(() => import('src/sections/access/user-role-mapping'));
const ProjectAssignmentPage = lazy(() => import('src/sections/access/project-assignment'));
const PermissionMappingListPage = lazy(() => import('src/sections/access/permission-mapping-list'));
const PermissionMappingNewPage = lazy(() => import('src/sections/access/permission-mapping-new'));

// Workflow
const ApprovalConfigPage = lazy(() => import('src/sections/workflow/approval-config'));
const ApprovalInboxPage = lazy(() => import('src/sections/workflow/approval-inbox'));
const DelegationsPage = lazy(() => import('src/sections/workflow/delegations'));

// System
const AuditLogsPage = lazy(() => import('src/sections/system/audit-logs'));
const NotificationsPage = lazy(() => import('src/sections/system/notifications'));

// Apps
const CrmPage = lazy(() => import('src/sections/apps/crm'));
const EoiPage = lazy(() => import('src/sections/apps/eoi'));
const IomPage = lazy(() => import('src/sections/apps/iom'));
const BookingsPage = lazy(() => import('src/sections/apps/bookings'));
const InventoryPage = lazy(() => import('src/sections/apps/inventory'));
const FinancePage = lazy(() => import('src/sections/apps/finance'));
const ReportsPage = lazy(() => import('src/sections/apps/reports'));
const DocumentsPage = lazy(() => import('src/sections/apps/documents'));
const EsignaturePage = lazy(() => import('src/sections/apps/esignature'));

const DashboardIndex = lazy(() => import('src/pages/dashboard/index'));

const layoutContent = (
  <DashboardLayout>
    <Suspense fallback={<LoadingScreen />}>
      <PermissionGuard>
        <Outlet />
      </PermissionGuard>
    </Suspense>
  </DashboardLayout>
);

export const dashboardRoutes = [
  {
    path: 'dashboard',
    element: CONFIG.auth.skip ? <>{layoutContent}</> : <AuthGuard>{layoutContent}</AuthGuard>,
    children: [
      { element: <DashboardIndex />, index: true },
      { path: 'zone-master', element: <ZoneMasterPage /> },
      { path: 'zone-master/create', element: <ZoneFormPage /> },
      { path: 'zone-master/:id/edit', element: <ZoneFormPage /> },
      { path: 'project-master', element: <ProjectMasterPage /> },
      { path: 'project-master/new', element: <ProjectNewPage /> },
      { path: 'project-master/:id', element: <ProjectDetailPage /> },
      { path: 'project-master/:id/edit', element: <ProjectEditPage /> },
      { path: 'department-master', element: <DepartmentMasterPage /> },
      { path: 'user-management', element: <UserManagementPage /> },
      { path: 'user-management/new', element: <UserNewPage /> },
      { path: 'user-management/:id', element: <UserDetailPage /> },
      { path: 'user-role-mapping', element: <UserRoleMappingPage /> },
      { path: 'project-assignment', element: <ProjectAssignmentPage /> },
      { path: 'permission-mapping', element: <PermissionMappingListPage /> },
      { path: 'permission-mapping/new', element: <PermissionMappingNewPage /> },
      { path: 'permission-mapping/:id', element: <PermissionMappingListPage /> },
      { path: 'permission-mapping/:id/edit', element: <PermissionMappingNewPage /> },
      { path: 'approval-config', element: <ApprovalConfigPage /> },
      { path: 'approval-inbox', element: <ApprovalInboxPage /> },
      { path: 'delegations', element: <DelegationsPage /> },
      { path: 'audit-logs', element: <AuditLogsPage /> },
      { path: 'notifications', element: <NotificationsPage /> },
    ],
  },
  {
    path: 'apps',
    element: CONFIG.auth.skip ? <>{layoutContent}</> : <AuthGuard>{layoutContent}</AuthGuard>,
    children: [
      { path: 'crm', element: <CrmPage /> },
      { path: 'eoi', element: <EoiPage /> },
      { path: 'iom', element: <IomPage /> },
      { path: 'bookings', element: <BookingsPage /> },
      { path: 'inventory', element: <InventoryPage /> },
      { path: 'finance', element: <FinancePage /> },
      { path: 'reports', element: <ReportsPage /> },
      { path: 'documents', element: <DocumentsPage /> },
      { path: 'esignature', element: <EsignaturePage /> },
    ],
  },
];

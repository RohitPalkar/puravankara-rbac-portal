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
const ProjectMasterPage = lazy(() => import('src/sections/projects/project-list'));
const ProjectFormPage = lazy(() => import('src/sections/projects/project-form'));
const DepartmentMasterPage = lazy(() => import('src/sections/organization/department-list'));
const DepartmentFormPage = lazy(() => import('src/sections/organization/department-form'));

// Access Management
const UserManagementPage = lazy(() => import('src/sections/users/user-list'));
const UserNewPage = lazy(() => import('src/sections/users/user-new'));

const PermissionMatrixPage = lazy(() => import('src/sections/access/permission-matrix'));
const PermissionMatrixCreatePage = lazy(() => import('src/sections/access/permission-matrix-create'));
const PermissionMatrixViewPage = lazy(() => import('src/sections/access/permission-matrix-view'));

// System
const AuditLogsPage = lazy(() => import('src/sections/system/audit-logs'));
const SettingsPage = lazy(() => import('src/sections/system/settings'));

// Modules (RBAC Showcase)
const ModuleDashboardPage = lazy(() => import('src/sections/modules/module-dashboard'));
const ModuleListPage = lazy(() => import('src/sections/modules/module-list'));

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

      { path: 'channel-partner-master', element: <ChannelPartnerPage /> },
      { path: 'channel-partner-master/create', element: <ChannelPartnerFormPage /> },
      { path: 'channel-partner-master/:id/edit', element: <ChannelPartnerFormPage /> },
      { path: 'project-master', element: <ProjectMasterPage /> },
      { path: 'project-master/create', element: <ProjectFormPage /> },
      { path: 'project-master/:id/edit', element: <ProjectFormPage /> },
      { path: 'department-master', element: <DepartmentMasterPage /> },
      { path: 'department-master/create', element: <DepartmentFormPage /> },
      { path: 'department-master/:id/edit', element: <DepartmentFormPage /> },
      // Access Management
      { path: 'user-management', element: <UserManagementPage /> },
      { path: 'user-management/new', element: <UserNewPage /> },

      { path: 'permission-matrix', element: <PermissionMatrixPage /> },
      { path: 'permission-matrix/new', element: <PermissionMatrixCreatePage /> },
      { path: 'permission-matrix/:id', element: <PermissionMatrixViewPage /> },
      { path: 'permission-matrix/:id/edit', element: <PermissionMatrixCreatePage /> },
      // System
      { path: 'audit-logs', element: <AuditLogsPage /> },
      { path: 'settings', element: <SettingsPage /> },
      // Modules (RBAC Showcase)
      { path: 'modules/:moduleCode', element: <ModuleDashboardPage /> },
      { path: 'modules/:moduleCode/list', element: <ModuleListPage /> },
    ],
  },
];

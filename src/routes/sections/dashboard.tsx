import { lazy, Suspense } from 'react';
import { Outlet } from 'react-router-dom';

import { CONFIG } from 'src/config-global';
import { DashboardLayout } from 'src/layouts/dashboard';

import { LoadingScreen } from 'src/components/loading-screen';
import { ErrorBoundary } from 'src/components/error-boundary/error-boundary';

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

// Masters (standalone reference masters)
const MasterCitiesPage = lazy(() => import('src/sections/masters/city/city-list'));
const MasterCityFormPage = lazy(() => import('src/sections/masters/city/city-form'));
const MasterCityViewPage = lazy(() => import('src/sections/masters/city/city-view'));
const LandConsultantListPage = lazy(() => import('src/sections/masters/land-consultant/land-consultant-list'));
const LandConsultantFormPage = lazy(() => import('src/sections/masters/land-consultant/land-consultant-form'));
const BDLandTeamListPage = lazy(() => import('src/sections/masters/bd-land-team/bd-land-team-list'));
const BDLandTeamFormPage = lazy(() => import('src/sections/masters/bd-land-team/bd-land-team-form'));
const MasterDepartmentListPage = lazy(() => import('src/sections/masters/department/department-list'));
const MasterDepartmentFormPage = lazy(() => import('src/sections/masters/department/department-form'));

// Access Management
const UserManagementPage = lazy(() => import('src/sections/users/user-list'));
const UserNewPage = lazy(() => import('src/sections/users/user-new'));
const UserDetailPage = lazy(() => import('src/sections/users/user-detail'));

const PermissionMatrixPage = lazy(() => import('src/sections/access/permission-matrix'));
const PermissionMatrixCreatePage = lazy(() => import('src/sections/access/permission-matrix-create'));
const PermissionMatrixViewPage = lazy(() => import('src/sections/access/permission-matrix-view'));

// System
const AuditLogsPage = lazy(() => import('src/sections/system/audit-logs'));
const SettingsPage = lazy(() => import('src/sections/system/settings'));

// Account
const MyProfilePage = lazy(() => import('src/sections/account/my-profile'));
const ChangePasswordPage = lazy(() => import('src/sections/account/change-password'));

// Modules (RBAC Showcase)
const ModuleDashboardPage = lazy(() => import('src/sections/modules/module-dashboard'));
const SubmoduleShowcasePage = lazy(() => import('src/sections/modules/submodule-showcase'));
const ModuleListPage = lazy(() => import('src/sections/modules/module-list'));
const ModuleCreatePage = lazy(() => import('src/sections/modules/module-create'));
const ModuleViewPage = lazy(() => import('src/sections/modules/module-view'));
const ModuleEditPage = lazy(() => import('src/sections/modules/module-edit'));
const ModuleDeletePage = lazy(() => import('src/sections/modules/module-delete'));

const DashboardIndex = lazy(() => import('src/pages/dashboard/index'));

const layoutContent = (
  <DashboardLayout>
    <ErrorBoundary>
      <Suspense fallback={<LoadingScreen />}>
        <Outlet />
      </Suspense>
    </ErrorBoundary>
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
      // Masters (standalone reference masters)
      { path: 'masters/cities', element: <MasterCitiesPage /> },
      { path: 'masters/cities/create', element: <MasterCityFormPage /> },
      { path: 'masters/cities/:id', element: <MasterCityViewPage /> },
      { path: 'masters/cities/:id/edit', element: <MasterCityFormPage /> },
      { path: 'masters/land-consultants', element: <LandConsultantListPage /> },
      { path: 'masters/land-consultants/create', element: <LandConsultantFormPage /> },
      { path: 'masters/land-consultants/:id/edit', element: <LandConsultantFormPage /> },
      { path: 'masters/bd-land-team', element: <BDLandTeamListPage /> },
      { path: 'masters/bd-land-team/create', element: <BDLandTeamFormPage /> },
      { path: 'masters/bd-land-team/:id/edit', element: <BDLandTeamFormPage /> },
      { path: 'masters/departments', element: <MasterDepartmentListPage /> },
      { path: 'masters/departments/create', element: <MasterDepartmentFormPage /> },
      { path: 'masters/departments/:id/edit', element: <MasterDepartmentFormPage /> },
      // Access Management
      { path: 'user-management', element: <UserManagementPage /> },
      { path: 'user-management/new', element: <UserNewPage /> },
      { path: 'user-management/:id/edit', element: <UserDetailPage /> },

      { path: 'permission-matrix', element: <PermissionMatrixPage /> },
      { path: 'permission-matrix/new', element: <PermissionMatrixCreatePage /> },
      { path: 'permission-matrix/:id', element: <PermissionMatrixViewPage /> },
      { path: 'permission-matrix/:id/edit', element: <PermissionMatrixCreatePage /> },
      // System
      { path: 'audit-logs', element: <AuditLogsPage /> },
      { path: 'settings', element: <SettingsPage /> },
      // Account
      { path: 'my-profile', element: <MyProfilePage /> },
      { path: 'change-password', element: <ChangePasswordPage /> },
      // Modules (RBAC Showcase)
      { path: 'modules/:moduleCode', element: <ModuleDashboardPage /> },
      { path: 'modules/:moduleCode/submodule/:submoduleId', element: <SubmoduleShowcasePage /> },
      { path: 'modules/:moduleCode/list', element: <ModuleListPage /> },
      { path: 'modules/:moduleCode/new', element: <ModuleCreatePage /> },
      { path: 'modules/:moduleCode/:id', element: <ModuleViewPage /> },
      { path: 'modules/:moduleCode/:id/edit', element: <ModuleEditPage /> },
      { path: 'modules/:moduleCode/:id/delete', element: <ModuleDeletePage /> },
    ],
  },
];

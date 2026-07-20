import { lazy, Suspense, type ReactNode } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from '@/stores/auth.store'
import { LinearProgress } from '@mui/material'
import DashboardLayout from '@/layouts/DashboardLayout'

const LoginPage = lazy(() => import('@/features/auth/pages/LoginPage'))
const DashboardPage = lazy(() => import('@/features/dashboard/DashboardPage'))
const PagePlaceholder = lazy(() => import('@/features/dashboard/PagePlaceholder'))
const Forbidden = lazy(() => import('@/pages/Forbidden'))
const NotFound = lazy(() => import('@/pages/NotFound'))

const ZoneListPage = lazy(() => import('@/features/geography/pages/ZoneListPage'))
const DepartmentListPage = lazy(() => import('@/features/organization/pages/DepartmentListPage'))
const RoleListPage = lazy(() => import('@/features/organization/pages/RoleListPage'))
const ModuleListPage = lazy(() => import('@/features/product-config/pages/ModuleListPage'))
const SubModuleListPage = lazy(() => import('@/features/product-config/pages/SubModuleListPage'))
const ActionListPage = lazy(() => import('@/features/product-config/pages/ActionListPage'))
const ProjectListPage = lazy(() => import('@/features/projects/pages/ProjectListPage'))
const UserListPage = lazy(() => import('@/features/users/pages/UserListPage'))
const PermissionMatrixPage = lazy(() => import('@/features/permissions/pages/PermissionMatrixPage'))
const RolePermissionPage = lazy(() => import('@/features/permissions/pages/RolePermissionPage'))
const UserPermissionPage = lazy(() => import('@/features/permissions/pages/UserPermissionPage'))
const WorkflowListPage = lazy(() => import('@/features/workflows/pages/WorkflowListPage'))
const WorkflowBuilderPage = lazy(() => import('@/features/workflows/pages/WorkflowBuilderPage'))
const ApprovalInboxPage = lazy(() => import('@/features/workflows/pages/ApprovalInboxPage'))
const ApprovalHistoryPage = lazy(() => import('@/features/workflows/pages/ApprovalHistoryPage'))
const DelegationPage = lazy(() => import('@/features/workflows/pages/DelegationPage'))

function LazyLoad({ children }: { children: ReactNode }) {
  return <Suspense fallback={<LinearProgress />}>{children}</Suspense>
}

function ProtectedRoute({ children }: { children: ReactNode }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const isLoading = useAuthStore((s) => s.isLoading)
  if (isLoading) return <LinearProgress />
  if (!isAuthenticated) return <Navigate to="/login" replace />
  return <LazyLoad>{children}</LazyLoad>
}

function PublicRoute({ children }: { children: ReactNode }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  if (isAuthenticated) return <Navigate to="/dashboard" replace />
  return <LazyLoad>{children}</LazyLoad>
}

export default function AppRouter() {
  return (
    <Routes>
      <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
      <Route path="/403" element={<LazyLoad><Forbidden /></LazyLoad>} />
      <Route path="/404" element={<LazyLoad><NotFound /></LazyLoad>} />

      <Route
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<DashboardPage />} />

        {/* Master Management */}
        <Route path="/master/geography" element={<ZoneListPage />} />
        <Route path="/master/organization" element={<DepartmentListPage />} />
        <Route path="/master/roles" element={<RoleListPage />} />

        {/* Product Configuration */}
        <Route path="/product-config/modules" element={<ModuleListPage />} />
        <Route path="/product-config/sub-modules" element={<SubModuleListPage />} />
        <Route path="/product-config/actions" element={<ActionListPage />} />

        {/* Future modules */}
        <Route path="/projects" element={<ProjectListPage />} />
        <Route path="/users" element={<UserListPage />} />
        <Route path="/permissions" element={<PermissionMatrixPage />} />
        <Route path="/permissions/roles" element={<RolePermissionPage />} />
        <Route path="/permissions/users" element={<UserPermissionPage />} />
        <Route path="/workflows" element={<WorkflowListPage />} />
        <Route path="/workflows/builder" element={<WorkflowBuilderPage />} />
        <Route path="/workflows/builder/:id" element={<WorkflowBuilderPage />} />
        <Route path="/approvals/inbox" element={<ApprovalInboxPage />} />
        <Route path="/approvals/history" element={<ApprovalHistoryPage />} />
        <Route path="/delegations" element={<DelegationPage />} />
        <Route path="/audit" element={<PagePlaceholder title="Audit Logs" />} />
      </Route>

      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/404" replace />} />
    </Routes>
  )
}

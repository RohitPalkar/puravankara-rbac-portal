# FRONTEND PHASE 1 — AUTHENTICATION + DASHBOARD SHELL

## Branch
- `frontend/rbac-v2-rebuild` — all Phase 0 + Phase 1 work

## Overview
Full auth flow (login → JWT → session → logout) and Dashboard application shell (sidebar + header + content area) with route guards.

---

## Files Created / Modified

### New Files

| File | Purpose |
|---|---|
| `src/features/auth/pages/LoginPage.tsx` | Login page with RHF + Zod, show/hide password, remember me, forgot password placeholder, right-side brand panel |
| `src/features/auth/services/auth.service.ts` | Auth API: login, logout, refreshToken, getProfile |
| `src/layouts/DashboardLayout/index.tsx` | App shell: sidebar + header + `<Outlet />` |
| `src/layouts/DashboardLayout/Header.tsx` | Sticky header: user avatar, name, role, notifications icon, profile dropdown with logout |
| `src/layouts/DashboardLayout/Sidebar.tsx` | Responsive sidebar: mobile drawer + permanent desktop, collapsible groups, Super Admin nav config |
| `src/pages/Forbidden.tsx` | 403 page |
| `src/pages/NotFound.tsx` | 404 page |

### Modified Files

| File | Changes |
|---|---|
| `src/app/providers.tsx` | Added `AuthInitializer` — calls `checkSession()` + `bootstrap()` on mount if token exists |
| `src/app/router.tsx` | Wrapped protected routes in `DashboardLayout`, added 403/404 routes, removed unused `PermissionRoute` |
| `src/services/api/axios.ts` | **Full refresh-token interceptor**: queue mechanism for concurrent 401s, retries original request after refresh, falls back to logout |
| `src/services/api/endpoints.ts` | Added `permissions.me` endpoint, `auth.logout` endpoint |
| `src/stores/auth.store.ts` | Complete Zustand store: `setAuth`, `clearAuth`, `logout` (calls API + clears), `checkSession`, token persistence via localStorage |
| `src/stores/permission.store.ts` | Added `bootstrap()` — calls `GET /permissions/me`, stores tree/projects/modules/actions; `hasModule()` / `hasAction()` helpers |
| `src/types/api.types.ts` | Added `RefreshPayload`, `PermissionTree`, `ProjectPermission`, `ModulePermission`, `SidebarNavItem` types |
| `src/features/dashboard/DashboardPage.tsx` | Welcome page: user info, 6 stat cards (users/roles/depts/zones/projects/modules), setup status warning, module/project chips |
| `src/hooks/useAuth.ts` | Simplified — re-exports auth store |

---

## Auth Flow

```
Login Page → RHF + Zod validate
  → POST /auth/login
  → setAuth() → localStorage tokens + Zustand state
  → POST /auth/me (checkSession) verify session
  → GET /permissions/me (bootstrap) load permissions
  → Navigate /dashboard

Page refresh → AuthInitializer detects token
  → GET /auth/me verify still valid
  → GET /permissions/me reload permissions
  → Render Dashboard

401 on any API call → axios interceptor
  → POST /auth/refresh (with queue for concurrent)
  → Retry original request
  → If refresh fails → clearAuth → redirect /login

Logout → POST /auth/logout (best-effort)
  → clearAuth → reset permissions → redirect /login
```

---

## Route Structure

| Path | Guard | Layout | Component |
|---|---|---|---|
| `/login` | PublicRoute | none | LoginPage |
| `/dashboard` | ProtectedRoute | DashboardLayout | DashboardPage |
| `/master/geography` | ProtectedRoute | DashboardLayout | PagePlaceholder |
| `/master/organization` | ProtectedRoute | DashboardLayout | PagePlaceholder |
| `/users` | ProtectedRoute | DashboardLayout | PagePlaceholder |
| `/permissions` | ProtectedRoute | DashboardLayout | PagePlaceholder |
| `/projects` | ProtectedRoute | DashboardLayout | PagePlaceholder |
| `/product-config` | ProtectedRoute | DashboardLayout | PagePlaceholder |
| `/workflows` | ProtectedRoute | DashboardLayout | PagePlaceholder |
| `/audit` | ProtectedRoute | DashboardLayout | PagePlaceholder |
| `/403` | none | none | Forbidden |
| `/404` | none | none | NotFound |
| `/` | — | — | Redirect → /dashboard |
| `*` | — | — | Redirect → /404 |

---

## Sidebar Navigation (Super Admin)

```
Dashboard
Master Data
  ├─ Geography
  └─ Organization
Users
Roles & Permissions
Projects
Product Config
Operations
  ├─ Workflows
  └─ Audit Logs
```

- Collapsible groups (Master Data, Operations)
- Mobile responsive (hamburger → temporary Drawer)
- Active route highlighting
- Designed to be driven by `permission.store` in future

---

## Validation

```
npm run build → ✓
  tsc -b       → 0 errors
  vite build   → 0 warnings
  dist/        → LoginPage 155KB, DashboardPage 19KB, total 438KB JS
```

---

## Pending for Phase 2

- [ ] Permission-based sidebar (drive from `permission.store` instead of hardcoded config)
- [ ] User management CRUD (list, create, edit, delete)
- [ ] Role management CRUD
- [ ] Geography (zones + cities) CRUD
- [ ] Organization (departments) CRUD
- [ ] Search/filter/pagination components
- [ ] Data table component with useTable hook
- [ ] Confirmation dialog component
- [ ] Toast notifications (sonner integration)
- [ ] API error handling layer

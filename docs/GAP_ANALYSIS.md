# Gap Analysis

## Current State vs Target Architecture

### ✅ Present (Working)

| Area | Status |
|------|--------|
| NestJS backend with TypeORM + MySQL | Complete |
| JWT authentication (email + password) | Complete |
| 12 TypeORM entities (User, Zone, City, Dept, Level, Role, Module, SubModule, Action, Mapping, RoleAssignment, Hierarchy) | Complete |
| Full CRUD APIs for all masters | Complete |
| Proper DTOs with class-validator (all modules) | Complete |
| Global exception filter + transform interceptor | Complete |
| Seed service (auto-seeds on startup) | Complete |
| React 19 + MUI 9 + Redux Toolkit frontend | Complete |
| JWT auth guard + public decorator + roles guard | Complete |
| Dynamic sidebar (permission-filtered) | Complete |
| PrivateRoute + Layout + login/logout | Complete |
| DataTable (MUI X DataGrid wrapper) | Complete |
| FormDialog (generic, react-hook-form) | Complete |
| Reusable hooks (useSnackbar, useCrudList) | Complete |
| All master pages with search, pagination | Complete |
| User creation wizard (multi-step) | Complete |
| Permission mapping page (with effective tree) | Complete |
| API base URL uses relative path (/api via proxy) | Complete |
| 403 interceptor with console.warn | Complete |

### ❌ Missing Business Rules (Phase 2)

| # | Gap | Impact | Priority |
|---|-----|--------|----------|
| 1 | **Admin role bypass** — Admin should bypass perms like Super Admin | Admin users get 403 on unmapped modules | High |
| 2 | **Primary + Secondary roles** — User can have 2 roles | Single-role limitation | High |
| 3 | **Project-scoped module toggles** — Per-project, per-user | Module access is global | High |
| 4 | **Hierarchy-based data scoping** — L3/L4 see dept-wide, L1 sees own | All users see same data scope | High |
| 5 | **Manager cascade selection** — L2/L3/L4 pickers in user creation | No hierarchy assignment in wizard | High |
| 6 | **Default-deny principle** — 403 for unauthorized access | No 403 enforcement on routes | High |
| 7 | **Permission caching** — 15-min TTL on resolved perms | Every request re-evaluates | Medium |
| 8 | **Audit logging** — All mapping changes logged | No audit trail | Medium |

### ❌ Missing Masters & Seed Data (Phase 1)

| # | Item | Source |
|---|------|--------|
| 1 | **Projects** master CRUD (entity + APIs + FE) | RBAC Info.xlsx |
| 2 | **Brands** master CRUD | RBAC Info.xlsx |
| 3 | **Project Phases** master CRUD | RBAC Info.xlsx |
| 4 | Complete module definitions (18 business modules) | Seed SQL spec |
| 5 | Complete sub-module definitions (30+) | Seed SQL spec |
| 6 | Complete action definitions (7 base + 50+ custom) | Seed SQL spec |
| 7 | Complete role-permission mappings | Mapping seed SQL |

### ❌ Missing Permission Engine (Phase 2)

| # | Item |
|---|------|
| 1 | `@Permissions(module, action)` decorator |
| 2 | `PermissionGuard` middleware |
| 3 | `GET /permissions/check` — check single permission |
| 4 | `GET /permissions/my-permissions` — resolved tree |
| 5 | `POST /auth/switch-role` — switch active role |
| 6 | In-memory permission cache (15-min TTL) |
| 7 | `permission_audit_log` table + audit middleware |

### ❌ Missing Frontend Components (Phase 2)

| # | Component |
|---|-----------|
| 1 | `PermissionProvider` — React context for permissions |
| 2 | `PermissionGuard` — route-level permission guard |
| 3 | `CanAccess` — conditional UI wrapper |
| 4 | `RoleSwitcher` — dropdown in AppBar |
| 5 | `DynamicSidebar` — API-driven nav items |
| 6 | `ForbiddenPage` — enhanced 403 page |
| 7 | Button-level permission hiding (Phase 7) |

## Recommended Phase Order

```
Phase 1: Seed complete modules/actions + Projects/Brands/Phases masters
Phase 2: Permission engine (decorators, guard, cache, audit, switch-role)
Phase 3: Multi-role + project scoping APIs
Phase 4: Frontend permission infrastructure (Provider, Guard, CanAccess)
Phase 5: Enhanced user creation wizard
Phase 6: Enhanced permission mapping UI
Phase 7: Route + button-level permission enforcement
Phase 8: Backend permission guard retrofit
Phase 9: Integration testing + hardening
```

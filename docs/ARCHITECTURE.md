# Architecture

## Overview

Puravankara RBAC Admin Platform is a full-stack enterprise application.

- **Backend**: NestJS 11 + TypeORM + MySQL 8 + JWT
- **Frontend**: React 19 + MUI 9 + Redux Toolkit + React Router 7 + Vite 8

## Backend Architecture

```
backend/src/
├── main.ts                      # Entry point, global pipes, CORS, /api prefix
├── app.module.ts                # Root module, global filter/interceptor/guard
├── config/
│   ├── database.config.ts       # MySQL TypeORM config (synchronize: true)
│   └── jwt.config.ts            # JWT secret + expiration
├── common/
│   ├── decorators/              # @CurrentUser, @Public, @Roles, @Permissions
│   ├── dto/pagination.dto.ts    # Reusable pagination query DTO
│   ├── filters/                 # Global HTTP exception filter
│   ├── guards/                  # JWT auth, permission, roles guards
│   └── interceptors/            # TransformInterceptor (standardizes responses)
└── modules/
    ├── auth/                    # Login, JWT, profile, sidebar
    ├── users/                   # CRUD + wizard (transactional create)
    ├── zones/                   # Zone master CRUD
    ├── cities/                  # City master (belongs to Zone)
    ├── departments/             # Department + DepartmentLevel (auto-creates levels)
    ├── levels/                  # System-wide levels (L1-L4)
    ├── brands/                  # Brand master CRUD
    ├── projects/                # Project + access-matrix endpoint
    ├── project-phases/          # Project phase master
    ├── user-groups/             # User group master
    ├── role-definitions/        # Roles per department + level
    ├── module-definitions/      # Modules + SubModules (with isFlatModule flag)
    ├── action-definitions/      # Actions (linked to module or sub-module)
    ├── permission-mappings/     # DeptRoleModuleMapping CRUD + template get/save
    ├── user-role-assignments/   # User ↔ Role assignment
    ├── user-hierarchies/        # Manager cascade (L2/L3/L4)
    ├── employee-directory/      # Employee lookup (for user wizard)
    ├── dashboard/               # Dashboard stats
    └── seed/                    # Auto-seeds on startup (idempotent)
```

### Module Pattern

All modules follow:

```
module/
  entities/        # TypeORM entities
  dto/             # class-validator DTOs
  controller.ts    # REST endpoints
  service.ts       # Business logic
  module.ts        # NestJS module registration
```

### Global Guards/Interceptors

| Middleware | Scope | Purpose |
|-----------|-------|---------|
| `TransformInterceptor` | Global | Wraps all responses in `{ statusCode, message, data, meta }` |
| `AllExceptionsFilter` | Global | Standardizes error responses |
| `PermissionGuard` | Global | Checks module-level access for each route |
| `JwtAuthGuard` | Controller | Applied to all controllers except `@Public()` routes |

### Response Format

```json
// Success
{ "statusCode": 200, "message": "Success", "data": { ... }, "meta": { "total": 100, "page": 1, "limit": 10, "totalPages": 10 } }

// Error
{ "statusCode": 404, "message": ["Entity not found"], "data": null, "timestamp": "..." }
```

## Frontend Architecture

```
frontend/src/
├── main.tsx                     # React DOM entry
├── App.tsx                      # Theme provider, router, route definitions
├── index.css                    # Global styles, scrollbar, focus outlines
├── store/
│   ├── index.ts                 # Redux configureStore
│   └── slices/authSlice.ts      # Auth reducer (login, logout, permissions)
├── hooks/
│   ├── useAuth.ts               # Auth context (hasModule, hasPermission)
│   ├── useSidebar.ts            # Sidebar tree fetch
│   ├── useCrudList.ts           # Generic CRUD list state
│   └── useSnackbar.tsx          # Snackbar state + component
├── types/index.ts               # User, RoleAssignment, Permission, ApiResponse
├── services/api.ts              # Axios instance + interceptors
├── components/
│   ├── common/                  # DataTable, FormDialog, PrivateRoute, PermissionGuardRoute, CanAccess
│   └── layout/                  # Layout (AppBar + Sidebar + Outlet), Sidebar, RoleSwitcher
└── pages/
    ├── auth/LoginPage.tsx
    ├── dashboard/DashboardPage.tsx
    ├── users/UserListPage.tsx, UserCreatePage.tsx
    ├── roles/RoleListPage.tsx
    ├── permissions/PermissionMappingPage.tsx
    ├── errors/ForbiddenPage.tsx
    └── masters/ (8 CRUD pages)
```

### Data Flow

1. Login: `POST /api/auth/login` → JWT + user + permissions → Redux + localStorage
2. Routing: `PrivateRoute` checks JWT → `PermissionGuardRoute` checks module access → `ForbiddenPage` on deny
3. Sidebar: `GET /api/auth/sidebar` → dynamic nav tree filtered by permissions
4. Pages fetch data via `api.ts` (Axios, auto-attaches JWT)
5. All responses unwrapped by `TransformInterceptor` → frontend accesses `res.data.data`

### Permission Guards

| Component | Purpose |
|-----------|---------|
| `PrivateRoute` | Redirects to `/login` if no JWT |
| `PermissionGuardRoute` | Shows `ForbiddenPage` if user lacks module access |
| `CanAccess` | Conditionally renders children based on module + action |

## Database

### Tables (20 entities)

All extend `BaseEntity` with `id`, `created_at`, `updated_at`, `deleted_at` (soft delete).

See `docs/DATABASE.md` for full entity relationship details.

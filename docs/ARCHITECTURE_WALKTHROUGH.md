# Architecture Walkthrough

## Layered Architecture

The platform follows a strict layered architecture. Each layer has a single responsibility and communicates only with adjacent layers.

```
┌──────────────────────────────────────────────────────────────┐
│                     PRESENTATION LAYER                        │
│  React 19  │  MUI 9  │  Redux  │  React Router 7             │
├──────────────────────────────────────────────────────────────┤
│                      API LAYER                                │
│  HTTP (REST over port 3000)  │  JWT Bearer Auth              │
├──────────────────────────────────────────────────────────────┤
│                   APPLICATION LAYER                           │
│  NestJS Controllers │ Services │ Guards │ Interceptors       │
├──────────────────────────────────────────────────────────────┤
│                   DATA ACCESS LAYER                           │
│  TypeORM Repository Pattern │ Query Builder                  │
├──────────────────────────────────────────────────────────────┤
│                     DATA LAYER                                │
│  MySQL 8 │ 20 Tables │ Indexes │ Foreign Keys                │
└──────────────────────────────────────────────────────────────┘
```

---

## Frontend Architecture

### Directory Structure

```
frontend/src/
├── main.tsx                 # React entry point, mounts <App/>
├── App.tsx                  # Theme provider, router config, route tree
├── index.css                # Global styles
│
├── components/
│   ├── common/              # Reusable primitives
│   │   ├── DataTable.tsx    # Generic paginated data grid (MUI X)
│   │   ├── FormDialog.tsx   # Generic CRUD form dialog
│   │   ├── PrivateRoute.tsx # Auth guard (redirects to /login)
│   │   ├── PermissionGuardRoute.tsx  # Module-level route guard
│   │   └── CanAccess.tsx    # Action-level conditional rendering
│   └── layout/
│       ├── Layout.tsx       # Shell: AppBar + Sidebar + Outlet + Breadcrumbs
│       ├── Sidebar.tsx      # Dynamic nav tree from /auth/sidebar
│       └── RoleSwitcher.tsx  # Multi-role dropdown
│
├── hooks/
│   ├── useAuth.ts           # Auth context: hasModule(), hasPermission()
│   ├── useSidebar.ts        # Sidebar tree fetch + transform
│   ├── useCrudList.ts       # Generic CRUD state machine
│   └── useSnackbar.tsx      # Notification state
│
├── pages/
│   ├── auth/LoginPage.tsx
│   ├── dashboard/DashboardPage.tsx
│   ├── users/UserListPage.tsx, UserCreatePage.tsx
│   ├── roles/RoleListPage.tsx
│   ├── permissions/PermissionMappingPage.tsx
│   ├── errors/ForbiddenPage.tsx
│   └── masters/ (8 CRUD pages: Zone, City, Department, Level, Brand, Project, Phase, UserGroup)
│
├── services/
│   └── api.ts               # Axios instance, interceptors, token injection
│
├── store/
│   ├── index.ts             # Redux configureStore
│   └── slices/authSlice.ts  # Auth state: user, token, roles, permissions
│
└── types/
    └── index.ts             # User, RoleAssignment, Permission, ApiResponse
```

### Component Hierarchy

```
<ThemeProvider>
  <BrowserRouter>
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<PrivateRoute />}>
        <Route element={<Layout />}>
          ── <Route path="/dashboard" element={<PermissionGuardRoute moduleCode="dashboard" />}>
          │     <DashboardPage />
          ── <Route path="/users" element={<PermissionGuardRoute moduleCode="users" />}>
          │     <UserListPage />
          ── ... permission-guarded routes
```

### State Management

```
Redux Store
└── auth
    ├── user: User | null
    ├── token: string | null
    ├── roleAssignments: RoleAssignment[]
    ├── activeRoleIndex: number
    └── permissions: Permission[]

useAuth() hook provides:
  - hasModule(moduleCode): boolean
  - hasPermission(moduleCode, action): boolean
  - user, roleAssignments, isSuperAdmin
```

### Permission Guarding Layers (Frontend)

| Layer | Component | What it blocks |
|-------|-----------|----------------|
| Route | `PrivateRoute` | Unauthenticated access (no JWT) |
| Module | `PermissionGuardRoute` | Access to entire module pages |
| Action | `CanAccess` | Individual buttons, links, tabs |

---

## Backend Architecture

### Directory Structure

```
backend/src/
├── main.ts                  # Bootstrap, global pipes, CORS, /api prefix
├── app.module.ts            # Root module registration
│
├── config/
│   ├── database.config.ts   # TypeORM config (MySQL, sync, entities)
│   └── jwt.config.ts        # JWT secret + expiry
│
├── common/
│   ├── decorators/
│   │   ├── current-user.decorator.ts   # @CurrentUser() param decorator
│   │   ├── public.decorator.ts         # @Public() skips auth
│   │   ├── roles.decorator.ts          # @Roles('admin') check
│   │   └── permissions.decorator.ts    # @Permissions('users', 'create')
│   ├── dto/pagination.dto.ts           # Reusable pagination query DTO
│   ├── filters/all-exceptions.filter.ts # Global error response handler
│   ├── guards/
│   │   ├── jwt-auth.guard.ts           # JWT validation + user injection
│   │   ├── permission.guard.ts         # Module+action authorization
│   │   └── roles.guard.ts             # Role-level access
│   └── interceptors/transform.interceptor.ts  # Standardized {statusCode,message,data,meta}
│
└── modules/
    ├── auth/          # POST /auth/login, GET /auth/profile, GET /auth/sidebar, GET /auth/permissions
    ├── users/         # CRUD + wizard-create (transactional)
    ├── zones/         # Master CRUD
    ├── cities/        # Master CRUD (FK → zones)
    ├── departments/   # Master CRUD + auto-level creation
    ├── levels/        # Master CRUD
    ├── brands/        # Master CRUD
    ├── projects/      # Master CRUD + /access-matrix endpoint
    ├── project-phases/# Master CRUD
    ├── user-groups/   # Master CRUD
    ├── role-definitions/  # CRUD per department+level
    ├── module-definitions/ # Module + SubModule hierarchy
    ├── action-definitions/ # Actions per module/sub-module
    ├── permission-mappings/  # Template get/save for DeptRoleModuleMapping
    ├── user-role-assignments/ # User ↔ Role assignment
    ├── user-hierarchies/     # Manager cascade
    ├── employee-directory/   # Employee lookup
    ├── dashboard/            # Stats aggregation
    └── seed/                 # Auto-seed on startup
```

### Module Pattern

Every feature module follows the same structure:

```
modules/example/
├── entities/
│   └── example.entity.ts       # TypeORM entity
├── dto/
│   ├── create-example.dto.ts   # Validation rules
│   └── update-example.dto.ts   # Partial validation
├── example.controller.ts       # Route definitions
├── example.service.ts          # Business logic
└── example.module.ts           # NestJS module registration
```

### Request Lifecycle

```
HTTP Request
    │
    ▼
[CORS]  ← main.ts global middleware
    │
    ▼
[TransformInterceptor]  ← wraps response in {statusCode, message, data, meta}
    │
    ▼
[AllExceptionsFilter]   ← catches thrown exceptions, returns standardized error
    │
    ▼
[JwtAuthGuard]          ← validates JWT, injects user into request
    │
    ▼
[PermissionGuard]       ← checks module+action access (global, except @Public())
    │
    ▼
[Controller]            ← validates DTO, calls service
    │
    ▼
[Service]               ← business logic, calls repositories
    │
    ▼
[TypeORM Repository]    ← database operations
    │
    ▼
MySQL 8
```

### Response Format

Every response follows a single contract:

```json
// Success
{
  "statusCode": 200,
  "message": "Success",
  "data": { ... },
  "meta": {
    "total": 100,
    "page": 1,
    "limit": 10,
    "totalPages": 10
  }
}

// Error
{
  "statusCode": 404,
  "message": ["Entity not found"],
  "data": null,
  "timestamp": "2026-07-03T10:30:00.000Z"
}
```

---

## Data Flow: User Login

```
1. POST /api/auth/login { email, password }
2. Controller → AuthService.validateUser(email, password)
3. Service → bcrypt.compare(password, user.password)
4. Service → Load user + roleAssignments + permissions
5. Service → If isSuperAdmin: return ALL modules × ALL actions
6. Service → Generate JWT { userId, email, roles[] }
7. Controller → Return { accessToken, user, roleAssignments, primaryRole, permissions }
8. Frontend → Redux dispatch(loginSuccess(...))
9. Frontend → localStorage.setItem('accessToken', token)
10. Frontend → Navigate to /dashboard
```

## Data Flow: Permission Check (API)

```
1. Request arrives with Authorization: Bearer <JWT>
2. JwtAuthGuard extracts user from token
3. PermissionGuard reads route metadata (moduleCode, actionCode)
4. Guard checks user.isSuperAdmin → bypass
5. Guard queries permissions from request.user.permissions
6. Guard checks permission set for (moduleCode, actionCode)
7. Pass → call controller. Fail → throw ForbiddenException
```

## Data Flow: Dynamic Sidebar

```
1. GET /api/auth/sidebar (called on login and role switch)
2. Backend queries module_definitions where user has access
3. Returns filtered tree: [ { label, moduleCode, children: [...] } ]
4. Frontend maps moduleCode → route path via moduleCodeToPath()
5. Sidebar renders nav items with expand/collapse
6. Icons mapped via iconMap: Record<string, ReactNode>
```

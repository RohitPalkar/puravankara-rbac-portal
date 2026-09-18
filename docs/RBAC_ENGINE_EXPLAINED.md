# RBAC Engine Explained

## Core Architecture

The RBAC engine is a two-layer permission system that separates **capability** from **scope**.

---

## Layer 1: Role Permission Template (WHAT)

Defines what actions a role can perform on which modules. This is the **role template** — shared by all users who hold that role.

### Entity Chain

```
Department
    └── Level
         └── Role Definition
              └── DeptRoleModuleMapping  ← Permission template entries
                   ├── Module Definition
                   ├── SubModule Definition (optional)
                   ├── Action Definition
                   └── Level (optional filter)
```

### How It Works

1. A **Department** (e.g., Sales) has a **Level** (e.g., L2 Manager).
2. A **Role** (e.g., Sales Manager) is defined for a Department + Level combination.
3. The **Permission Matrix Builder UI** lets admins configure which modules, sub-modules, and actions the role can access.
4. These mappings are stored in `dept_role_module_mappings` — a single permission template per role.

### Example: Sales Manager Permission Template

```
Sales → L2 → Sales Manager → Permissions:
  ├── Masters Module: View, List
  ├── Users Module: View, List, Create
  ├── EOI Module: View, List, Create, Edit, Delete
  └── Bookings Module: View, List, Create
```

### Flat Modules vs Hierarchical Modules

| Type | Structure | Example |
|------|-----------|---------|
| Flat | Module → Actions directly | `Dashboard → View` |
| Hierarchical | Module → SubModule → Actions | `Masters → Zones → View, Create, Edit, Delete` |

Both types are handled uniformly. The `isFlatModule` flag on `module_definitions` determines the rendering mode in the UI and the query path in the backend.

---

## Layer 2: Project Access (WHERE)

Defines which projects a user can apply their role permissions to.

### Entity Chain

```
User
  └── UserProjectModuleAccess
       ├── Project
       ├── Module Definition
       ├── SubModule Definition (optional)
       ├── Action Definition
       └── allowed: boolean
```

### How It Works

1. When creating a user, the wizard's **Step 3** loads projects filtered by: selected zones + primary role.
2. The UI shows a matrix: Projects × Modules (filtered to only those the role has permission for).
3. The admin checks which project-module-action combinations the user should have.
4. These are stored in `user_project_module_access`.

### Project Access Scope on Role Assignment

Each `user_role_assignment` has an `access_scope` field:

| Scope | Behavior |
|-------|----------|
| `ALL_PROJECTS` | User can access all projects — bypasses project-level checks |
| `ASSIGNED_PROJECTS` | User can only access explicitly assigned project-module entries |

The `ASSIGNED_PROJECTS` scope is the default for non-admin roles.

---

## Active Role Context (Enterprise RBAC v2.1)

A user may hold multiple roles (Primary, Secondary, Buddy RM) but **exactly one is active per session**. The active role determines the sole authorization context; permissions are **not** merged across all assigned roles while a role is active.

```
User
  ↓
Selected Active Role  ← per-session context (JWT + user_sessions.active_role_id)
  ↓
Project / Scope
  ↓
Module
  ↓
Submodule
  ↓
Action
  ↓
Effective Permission (ActiveRole ∩ Project)
```

Switching roles does **not** mutate role assignments; it rotates the authenticated context and invalidates permission/project-scope caches.

- **Primary Role** — first assignment per user (`user_roles.role_type = 'PRIMARY'`), never expires unless deactivated.
- **Secondary Role** — `role_type = 'SECONDARY'`, may have `expires_at` → auto-excluded from switcher and rejected by guard after expiry; if active secondary expires, next request falls back to Primary.
- **Buddy RM** — `profile_type = BUDDY_RM` or `role_type = 'BUDDY_RM'`, delegated via permission profile; appears as a distinct switchable role.
- **Expiry & Fallback** — `user_roles.expires_at` / `permission_profiles.expires_at` evaluated on every `JwtStrategy.validate` and on `POST /auth/switch-role`; expired assignments are invisible in `GET /auth/my-roles` and rejected on switch, with silent fallback to Primary.

Backend remains source of truth: `PermissionGuard` resolves `activeRoleId` from JWT (`request.user.activeRoleId`) and passes it to `PermissionService.resolve({ activeRoleId })`, which narrows every lookup (`role_project_permissions`, `role_action_permissions`, `permission_profiles`) to that single role.

## Permission Resolution Algorithm

### Effective Permission = ActiveRole Permission ∩ Project Access

```
User (with ActiveRole = R) attempts Action A on Module M in Project P
    │
    ▼
Step 0: Resolve ActiveRole R from JWT/session (fallback to PRIMARY if expired/missing)
    │
    ▼
Step 1: Does ActiveRole R have a mapping for (Dept, Role, M, A) via role_project_permissions / role_action_permissions / profile?
    │
    ├── No  → DENIED
    │
    └── Yes → Go to Step 2
                │
                ▼
Step 2: Is the user a Super Admin?
    │
    ├── Yes → ALLOWED (bypass)
    │
    └── No  → Go to Step 3
                │
                ▼
Step 3: Does the user's role assignment have access_scope = 'ALL_PROJECTS'?
    │
    ├── Yes → ALLOWED
    │
    └── No  → Go to Step 4
                │
                ▼
Step 4: Is there a UserProjectModuleAccess entry for (User, P, M, A, allowed=true)?
    │
    ├── Yes → ALLOWED
    │
    └── No  → DENIED
```

### Pseudocode

```
function hasPermission(user, moduleCode, actionCode, projectId?, activeRoleId?):
    if user.isSuperAdmin:
        return true

    activeRole = activeRoleId ?? user.session.activeRoleId ?? user.primaryRoleId
    if expired(activeRole): activeRole = user.primaryRoleId // fallback

    rolePerms = getRolePermissions(activeRole) // only this role, no merge
    if not rolePerms.has(moduleCode, actionCode):
        return false

    projectScope = resolveScope(user, activeRole) // zones intersected with role's department zone
    if not projectScope.hasProject(projectId):
        return false
    if projectId is null:
        return false

    return hasProjectAccess(user, projectId, activeRole) && rolePerms.has(moduleCode, actionCode)
```

Role switch path:
```
POST /api/v1/auth/switch-role { roleId }
  → validate: authenticated, assigned, role.isActive, not expired, scope valid
  → update user_sessions.active_role_id
  → rotate tokens with new activeRoleId in JWT
  → audit AUTH / ROLE_SWITCH { from, to, ip, ua }
  → invalidate permission/scope caches for user
  → frontend refetch GET /auth/my-roles + GET /permissions/me → nav/projects/menus recalc
```

---

## Permission Calculation on Login

When a user logs in, their effective permissions are calculated and returned in the login response.

### Login Permission Resolution

```
POST /api/auth/login
    │
    ▼
1. Authenticate (email + bcrypt password)
    │
    ▼
2. Load user + role assignments + hierarchy
    │
    ▼
3. Determine active role (primary role by default)
    │
    ▼
4. Calculate permissions:
   ├── Super Admin  → Cartesian product: ALL modules × ALL actions
   ├── Admin role   → ALL modules × ALL actions (admin bypass)
   └── Normal user  → Query dept_role_module_mappings for role IDs
                        │
                        ▼
                 Return: [{ moduleId, moduleCode, actionCode }]
```

The returned `permissions[]` array is cached in Redux on the frontend. Every `hasModule()` / `hasPermission()` check runs against this cached array — no additional API calls needed for runtime checks.

---

## Hierarchical Permission Escalation

### Super Admin Bypass

Super Admin (`isSuperAdmin = true`) is the highest permission level. The super admin:

- Bypasses all `PermissionGuard` checks (both frontend and backend)
- Receives a full cross-join of all modules × all actions on login
- Has unconditional access to every route and API endpoint
- Is the bootstrap user created during seeding

### Admin Bypass

Users with admin-level roles (where `isAdmin` flag is true on role assignment) also receive full module access. This is useful for department-level administrators who need broad access within their scope but are not system-wide super admins.

---

## Frontend Permission Guards

### Route-Level: `PermissionGuardRoute`

```typescript
<PermissionGuardRoute moduleCode="users">
  <UserListPage />
</PermissionGuardRoute>
```

If the user lacks the `users` module permission, they see the `ForbiddenPage` instead.

### Action-Level: `CanAccess`

```typescript
<CanAccess moduleCode="users" action="create">
  <Button>Create User</Button>
</CanAccess>
```

If the user lacks the `create` action on the `users` module, children are not rendered.

### Runtime Lookup: `useAuth()`

```typescript
const { hasModule, hasPermission } = useAuth();

if (hasModule('sales')) { /* render sales section */ }
if (hasPermission('users', 'delete')) { /* show delete button */ }
```

---

## Summary

| Concept | Table / Mechanism | Configured Via |
|---------|------------------|----------------|
| Role Permission Template | `dept_role_module_mappings` | Permission Matrix Builder UI |
| Project Access | `user_project_module_access` | User Creation Wizard Step 3 |
| Project Scope | `user_role_assignments.access_scope` | Role assignment (ALL / ASSIGNED) |
| Super Admin Bypass | `users.is_super_admin` | Database flag |
| Runtime Check (FE) | `hasModule()` / `hasPermission()` | Cached Redux permissions |
| Runtime Check (BE) | `PermissionGuard` | Guard + route metadata |
| Dynamic Sidebar | `GET /auth/sidebar` | Filtered module tree |

```
WHAT (Role Permission) + WHERE (Project Scope) = EFFECTIVE ACCESS
```

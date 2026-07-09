# Technical Q&A — Enterprise RBAC Administration Platform

---

## Q1: How scalable is permission handling?

**Answer:** The resolver-based architecture separates permission calculation from business modules, making it highly scalable.

**Details:**
- Permission lookup is a single database query per request (cached on login).
- The `PermissionGuard` runs globally and checks a pre-calculated permission set — no per-action database queries at runtime.
- The permission set is computed at login time and returned in the JWT response payload. Frontend caches it in Redux.
- Adding thousands of users or hundreds of modules does not increase per-request latency.
- The bottleneck is the login endpoint itself (permission set calculation), which is O(n) where n = number of module-action combinations for the role — typically under 200 entries.

---

## Q2: Can SSO be added?

**Answer:** Yes. The authentication provider can be swapped without affecting the authorization layer.

**Details:**
- Authentication is handled by `JwtAuthGuard` and `AuthService`.
- To add SSO (SAML, OIDC, Azure AD, etc.):
  1. Add a new auth strategy (e.g., `SamlStrategy` or `OidcStrategy`) in the auth module.
  2. Add a `POST /auth/sso` endpoint that accepts the SSO token.
  3. After SSO validation, call the same permission-resolution logic that `POST /auth/login` uses.
  4. The JWT generation and permission calculation remain unchanged.
- The entire RBAC engine, permission guards, master data, and user management are authentication-agnostic.
- No changes needed to modules, entities, or guards.

---

## Q3: Can new modules be added?

**Answer:** Yes. Add a module entry in the master data — no code changes required for permissions.

**Details:**
- Modules are defined in the `module_definitions` table, not in code.
- To add a new module:
  1. Insert a row into `module_definitions` (name, code, parent_id if nested, is_flat_module flag).
  2. Insert action rows into `action_definitions` (linked to the module or sub-module).
  3. If hierarchical, insert sub-module rows into `sub_module_definitions`.
  4. The module automatically appears in:
     - Permission Matrix Builder UI
     - User Creation Wizard Step 3 (project access matrix)
     - Backend permission guard checks
     - Sidebar (if the user has permission)
- If the new module needs a dedicated UI page:
  1. Create a new page component in `frontend/src/pages/`.
  2. Add a route in `App.tsx` with `PermissionGuardRoute`.
  3. Add a sidebar icon mapping in `Sidebar.tsx`.
- The permission system itself requires zero code changes.

---

## Q4: Can the hierarchy structure change?

**Answer:** Yes. Each department controls its own hierarchy depth dynamically.

**Details:**
- The `departments.number_of_levels` field determines how many levels exist in that department.
- `DepartmentLevel` entries are auto-created when a department is created or its level count changes.
- The hierarchy chain (L2 → L3 → L4) is stored in `user_hierarchies` with nullable FK columns:
  - `manager_id` (L2)
  - `team_admin_id` (L3)
  - `dept_admin_id` (L4)
- To add a new level to all departments: insert a new `Level` row and update department level counts.
- No code changes are needed to extend the hierarchy — it's entirely data-driven.

---

## Q5: How are APIs protected?

**Answer:** JWT authentication + global permission guard with optional role-based decorators.

**Details:**
- **JwtAuthGuard** (applied globally via `APP_GUARD`): Validates JWT on every request. Extracts user and injects into `request.user`. Excluded on `@Public()` routes (e.g., login).
- **PermissionGuard** (applied globally): Reads `@Permissions()` decorator metadata from the route handler. Checks `user.permissions` for the required module+action. Returns 403 if denied. Super Admin bypasses automatically.
- **RolesGuard** (optional, applied per controller): Reads `@Roles()` decorator. Checks user's role level. Used for admin-level endpoints.
- **Pipeline:**

```
Request → JwtAuthGuard → PermissionGuard → RolesGuard (optional) → Controller
```

**Example controller protection:**
```typescript
@Controller('users')
@Permissions('users')  // module-level guard
export class UsersController {
  @Post()
  @Permissions('users', 'create')  // action-level guard
  async create(@Body() dto: CreateUserDto) { ... }

  @Public()  // no auth required
  @Get('public-stats')
  async publicStats() { ... }
}
```

---

## Q6: How is the permission template saved atomically?

**Answer:** The save operation is wrapped in a database transaction using TypeORM's `QueryRunner`.

**Details:**
- When saving `dept_role_module_mappings`:
  1. `softDelete` all existing mappings for the given (department, role, level) combination.
  2. `insert` new mappings from the payload.
  3. Both operations execute in a single transaction.
- If any insert fails, the softDelete is rolled back.
- This guarantees that a failed save never leaves the permission template in a partial state.

---

## Q7: How do flat modules differ from hierarchical modules?

**Answer:** Flat modules have actions directly attached. Hierarchical modules have actions under sub-modules.

**Details:**
- `module_definitions.isFlatModule = true`:
  - UI renders: Module → Checkboxes (actions directly)
  - Permission check: moduleId + actionId
  - Example: Dashboard (View)

- `module_definitions.isFlatModule = false`:
  - UI renders: Module → SubModule → Checkboxes (actions)
  - Permission check: moduleId + subModuleId + actionId
  - Example: Masters → Zones → View / Create / Edit / Delete

- Both types coexist in the same template. The `PermissionMappingPage` checks `isFlatModule` to determine rendering and data structure.

---

## Q8: How does the seed service work?

**Answer:** Runs on `OnModuleInit` and is idempotent — checks for existing data before inserting.

**Details:**
- `SeedService.onModuleInit()` executes after the database connection is established.
- Checks `if (count > 0) return;` for each entity — if rows exist, skips seeding.
- Seeds in dependency order: Levels → Modules → Actions → Zones → Brands → Phases → Departments → Roles → Employees → Super Admin.
- The super admin password is bcrypt-hashed.
- To reset: drop the database or truncate all tables and restart.

---

## Q9: What happens when a role's permissions change?

**Answer:** Existing users are unaffected until their next login or role switch.

**Details:**
- Permissions are calculated at login time and cached client-side.
- When a role's permission template is updated in the database:
  - Currently logged-in users still have their old cached permissions.
  - On next login, the user receives the updated permission set.
  - On role switch (via `RoleSwitcher`), the user's permissions are recalculated.
- No invalidation mechanism is needed — permission changes are not real-time by design (consistent with enterprise access control patterns where permission changes typically require re-authentication).

---

## Q10: How is the project access matrix filtered?

**Answer:** Only modules the role has permission for are shown in the wizard.

**Details:**
- The `GET /projects/access-matrix` endpoint accepts `zoneIds` and `roleId`.
- Backend queries:
  1. Projects in the specified zones.
  2. Role's permission template (dept_role_module_mappings for the role).
  3. Returns only modules+actions the role has access to, grouped by project.
- This ensures the admin assigning project access cannot inadvertently grant permissions the user's role doesn't have.
- The effective permission is always `rolePermission ∩ projectAccess`.

---

## Q11: Can I add custom actions beyond CRUD?

**Answer:** Yes. Actions are master data — not hard-coded.

**Details:**
- `action_definitions` is a regular table. Add any custom action:
  - `export` — Export data
  - `approve` — Approve workflow
  - `assign` — Assign tasks
  - Any organization-specific action
- The action appears in the Permission Matrix Builder automatically.
- Guards check for the action code — no code changes needed.
- Super Admin always has all actions.

---

## Q12: How does the frontend handle 403 errors?

**Answer:** Through a combination of route guards, API interceptors, and the ForbiddenPage component.

**Details:**
- **Before navigation:** `PermissionGuardRoute` checks the Redux permission set. If access denied, renders `ForbiddenPage`.
- **At API level:** Axios response interceptor catches 403 errors from the backend. Currently logs the user out for authentication errors; 403s from guarded routes are handled gracefully.
- **At UI level:** `CanAccess` component conditionally renders elements based on permission check.
- The `ForbiddenPage` shows a clear message and a "Back to Dashboard" button — never a dead-end.

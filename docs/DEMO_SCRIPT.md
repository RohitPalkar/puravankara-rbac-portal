# Demo Script — Enterprise RBAC Administration Platform

## Prerequisites

- Backend running on `http://localhost:3000`
- Frontend running on `http://localhost:5174`
- Database seeded (happens automatically on first backend start)
- Demo data ready: 5 departments, 13 roles, 9 employee directory entries, 2 projects

---

## Sequence 1: Login

**Action:**
1. Open browser to `http://localhost:5174`
2. Enter email: `superadmin@puravankara.com`
3. Enter password: `SuperAdmin@123`
4. Click **Sign In**

**Verify:**
- Redirected to `/dashboard`
- Sidebar shows full navigation
- Dashboard displays metric cards (Users, Roles, Departments, Projects)
- User avatar in top-right corner
- Breadcrumbs show "Dashboard"

**Explain:**
> This is JWT-based authentication. The backend validates credentials with bcrypt, generates a 24-hour JWT token, and returns the user's full permission set. The frontend stores the token in localStorage and uses it for all subsequent API calls. Super Admin bypasses all permission checks — you see every module in the sidebar.

---

## Sequence 2: Dashboard

**Action:** (already on dashboard after login)

**Verify:**
- 4 metric cards with icons and placeholder values
- Quick Actions panel: Create User, Manage Roles, Permission Matrix, View Logs
- Access Summary: Active Roles, Accessible Modules, Total Permissions

**Explain:**
> The dashboard aggregates data from multiple endpoints. Metric cards provide quick navigation. The Access Summary reflects the active role's permission scope. Since we're Super Admin, the module count includes all 20+ modules.

---

## Sequence 3: Masters Setup

### 3a: Zones

**Action:** Navigate to **Masters > Zones**

**Verify:**
- 4 zones listed: West, East, North, South
- Search field works
- Can add/edit/delete zones

**Explain:**
> Zones are geographical regions. Every master entity follows the same CRUD pattern: server-side pagination, search, status toggle, and a form dialog for create/edit. The DataTable and FormDialog components are reused across all 8 master pages.

### 3b: Departments

**Action:** Navigate to **Masters > Departments**

**Verify:**
- 5 departments: Administration, Sales, CRM, Finance, Operations
- Each has a `numberOfLevels` value
- Status column is clickable (toggle)

**Explain:**
> Departments control their own hierarchy depth through `numberOfLevels`. When a department is created, corresponding department-level entries are auto-generated. This means each department can have a different organizational structure.

### 3c: Levels

**Action:** Navigate to **Masters > Levels**

**Verify:**
- L1 (Individual Contributor) through L4 (Dept Admin)
- Sort order determines hierarchy rank

**Explain:**
> Levels are system-wide but can be selectively applied per department through role definitions. The permission matrix can optionally filter by level within a department-role combination.

### 3d: Roles

**Action:** Navigate to **Roles**

**Verify:**
- 13 roles across all departments
- Each role linked to a department and level
- Role list shows department and level columns

**Explain:**
> Roles are the bridge between the organizational chart and the permission system. A role definition ties together: Department + Level + Name. The actual permissions are set separately via the Permission Matrix.

### 3e: Projects

**Action:** Navigate to **Masters > Projects**

**Verify:**
- 2 projects: Puravankara Electronic City, Provident Park Square
- Each linked to zone, city, brand, phase

**Explain:**
> Projects are the "where" in our RBAC model. Users get access to specific projects through the wizard. Each project has full master data including GSTIN, billing entity, and payment gateway configuration.

---

## Sequence 4: Permission Matrix

**Action:**
1. Navigate to **Permission Management**
2. Select Department: **Sales**
3. Select Level: **L2 Manager**
4. Select Role: **Sales Manager**
5. Click **Load Permissions**

**Verify:**
- Module tree loads with checkboxes
- Modules have permission counters (e.g., "3 / 5")
- Expand/collapse works for hierarchical modules
- Flat modules show actions directly
- Hierarchical modules show SubModule → Action tree

**Action:**
1. Expand **Masters** module
2. Check Zone Management actions (View, Create)
3. Expand **Users** module
4. Check View, Create actions
5. Click **Save Permissions**

**Verify:**
- Success snackbar appears
- Unsaved changes warning appears if you modify without saving
- Reloading shows saved state

**Explain:**
> This creates a reusable permission template. Every user assigned the Sales Manager role will inherit these permissions. The template is stored in `dept_role_module_mappings`. Parent checkboxes cascade to children. The indeterminate state indicates partial selection. The save operation is transactional — old mappings are soft-deleted, new ones inserted atomically.

---

## Sequence 5: User Creation (Full Wizard)

### Step 1: Identity

**Action:**
1. Navigate to **Users** → **Create User**
2. Enter Employee ID: `SL002`
3. Click **Lookup**

**Verify:**
- Name and Email auto-populate from employee directory
- Mobile is editable
- Employment Type dropdown: Permanent / Contract / Serving Notice Period
- Start Date and End Date fields

**Explain:**
> The employee directory is a pre-seeded lookup table. It contains employee information imported from HR systems. The wizard uses it to auto-fill identity details — no manual data entry for existing employees. The lookup is by Employee ID, which is the organization's unique identifier.

### Step 2: Organization

**Action:**
1. Select Zone(s): **South** (multi-select)
2. Select Department: **Sales**
3. Select Primary Role: **Sales Manager**
4. Manager L2 candidates auto-load

**Verify:**
- Roles dropdown only shows Sales department roles (filtered by department selection)
- Hierarchy candidates appear based on department + level
- Secondary role, L3/L4 candidates, User Group all available

**Explain:**
> Step 2 maps the user to the organizational structure. Zone determines geographic scope. Department filters available roles. The hierarchy section builds the reporting chain — the system loads candidates based on department and level code (L2=Manager, L3=Team Admin, L4=Dept Admin).

### Step 3: Project Access

**Action:**
1. Verify project matrix loaded
2. Expand **Puravankara Electronic City**
3. Check several module checkboxes
4. Click **Create User**

**Verify:**
- Success snackbar with temporary password
- Auto-redirect to Users list
- New user appears in the table

**Explain:**
> Step 3 is where "WHAT + WHERE = EFFECTIVE ACCESS" comes together. The matrix shows only modules the selected role has permission for. The admin selects which project-module combinations the user can access. On creation, the backend:
> 1. Creates the User record with bcrypt-hashed temp password
> 2. Creates UserRoleAssignment
> 3. Creates UserHierarchy entries
> 4. Creates UserProjectModuleAccess entries
> All in a single transaction.

---

## Sequence 6: Login as Created User

**Action:**
1. Logout (avatar menu → Logout)
2. Login with the new user's credentials (temp password)

**Verify:**
- Sidebar shows fewer modules than Super Admin
- Restricted routes show **ForbiddenPage**
- Dashboard shows limited metrics

**Action:**
1. Attempt to navigate to a restricted module

**Verify:**
- `PermissionGuardRoute` blocks access
- `ForbiddenPage` displays with navigation back
- The `CanAccess` component hides restricted UI elements

**Explain:**
> Permission masking happens at three levels:
> 1. **Sidebar** — Only permitted modules appear (filtered via `/auth/sidebar` API)
> 2. **Routes** — `PermissionGuardRoute` checks module access before rendering
> 3. **Actions** — `CanAccess` conditionally renders buttons and links
> All three use the same permission set returned at login — no additional API calls.

---

## Sequence 7: Role Switching

**Action:** (if user has multiple roles)
1. Click role chip in top bar
2. Select secondary role

**Verify:**
- Permissions update in real-time
- Sidebar re-renders with new role's modules

**Explain:**
> When a user has multiple role assignments (primary + secondary), they can switch between them. The `RoleSwitcher` calls `/auth/permissions` to reload permissions for the selected role, dispatches to Redux, and the sidebar re-renders automatically.

---

## Sequence 8: Status Toggle

**Action:**
1. Navigate to **Users**
2. Click a user's status chip

**Verify:**
- Status toggles without page reload
- Visual feedback via snackbar

**Explain:**
> Status toggling is instant and works through a dedicated `PATCH /users/:id/toggle-status` endpoint. The DataTable refreshes in-place. This pattern is consistent across all entities that support status.

---

## Summary of Concepts Demonstrated

| Demo Sequence | Concept |
|--------------|---------|
| Login | JWT auth, permission set calculation |
| Dashboard | Aggregated stats, quick actions |
| Masters Setup | Master-driven architecture, reusable CRUD |
| Permission Matrix | Role permission templates, cascading checkboxes |
| User Creation | 3-step wizard, transactional create, temp password |
| Login as Created User | Runtime permission masking, 3-layer enforcement |
| Role Switching | Multi-role support, dynamic permission reload |
| Status Toggle | Instant state management, optimistic UI |

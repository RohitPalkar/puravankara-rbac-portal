# Demo Flow — End-to-End Business Journey

## Prerequisites

Backend and frontend running. Database seeded (auto on first startup).

## Step 1: Login as Super Admin

1. Open `http://localhost:5174`
2. Login: `superadmin@puravankara.com` / `SuperAdmin@123`
3. **Verify**: Dashboard shows 4 metric cards (Users, Roles, Departments, Projects), Quick Actions panel, Access Summary

## Step 2: Review Master Data

1. Navigate to **Masters > Zones** — verify 4 zones (West, East, North, South)
2. Navigate to **Masters > Departments** — verify 5 departments (Administration, Sales, CRM, Finance, Operations)
3. Navigate to **Masters > Levels** — verify L1-L4
4. Navigate to **Roles** — verify 13 roles across departments

## Step 3: Create a Permission Matrix

1. Navigate to **Permission Management**
2. Select Department: **Sales**, Level: **L2 Manager**, Role: **Sales Manager**
3. Click **Load Permissions**
4. Verify module tree loads with all modules
5. Expand **Masters** → enable a few sub-modules (e.g., Zones, Departments)
6. Expand **Users** → enable View, Create actions
7. Click **Save Permissions**
8. **Verify**: Success snackbar, unsaved warning disappears

## Step 4: Create a User (Full Wizard)

1. Navigate to **Users** → **Create User**

### Step 4a: Identity
1. Enter Employee ID: `SL002` (Anita Desai)
2. Click **Lookup**
3. Verify: Name, Email auto-populate (readonly), Mobile editable
4. Set Employment Type: **Permanent**
5. Set Start Date: today's date
6. Click **Next**

### Step 4b: Organization
1. Select Zone(s): **South**
2. Select Department: **Sales**
3. Verify: Roles dropdown populates with Sales roles
4. Select Primary Role: **Sales Manager**
5. Select a Manager L2 candidate (auto-loaded)
6. Click **Next**

### Step 4c: Project Access
1. Verify project matrix loads with modules filtered by Sales Manager permissions
2. Expand a project (e.g., **Puravankara Electronic City**)
3. Toggle module checkboxes to assign access
4. Click **Create User**
5. **Verify**: Success snackbar with temp password, auto-redirects to Users list

## Step 5: Verify Created User

1. Users list shows the new user
2. Verify: Employee ID, Name, Department, Role, Zone, Employment type (chip), Status are all correct
3. Status chip is clickable (toggle active/inactive)

## Step 6: Create Additional Users (Optional)

Create users for different roles to test permission boundaries:

| Employee ID | Name | Department | Role |
|------------|------|------------|------|
| SL001 | Rajesh Kumar | Sales | Sales Head |
| SL003 | Vikram Singh | Sales | Sales Executive |
| CRM001 | Priya Sharma | CRM | CRM Head |
| FIN001 | Amit Patel | Finance | Finance Executive |
| OPS001 | Rohit Verma | Operations | Operations Executive |

## Step 7: Test RBAC Enforcement

1. Logout Super Admin
2. Login as newly created user (use temp password)
3. **Verify**: Sidebar only shows permitted modules
4. Attempt to access restricted routes — **ForbiddenPage** shown
5. Verify `PermissionGuardRoute` blocks access
6. Verify `CanAccess` component conditionally renders UI elements

## Step 8: Test Permission Matrix

1. Login as Super Admin
2. Navigate to **Permission Management**
3. Load different Department + Role combinations
4. Verify each role sees correct pre-configured permissions
5. Toggle permissions, save, reload — verify persistence

## Expected Results

| Test Case | Expected |
|-----------|----------|
| Super Admin login | Full sidebar, all modules accessible |
| Normal user login | Sidebar only shows permitted modules |
| Forbidden route | 403 Forbidden page with navigation back |
| Permission save + reload | Permissions persist correctly |
| Flat module access | Shows direct actions, no sub-modules |
| Hierarchical module access | Shows SubModule → Action tree |
| User creation wizard | 3-step flow completes, user appears in list |
| Project matrix filtering | Only role-permitted modules visible |
| Status toggle | User status changes without page reload |

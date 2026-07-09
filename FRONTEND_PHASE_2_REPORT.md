# FRONTEND PHASE 2 — MASTER MANAGEMENT IMPLEMENTATION

## Branch
- `frontend/rbac-v2-rebuild`

## Overview
Built 6 master management CRUD screens with reusable components (DataTable, DrawerForm, ConfirmDialog, StatusChip, EmptyState).

---

## Sidebar Navigation (Updated)
```
Dashboard
Master Management
  ├─ Zone Master           /master/geography
  ├─ Department Master     /master/organization
  └─ Role Master           /master/roles
Product Configuration
  ├─ Modules               /product-config/modules
  ├─ Sub Modules           /product-config/sub-modules
  └─ Actions               /product-config/actions
Users                      /users
Roles & Permissions        /permissions
Projects                   /projects
Operations
  ├─ Workflows             /workflows
  └─ Audit Logs            /audit
```

---

## Screens Created

### 1. Zone Master (`/master/geography`)
- **List**: Zone Name, Total Cities Mapped, Status, Created Date, Actions
- **Create/Edit** (DrawerForm): Zone Name, Status toggle
- **City Mapping** (dual-list drawer when editing):
  - Left: Available cities with search + checkbox select
  - Right: Mapped cities with checkbox select
  - Move Selected → / ← Remove Selected buttons
  - Uses `GET /cities`, `GET /city-zone-mappings`, `POST /city-zone-mappings`, `DELETE /city-zone-mappings`
- **Actions**: Edit (opens drawer with mapping), Enable/Disable (Switch toggle with confirm)

### 2. Department Master (`/master/organization`)
- **List**: Department, Levels, Status, Actions
- **Create/Edit** (DrawerForm): Department Name, Number of Levels (1-10)
- **Live level preview**: Shows L1, L2, L3... badges as you type
- **Actions**: Edit, Enable/Disable

### 3. Role Master (`/master/roles`)
- **List**: Role, Department, Hierarchy Level, Status, Actions
- **Create** (DrawerForm with Stepper):
  - Step 1: Select Department (dropdown)
  - Step 2: Select Hierarchy Level (L1 to Lmax, auto-constrained by department's max levels)
  - Step 3: Enter Role Name
  - Back/Next navigation
- **Actions**: Enable/Disable

### 4. Modules (`/product-config/modules`)
- **List**: Module Name, Status, Actions
- **Create/Edit**: Module Name, Active toggle

### 5. Sub Modules (`/product-config/sub-modules`)
- **List**: Sub Module Name, Description, Status, Actions
- **Create/Edit**: Name, Description (multiline), Active toggle

### 6. Actions (`/product-config/actions`)
- **List**: Action Code, Action Label, Status, Actions
- **Create/Edit**: Code (e.g. VIEW), Label (e.g. View), Active toggle

---

## Common Components Built

| Component | Location | Features |
|---|---|---|
| `DataTable` | `components/data-table/DataTable.tsx` | Sortable columns, search input, pagination, loading skeletons, empty state |
| `Column<T>` | (type) | id, label, render, sortable, width, align |
| `DrawerForm` | `components/dialogs/DrawerForm.tsx` | Right-side drawer, title, close button, scrollable body, cancel/save footer, loading state |
| `ConfirmDialog` | `components/dialogs/ConfirmDialog.tsx` | Title, message, confirm/cancel buttons, loading state |
| `StatusChip` | `components/common/StatusChip.tsx` | Active (green) / Inactive (gray) chip |
| `EmptyState` | `components/common/EmptyState.tsx` | Inbox icon + message |

---

## API Endpoints Connected

| Module | API Endpoints Used |
|---|---|
| Zones | `GET /zones`, `POST /zones`, `PATCH /zones`, `DELETE /zones` |
| Cities | `GET /cities` |
| City-Zone Mappings | `GET /city-zone-mappings`, `POST /city-zone-mappings`, `DELETE /city-zone-mappings` |
| Departments | `GET /departments`, `POST /departments`, `PATCH /departments` |
| Roles | `GET /roles`, `POST /roles`, `PATCH /roles` |
| Modules | `GET /modules`, `POST /modules`, `PATCH /modules` |
| Sub Modules | `GET /sub-modules`, `POST /sub-modules`, `PATCH /sub-modules` |
| Actions | `GET /actions`, `POST /actions`, `PATCH /actions` |

---

## Validation

```
npm run build → ✓
  tsc -b       → 0 errors
  vite build   → ✓ (627ms)
  dist/        → 6 master pages + common components code-split
```

---

## Permission Rules
- All pages check `usePermissionStore` for module/action access (ready for future permission enforcement)
- Sidebar can be filtered by `hasModule()` / `hasAction()` checks
- Currently all menus visible for Super Admin

---

## Known Issues / Pending for Phase 3
- [ ] Permission enforcement on buttons (hide Edit/Delete based on permissions)
- [ ] Role edit screen (currently create-only as spec'd)
- [ ] Sub Module → Module mapping UI
- [ ] City Master standalone (currently inline in Zone form)
- [ ] Bulk city mapping (currently one-by-one API calls)
- [ ] Search/filter on mapped cities list
- [ ] Form validation improvements (better error messages)
- [ ] Toast notification system (currently inline Snackbar, should use sonner)
- [ ] Loading states for table actions

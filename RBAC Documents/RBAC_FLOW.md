# RBAC Flow

## Entity Hierarchy

```
User
 ├── Zone (geographical region via UserZone)
 ├── Department (org unit: Sales, CRM, Finance, Operations)
 ├── Level (hierarchy: L1-L4)
 ├── RoleAssignments (primary + secondary roles)
 │    └── RoleDefinition
 │         ├── Department
 │         ├── Level
 │         └── DeptRoleModuleMappings (permission template)
 │              ├── ModuleDefinition
 │              ├── SubModuleDefinition
 │              ├── ActionDefinition
 │              └── Level
 ├── UserHierarchy (manager cascade)
 │    ├── Manager (L2)
 │    ├── TeamAdmin (L3)
 │    └── DeptAdmin (L4)
 └── UserProjectModuleAccess (project-level overrides)
      └── Project + Module + Action
```

## Permission Resolution

### Two-Layer Permission Model

```
Layer 1: Role Permission Template (WHAT can this role do?)
  DeptRoleModuleMapping: Department + Role + Module + SubModule + Action
  Managed via: Permission Matrix Builder UI

Layer 2: Project Access (WHERE can this user do it?)
  UserProjectModuleAccess: User + Project + Module + SubModule + Action
  Managed via: User Creation Wizard Step 3
```

### Effective Permission Calculation

```
Effective = RolePermission ∩ ProjectAccess

A user can perform Action A on Module M in Project P only if:
  1. Their role has DeptRoleModuleMapping for (Dept, Role, M, A) ✓
  2. They have UserProjectModuleAccess for (User, P, M, A, allowed=true) ✓
  OR their role has accessScope = ALL_PROJECTS
```

### Login Flow

1. User posts `{ email, password }` → `POST /api/auth/login`
2. Backend validates credentials (bcrypt.compare)
3. Loads user + role assignments + effective permissions
4. If `isSuperAdmin` → returns ALL modules × ALL actions (CROSS JOIN)
5. If admin role → also returns full access
6. If normal user → queries `dept_role_module_mappings` for user's role IDs
7. Returns: `accessToken`, `user`, `roleAssignments`, `primaryRole`, `permissions[]`

### Permission Check (Frontend)

```typescript
hasModule('sales')              → boolean (can access module)
hasPermission('sales', 'create') → boolean (can perform action)
user.isSuperAdmin               → bypasses all checks
```

### Dynamic Sidebar

1. `GET /api/auth/sidebar` returns module tree filtered by user permissions
2. `Sidebar.tsx` renders dynamic nav with proper icons
3. Each sidebar item has a `moduleCode` mapped to a route path
4. Non-admin users see only permitted modules

## Permission Matrix Builder

```
Department → Level → Role → Load Permissions
  ↓
Module Tree (expandable/collapsible)
  ├── [✓] Module A (flat) - 4/5 enabled
  │    ├── [✓] Action 1
  │    ├── [✓] Action 2
  │    └── [ ] Action 3
  └── [✓] Module B (hierarchical) - 2/2 enabled
       └── [✓] SubModule B1
            ├── [✓] Action 1
            └── [✓] Action 2
```

- Parent checkbox cascade: select all / deselect all children
- Indeterminate state for partial selections
- Permission counters per module
- Search, expand/collapse all, unsaved changes warning
- Transactional save: soft-delete old + insert new mappings

## Flat Module Support

Two types of modules:

```
Type 1 (Hierarchical):        Type 2 (Flat):
  Module                        Module (isFlatModule=true)
    └── SubModule                 └── Action 1
         └── Action 1              └── Action 2
         └── Action 2
```

Both types handled correctly in permission template get/save and project access matrix.

## Seed Data

Auto-seeded on first startup (5 departments, 13 roles, 9 employees):

| Department | Roles | Levels |
|-----------|-------|--------|
| Administration | Super Admin, Admin | L4, L2 |
| Sales | Sales Head, Sales Manager, Sales Executive | L4, L2, L1 |
| CRM | CRM Head, CRM TL, CRM Executive | L3, L2, L1 |
| Finance | Finance Head, Finance Admin, Finance Executive | L3, L2, L1 |
| Operations | Operations Head, Operations Executive | L3, L1 |

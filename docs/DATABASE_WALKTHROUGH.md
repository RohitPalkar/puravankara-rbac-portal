# Database Walkthrough

## Overview

20 TypeORM entities mapped to MySQL 8 tables. All entities extend `BaseEntity` with `id`, `created_at`, `updated_at`, `deleted_at` (soft delete via `@DeleteDateColumn`).

---

## Entity Groups

### Group 1: Organization Structure

Defines the physical and organizational hierarchy of the business.

```
Zone ──── City
  │
  └────── UserZone (user assignment)
  │
  └────── Project
            ├── Brand
            └── ProjectPhase

Department ──── DepartmentLevel
```

| Entity | Key Columns | Purpose |
|--------|-------------|---------|
| `zones` | `id`, `name`, `code`, `status` | Geographical regions: West, East, North, South |
| `cities` | `id`, `name`, `zone_id (FK)` | Cities within zones |
| `departments` | `id`, `name`, `code`, `number_of_levels` | Org units: Sales, CRM, Finance, Ops, Admin |
| `department_levels` | `id`, `department_id (FK)`, `level_number`, `level_name`, `level_code` | Per-department level definitions |
| `levels` | `id`, `code`, `name`, `sort_order` | System-wide levels: L1-L4 |
| `brands` | `id`, `name`, `code`, `gstin`, `pan` | Business brands: Puravankara, Provident, Purva Land |
| `projects` | `id`, `name`, `code`, `zone_id (FK)`, `city_id (FK)`, `brand_id (FK)`, `phase_id (FK)` | Real-estate projects |
| `project_phases` | `id`, `name`, `code` | Project phases: Phase 1, 2, 3 |

**Relationship Diagram:**

```
zones 1──N cities
zones 1──N projects
cities 1──N projects
brands 1──N projects
project_phases 1──N projects
departments 1──N department_levels
```

---

### Group 2: Identity & Users

Defines who can access the system and their organizational context.

```
User ──── UserGroup
  │
  ├────── UserZone (N:N with Zone)
  │
  ├────── UserHierarchy (self-referencing)
  │         ├── manager_id (L2)
  │         ├── team_admin_id (L3)
  │         └── dept_admin_id (L4)
  │
  └────── EmployeeDirectory (lookup table)

Department ──── User (via department_id)
Level ──── User (via level_id)
```

| Entity | Key Columns | Purpose |
|--------|-------------|---------|
| `users` | `id`, `employee_id`, `name`, `email`, `password`, `department_id (FK)`, `zone_id (FK)`, `level_id (FK)`, `status`, `is_super_admin`, `employment_type`, `start_date`, `end_date`, `created_by_id (FK self)`, `must_change_password`, `last_login` | Core user record |
| `user_groups` | `id`, `name`, `code` | Grouping: Closing RM, Team Admin, Dept Admin |
| `user_zones` | `id`, `user_id (FK)`, `zone_id (FK)`, `is_primary` | Many-to-many user ↔ zone |
| `user_hierarchies` | `id`, `user_id (FK)`, `manager_id (FK)`, `team_admin_id (FK)`, `dept_admin_id (FK)` | Reporting structure |
| `employee_directory` | `id`, `employee_id`, `name`, `email`, `mobile`, `department`, `designation` | Pre-loaded employee data for wizard lookup |

**Relationship Diagram:**

```
users 1──1 user_hierarchies
users N──M user_zones ──M zones
users N──1 departments
users N──1 levels
users 1──N users (created_by)
employee_directory (independent lookup, no FKs)
```

---

### Group 3: Security Definitions

Defines the permission vocabulary — what can be protected.

```
ModuleDefinition
  ├── SubModuleDefinition
  │     └── ActionDefinition
  └── ActionDefinition (for flat modules)

Level ──── RoleDefinition
Department ──── RoleDefinition
```

| Entity | Key Columns | Purpose |
|--------|-------------|---------|
| `module_definitions` | `id`, `name`, `code`, `parent_id (FK self)`, `is_flat_module` | Application modules: Dashboard, Masters, Users, EOI, etc. |
| `sub_module_definitions` | `id`, `name`, `code`, `module_id (FK)` | Sub-sections within modules |
| `action_definitions` | `id`, `name`, `code`, `module_id (FK)`, `sub_module_id (FK)` | CRUD + custom actions: View, Create, Edit, Delete, Export |
| `role_definitions` | `id`, `name`, `code`, `department_id (FK)`, `level_id (FK)`, `description` | Roles per department+level: Sales Manager, CRM Head, etc. |

**Hierarchy:**

```
module_definitions (parent_id self-ref for nested modules)
     │
     ├── action_definitions (where module_id is set, sub_module_id is null) → Flat module
     │
     └── sub_module_definitions
              │
              └── action_definitions (where sub_module_id is set)
```

---

### Group 4: Permission Assignments

The actual permission data — who can do what, where.

```
DeptRoleModuleMapping ←── RoleDefinition
  ├── ModuleDefinition
  ├── SubModuleDefinition (nullable)
  ├── ActionDefinition
  └── Level (nullable, for level-specific permissions)

UserRoleAssignment ←── User
  ├── RoleDefinition
  └── access_scope (ALL_PROJECTS | ASSIGNED_PROJECTS)

UserProjectModuleAccess ←── User
  ├── Project
  ├── ModuleDefinition
  ├── SubModuleDefinition (nullable)
  ├── ActionDefinition
  └── allowed (boolean)
```

| Entity | Key Columns | Purpose |
|--------|-------------|---------|
| `dept_role_module_mappings` | `department_id`, `role_definition_id`, `module_id`, `sub_module_id`, `action_id`, `level_id` | Permission templates (what a role can do) |
| `user_role_assignments` | `user_id`, `role_definition_id`, `is_primary`, `access_scope`, `project_ids (JSON)` | Which user has which role |
| `user_project_module_access` | `user_id`, `project_id`, `module_id`, `sub_module_id`, `action_id`, `allowed` | Per-user project-level overrides |

**Relationship Diagram:**

```
dept_role_module_mappings
  N──1 role_definitions
  N──1 module_definitions
  N──1 sub_module_definitions (nullable)
  N──1 action_definitions
  N──1 levels (nullable)

user_role_assignments
  N──1 users
  N──1 role_definitions

user_project_module_access
  N──1 users
  N──1 projects
  N──1 module_definitions
  N──1 sub_module_definitions (nullable)
  N──1 action_definitions
```

---

## Entity Relationship Summary

```
Organization                    Identity                        Security                        Permissions
────────────                    ────────                        ────────                        ───────────
zones                           users                           module_definitions              dept_role_module_mappings
  └── cities                      ├── user_hierarchies            ├── sub_module_definitions       ├── role_definitions
  └── projects                    ├── user_zones                  └── action_definitions             ├── module_definitions
       ├── brands                 ├── user_groups                                                    ├── action_definitions
       └── project_phases         ├── employee_directory        role_definitions                  └── levels
                                  └── user_role_assignments       ├── departments
departments                                                        └── levels                    user_project_module_access
  └── department_levels                                            ├── action_definitions           ├── users
                                                                                                    ├── projects
levels                                                             ├── module_definitions            ├── module_definitions
                                                                                                    └── action_definitions
```

---

## Key Database Features

### Soft Delete

Every entity inherits `deleted_at` from `BaseEntity`. TypeORM's `@DeleteDateColumn` enables:

- All queries automatically filter `WHERE deleted_at IS NULL`
- Record restoration possible by clearing `deleted_at`
- Audit trail without data loss

### Foreign Key Strategy

All FKs use `ON DELETE NO ACTION` (TypeORM default). This prevents accidental cascade deletes that could orphan critical permission data. Deletion of referenced entities requires explicit handling in service code.

### Indexing Strategy

- Primary keys: auto-increment `id` on all tables
- Unique constraints: `name`, `code` on master entities (zones, departments, levels, etc.)
- Composite unique: `(department_id, role_definition_id, module_id, sub_module_id, action_id)` on `dept_role_module_mappings`
- FK indexes: automatically created by TypeORM for relation columns

### JSON Columns

- `users.project_ids` — Quick lookup of user's project associations
- `user_role_assignments.project_ids` — Project scope for role assignments

These are used sparingly and only for denormalized lookups where a JSON column avoids complex join queries.

# Database Schema

## Overview

20 TypeORM entities mapped to MySQL tables. All extend `BaseEntity`:
- `id` (PrimaryGeneratedColumn)
- `created_at` (CreateDateColumn)
- `updated_at` (UpdateDateColumn)
- `deleted_at` (DeleteDateColumn — soft delete)

## Entity Relationship Diagram

```
Zone ──┬── City
       └── UserZone ── User

Department ──┬── DepartmentLevel
             └── RoleDefinition ──┬── DeptRoleModuleMapping
                                  │    ├── ModuleDefinition
                                  │    ├── SubModuleDefinition
                                  │    ├── ActionDefinition
                                  │    └── Level
                                  └── UserRoleAssignment ── User

User ──┬── UserHierarchy (self-ref: manager/teamAdmin/deptAdmin)
       ├── UserRoleAssignment
       ├── UserZone
       ├── UserProjectModuleAccess
       └── UserGroup

ModuleDefinition ──┬── SubModuleDefinition
                   └── DeptRoleModuleMapping

Level ──┬── RoleDefinition
        └── DeptRoleModuleMapping

Brand ── Project
ProjectPhase ── Project
Project ── UserProjectModuleAccess

EmployeeDirectory (lookup table, no FKs)
```

## Table Details

### `users` — Core user table
| Column | Type | Constraints |
|--------|------|-------------|
| `employee_id` | VARCHAR | UNIQUE, NOT NULL |
| `name` | VARCHAR | NOT NULL |
| `email` | VARCHAR | UNIQUE, NOT NULL |
| `password` | VARCHAR | NOT NULL (bcrypt hashed) |
| `mobile` | VARCHAR | NULLABLE |
| `department_id` | INT | FK → departments.id |
| `zone_id` | INT | FK → zones.id |
| `level_id` | INT | FK → levels.id |
| `status` | ENUM('active','inactive','suspended') | DEFAULT 'active' |
| `is_super_admin` | BOOLEAN | DEFAULT false |
| `employment_type` | ENUM('PERMANENT','CONTRACT','SERVING_NOTICE_PERIOD') | DEFAULT 'PERMANENT' |
| `start_date` | DATE | NULLABLE |
| `end_date` | DATE | NULLABLE |
| `created_by_id` | INT | FK → users.id (self-ref) |
| `must_change_password` | BOOLEAN | DEFAULT true |
| `last_password_changed_at` | DATETIME | NULLABLE |
| `last_login` | DATETIME | NULLABLE |

### `zones` — Geographical zones
UNIQUE on `name`, `code`. One-to-many to `City`.

### `cities` — Cities within zones
FK `zone_id` → zones.id (NOT NULL).

### `departments` — Organizational departments
UNIQUE on `name`, `code`. Has `number_of_levels` (default 4). One-to-many to `DepartmentLevel` and `RoleDefinition`.

### `department_levels` — Department-specific hierarchy levels
FK `department_id` → departments.id. Stores `level_number`, `level_name`, `level_code`.

### `levels` — System-wide hierarchy (L1-L4)
UNIQUE on `code`. Used by RoleDefinition and DeptRoleModuleMapping.

### `module_definitions` — Application modules
UNIQUE on `code`. Supports parent-child hierarchy (self-ref FK `parent_id`). Has `is_flat_module` flag for flat modules. One-to-many to SubModuleDefinition and DeptRoleModuleMapping.

### `sub_module_definitions` — Sub-modules within modules
FK `module_id` → module_definitions.id (NOT NULL).

### `action_definitions` — CRUD + custom actions
FK `module_id` → module_definitions.id (NULLABLE for sub-module actions). FK `sub_module_id` → sub_module_definitions.id (NULLABLE for flat module actions).

### `dept_role_module_mappings` — Permission templates (core RBAC table)
UNIQUE on `(department_id, role_definition_id, module_id, sub_module_id, action_id)`. FKs to Department, RoleDefinition, ModuleDefinition, SubModuleDefinition, ActionDefinition, Level.

### `user_role_assignments` — User ↔ Role assignments
FKs to User and RoleDefinition. Has JSON `project_ids` column. Has `access_scope` ENUM('ALL_PROJECTS','ASSIGNED_PROJECTS').

### `user_project_module_access` — Per-user project-level overrides
FKs to User, Project, ModuleDefinition, SubModuleDefinition, ActionDefinition. Boolean `allowed` column.

### `user_hierarchies` — Manager cascade
FKs to User (self-ref via manager_id, team_admin_id, dept_admin_id).

### `user_zones` — User ↔ Zone many-to-many
FKs to User and Zone. Boolean `is_primary`.

### `employee_directory` — Employee lookup table
UNIQUE INDEX on `employee_id`. Flat/denormalized for quick lookups. No FKs.

### Other tables
- `brands` — UNIQUE on `name`, `code`
- `projects` — FKs to Zone, City, Brand, ProjectPhase
- `project_phases` — UNIQUE on `code`
- `user_groups` — UNIQUE on `name`, `code`
- `role_definitions` — UNIQUE on `name`, `code`. FKs to Department and Level.

## Key Constraints

- All 20 entities extend `BaseEntity` → soft delete via `deleted_at`
- All foreign keys use `ON DELETE NO ACTION` (TypeORM default)
- All `status` columns use ENUM `('active', 'inactive')` except `users.status` which adds `'suspended'`
- JSON columns: `users.project_ids`, `user_role_assignments.project_ids`
- Self-referencing FKs: `module_definitions.parent_id`, `users.created_by_id`, `user_hierarchies.*`

# RBAC V0.3 Backend Alignment Report

## Summary
Implemented the Role Mapping API — the V0.3 RBAC model where roles are created through role mappings (not standalone CRUD). A role mapping transaction creates the role record, links it to a department, generates a permission template, and populates template permissions — all in a single DB transaction.

## New Files Created

| File | Purpose |
|------|---------|
| `src/modules/role-mapping/role-mapping.module.ts` | Module registering entities, controllers, service |
| `src/modules/role-mapping/role-mapping.controller.ts` | 3 controllers: RoleMapping (POST/GET/GET:id), DepartmentRoles, AvailableSecondaryRoles |
| `src/modules/role-mapping/role-mapping.service.ts` | Transactional create, list with counts, detail tree, department role lookup, secondary role lookup |
| `src/modules/role-mapping/role-mapping.dto.ts` | DTOs: CreateRoleMappingDto, list/detail response types |

## Modified Files

| File | Change |
|------|--------|
| `src/app.module.ts` | Added `RoleMappingModule` to imports |

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/role-mappings` | Create role mapping (transaction: role → dept-role → template → permissions) |
| `GET` | `/api/role-mappings` | List all role mappings with departmentName, hierarchyLevel, moduleCount, permissionCount, status |
| `GET` | `/api/role-mappings/:id` | Detail view with full module/subModule/action permission tree |
| `GET` | `/api/departments/:id/roles` | Active roles for a department (user creation dropdown) |
| `GET` | `/api/users/available-secondary-roles` | Roles eligible for secondary assignment (excludes a primary role ID via `?exclude=` query param) |

## Transactional Create Flow (`POST /api/role-mappings`)
1. Validates role name is unique and department exists
2. Creates `Role` record in `roles` table
3. Creates `DepartmentRole` mapping in `department_roles` table
4. Creates `PermissionTemplate` record in `permission_templates` table
5. Creates `TemplatePermission` records in `template_permissions` table for each module/subModule/action combo
6. All operations commit or rollback atomically

## Key Design Decisions
- **Existing tables reused**: `roles`, `department_roles`, `permission_templates`, `template_permissions` — no schema changes
- **Existing role GET APIs preserved**: standalone Role CRUD kept for dropdown/seeding compatibility
- **`POST /api/users/full` remains unchanged**: user creation references `roleId` which is still a valid FK to `roles` table
- **Permission template naming convention**: `Template: {roleName}` for deterministic lookup
- **Secondary roles rule**: returns all active roles minus the primary (caller can apply additional level-based filtering)
- **Department roles**: ordered by `hierarchyLevelRank` ascending

## Verification
- `npm run build`: 0 errors
- `npm test`: 78 tests passed, 10 suites passed
- Existing `POST /api/users/full` works without changes (only depends on role IDs existing in `roles` table)

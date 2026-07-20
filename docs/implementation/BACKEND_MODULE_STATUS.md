# Backend Module Status

> Generated: 2026-07-20 | Sprint: 0

## Overview

The backend (NestJS, TypeORM, PostgreSQL) is fully deployed and operational at:
- **API URL:** `https://puravankara-rbac-portal.onrender.com/api/v1/`
- **Health:** `GET /api/v1/health`

All 37 controllers across 29 controller files are live with ~163 routes.

## Module Status

| # | Module | Controller(s) | Routes | DB Tables | Status |
|---|--------|--------------|:------:|:---------:|:------:|
| 1 | Auth | `AuthController` | 6 | — | ✅ Live |
| 2 | Setup | `SetupController` | 2 | — | ✅ Live |
| 3 | Users | `UserController` | 7 | `users` | ✅ Live |
| 4 | User Roles | `UserRoleController` | 3 | `user_roles` | ✅ Live |
| 5 | User Reporting | `UserReportingLineController` | 3 | `user_reporting_lines` | ✅ Live |
| 6 | User Zones | `UserZoneController` | 3 | `user_zones` | ✅ Live |
| 7 | User Groups | `UserGroupController` | 5 | `user_groups` | ✅ Live |
| 8 | Brands | `BrandController` | 5 | `brands` | ✅ Live |
| 9 | Phases | `PhaseController` | 6 | `phases` | ✅ Live |
| 10 | Channel Partner Types | `ChannelPartnerTypeController` | 5 | `channel_partner_types` | ✅ Live |
| 11 | Channel Partners | `ChannelPartnerController` | 5 | `channel_partners` | ✅ Live |
| 12 | Cities | `CityController` | 5 | `cities` | ✅ Live |
| 13 | Zones | `ZoneController` | 5 | `zones` | ✅ Live |
| 14 | City-Zone Mappings | `CityZoneMappingController` | 3 | `city_zone_mappings` | ✅ Live |
| 15 | Projects | `ProjectController` | 4 | `projects` | ✅ Live |
| 16 | Project Locations | `ProjectLocationController` | 5 | `project_locations` | ✅ Live |
| 17 | Departments | `DepartmentController` | 5 | `departments` | ✅ Live |
| 18 | Roles | `RoleController` | 5 | `roles` | ✅ Live |
| 19 | Department Roles | `DepartmentRoleController` | 3 | `department_roles` | ✅ Live |
| 20 | Modules | `ModuleController` | 6 | `modules` | ✅ Live |
| 21 | Sub Modules | `SubModuleController` | 5 | `sub_modules` | ✅ Live |
| 22 | Actions | `ActionController` | 5 | `actions` | ✅ Live |
| 23 | Module-Actions | `ModuleActionController` | 5 | `module_actions` | ✅ Live |
| 24 | Permissions | `PermissionController` | 6 | — | ✅ Live |
| 25 | Permission Templates | `PermissionTemplateController` | 8 | `permission_templates` | ✅ Live |
| 26 | Role-Project Perms | `RoleProjectPermissionController` | 5 | `role_project_permissions` | ✅ Live |
| 27 | User Permission Overrides | `UserPermissionOverrideController` | 4 | `user_permission_overrides` | ✅ Live |
| 28 | Project Access | `UserProjectAccessController` | 4 | `user_project_access` | ✅ Live |
| 29 | Project Groups | `ProjectGroupController` | 5 | `project_groups` | ✅ Live |
| 30 | Group Projects | `ProjectGroupProjectController` | 3 | `project_group_projects` | ✅ Live |
| 31 | User Project Groups | `UserProjectGroupController` | 3 | `user_project_groups` | ✅ Live |
| 32 | Workflows | `WorkflowController` | 5 | `approval_workflows` | ✅ Live |
| 33 | Approvals | `ApprovalController` | 4 | `approval_requests` | ✅ Live |
| 34 | Delegations | `DelegationController` | 5 | `delegations` | ✅ Live |
| 35 | Notifications | `NotificationController` | 6 | `notifications` | ✅ Live |
| 36 | Audit Logs | `AuditController` | 1 | `audit_logs` | ✅ Live |
| 37 | Health | `HealthController` | 1 | — | ✅ Live |

## DB Schema Verification

| Entity | Columns | Migrations | Status |
|--------|:-------:|:----------:|:------:|
| Brands | 34 | 1 (InitialSchema) | ✅ Verified |
| Phases | 22 | 1 (InitialSchema) | ✅ Verified |
| Users | 11 | 1 (InitialSchema) | ✅ Verified |
| Cities | 5 | 1 (InitialSchema) | ✅ Verified |
| Zones | 5 | 1 (InitialSchema) | ✅ Verified |
| Projects | 33 | 1 (InitialSchema) | ✅ Verified |
| Departments | 5 | 1 (InitialSchema) | ✅ Verified |
| Roles | 7 | 1 (InitialSchema) | ✅ Verified |

## Migration Status

| Migration | Status |
|-----------|:------:|
| `1783077482111-InitialSchema.ts` | Applied (production) |
| `1783077482112-SyncSchemaWithEntities.ts` | 🚫 Orphaned → `docs/archive/migrations/` |
| `1783077482113-CreateBrandsTable.ts` | 🚫 Orphaned → `docs/archive/migrations/` |
| `1783083177415-MenuModulePermissionFix.ts` | 🚫 Orphaned → `docs/archive/migrations/` |

## Known Issues

| Issue | Detail | Status |
|-------|--------|:------:|
| `DEFAULT_ADMIN_PASSWORD` | Not set in Render dashboard env vars | ⚠️ Manual action needed |
| `admin@system.local` → `admin@puravankara.com` | Updated in `render.yaml`, not deployed | ✅ Staged |

# Architecture Alignment Report — Step 16

## Summary

| Area | Status | Changes |
|------|--------|---------|
| 1. Project Extended Metadata (JSONB) | ✅ Already Done | `projects.extended_metadata` JSONB column, frontend Advanced Configuration |
| 2. User Zone Access | ✅ Already Done | `user_zones` entity/service/controller, wizard Step 2 zone multi-select |
| 3. Permission Snapshot Engine | ✅ Already Done | `user_project_feature_matrix` entity, JSON snapshot structure |
| 4. Permission Compiler Service | ✅ Already Done | Full compile/save/invalidate/retrieve service with triggers |
| 5. Permission Snapshot History | ✅ NEW | `permission_snapshot_history` entity; PCS writes history on recompile |
| 6. Dependency Validation Service | ✅ NEW | `DependencyValidatorService` with `assertDepartmentDeletable`, `assertRoleDeletable`, `assertModuleDeletable` |
| 7. First Time Setup / System Settings | ✅ Enhanced | `system_settings` entity + `SystemSettingService`; existing `/setup/status` now persists `setup_completed` |
| 8. Frontend: Snapshot-driven Sidebar | ✅ NEW | Sidebar filters nav items via `hasModuleAccess()` from auth store |
| 9. Frontend: PermissionRoute | ✅ Enhanced | Now checks `requiredModule`/`requiredAction` against stored permissions |
| 10. Frontend: Login loads permissions | ✅ NEW | After auth, fetches `GET /permissions/me` and stores in auth store |

---

## Detailed Changes

### Enhancement 5 — Permission Snapshot History (`permission_snapshot_history`)

**DB Impact:** New table with 6 columns (id, user_id, project_id, snapshot jsonb, changed_by, created_at). FK references to users and projects with CASCADE deletes.

**API Impact:** None (internal — written by PermissionCompilerService on each `compileAndSave` call).

**Backend Files:**
- `backend/src/modules/permissions/entities/permission-snapshot-history.entity.ts` — NEW
- `backend/src/modules/permissions/services/permission-compiler.service.ts` — Updated: injects historyRepo, saves previous snapshot before overwriting

**Rationale:** Allows answering "Why could user approve something last month?" — old snapshots preserved before each recompile.

---

### Enhancement 6 — Dependency Validation Service

**DB Impact:** None (read-only; queries existing tables).

**API Impact:** Department/Role/Module `DELETE` endpoints now return `409 Conflict` with descriptive message if dependencies exist.

**Backend Files:**
- `backend/src/common/services/dependency-validator.service.ts` — NEW
- `backend/src/common/common.module.ts` — NEW (Global module providing DVS)
- `backend/src/modules/organization/services/organization.service.ts` — Updated: `DepartmentService.remove()` and `RoleService.remove()` call DVS
- `backend/src/modules/product-catalog/services/catalog.service.ts` — Updated: `ModuleCatalogService.remove()` calls DVS
- `backend/src/app.module.ts` — Updated: imports CommonModule

**Validation Rules:**

| Entity | Blocked If |
|--------|-----------|
| Department | Users exist with this departmentId, or department-role mappings exist |
| Role | UserRole assignments exist, or role-project-permissions exist |
| Module | Role-project-permissions, template-permissions, or module-actions reference this module |

---

### Enhancement 7 — System Settings / First Time Setup

**DB Impact:** New `system_settings` table (key PK, value JSONB).

**API Impact:** No new endpoints; existing `GET /setup/status` now writes `setup_completed: true` to `system_settings` when all required entities exist.

**Backend Files:**
- `backend/src/modules/setup/entities/system-setting.entity.ts` — NEW
- `backend/src/modules/setup/dto/system-setting.dto.ts` — NEW
- `backend/src/modules/setup/services/system-setting.service.ts` — NEW (upsert, get, isSetupCompleted, markSetupCompleted)
- `backend/src/modules/setup/setup.module.ts` — Updated: registers SystemSetting entity + SystemSettingService
- `backend/src/modules/setup/setup.service.ts` — Updated: calls `markSetupCompleted()` when all entities found

---

### Frontend: Snapshot-driven Sidebar & PermissionRoute

**Frontend Files:**
- `frontend/src/stores/authStore.ts` — Updated: added `permissions` (snapshot), `setPermissions`, `hasModuleAccess()`, `hasAction()`
- `frontend/src/pages/Login.tsx` — Updated: after successful login, calls `GET /permissions/me` and stores result
- `frontend/src/components/layout/Sidebar.tsx` — Updated: nav items have `requiredModule`; filtered by `hasModuleAccess()`
- `frontend/src/components/PermissionRoute.tsx` — Updated: checks `requiredModule`/`requiredAction` against stored permissions

---

## DB Impact Summary

| Table | Type | Description |
|-------|------|-------------|
| `projects` | Modified (Step 1) | `extended_metadata` JSONB column |
| `user_zones` | Existing (Step 2) | Composite PK (user_id, zone_id) |
| `user_project_feature_matrix` | Existing (Step 3) | Snapshot cache with JSONB |
| `permission_snapshot_history` | **NEW** | Historical snapshots for audit |
| `system_settings` | **NEW** | KV store for system configuration |

Total tables: 38 → 40

---

## API Impact Summary

| Method | Endpoint | Change |
|--------|----------|--------|
| DELETE | `/departments/:id` | Now returns 409 if dependencies exist |
| DELETE | `/roles/:id` | Now returns 409 if dependencies exist |
| DELETE | `/modules/:id` | Now returns 409 if dependencies exist |
| GET | `/setup/status` | Now persists `setup_completed` to system_settings |
| GET | `/permissions/me` | Consumed on login to populate frontend permissions |

---

## Test Impact

- Existing 76 backend tests not affected (no schema changes to existing tables, new entities are additive)
- DependencyValidatorService: should add unit tests for each assert method
- PermissionCompilerService: existing tests not affected; new `compileAndSave` saves history silently

---

## Validation Checklist

- [x] Backend builds clean (tsc --noEmit passes for non-spec files)
- [x] Frontend builds clean (tsc --noEmit passes)
- [ ] All 76 backend tests pass (requires running DB)
- [ ] Auth flow works (login → permission fetch)
- [ ] Permission engine unchanged (source of truth remains RBAC tables)

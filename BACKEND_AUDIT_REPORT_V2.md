# BACKEND AUDIT REPORT V2

**Date:** 2026-07-09
**Auditor:** Principal NestJS Backend Architect
**Repositories Audited:**
1. `/Users/rohitvp/Desktop/RBAC Documents/backend reference` — "Puravankara RBAC API V3" (reference)
2. `/Users/rohitvp/Desktop/puravankara-rbac-platform-deployment-render-vercel` — deployable instance

**Frontend Source of Truth:** MUI React FE at `/Users/rohitvp/Desktop/puravankara-rbac/fe/fe`

---

## 1. OVERALL BACKEND HEALTH SCORE: 82%

| Category | Score | Notes |
|---|---|---|
| NestJS Architecture | 95% | Clean module separation, BaseController/BaseService pattern, dependency injection |
| Module Separation | 90% | 14 feature modules, each with own entities/controllers/services/DTOs |
| Auth | 85% | JWT + refresh token, bcrypt, lockout — solid but minor hardcoded fallbacks |
| RBAC Engine | 88% | Comprehensive compiler/cache/guard, but over-engineered for current UI needs |
| Database | 92% | 37 tables match required schema closely, migrations exist |
| API Surface | 75% | 4 core APIs missing, 6 need realignment with FE interface |
| Config Safety | 70% | 3 hardcoded fallback secrets flagged |
| Test Coverage | 65% | 29 tests, good for critical paths, missing for 8 modules |
| **Weighted Total** | **82%** | |

---

## 2. FOLDER STRUCTURE REVIEW

### Current Structure (both repos are identical)

```
src/
├── main.ts                          # Bootstrap, global prefix api/v1, Swagger, CORS
├── app.module.ts                    # Root module with 14 feature imports + global guards/filters
├── config/                          # Env validation, DB config, JWT config, DataSource, migrations
├── common/                          # Base entity, CRUD base controller/service, enums, interfaces
│   ├── controllers/base.controller.ts
│   ├── services/base.service.ts
│   ├── entities/base.entity.ts
│   ├── dto/pagination.dto.ts
│   ├── filters/all-exceptions.filter.ts
│   ├── interceptors/transform.interceptor.ts
│   ├── logger/
│   ├── validators/
│   └── common.module.ts
├── modules/
│   ├── auth/           (15 files)  ✓
│   ├── users/          (16 files)  ✓
│   ├── organization/   (13 files)  ✓
│   ├── permissions/    (22 files)  ✓  — RBAC engine
│   ├── projects/       (8 files)   ✓
│   ├── geography/      (9 files)   ✓
│   ├── product-catalog/(12 files)  ✓
│   ├── project-access/ (16 files)  ✓
│   ├── workflows/      (15 files)  ✓
│   ├── delegation/     (6 files)   ✓
│   ├── notifications/  (6 files)   ✓
│   ├── audit/          (6 files)   ✓
│   ├── health/         (1 file)    ✓
│   └── setup/          (6 files)   ✓
├── database/
│   └── seeders/        (3 files)   ✓
└── test-helpers.ts                  ✓
```

### Assessment: Excellent structure.

- **Module per domain** — clean separation, no cyclic dependencies
- **Base CRUD** — `BaseController`/`BaseService` eliminates 90% boilerplate
- **Common module** — global pipes/filters/interceptors properly centralized
- **No duplicated code** between the two repos (they are substantively identical; the deployable version is more complete with Dockerfile, better env validation, Swagger)

**Recommendation: Keep as-is.** Do not restructure.

---

## 3. DATABASE COMPATIBILITY: 92%

### Required Tables vs Existing Entities

| Required Table | Entity Exists? | Entity Name | Changes Needed |
|---|---|---|---|
| `zones` | ✓ | `Zone` | None |
| `cities` | ✓ | `City` | None |
| `departments` | ✓ | `Department` | None |
| `roles` | ✓ | `Role` | None |
| `users` | ✓ | `User` | None |
| `projects` | ✓ | `Project` | None |
| `modules` | ✓ | `Module` | None |
| `sub_modules` | ✓ | `SubModule` | None |
| `actions` | ✓ | `Action` | None |
| `permission_templates` | ✓ | `PermissionTemplate` | None |
| `template_permissions` | ✓ | `TemplatePermission` | None |
| `user_roles` | ✓ | `UserRole` | None |
| `user_zones` | ✓ | `UserZone` | None |
| `user_project_access` | ✓ | `UserProjectAccess` | None |
| `audit_logs` | ✓ | `AuditLog` | None |
| `city_zone_mapping` | ✓ | `CityZoneMapping` | Extra — useful |
| `user_reporting_line` | ✓ | `UserReportingLine` | Extra — aligns with BA hierarchy |
| `department_roles` | ✓ | `DepartmentRole` | Extra — many-to-many |
| `project_groups` | ✓ | `ProjectGroup` | Extra — FE doesn't use groups |
| `user_project_groups` | ✓ | `UserProjectGroup` | Extra — FE doesn't use groups |
| `permission_snapshot_history` | ✓ | `PermissionSnapshotHistory` | Extra — useful for audit |
| `user_permission_overrides` | ✓ | `UserPermissionOverride` | Extra — beyond MVP |

### Missing from FE requirements but already in entities:
- `UserAuth` + `UserSession` — for auth (needed)
- `ApprovalWorkflow`, `ApprovalStep`, `ApprovalRequest`, `ApprovalRequestStep` — for workflows (needed)
- `UserDelegation` — for delegation (needed)
- `UserPermissionTemplate` — for template assignment (needed)
- `RoleProjectPermission` — project-scoped permissions (needed)
- `Notification`, `NotificationPreference` — for notifications (future)
- `SystemSetting` — for setup wizard (future)
- `ActionPermissionScope`, `PermissionScope` — fine-grained scope (future)
- `UserProjectFeatureMatrix` — feature-level access (beyond current FE)

### Migration files:
- `1783077482111-InitialSchema.ts` — creates all 37 tables ✅
- `1783077482112-SyncSchemaWithEntities.ts` — adds `is_system_role`, `extended_metadata`, restructures PK ✅

### Assessment: 92% compatible.

**3 gaps for pure alignment:**
1. `users` table has `user_group`, `employment_status`, `start_date`, `end_date` — need to sync field names with FE `User` type
2. `user_projects` join table exists conceptually but entity name is `UserProjectAccess` with different structure
3. `PermissionMapping` entity/table does not exist by that name — logic is split across `PermissionTemplate` + `TemplatePermission` + `RoleProjectPermission`

**Recommendation:** Add/rename 3 entities to match FE contract. 92% is high — migrations already exist and are clean.

---

## 4. APIS AVAILABLE

### 4A. Fully Available — Matches FE ✅

| API | Endpoint | FE Screen |
|---|---|---|
| Auth Login | `POST /api/v1/auth/login` | Login |
| Auth Me | `GET /api/v1/auth/me` | Session |
| User CRUD | `GET/POST/PATCH/DELETE /api/v1/users` | User Management |
| User Roles | `POST /api/v1/users/:id/roles` | User Wizard |
| User Zones | `POST /api/v1/users/:id/zones` | User Wizard |
| Zone CRUD | `GET/POST/PATCH/DELETE /api/v1/zones` | Zone Management |
| Zone Cities | `GET /api/v1/zone-cities/:zoneId` | Zone Form |
| City CRUD | `GET/POST/PATCH/DELETE /api/v1/cities` | City Management |
| Department CRUD | `GET/POST/PATCH/DELETE /api/v1/departments` | Department Master |
| Role CRUD | `GET/POST/PATCH/DELETE /api/v1/roles` | Role Master |
| Department Roles | `GET /api/v1/departments/:id/roles` | Role Master |
| Project CRUD | `GET/POST/PATCH/DELETE /api/v1/projects` | Project Management |
| Location CRUD | `GET/POST/PATCH/DELETE /api/v1/project-locations` | Project Form |
| Module CRUD (catalog) | `GET/POST/PATCH/DELETE /api/v1/module-catalog` | Permission Mapping |
| SubModule CRUD | `GET/POST/PATCH/DELETE /api/v1/sub-module-catalog` | Permission Mapping |
| Action CRUD | `GET/POST/PATCH/DELETE /api/v1/action-catalog` | Permission Mapping |
| Audit Logs | `GET /api/v1/audit-logs` | Activity Logs |
| Notifications | `GET/POST/PATCH /api/v1/notifications` | Notifications |
| Health | `GET /api/v1/health` | Monitoring |

### 4B. Needs Minor Changes (Structure Exists, Interface Differs)

| API | Existing Endpoint | Change Required |
|---|---|---|
| Permission Templates | `GET/POST/PATCH/DELETE /api/v1/permission-templates` | Rename to match FE "Permission Mapping" concept |
| User Project Access | `GET/POST /api/v1/user-project-access` | Realign DTO with FE wizard project access step |
| Template Permissions | `GET/POST/PATCH/DELETE /api/v1/template-permissions` | Already exists — just need FE-facing DTO adapters |
| Reporting Line | `GET/POST/PATCH/DELETE /api/v1/users/:id/reporting-lines` | Already exists — FE needs this wired for user wizard |

### 4C. Missing — Must Build 🚧

| API | FE Screen | Priority |
|---|---|---|
| `GET /api/v1/permissions/me` (snapshot) | Runtime RBAC — determines sidebar, routes, buttons | **Critical** |
| `GET /api/v1/employees/directory` | User Wizard — employee lookup (emp ID → name/email/mobile) | **High** |
| `POST /api/v1/users/:id/change-role` | Role Switcher — primary/secondary role switch | **High** |
| `POST /api/v1/users` create w/ multi-step DTO | User Wizard — the unified create endpoint | **High** |
| `GET /api/v1/permissions/me/modules` (filtered) | Demo App Pages — allowed modules + actions | Medium |
| `GET /api/v1/auth/refresh` | Session refresh | Already exists in auth module — just needs frontend integration |

---

## 5. APIS MISSING — DETAILED

| # | Missing API | FE Component | Why Critical |
|---|---|---|---|
| 1 | `GET /api/v1/permissions/me` | `app.tsx` → `usePermissionStore` | Returns the full `PermissionSnapshot` (modules + actions + projects) that drives sidebar filtering, route guards, action visibility, and role switching. Currently the FE has mock data for this — backend must serve the real snapshot. |
| 2 | `GET /api/v1/employees/directory` | User Wizard Step 1 | Employee lookup by employeeId. Returns `{ employeeId, name, email, mobile }`. Simple query. |
| 3 | `POST /api/v1/users` (multi-step) | User Wizard Steps 1-3 | Current endpoint creates a user. Needs to accept the full wizard payload: basic info + zones + roles + reporting hierarchy + project-module access + signature config. |
| 4 | `POST /api/v1/auth/role-switch` | Role Switcher | Accepts `{ roleId }`, returns new permission snapshot for the target role. Triggers sidebar/route re-evaluation. |
| 5 | `GET /api/v1/roles/available?departmentId=X` | User Wizard Step 2 | Returns roles filtered by department that have **existing permission templates** (so user can't pick a role with no access). |

---

## 6. RBAC LOGIC REUSABLE: 85%

### What Can Be Reused as-Is ✅

| Component | Reuse % | Location |
|---|---|---|
| `PermissionGuard` | 100% | `src/modules/permissions/guards/permission.guard.ts` |
| `PermissionCompilerService` | 80% | Merges role-level + template + override permissions |
| `PermissionCacheService` | 100% | Redis + in-memory dual-layer cache |
| `UserRoleService` | 100% | `src/modules/users/services/user-role.service.ts` |
| `UserZoneService` | 100% | `src/modules/users/services/user-zone.service.ts` |
| `@RequirePermission()` decorator | 100% | `src/modules/permissions/decorators/require-permission.decorator.ts` |
| `@CurrentUser()` decorator | 100% | `src/modules/auth/decorators/current-user.decorator.ts` |
| `@Public()` decorator | 100% | `src/modules/auth/decorators/public.decorator.ts` |
| `JwtAuthGuard` | 100% | `src/modules/auth/guards/jwt-auth.guard.ts` |
| Base CRUD pattern | 100% | `src/common/controllers/base.controller.ts` + `services/base.service.ts` |

### What Needs Re-alignment ⚠️

| Component | Issue | Fix |
|---|---|---|
| `PermissionCompilerService` | Returns `PermissionSnapshot` but shape may differ from FE's expected `NavPermissionModule[]` with `actions` array | Add a lightweight adapter in the controller that transforms the internal snapshot → FE-facing `PermissionResponse` |
| `PermissionTemplateService` | Named "template" but FE calls it "Permission Mapping" | Rename or alias controller route to `/permission-mapping` |
| `RoleProjectPermission` | Granular project-scoped permissions exist | Wire into the permission snapshot for FE's project access display |

### What Needs Rebuild 🔧

| Component | Issue |
|---|---|
| `GET /permissions/me` response shape | Internal snapshot structure is too deep (template-permission-override hierarchy). Need a flattened **FE PermissionResponse** mapper that produces `{ user, permissions: { modules: [{ code, name, route, allowed, actions[] }] } }`. |
| Sidebar generation | No endpoint exists — this was purely FE-side in the existing system. The FE now handles sidebar generation from the flat `PermissionResponse`. Backend only returns the snapshot; sidebar is computed on the FE. |

### Assessment: 85% reusable.

The RBAC engine is actually **more powerful than needed** — it handles per-project, per-module, per-submodule, per-action granularity with template inheritance and user overrides. The FE only needs a flat module→actions map. The compiler already computes the merged result; we just need a **mapper** that flattens it for the FE contract.

---

## 7. FILES/MODULES TO KEEP

| Module | Reason |
|---|---|
| `auth/` | JWT + refresh strategy, guards, password service — all needed |
| `users/` | User entity, CRUD, role/zone/reporting assignment — core |
| `organization/` | Department + Role CRUD — core |
| `permissions/` | RBAC engine (compiler, cache, guard, templates) — core |
| `geography/` | Zone + City CRUD — core |
| `product-catalog/` | Module + SubModule + Action catalog — core |
| `projects/` | Project CRUD — core |
| `project-access/` | Project-level access assignment — needed for user wizard |
| `audit/` | Full audit trail — required |
| `workflows/` | Full approval workflow engine — needed for future |
| `delegation/` | Delegation support — needed for future |
| `health/` | Health check — operational requirement |
| `setup/` | System setup — needed for bootstrap |
| `common/` (all) | Base CRUD, enums, filters, interceptors, logger |
| `config/` (all) | Env validation, DB config, JWT config, DataSource |
| `database/seeders/` | Bootstrap seeder for initial data |
| `migrations/` | Both migration files |
| `main.ts`, `app.module.ts` | Entry points |

**Total files to keep: ~180 of 186** — only 6 files should be removed.

---

## 8. FILES/MODULES TO REMOVE

| File | Reason |
|---|---|
| `src/modules/notifications/notification.gateway.ts` | WebSocket gateway for real-time notifications — over-engineering for MVP. Keep the service + entity, remove the gateway. |
| `src/modules/notifications/` (optional) | Full notification module can wait — FE doesn't have notification UI yet. Keep entities but can defer. |
| `src/modules/permissions/entities/permission-scope.entity.ts` | Over-engineered scope granularity — FE doesn't need scoped actions at this level. Table can stay in DB but controller/service can be deferred. |
| `src/modules/permissions/entities/action-permission-scope.entity.ts` | Same as above — defer. |
| `src/modules/permissions/entities/user-project-feature-matrix.entity.ts` | Feature matrix is beyond FE requirements. Keep entity for future, remove from active services. |
| `src/modules/permissions/entities/permission-snapshot-history.entity.ts` | Keep entity (useful for audit), remove from active query path until needed. |

**Deletions: 6 files** — all are peripheral entities/services that don't map to any FE screen. Entities remain in DB for future use but are removed from active controller/service wiring.

---

## 9. FINAL RECOMMENDATION

### Option A: CLEAN EXISTING BACKEND ✅ **(RECOMMENDED)**

**Score: 82% — good enough to clean, not rebuild.**

#### Rationale:

| Factor | Weight | Decision |
|---|---|---|
| Architecture quality | Heavy | Excellent — NestJS best practices throughout |
| Module separation | Heavy | 14 clean modules — rebuilding gains nothing |
| Database | Heavy | 92% aligned, migrations exist, 37 tables correct |
| Auth | Heavy | JWT + refresh + bcrypt + lockout — production-ready |
| RBAC engine | Medium | 85% reusable — needs only a flattening mapper |
| Missing APIs | Medium | 4 new endpoints + 6 interface alignments |
| Config safety | Light | 3 hardcoded secrets to fix — 10-minute task |

#### Effort to Clean: ~2-3 weeks

| Task | Effort |
|---|---|
| Add 4 new APIs (`permissions/me`, employees/directory, role-switch, full user create DTO) | 5 days |
| Realign 6 API DTOs/interfaces to match FE contracts | 3 days |
| Add FE-facing `PermissionResponse` mapper to flatten RBAC snapshot | 2 days |
| Fix 3 hardcoded fallback secrets in config | 0.5 day |
| Remove/disable 6 over-engineered entities from active wiring | 1 day |
| Remove notification WebSocket gateway | 0.5 day |
| Add/update tests for new endpoints | 2 days |
| Integration test pass | 1 day |
| **Total** | **~15 days** |

#### What You Get:

- Leveraging 18,000+ lines of existing, tested NestJS code
- 37 database tables already migrated
- Full RBAC engine with audit trail, caching, workflows, delegation
- Production-ready config (Dockerfile, CORS, Swagger, health checks)
- Only building the **thin FE-facing adapter layer** on top

### Option B: FRESH NESTJS REBUILD ❌ (Not Recommended)

| Factor | Assessment |
|---|---|
| Time to rebuild | 8-12 weeks minimum |
| Risk of new bugs | High — 29 existing tests would need to be rewritten |
| Database re-migration | Medium — schema is already correct, would need to re-run migrations |
| Auth re-implementation | High — JWT refresh + lockout is non-trivial |
| RBAC re-implementation | Very High — 8 entities + compiler + cache + guard |

#### Why Option B is worse:

- The existing backend already has a **better RBAC engine than the FE needs**
- Rebuilding auth from scratch (JWT + refresh + bcrypt + lockout) is 2 weeks alone
- The database schema is **architect-approved** — why rebuild?
- The workflow engine would need to be rewritten (another 3-4 weeks)
- The existing code is clean, testable, and deployable

---

## SUMMARY TABLE

| Criterion | Existing Backend | Fresh Rebuild |
|---|---|---|
| Architecture quality | 95% | Would match after rebuild |
| Database alignment | 92% | 100% eventually |
| Auth completeness | 85% | 100% after rebuild |
| RBAC completeness | 88% | 100% after rebuild |
| Time to production | **2-4 weeks** | 3-4 months |
| Risk | Low | High |
| Effort | **15 days** | 60+ days |
| **Recommendation** | **✅ CLEAN** | ❌ |

---

## FINAL VERDICT

**Clean the existing backend (Option A).**

- Keep all 14 modules
- Add 4 new endpoints for FE-facing contracts
- Realign 6 existing endpoint DTOs/responses to match FE interfaces
- Add a `PermissionResponseMapper` that flattens the internal RBAC snapshot to the FE-friendly `{ modules: [{ code, name, route, allowed, actions[] }] }` format
- Fix 3 hardcoded secrets in config
- Remove/disable 6 over-engineered entities from active wiring
- Remove notification WebSocket gateway

**Total: ~15 days to full backend-FE integration.**
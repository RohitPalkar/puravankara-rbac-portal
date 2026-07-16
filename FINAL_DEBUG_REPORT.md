# FINAL DEBUG REPORT — Enterprise RBAC + Project Provisioning Platform

**Date:** 2026-07-04
**Status:** CONDITIONAL PASS (see findings below)

---

## Executive Summary

The system is functionally complete and operational for 19/20 API test cases. Three bugs were found and fixed during testing. Several pre-existing design gaps and security issues are documented below. The system is deployable after addressing the **Critical** findings.

---

## Bugs Fixed During Testing

| # | Bug | Impact | Fix |
|---|-----|--------|-----|
| F1 | `UserService.generateEmpId()` uses `findOne()` without `where` clause | TypeORM v1 rejects this → `500` on user creation. **No user could be created.** | Changed to `find({ take: 1, order: ... })` at `src/modules/users/services/user.service.ts:105` |
| F2 | `AllExceptionsFilter` not handling TypeORM `QueryFailedError` | Duplicate key violations returned `500` instead of `409 Conflict` | Added `QueryFailedError` detection with `constructor.name` check at `src/common/filters/http-exception.filter.ts:17` |
| F3 | No `POST /auth/set-password` endpoint | Created users have no `UserAuth` record → **cannot ever log in**. Login flow silently creates empty password record → `401` | Added `POST /auth/set-password` to `AuthController` and `AuthService.setInitialPassword()` at `src/modules/auth/services/auth.service.ts:204` |
| F4 | Login flow creates UserAuth without password for new users | UserAuth rows persisted with `null` passwordHash → subsequent logins silently fail | Changed to throw clear `UnauthorizedException('Account not configured...')` at `src/modules/auth/services/auth.service.ts:96-100` |

---

## Test Results (19/20 Pass)

| Phase | Test | Result |
|-------|------|--------|
| 2 | Bootstrap status endpoint | ✓ |
| 4 | Department CRUD | ✓ |
| 4 | Role CRUD | ✓ |
| 4 | Project CRUD | ✓ |
| 4 | Module CRUD | ✓ |
| 4 | Duplicate entity → 409 (was 500, fixed) | ✓ |
| 4 | User create with empId generation (was 500, fixed) | ✓ |
| 4 | Sub-module CRUD | ✓ |
| 4 | City-Zone mapping | ✓ |
| 4 | User Project Access | ✓ |
| 4 | User Role assignment | ✓ |
| 4 | Permission Template + Permissions | ✓ |
| 4 | Set password for new user (new endpoint) | ✓ |
| 5 | John login (was blocked, now works) | ✓ |
| 5 | John access to zones (non-admin) | ✓ (200 — see finding S1) |
| 7 | Permission explain API | ✓ |
| 15 | Audit logs | ✓ |
| 16 | Delegations | ✓ |
| 17 | Notifications | ✓ |
| 17 | Health check | ✓ |

---

## Findings

### CRITICAL

#### C1 — No `ON DELETE CASCADE` on any FK relationship

All 54 foreign key constraints in the database lack `ON DELETE CASCADE` or `ON DELETE SET NULL`. Consequences:
- Soft-deleting a `User` leaves orphaned `UserRole`, `UserProjectAccess`, `UserAuth`, `UserSession`, `UserPermissionOverride`, `UserPermissionTemplate`, `UserProjectGroup`, `UserDelegation`, `UserReportingLine` records with dangling references
- Soft-deleting a `Role` leaves orphaned `UserRole`, `RoleProjectPermission` records
- Hard-deleting any referenced entity will fail with a FK violation

**Recommendation:** Add `ON DELETE CASCADE` on child tables or implement cascade logic in service layer's `remove()` methods.

#### C2 — BaseController CRUD endpoints missing `@RequirePermission()`

All endpoints in `BaseController` (`GET`, `POST`, `PATCH`, `DELETE`) are accessible to **any authenticated user** without permission checks. The global `PermissionGuard` returns `true` (line 32-34) when no `@RequirePermission()` decorator is present.

Affected entities: zones, cities, departments, roles, modules, sub-modules, actions, projects, project-groups, workflow configurations.

Any authenticated user (even with no roles) can CREATE/UPDATE/DELETE master data.

**Recommendation:** Add `@RequirePermission()` decorators to BaseController methods, or implement class-level permission on each controller.

#### C3 — No `RoleProjectPermission` CRUD controller

The `RoleProjectPermission` entity exists at `src/modules/permissions/entities/role-project-permission.entity.ts` and is used by the permission engine, but there is no REST controller to manage role-based permissions. Admins cannot grant permissions to roles via the API.

**Recommendation:** Create a `RoleProjectPermissionController` with CRUD endpoints.

#### C4 — No workflow creation endpoint

`WorkflowController` has only `GET` (list/detail/steps) and `POST .../submit`. There is no `POST /workflows` to create a new workflow configuration.

**Recommendation:** Add a `create` method to `WorkflowController`.

---

### HIGH

#### H1 — `UserRole`, `User`, and junction tables don't extend `AppBaseEntity`

9 entities bypass `AppBaseEntity`:
- `user.entity.ts` — has fields manually (OK but inconsistent)
- `user-role.entity.ts` — **no timestamps, no soft delete**
- `city-zone-mapping.entity.ts`, `department-role.entity.ts`, `action-permission-scope.entity.ts`, `project-group-project.entity.ts`, `project-location.entity.ts`, `user-project-access.entity.ts`, `user-project-group.entity.ts`, `user-reporting-line.entity.ts`, `user-permission-template.entity.ts`

Result: junction records cannot be soft-deleted and lack audit timestamps.

#### H2 — `Role.name` not unique

Roles table has no unique constraint on `name`, allowing duplicate role names. Same issue for `ApprovalWorkflow.name`.

**Recommendation:** Add `@Unique(['name'])` on `Role` and `ApprovalWorkflow` entities.

#### H3 — Missing FK constraints on Notification entities

`Notification.userId` and `NotificationPreference.userId` lack foreign key constraints to `users(emp_id)`. Same for `UserDelegation.userId`.

**Recommendation:** Add `@ManyToOne` with `@JoinColumn` on userId fields.

#### H4 — PermissionGuard SUPER_ADMIN check uses `name` string comparison

Line 71: `ur.role.name === 'SUPER_ADMIN'` — fragile string comparison. If role name is ever changed, SUPER_ADMIN bypass breaks.

**Recommendation:** Use a flag or compare against the role ID of SUPER_ADMIN.

#### H5 — No input validation on CreateUserDto email/name fields

No `@IsEmail()` on email, no `@MinLength` on name/email in `CreateUserDto`.

---

### MEDIUM

#### M1 — Redundant index on `UserProjectAccess`

Entity has both `@Index(['userId', 'projectId'])` and `@Unique(['userId', 'projectId'])`. Unique constraint already creates an index.

#### M2 — `PermissionService.resolve()` user lookup uses `findOne` with composite key

Line in `resolve()` uses `findOne` with multiple conditions — if TypeORM v1 considers this a "single row" fetch, it could throw the same error as Bug F1.

#### M3 — Setup status only checks Department, Project, Module

The `GET /api/v1/setup/status` endpoint checks only 3 entities. The bootstrap checklist should also include Zones, Cities, Roles, Users, Workflows.

#### M4 — Seed is not idempotent when data exists

If `npm run seed` is run on a non-empty database, it will attempt to re-insert the bootstrap user and SUPER_ADMIN role, causing unique constraint violations.

**Recommendation:** Add `findOne` + skip logic to bootstrap seeder.

---

### LOW

#### L1 — Frontend localStorage `auth-storage` may contain stale tokens after DB reset

After `DROP DATABASE` + recreate + reseed, the old access/refresh tokens in localStorage are invalid. Clear and re-login required.

#### L2 — `z.coerce.number()` type inference broken with Zod v4

As noted in earlier documentation. Explicit form data interfaces needed instead of `z.infer`.

#### L3 — No email notification provider implementation

`NotificationChannel` interface exists but only `InAppChannel` is implemented.

---

## Security Audit Summary

| Area | Status | Notes |
|------|--------|-------|
| JWT tokens | ✓ | Signed with secret, expiry, refresh rotation |
| Password hashing | ✓ | bcrypt with 12 rounds |
| Account lockout | ✓ | After 5 failed attempts |
| Rate limiting | ✓ | 100 req/min via throttler |
| Global auth guard | ✓ | All endpoints guarded by default |
| Permission check | ⚠️ | SUPER_ADMIN bypass works, but `@RequirePermission()` missing on BaseController |
| SQL injection | ✓ | TypeORM parameterized queries |
| CORS | ✓ | Whitelist configured |
| Helmet headers | ✓ | Security headers set |
| Input validation | ⚠️ | Missing on some DTOs (H5) |
| Soft delete | ⚠️ | Junction tables can't soft-delete (H1) |
| Cascade delete | ✗ | No ON DELETE CASCADE anywhere (C1) |

---

## Frontend API Contract Issues

| Endpoint | Expected | Actual | Status |
|----------|----------|--------|--------|
| `GET  /api/v1/permissions/explain` | GET query params | **POST with body** | Fix frontend or add GET variant |
| `GET  /api/v1/auth/me` | Works | Returns `{ user, roles }` | ✓ |
| `POST /api/v1/auth/set-password` | Missing | **Now added** | ✓ (F3) |
| `POST /api/v1/workflows` (create) | Missing | Not implemented | ⚠️ (C4) |

---

## Release Decision

**CONDITIONAL PASS** — The system can be released after addressing:
1. **C1** — Cascade delete strategy (most impactful for data integrity)
2. **C2** — `@RequirePermission()` on BaseController (most impactful for security)
3. **C3** — Role-project-permission CRUD controller
4. **C4** — Workflow create endpoint

Without these, the system has:
- **Data integrity risk**: Orphaned records on soft delete
- **Security risk**: Any user can modify master data
- **Functionality gaps**: Cannot grant permissions to roles, cannot create workflows

---

## Files Changed During Debug

| File | Change |
|------|--------|
| `backend/src/modules/users/services/user.service.ts:105-108` | `findOne` → `find({ take: 1 })` |
| `backend/src/common/filters/http-exception.filter.ts:17-23` | Added `QueryFailedError` → `409` handling |
| `backend/src/modules/auth/services/auth.service.ts:92-100` | Throw on missing UserAuth instead of creating empty record |
| `backend/src/modules/auth/services/auth.service.ts:204-236` | New `setInitialPassword()` method |
| `backend/src/modules/auth/auth.controller.ts:66-73` | New `POST /auth/set-password` endpoint |
| `backend/src/modules/auth/dto/set-password.dto.ts` | New DTO for set-password |

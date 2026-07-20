# Hybrid RBAC Validation Report

> **Date:** 2026-07-06
> **Scope:** Validate every entity mapping and data flow against BRD
> **Status:** 16 PASS / 10 FAIL / 0 FIX REQUIRED

---

## 1. Master Flow: Zone → City → Project → User Access

| # | Check | Result | Details |
|---|-------|--------|---------|
| 1.1 | `zones` entity | ✅ PASS | `name` unique, `is_active` column present |
| 1.2 | `cities` entity | ✅ PASS | `name` unique, `is_active` column present |
| 1.3 | `city_zone_mappings` entity | ✅ PASS | Composite PK `(city_id, zone_id)`, FK cascades |
| 1.4 | `projects` entity | ✅ PASS | `extended_metadata` JSONB column added |
| 1.5 | `project_locations` entity | ✅ PASS | Links project ↔ city ↔ zone, composite PK |
| 1.6 | `user_zones` entity | ✅ PASS | Composite PK `(user_id, zone_id)`, CASCADE deletes |
| 1.7 | Project location API | ✅ PASS | `GET /project-locations` returns all join data |
| 1.8 | User zone API | ✅ PASS | `GET/POST/DELETE /user-zones` CRUD available |

---

## 2. Organization Flow: Department → Levels → Roles → Users

| # | Check | Result | Details |
|---|-------|--------|---------|
| 2.1 | `departments` entity | ✅ PASS | `max_hierarchy_levels` defaults to 4 |
| 2.2 | `roles` entity | ✅ PASS | `hierarchy_level_rank` column present |
| 2.3 | `department_roles` entity | ✅ PASS | Links departments ↔ roles |
| 2.4 | `user_roles` entity | ✅ PASS | Composite unique `(user_id, department_id, role_id)` |
| 2.5 | `user_reporting_lines` entity | ✅ PASS | Composite PK `(user_id, reports_to_user_id, level_rank)` |
| 2.6 | **Role creation validates hierarchy rank** | ❌ FAIL | Role service calls `super.create()` with no check that `hierarchyLevelRank <= department.maxHierarchyLevels`. An L10 role can be created for a dept with max=4. |

**FIX REQUIRED 2.6:** Add validation in `RoleService.create()` / `RoleService.update()`:
```typescript
// Before creating role, fetch department and validate:
const dept = await this.deptRepo.findOne({ where: { id: dto.departmentId } });
if (!dept) throw new NotFoundException('Department not found');
if (dto.hierarchyLevelRank > dept.maxHierarchyLevels) {
  throw new BadRequestException(
    `Hierarchy rank ${dto.hierarchyLevelRank} exceeds department max of ${dept.maxHierarchyLevels}`
  );
}
```

---

## 3. Module Flow: Module → SubModule → Action

| # | Check | Result | Details |
|---|-------|--------|---------|
| 3.1 | `modules` entity | ✅ PASS | `name` unique, `is_active` |
| 3.2 | `sub_modules` entity | ✅ PASS | Unique `(module_id, name)` |
| 3.3 | `actions` entity | ✅ PASS | `code` unique, `label`, `is_active` |
| 3.4 | `module_actions` entity | ✅ PASS | Links module + subModule + action, unique `(module_id, sub_module_id, action_id)` |
| 3.5 | Dynamic module/submodule creation | ✅ PASS | Admin creates via `POST /modules`, `POST /sub-modules` |
| 3.6 | Actions seeded only | ✅ PASS | 8 system actions seeded by bootstrap (VIEW, CREATE, UPDATE, DELETE, APPROVE, REJECT, EXPORT, IMPORT) |

---

## 4. User Creation 3-Step Flow

| # | Check | Result | Details |
|---|-------|--------|---------|
| 4.1 | Step 1: Basic Details form | ✅ PASS | Name, email, department, role, employment status |
| 4.2 | Step 1 creates user immediately | ❌ FAIL | BRD says "Save temporary state only" — current wizard calls `POST /users` + `POST /user-roles` on Step 1 submit before user finalizes |
| 4.3 | Step 2: Zone selection UI | ✅ PASS | Zone → City → Project drilldown works |
| 4.4 | Step 2 assigns project access | ✅ PASS | `POST /user-project-access/bulk` via `useAssignProjects` |
| 4.5 | **Step 2: Zone assignment missing** | ❌ FAIL | BRD says "Zone, Department, Role, Hierarchy Manager" — `user_zones` is never populated during creation |
| 4.6 | **Step 2: Hierarchy Manager missing** | ❌ FAIL | BRD specifies "Hierarchy Manager" — no manager/L3/L4 selection exists |
| 4.7 | Step 3: Permission config | ✅ PASS | Shows project-level override UI with inherited permissions |
| 4.8 | **user_project_feature_matrix not compiled after creation** | ❌ FAIL | After user creation + project assignment, `PermissionCompilerService.compileAndSave` is never called |
| 4.9 | **No zone assignment in creation** | ❌ FAIL | `user_zones` table empty after wizard completes |

**FIX REQUIRED 4.2:** Convert Step 1 to store form data in local state only (already partially done — uses `useState` but submits early). Move API calls to final step or add "Save Draft" option.

**FIX REQUIRED 4.5:** Add zone multi-select in Step 2. Call `POST /user-zones` for each selected zone after user creation.

**FIX REQUIRED 4.6:** Add manager selection dropdown (L3, L4) in Step 2. Call `POST /user-reporting-lines` after creation.

**FIX REQUIRED 4.8:** Call `POST /permissions/compile/:userId/:projectId` after project assignment in Step 2 or on finish.

---

## 5. API Response Validation: `GET /api/v1/permissions/me`

| # | Check | Result | Details |
|---|-------|--------|---------|
| 5.1 | Endpoint exists | ✅ PASS | `GET /api/v1/permissions/me` registered |
| 5.2 | Returns `projects` array | ✅ PASS | Returns `{ projects: [...] }` |
| 5.3 | Each project has `id`, `name` | ✅ PASS | Correct shape |
| 5.4 | Each module has `actions` array | ✅ PASS | Correct shape |
| 5.5 | **Missing `user` wrapper** | ❌ FAIL | BRD expects `{ user: {}, projects: [...] }` — current returns `{ projects: [...] }` |
| 5.6 | **Missing `subModules` nesting** | ❌ FAIL | BRD expects `modules: [{ name, subModules: [{ name, actions }] }]` — current returns `modules: [{ name, actions }]` |

**FIX REQUIRED 5.5:** Wrap response in `PermissionController.getMyPermissions()`:
```typescript
async getMyPermissions(@Req() req: any) {
  const userId = req.user?.empId || req.user?.userId;
  const user = await this.userRepo.findOne({ where: { empId: userId } });
  const perms = await this.permissionService.getUserPermissions(userId);
  return { user: { empId: user?.empId, name: user?.name, email: user?.email }, ...perms };
}
```

**FIX REQUIRED 5.6:** Modify `PermissionService.getUserPermissions()` or `getUserModulePermissions()` to return the nested `subModules` structure. Either use the `PermissionCompilerService.getCompiled()` output for super-admin mode, or restructure the existing resolution:

```typescript
// Expected response shape:
{
  user: { empId, name, email },
  projects: [{
    id, name,
    modules: [{
      name,
      subModules: [{ name, actions: [{ code, label }] }]
    }]
  }]
}
```

---

## 6. Hybrid Architecture: Permission Compiler / Snapshot

| # | Check | Result | Details |
|---|-------|--------|---------|
| 6.1 | `user_project_feature_matrix` entity | ✅ PASS | JSONB column, unique `(user_id, project_id)`, version tracking |
| 6.2 | `PermissionCompilerService` | ✅ PASS | Compiles from RBAC tables → JSON tree |
| 6.3 | Auto-trigger on `RoleProjectPermission` change | ✅ PASS | `create()` and `remove()` call `compileForRole()` |
| 6.4 | Auto-trigger on `UserPermissionOverride` change | ✅ PASS | `upsert()` and `remove()` call `compileAndSave()` |
| 6.5 | **Auto-trigger on project assignment change** | ❌ FAIL | `UserProjectAccessService.assign()` / `assignBulk()` / `revoke()` don't call compiler |
| 6.6 | **Auto-trigger on role assignment** | ❌ FAIL | `UserRoleService.assign()` / `revoke()` don't call compiler |
| 6.7 | **Login does not compile/return snapshot** | ❌ FAIL | BRD optimization: "Login → Permission resolved → Read JSONB → Return frontend-ready tree" — login only returns JWT + user info |

**FIX REQUIRED 6.5:** Inject `PermissionCompilerService` into `UserProjectAccessService` and call `compileAndSave(userId, projectId)` after assign/revoke.

**FIX REQUIRED 6.6:** Inject `PermissionCompilerService` (via forwardRef) into `UserRoleService` and call `compileForAllUserProjects(userId)` on role assign/revoke.

**FIX REQUIRED 6.7:** In `AuthService.login()`, after successful login, call `permissionCompilerService.compileForAllUserProjects(user.empId)` and return the snapshot in the response:
```typescript
// In login response:
const snapshot = await this.compilerService.getCompiled(user.empId, primaryProjectId);
return {
  accessToken, refreshToken, expiresIn,
  user: { empId, name, email },
  permissions: snapshot,
};
```

---

## Summary

| Area | PASS | FAIL |
|------|------|------|
| Master Flow | 8 | 0 |
| Organization Flow | 5 | 1 |
| Module Flow | 6 | 0 |
| User Creation Flow | 3 | 5 |
| API Response | 4 | 2 |
| Hybrid Architecture | 4 | 3 |
| **Total** | **30** | **11** |

### Priority Action Items

1. **HIGH — API Response Shape**: Fix `GET /api/v1/permissions/me` to include `user` object and `subModules` nesting
2. **HIGH — Login Optimization**: Compile + return permission snapshot on login
3. **HIGH — User Creation Flow**: Add zone/manager assignment, trigger compiler after creation
4. **HIGH — Hierarchy Validation**: Prevent role ranks exceeding department `max_hierarchy_levels`
5. **MEDIUM — Auto-trigger on Project Access**: Call compiler when project access is assigned/revoked
6. **MEDIUM — Auto-trigger on Role Assignment**: Call compiler when roles are assigned/revoked

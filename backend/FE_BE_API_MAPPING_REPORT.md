# FE ↔ BE API Mapping Report

**Generated:** 2026-07-09  
**Branch:** `backend-cleanup`  
**Phase:** BE-2 — Contract Adapters

---

## 1. Auth Status

### Endpoints

| FE Action | FE URL | BE Route | BE Method | Status |
|---|---|---|---|---|
| `signIn` | `/api/auth/sign-in` | `/api/auth/sign-in` | POST | ✅ Added alias |
| `signUp` | `/api/auth/sign-up` | `/api/auth/sign-up` | POST | ❌ Missing — needs endpoint |
| `checkUserSession` | `/api/auth/me` | `/api/auth/me` | GET | ✅ Works |
| `refresh` | `/api/auth/refresh` | `/api/auth/refresh` | POST | ✅ Works |

### Response Format

**Login Response (BE):**
```json
{
  "accessToken": "eyJ...",
  "refreshToken": "eyJ...",
  "expiresIn": 900,
  "user": { "empId": "PPL00001", "name": "...", "email": "...", "role": "ADMIN", "roles": ["ADMIN"] },
  "permissions": { "projects": [...] }
}
```

**FE reads:** `res.data.accessToken`, `res.data.user`  
**Interceptor behavior:** `TransformInterceptor` wraps in `{ statusCode, message, data }`  
**✅ Fix applied:** `@RawResponse()` decorator on `signIn` and `me` endpoints bypasses the wrapper.

**Global prefix changed:** `api/v1` → `api` to match FE `endpoints.ts`.

**Changes made:**
- `main.ts` — prefix changed to `api`
- `auth.controller.ts` — added `/sign-in` alias, added `@RawResponse()` on sign-in and me
- `transform.interceptor.ts` — added `Reflector` check for `@RawResponse()` metadata
- Created `raw-response.decorator.ts` in common/decorators

### Gaps
1. **Sign Up** endpoint not implemented. FE calls `POST /api/auth/sign-up`. BE has no `POST /auth/sign-up` or equivalent. Need to create.
2. **Forgot Password / Reset Password** — no endpoints exist on BE.

---

## 2. Permissions/Me Status

### Endpoint

| FE Need | BE Route | Status |
|---|---|---|
| Runtime permission snapshot for sidebar/guards | `GET /api/permissions/me` | ✅ Adapted |

### Response Format

**FE expected shape (`PermissionResponse`):**
```ts
{
  user: { id, name, email, role?, departmentId?, level? },
  permissions: {
    modules: [{
      code: 'DASHBOARD',
      name: 'Dashboard',
      route: '/dashboard',
      allowed: true,
      actions: ['VIEW', 'EXPORT']
    }]
  }
}
```

**BE raw shape (`UserPermissionsResponse`):**
```ts
{
  user: { empId, name, email, roles },
  projects: [{ id, name, modules: [{ id, name, subModules: [{ id, name, actions: [{ code, label, allowed }] }] }] }]
}
```

**✅ Adapter created:** `PermissionAdapterService` transforms BE nested project→module→subModule→actions into FE flat module list with `{ code, name, route, allowed, actions }`. Uses `SUBMODULE_TO_CODE` mapping to derive FE module codes (e.g., `Zones` subModule → `ZONE_MGMT` code).

**New endpoints added:**
- `GET /api/permissions/me` — adapted FE-compatible response
- `GET /api/permissions/me/raw` — original BE format (for debugging)
- `GET /api/permissions/user/:userId/adapted` — adapt any user's permissions

**Changes made:**
- Created `permission-adapter.service.ts` in permissions module
- Updated `permissions.module.ts` — registered and exported adapter
- Updated `permission.controller.ts` — `GET /me` now uses adapter

---

## 3. Master API Status

### Zones

| BE Route | FE Fields | Status |
|---|---|---|
| `GET /api/zones` | `{ id, name, code, description, status, createdBy, createdAt, updatedAt }` | 🟡 Mapped |

**Bridging notes:**
- BE `id` is `number`, FE expects `string` → mapper converts via `String(id)`
- BE `isActive` boolean → FE `status: 'active' | 'inactive'` string
- BE lacks `code` field → mapper generates from first 3 chars of name
- BE lacks `description` → mapper returns empty string

**✅ Mapper:** `ResponseMapperService.toZone(be)` in common module.

### Departments

| Route | FE Fields | Status |
|---|---|---|
| `GET /api/departments` | `{ id, name, code, description, maxHierarchyLevels, createdBy, status, createdAt, updatedAt }` | 🟡 Mapped |

**Bridging:** Same as zone pattern (`isActive` → `status`, missing `code`/`description`).  
**✅ Mapper:** `ResponseMapperService.toDepartment(be)`

### Roles

| Route | FE Fields | Status |
|---|---|---|
| `GET /api/roles` | `{ id, name, code, description, level, departmentId, departmentName, createdBy, status, createdAt, updatedAt }` | 🟡 Mapped |

**Bridging:**
- BE `hierarchyLevelRank` (number like `2`) → FE `level` (string like `L2`)
- BE role entity doesn't have `departmentId` — it's in a join table `department_roles`
- Mapper handles `role.department.id` or `role.departmentRole.department.id`
- `code`, `description` → same fallback pattern

**✅ Mapper:** `ResponseMapperService.toRoleList(beRoles)`

### Projects

| Route | FE Fields | Status |
|---|---|---|
| `GET /api/projects` | `{ id, name, code, brand, zoneId, zoneName, cityId, cityName, phase, billingEntity, billingAddress, gstin, paymentGateway, status, createdAt, updatedAt }` | 🟡 Mapped |

**Bridging:**
- Most extended fields (brand, zoneId, cityId, phase, etc.) stored in BE `extendedMetadata` JSONB
- `billingEntity` → BE `billingEntityName`
- `gstin` → BE `billingGstin`

**✅ Mapper:** `ResponseMapperService.toProject(be)`

### Changes made:
- Created `response-mapper.service.ts` in common module
- Registered in `common.module.ts` (global)
- All mappers available for controllers or future FE integration

---

## 4. Permission Mapping Status

### FE 4-Step Wizard → BE

| FE Step | FE Data | BE Entity/Contract | Status |
|---|---|---|---|
| Step 1: Department + Level + Role | `{ departmentId, level, roleId }` | → `permission_template` | 🟡 |
| Step 2: Select Modules | `[{ moduleId, selected }]` | → linked in `template_permissions` | 🟡 |
| Step 3: Configure SubModule Actions | `[{ subModuleId, actionIds[] }]` | → `template_permissions.moduleId + actionId` | 🟡 |
| Step 4: Review & Save | Full payload | → `POST /permission-templates` + `POST /permission-templates/:id/permissions` | 🟡 |

**Key gap:** FE wizard uses `actionNames` (strings: `View`, `Create`, `Edit`, `Delete`) but BE `template_permissions.actionId` is an integer FK to `actions` table. The FE already knows action IDs from the product catalog (`GET /api/modules`, `GET /api/sub-modules`, `GET /api/actions`). A translation layer is needed in the FE API service to convert `actionName` → `actionId` before sending to BE.

**No entity changes needed.** The BE `permission_templates` and `template_permissions` tables directly support the wizard data model.

---

## 5. User Wizard Status

### Endpoint: `POST /api/users/full`

| FE Field | BE DTO Field | BE Entity Column | Status |
|---|---|---|---|
| `employeeId` | `CreateUserDto.employeeId` | `User.empId` | ✅ Added to DTO, mapped |
| `firstName` | `CreateUserDto.firstName` | (not in entity) | 🟡 Silently stored via `@IsOptional()` |
| `lastName` | `CreateUserDto.lastName` | (not in entity) | 🟡 Silently stored |
| `name` | `CreateUserDto.name` | `User.name` | ✅ |
| `email` | `CreateUserDto.email` | `User.email` | ✅ |
| `phone` | `CreateUserDto.phone` | (not in entity) | 🟡 Silently stored |
| `mobile` | `CreateUserDto.mobile` | (not in entity) | 🟡 Silently stored |
| `departmentId` | `CreateUserDto.departmentId` | `User.departmentId` | ✅ |
| `roleId` (primary) | `UserOrganizationDto.primaryRole` | `UserRole.roleId` | ✅ |
| `secondaryRoleId` | `UserOrganizationDto.secondaryRoles` | `UserRole.roleId` | ✅ |
| `level` | (calculated from role) | `Role.hierarchyLevelRank` | ✅ |
| `employmentStatus` | `CreateUserDto.employmentStatus` | `User.employmentStatus` | ✅ |
| `userGroup` | `CreateUserDto.userGroup` | (not in entity) | 🟡 Silently stored |
| `startDate` | `CreateUserDto.startDate` | (not in entity) | 🟡 Silently stored |
| `endDate` | `CreateUserDto.endDate` | (not in entity) | 🟡 Silently stored |
| `zoneIds` | `UserOrganizationDto.zones` | `UserZone.zoneId` | ✅ |
| `reportingHierarchy` | `UserOrganizationDto.reporting` | `UserReportingLine` | ✅ |
| `moduleAccess` (project perms) | No BE equivalent | `user-project-access` bulk endpoint | 🟡 Needs separate call |

**Changes made:**
- Extended `CreateUserDto` with 8 new optional fields
- Updated `createFull()` service to accept `employeeId` as `empId` instead of auto-generating

**Post-creation flow:** FE wizard creates user → then calls `POST /api/user-project-access/bulk` for project assignments.

---

## 6. API Response Format (Step 6)

### Global Interceptor

The `TransformInterceptor` wraps all responses as:

```json
{
  "statusCode": 200,
  "message": "Success",
  "data": <actual_response>,
  "meta": <pagination_meta_if_applicable>
}
```

**Exception handler** (for errors):
```json
{
  "statusCode": 400,
  "message": ["Error description"],
  "data": null,
  "timestamp": "2026-07-09T..."
}
```

**✅ Status:** Standardized format already exists. Added `@RawResponse()` decorator support for endpoints where FE reads raw response directly (auth).

### Paginated Responses
```
TransformInterceptor → { statusCode, message, data: { data: [...], meta: { page, limit, total } } }
```
FE will need to read `res.data.data` for the items array and `res.data.meta` for pagination.

---

## 7. Summary of Changed Files

| File | Change |
|---|---|
| `src/main.ts` | Global prefix `api/v1` → `api` |
| `src/common/decorators/raw-response.decorator.ts` | **NEW** — `@RawResponse()` metadata decorator |
| `src/common/interceptors/transform.interceptor.ts` | Added `Reflector`-based skip for raw responses |
| `src/common/services/response-mapper.service.ts` | **NEW** — Zone/Dept/Role/Project → FE format mapper |
| `src/common/common.module.ts` | Registered `ResponseMapperService` globally |
| `src/modules/auth/auth.controller.ts` | Added `/sign-in` alias, `@RawResponse()` on sign-in & me |
| `src/modules/users/dto/user.dto.ts` | Extended `CreateUserDto` with 8 FE fields |
| `src/modules/users/services/user.service.ts` | `createFull` accepts `employeeId` as `empId` |
| `src/modules/permissions/permission.controller.ts` | `GET /me` uses adapter; added `/raw` and `/adapted` endpoints |
| `src/modules/permissions/permissions.module.ts` | Registered `PermissionAdapterService` |
| `src/modules/permissions/services/permission-adapter.service.ts` | **NEW** — Transforms BE nested perms to FE flat format |

---

## 8. Remaining Gaps

| Gap | Severity | Impact | Suggested Fix |
|---|---|---|---|
| **Sign Up** endpoint missing | **HIGH** | FE sign-up crashes | Create `POST /api/auth/sign-up` in auth controller |
| **Forgot/Reset Password** missing | **MEDIUM** | FE password recovery broken | Create endpoints |
| **Action names → IDs bridge** | **HIGH** | Permission wizard can't save | FE API service layer must map `actionName` strings to BE `actionId` integers |
| **Project assignment bulk** needed after user create | **MEDIUM** | User wizard incomplete | FE calls `POST /api/user-project-access/bulk` after create |
| **FE-expected ID type** mismatch (string vs number) | **LOW** | Display only | Resolved via `ResponseMapperService` string conversion |
| **FE `status` field vs BE `isActive`** | **LOW** | Display only | Resolved via mapper |
| **FE missing `code`/`description`** | **LOW** | Display only | Resolved via mapper defaults |
| **Global interceptor wrapping** | **LOW** | FE reads at different level | Known — FE must read `res.data.data` for list endpoints |
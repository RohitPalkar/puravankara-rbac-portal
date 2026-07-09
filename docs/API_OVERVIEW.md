# API Overview

Base URL: `http://localhost:3000/api/`

All endpoints require `Authorization: Bearer <JWT>` unless marked `@Public()`.

Response format: `{ statusCode, message, data, meta }`

---

## Authentication APIs

| Endpoint | Method | Auth | Purpose |
|----------|--------|------|---------|
| `/auth/login` | POST | Public | Authenticate user, return JWT + permissions |
| `/auth/profile` | GET | JWT | Get current user profile |
| `/auth/sidebar` | GET | JWT | Get filtered module tree for sidebar |
| `/auth/permissions` | GET | JWT | Get effective permissions for active role |

### POST /auth/login

**Input:**
```json
{ "email": "superadmin@puravankara.com", "password": "SuperAdmin@123" }
```

**Output:**
```json
{
  "accessToken": "eyJhbG...",
  "user": { "id": 1, "name": "Super Admin", "email": "...", "isSuperAdmin": true },
  "roleAssignments": [{ "id": 1, "roleName": "Super Admin", "isPrimary": true }],
  "primaryRole": { "id": 1, "name": "Super Admin", "department": {...}, "level": {...} },
  "permissions": [{ "moduleId": 1, "moduleCode": "dashboard", "actionCode": "view" }, ...]
}
```

---

## Master Data APIs

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/zones` | GET/POST/PATCH/DELETE | Zone CRUD |
| `/zones/dropdown` | GET | Zone dropdown list |
| `/cities` | GET/POST/PATCH/DELETE | City CRUD |
| `/cities/dropdown` | GET | City dropdown list |
| `/departments` | GET/POST/PATCH/DELETE | Department CRUD |
| `/departments/dropdown` | GET | Department dropdown list |
| `/departments/:id/toggle-status` | PATCH | Toggle department active/inactive |
| `/levels` | GET/POST/PATCH/DELETE | Level CRUD |
| `/levels/dropdown` | GET | Level dropdown list |
| `/brands` | GET/POST/PATCH/DELETE | Brand CRUD |
| `/brands/dropdown` | GET | Brand dropdown list |
| `/projects` | GET/POST/PATCH/DELETE | Project CRUD |
| `/projects/dropdown` | GET | Project dropdown list |
| `/projects/access-matrix` | GET | Project matrix for user wizard |
| `/project-phases` | GET/POST/PATCH/DELETE | Project phase CRUD |
| `/project-phases/dropdown` | GET | Project phase dropdown list |
| `/user-groups` | GET/POST/PATCH/DELETE | User group CRUD |
| `/user-groups/dropdown` | GET | User group dropdown list |
| `/role-definitions` | GET/POST/PATCH/DELETE | Role definition CRUD |
| `/role-definitions/dropdown` | GET | Role dropdown list |
| `/role-definitions/by-department/:deptId` | GET | Roles filtered by department |

### GET /projects/access-matrix

**Query params:** `zoneIds=1,2&roleId=5`

**Output:**
```json
[{
  "id": 1, "name": "Puravankara Electronic City", "code": "PEC",
  "modules": [{
    "id": 1, "name": "Dashboard", "code": "dashboard",
    "isFlatModule": true,
    "actions": [{ "id": 1, "name": "View", "code": "view" }],
    "subModules": []
  }, {
    "id": 2, "name": "Masters", "code": "masters",
    "isFlatModule": false,
    "actions": [],
    "subModules": [{
      "id": 5, "name": "Zone Management", "code": "zone-management",
      "actions": [{ "id": 1, "name": "View", "code": "view" }, { "id": 2, "name": "Create", "code": "create" }]
    }]
  }]
}]
```

---

## User APIs

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/users` | GET | List users (paginated, searchable) |
| `/users` | POST | Create user (full wizard payload) |
| `/users/:id` | GET | Get user details |
| `/users/:id` | PATCH | Update user |
| `/users/:id/toggle-status` | PATCH | Toggle user active/inactive |
| `/users/hierarchy-candidates` | GET | Get potential managers by department+level |
| `/employees/lookup/:employeeId` | GET | Employee directory lookup |

### POST /users (Full Payload)

```json
{
  "employeeId": "SL002",
  "name": "Anita Desai",
  "email": "anita.desai@puravankara.com",
  "mobile": "9876543210",
  "employmentType": "PERMANENT",
  "startDate": "2026-07-01",
  "departmentId": 2,
  "zoneIds": [4],
  "primaryRoleId": 6,
  "secondaryRoleId": null,
  "managerId": 1,
  "teamAdminId": null,
  "deptAdminId": null,
  "userGroupId": null,
  "projectModuleAccess": [
    { "projectId": 1, "moduleId": 2, "subModuleId": 5, "actionId": 1, "allowed": true }
  ]
}
```

---

## Permission APIs

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/permission-mappings/template/data` | GET | Get permission template for department+role+level |
| `/permission-mappings/template/data` | PUT | Save permission template |

### GET /permission-mappings/template/data

**Query params:** `departmentId=2&roleDefinitionId=6&levelId=3`

**Output:**
```json
[{
  "moduleId": 1, "moduleName": "Dashboard", "moduleCode": "dashboard",
  "isFlatModule": true,
  "actions": [{ "id": 1, "name": "View", "code": "view", "checked": true }],
  "subModules": []
}, {
  "moduleId": 2, "moduleName": "Masters", "moduleCode": "masters",
  "isFlatModule": false,
  "actions": [],
  "subModules": [{
    "id": 5, "name": "Zone Management", "code": "zone-management",
    "actions": [{ "id": 1, "name": "View", "code": "view", "checked": true }]
  }]
}]
```

### PUT /permission-mappings/template/data

```json
{
  "departmentId": 2,
  "roleDefinitionId": 6,
  "levelId": 3,
  "permissions": [
    { "moduleId": 2, "subModuleId": 5, "actionId": 1, "allowed": true }
  ]
}
```

The save operation replaces all existing mappings: soft-deletes old entries, inserts new ones. This is transactional.

---

## Dashboard APIs

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/dashboard/stats` | GET | Aggregated counts (users, roles, departments, projects) |

---

## API Patterns

### Pagination

Query params: `?page=1&limit=10&search=term`

Response meta:
```json
"meta": { "total": 50, "page": 1, "limit": 10, "totalPages": 5 }
```

### Status Toggle

`PATCH /:entity/:id/toggle-status` — Flips between `active` and `inactive`.

### Dropdown Endpoints

All masters expose a `/dropdown` variant:
```json
[{ "id": 1, "name": "Sales" }, { "id": 2, "name": "CRM" }]
```

### Error Responses

```json
// 401 Unauthorized
{ "statusCode": 401, "message": "Unauthorized", "data": null }

// 403 Forbidden
{ "statusCode": 403, "message": "Forbidden resource", "data": null }

// 404 Not Found
{ "statusCode": 404, "message": ["User not found"], "data": null }

// Validation error
{ "statusCode": 400, "message": ["name must be a string", "email must be an email"], "data": null }
```

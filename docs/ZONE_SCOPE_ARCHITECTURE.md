# Resource Scope Architecture: Zone as First-Class Scope

## 1. The Problem

**Permission resolution today has no scope awareness.**

```
User → Department → Role → Permission Profile → Module → SubModule → Action
                                                      ↓
                                              Projects (filtered by ALL/SELECTED)
```

Zone is a separate concern:
- `user_zones` exists but is NEVER consulted during permission resolution
- `project_locations` links Projects → Zones but only used for UI filtering in User Wizard Step 2
- `/permissions/me` returns `projects → modules → subModules → actions` — but these projects are NOT scoped to the user's assigned zones

**Result**: A user assigned to Zone "Mumbai" could receive permissions for projects in Zone "Pune" if a permission profile grants `SELECTED` projects without zone filtering.

---

## 2. Key Design Decisions

### 2.1 Identity ≠ Scope ≠ Permissions

Three distinct concerns:

| Layer | Concern | Entity |
|-------|---------|--------|
| **Identity Resolution** | WHO is the user? | User → Department → Hierarchy → Role |
| **Resource Scope** | WHERE can the user operate? | Region → Zone → City → BU → Brand → Phase → Project |
| **Permission Resolution** | WHAT can the user do? | Profile → Module → SubModule → Action Group → Action |

### 2.2 Scope Resolved First, Permissions Evaluated Within Scope

Permissions should never even evaluate projects that are outside scope.

### 2.3 Super Admin Bypasses Scope

Super Admin is **ALLOW → Skip Identity → Skip Scope → Skip Permission → RETURN**.

They do not need department, hierarchy, role, or zone assignments.

### 2.4 Dedicated Services

- `IdentityResolutionService` — resolves department, hierarchy, role
- `ScopeResolutionService` — resolves resource scope (zones → projects)
- `EffectivePermissionService` — resolves permissions within scope, manages cache

### 2.5 Cached Effective Permissions

`EffectivePermissionService` produces a cached `EffectivePermission` (renamed from `CompiledPermission`) that includes scope + permissions + metadata. Compiled on any state change; zero joins at runtime.

### 2.6 Comprehensive Cache Invalidation

Recalculate `EffectivePermission` when **any** of these change:

```text
User Updated
  └── Department changed
  └── Hierarchy changed
  └── Activated/Deactivated

Zone Assignment Changed
  └── user_zones inserted/updated/deleted

Project Mapping Changed
  └── project_locations updated

Role Assignment Changed
  └── user_role_assignments (role switch, access_scope, isAdmin)

Permission Matrix Changed
  └── dept_role_module_mappings inserted/updated/deleted

Permission Profile Changed
  └── permission_profile_projects (project access changed)
  └── permission_profile_modules / submodules / actions
```

### 2.7 Future-Proof Resource Hierarchy

The scope engine supports an arbitrary resource hierarchy — not just Zone → Project, but:

```
Region
  └── Zone
       └── City
            └── Business Unit
                 └── Brand
                      └── Phase
                           └── Project
```

Each level is opt-in. Today only Zone → Project is active. The final scope resolution is always a **resolved project set** — permissions always evaluate against projects.

### 2.8 Delegation Extension Point

Future support for temporary access delegation (e.g., Buddy RM):

```text
EffectivePermission
  └── base: resolved from identity + scope + permissions
  └── override: delegated/temporary access (future)
```

The `EffectivePermission` type includes an optional `delegations` field for this purpose.

---

## 3. Proposed Architecture

### 3.1 Resolution Flow

```
Authentication
       │
       ▼
     User
       │
       ├── Is Super Admin? ──► ALLOW (bypass everything)
       │
       └── Not Super Admin
              │
              ▼
    ┌───────────────────────────────────┐
    │    IDENTITY RESOLUTION SERVICE     │  ← IdentityResolutionService
    │                                   │
    │   resolveUserIdentity(userId)     │
    │   1. Load department              │
    │   2. Load hierarchy (L2/L3/L4)    │
    │   3. Load active role             │
    │   4. Return UserIdentity          │
    └──────────────┬───────────────────┘
                   │
                   ▼
    ┌───────────────────────────────────┐
    │     SCOPE RESOLUTION SERVICE       │  ← ScopeResolutionService
    │                                   │
    │   resolveUserScope(userId)        │
    │                                   │
    │   1. Load user_zones → Zone[]     │
    │   2. Load project_locations →     │
    │      Project[] for each Zone      │
    │   3. Assemble resource scope:     │
    │      { resources: { zones,        │
    │        projects } }               │
    │                                   │
    │   Future: cities, BUs, brands,    │
    │   phases added here without       │
    │   changing anything downstream    │
    └──────────────┬───────────────────┘
                   │
                   ▼
    ┌───────────────────────────────────┐
    │     EFFECTIVE PERMISSION SERVICE   │  ← EffectivePermissionService
    │                                   │   (renamed from PermissionCompilerService)
    │   resolveEffectivePermission(     │
    │     identity,                     │
    │     scope                         │
    │   )                               │
    │                                   │
    │   1. Load permission profiles     │
    │   2. Resolve Module → SubModule → │
    │      Action Group → Action tree   │
    │   3. Filter to scope.projects     │
    │      (only evaluate within scope) │
    │   4. Cache result                 │
    │   5. Return EffectivePermission   │
    └──────────────┬───────────────────┘
                   │
                   ▼
    ┌───────────────────────────────────┐
    │           CACHE                    │
    │                                   │
    │   EffectivePermission stored:     │
    │   - On login                      │
    │   - On any identity change        │
    │   - On any scope change           │
    │   - On any permission change      │
    │                                   │
    │   Invalidated by:                 │
    │   - User update                   │
    │   - Zone assignment change        │
    │   - Role change / switch          │
    │   - Permission matrix change      │
    │   - Permission profile change     │
    │   - Project mapping change        │
    │                                   │
    │   Zero repeated joins at runtime  │
    └──────────────┬───────────────────┘
                   │
                   ▼
    ┌───────────────────────────────────┐
    │          FRONTEND                  │
    │                                   │
    │   useMyPermissions()              │
    │   → reads EffectivePermission     │
    │   → { metadata, scope,            │
    │       permissions }               │
    │   → hasPermission(), hasModule()  │
    │   → inScope(), getZones(),        │
    │     getProjects()                 │
    └───────────────────────────────────┘
```

### 3.2 Data Model (No Schema Changes Required)

| Table | Role in Scope Resolution |
|-------|--------------------------|
| `users` | contains user id + `is_super_admin` |
| `user_zones` | **Maps user → Zone(s)** |
| `zones` | Zone master |
| `project_locations` | **Maps Project → Zone** |
| `projects` | Project master |

**No new tables or columns.** All relationships already exist. The change is purely in **resolution logic**.

---

## 4. API Contract

### 4.1 `GET /permissions/me` — Response

```typescript
// Current
interface PermissionsResponse {
  projects: Project[];
  modules: Module[];
  subModules: SubModule[];
  actions: Action[];
}

// Proposed
interface PermissionsResponse {
  effectivePermission: EffectivePermission;
}

interface EffectivePermission {
  metadata: {
    version: string;
    generatedAt: string;        // ISO timestamp
    expiresAt: string;          // ISO timestamp (cache TTL)
    userId: string;
  };
  identity: {
    department: DeptInfo;
    hierarchy: HierarchyInfo;
    role: RoleInfo;
  };
  scope: {
    resources: {
      zones: ResourceInfo[];
      projects: ResourceInfo[];
      // future: cities[], businessUnits[], brands[], phases[]
    };
  };
  permissions: {
    modules: ModulePermission[];
    subModules: SubModulePermission[];
    actions: ActionPermission[];
  };
  delegations: Delegation[];   // future: temporary/ delegated access
}
```

### 4.3 `GET /permissions/me?resourceType=zone&resourceId=uuid`

Query param to narrow scope to a specific resource subtree. Returns permissions within that subtree only.

---

## 5. Service Architecture

### 5.1 `ScopeResolutionService` (NEW)

```typescript
@Injectable()
export class ScopeResolutionService {
  resolveUserScope(userId: string): Promise<UserScope>;

  resolveProjectScope(projectId: string): Promise<ResourceScope>;
  // future: resolveCityScope(), resolveBusinessUnitScope()
}

interface UserScope {
  userId: string;
  zones: ZoneInfo[];
  projects: ProjectInfo[];
  // future: cities, businessUnits, brands, phases

  hasProject(projectId: string): boolean;
  hasZone(zoneId: string): boolean;
  isInScope(resourceType: string, resourceId: string): boolean;
}
```

### 5.2 `PermissionService` (UPDATED)

```typescript
// Current: resolves permissions independently
getMyPermissions(userId) → { projects, modules, subModules, actions }

// Updated: takes scope as input
compileEffectivePermission(userId, scope: UserScope) → EffectivePermission

// Runtime check
hasPermission(user, moduleCode, actionCode, projectId?) → boolean
  // 1. If super admin → true
  // 2. If projectId provided → check scope.hasProject(projectId) → false if out of scope
  // 3. Existing permission waterfall...
```

### 5.3 `EffectivePermissionService` (CACHE LAYER)

```typescript
@Injectable()
export class EffectivePermissionService {
  // Called when any identity, scope, or permission state changes
  resolveAndCache(userId: string): Promise<EffectivePermission>;

  // Called at runtime — zero joins
  getCached(userId: string): EffectivePermission | null;

  // Invalidate cache for specific user (on identity/scope/perm change)
  invalidate(userId: string): void;

  // Invalidate cache for all users affected by a scope change
  // (e.g., zone reassigned, project moved)
  invalidateByZone(zoneId: string): Promise<void>;
  invalidateByProject(projectId: string): Promise<void>;
}
```

### 5.4 Resolution Order

```
hasPermission(user, moduleCode, actionCode, projectId?)

  Step 0: Is Super Admin?                    → ALLOW (bypass scope + permission)

  Step 1: Is projectId in scope?             → DENY if not (scope check)
  Step 2: Does role have module+action?      → DENY if not
  Step 3: Is accessScope ALL_PROJECTS?       → ALLOW
  Step 4: Is project explicitly assigned?    → ALLOW / DENY
```

---

## 6. Scope of Changes

### 6.1 Backend — New Files

| File | Purpose |
|------|---------|
| `scope-resolution/` | New module |
| `scope-resolution.service.ts` | `resolveUserScope()` — resolves zones → projects |
| `scope-resolution.module.ts` | Module registration |
| `user-scope.interface.ts` | `UserScope`, `ResourceScope` types |
| `identity-resolution.service.ts` | `resolveUserIdentity()` — resolves dept/hierarchy/role |
| `identity-resolution.module.ts` | Module registration |
| `effective-permission.service.ts` | Resolution + cache: resolve scope+permissions, cache, invalidate |
| `effective-permission.module.ts` | Module registration |
| `effective-permission.interface.ts` | `EffectivePermission`, `ScopeInfo`, `PermissionTree`, `Delegation` types |

### 6.2 Backend — Modified Files

| File | Change |
|------|--------|
| `permission.service.ts` | Accept `scope` param; insert scope check in `hasPermission()`; delegate compilation to `EffectivePermissionService` |
| `permission.controller.ts` | Wire new flow: resolve identity → resolve scope → resolve effective permission → return |
| `permission.module.ts` | Import `ScopeResolutionModule`, `EffectivePermissionModule`, `IdentityResolutionModule` |
| `auth.service.ts` (login) | Trigger `EffectivePermissionService.resolveAndCache()` after login |
| `user.service.ts` | Invalidate cache on user update (dept change, active toggle) |
| `user-role-assignments.service.ts` | Invalidate cache on role assignment/switch/unassign |
| `permission-mappings.service.ts` | Invalidate cache on permission matrix change |
| `permission-profile.service.ts` | Invalidate cache on permission profile change |
| `project-locations.service.ts` | Invalidate cache on project-zone mapping change |
| `user-zones.service.ts` | Invalidate cache on user-zone assignment change |

### 6.3 Frontend

| File | Change |
|------|--------|
| `types/auth.ts` | Replace `CompiledPermissions` with `EffectivePermission` (scope + permissions) |
| `use-permissions.ts` | Adapt to new shape — extract permissions tree from `effectivePermission.permissions` |
| `useAuth.ts` | Add `scope` helpers: `inScope()`, `getZones()`, `getProjects()` |
| Route guards | No change — module-level access unaffected |
| `CanAccess` | No change — action-level access unaffected |

---

## 7. Future Resource Hierarchy

The scope engine is designed for extensibility. Each new resource level is a new resolver:

```
ResourceScopeResolver (interface)
  │
  ├── ZoneResolver        ← active today
  ├── CityResolver        ← future
  ├── BusinessUnitResolver ← future
  ├── BrandResolver       ← future
  ├── PhaseResolver       ← future
  └── ProjectResolver     ← active today

UserScope {
  zones:     ZoneInfo[];       ← resolved by ZoneResolver
  cities:    CityInfo[];       ← resolved by CityResolver (future)
  projects:  ProjectInfo[];    ← resolved by ProjectResolver
  // Each resolver is independent and opt-in
}
```

Each resolver has a `resourceType` identifier. The `isInScope(resourceType, resourceId)` check dispatches to the correct resolver.

---

## 8. Migration Plan

### Phase 1: Foundation (This Work)

1. Create `ScopeResolutionService` with `resolveUserScope(userId)` — resolves zones → projects
2. Create `IdentityResolutionService` with `resolveUserIdentity(userId)` — resolves dept/hierarchy/role
3. Create `EffectivePermissionService` with cache layer — resolve + cache + invalidate
4. Create types: `UserScope`, `UserIdentity`, `EffectivePermission`, `Delegation`
5. Update `PermissionService`:
   - `resolveEffectivePermission()` takes identity + scope, filters to scope.projects
   - `hasPermission()` checks scope before permission waterfall
   - Super Admin bypasses identity + scope + permission entirely
6. Update `PermissionController` — wire new flow
7. Update login handler — trigger `EffectivePermissionService.resolveAndCache()`
8. Wire cache invalidation in: user service, role assignments, permission mappings, permission profiles, project locations, user zones
9. Update frontend types: `CompiledPermissions` → `EffectivePermission` (metadata + identity + scope + permissions + delegations)

### Phase 2: Frontend Scope UI (Next)

1. Add scope display in sidebar/header — show user's assigned zones
2. Add zone filter on dashboard
3. Scope-aware data queries

### Phase 3: Additional Resource Levels (Future)

As the business requires: City, Business Unit, Brand, Phase — each is a new resolver class implementing `ResourceScopeResolver`, registered in the scope module. Zero changes to the permission engine.

---

## 9. Risk Assessment

| Risk | Impact | Mitigation |
|------|--------|------------|
| Users lose project access if missing `user_zones` rows | High | Pre-deployment audit: `SELECT * FROM users u LEFT JOIN user_zones uz ON u.id = uz.user_id WHERE uz.id IS NULL AND u.is_super_admin = false` |
| Performance: extra queries per request | Low | Cache layer ensures scope + permission are resolved once. Runtime `hasPermission()` reads cache. |
| Backward compat of API response | Medium — response shape changes | Coordinate frontend deployment. The frontend already consumes `/permissions/me` via `useMyPermissions()` — update hook to unwrap new shape. |
| `hasPermission()` without projectId | Low — scope check is no-op without project context | Document: scope check only applies when `projectId` is provided |

---

## 10. What This Unlocks

1. **True multi-zone RBAC** — Users operate only within assigned zones
2. **Dashboard zone filter** — "Show data for Mumbai zone only"
3. **Zone-scoped reports** — Auto-filtered to user's scope
4. **Audit trail** — Every permission check has scope context
5. **Extensible resource hierarchy** — Cities, BUs, Brands, Phases added as plug-in resolvers
6. **Permission compiler** — Zero repeated joins; cached effective permission per user
7. **Super Admin isolation** — Not burdened with zone assignments

---

## Summary

```
Current:     User → Role → Permission Profile → Projects (unscoped)

Proposed:    User → [Super Admin bypass?]
                   → Identity Resolution → { department, hierarchy, role }
                   → Scope Resolution → { resources: { zones, projects } }
                   → Effective Permission Service → resolve + cache
                   → Cache → Frontend

Identity ≠ Scope ≠ Permissions.
Scope is resolved before permissions.
Permissions are only evaluated within scope.
EffectivePermission is cached and invalidated on any state change.
```

## Architecture at a Glance

```
Three concerns, three services, one cache:

  IdentityResolutionService  →  WHO (department, hierarchy, role)
  ScopeResolutionService     →  WHERE (zone, project, ...)
  EffectivePermissionService →  WHAT (module, submodule, action)
                              + cache + invalidation
```

# Commands

- **Lint check**: `npx eslint "src/**/*.{js,jsx,ts,tsx}" --no-ignore`
- **Lint fix**: `npx eslint "src/**/*.{js,jsx,ts,tsx}" --fix --no-ignore`
- **Build**: `npm run build` (runs `tsc && vite build`)

# Architecture Baseline (Enterprise RBAC v2.0 — Frozen)

```
Company
    │
    ▼
Zone ────────────────── Organisational boundary
    │
    ▼
Department ──────────── Unique per (name, zone_id)
    │
    ▼
Role ────────────────── Global, filtered by department hierarchy
    │
    ▼
Permission Profile ──── Zone-scoped via department
    │
    ▼
Projects ────────────── Zone-aware via locations
    │
    ▼
Users ───────────────── Zone-aware via user_zones + cascade
    │
    ▼
Reporting ───────────── Zone-filtered, sorted: dept → role → alpha
    │
    ▼
Approval Workflow ───── Zone-scoped via department
```

## Frozen Rules

1. **UI-only rename.** Backend entities, DTOs, API paths unchanged. UI surface uses "Role", "Role Hierarchy", "Department Administrator", "Merge Role".
2. **Inline `(name + zone)` validation.** Revalidate on name/zone change.
3. **No cross-zone merge.** Merge target must be same zone.
4. **Dependent cascade clear.** Changing Department clears Primary/Secondary Role, Dept Administrator, Reporting Manager.
5. **Department Administrator = designation, not permission.** RBAC determines access.
6. **Each department record belongs to exactly ONE zone.** `(name, zone_id)` is unique. `department_zone_mappings` will be replaced by `zone_id` FK.

## Implementation Contract

- No redesign of the architecture
- No new entities unless required
- No backend entity or API contract renames
- No changes to permission resolution flow
- Only implement frozen scope
- If architectural change appears required → STOP, impact analysis, wait for approval

## Change Governance

| Type | Examples | Approval |
|------|----------|----------|
| Bug | Incorrect filtering, broken API, UI defect | Immediate |
| Enhancement | Better UX, validation, search | Within phase if in scope |
| Feature | New workflow/module/rule | Future release |
| Architecture Change | New entities, relationship changes | Impact analysis + approval |

## Phase Plan

```
Phase 1 — Department Master
  G1  zone_id FK + (name, zone_id) unique
  G2  Migrate M:N data → 1:1, drop junction table
  G3  Zone info in department DTOs/responses
  G14 Duplicate name UX with zone context + inline validation
  G19 Edit Department zone-change collision detection
  G20 Delete Department impact summary + merge (same zone only)
  G17 Zone column on Department list

Phase 2 — User Management
  G15 Department Administrator checkbox + cascade
  G7  Zone-filtered + sorted Reporting Manager autocomplete

Phase 3 — Permission Matrix
  G4  Zone selector in matrix create
  G5  Remove Hierarchy Level → direct Role (UI only)
  G16 Searchable Role Autocomplete with zone context
  G18 Rename "Hierarchy Level" → "Role" in UI only
  G17 Zone column on Permission Matrix list
  G9  Role summary zone info

Phase 4 — Search APIs + Polish
  G10 GET /roles?zoneId=
  G11 GET /departments?zoneId=
```

## Key State

- API base: `https://puravankara-rbac-portal.onrender.com`
- Admin: `admin@puravankara.com` / `Test@123`
- Backend: NestJS/TypeORM (`backend/`)
- Frontend: React/Vite/TypeScript (`src/`)
- 12 pre-existing Jest test failures (0 regressions)
- TransformInterceptor wraps all responses as `{ statusCode, message, data, meta }`
- User PK is `empId` (varchar, not auto-increment)
- Latest migration: `1785000000007-AddRoleIdToHierarchyLevels`
- Stream A+B certified at tags `v1.2.1-user-management-certified` and `v1.3.0-stream-b-certified`

# Backup-FE Branch Analysis

**Branch:** `origin/backup-fe` (not deleted — pending review)
**Created:** 2026-07-08 to 2026-07-09
**Author:** RohitPalkar
**Status:** 21 unique commits never merged into `main`

## Commit Log

| # | Hash | Date | Message | Category |
|---|------|------|---------|----------|
| 1 | 1790114 | Jul 9 11:22 | user list: split mobile column, center User Details, fix DatePicker height | Bug fix |
| 2 | c921702 | Jul 9 11:06 | UI tweaks: zone chips, DatePicker, layout, access radio | UI improvement |
| 3 | 8b0e8ac | Jul 9 10:50 | User creation wizard revamp: 3 steps, zone chips, reporting hierarchy | Feature addition |
| 4 | f223a0a | Jul 9 10:35 | User list: extract email column | UI improvement |
| 5 | cd5198c | Jul 9 10:33 | User Management revamp: new columns, 3-step wizard, PermissionTree | Feature addition |
| 6 | 20bc417 | Jul 9 10:27 | Role Master revamp: columns, level dept dependency | Feature addition |
| 7 | eceb5b3 | Jul 9 10:23 | Department create: remove status field | UI improvement |
| 8 | 05f3086 | Jul 9 10:19 | Department Master revamp: columns, maxHierarchyLevels | Feature addition |
| 9 | 6eff39c | Jul 9 10:06 | Save/Cancel CTAs at bottom, zone code always disabled | UI improvement |
| 10 | 7bc20fd | Jul 9 01:15 | Global table changes and Zone flow completion | Feature addition |
| 11 | 8844c6b | Jul 9 01:14 | Action menu: vertical kebab icon, centered button | Styling |
| 12 | 2c38bba | Jul 9 01:11 | DataTable: remove column menu, sort in filters | Refactoring |
| 13 | 91f60dc | Jul 9 01:10 | Action columns: kebab menu (RowActionsMenu) | Refactoring |
| 14 | 73dc0a4 | Jul 9 01:06 | Column menu: only show sort | Refactoring |
| 15 | 8479487 | Jul 9 01:04 | DataTable: restore header menus, push Filters/Columns to right | Refactoring |
| 16 | 8b57332 | Jul 9 01:00 | Global DataTable enhancement (toolbar, sort panel, sticky actions) | Refactoring |
| 17 | 55dcd4e | Jul 8 23:09 | Remove all files except RBAC Documents folder | Cleanup |
| 18 | 73aa8ec | Jul 8 23:04 | Documents | — |
| 19 | b42a015 | Jul 8 23:03 | Update README.md | — |
| 20 | 94c5e14 | Jul 8 23:01 | Supporting Documents | — |
| 21 | b022d01 | Jul 8 22:55 | Initial commit | — |

## Files Modified (vs `main`)

### src/ files modified
| File | Type | Description |
|------|------|-------------|
| `src/layouts/config-nav-dashboard.tsx` | Modified | Nav config changes |
| `src/routes/paths.ts` | Modified | Route additions |
| `src/routes/sections/dashboard.tsx` | Modified | Dashboard route additions |
| `src/sections/projects/project-list.tsx` | Modified | Project list changes |
| `src/sections/users/user-new.tsx` | Modified | User wizard revamp (309 lines changed) |
| `src/services/mock-data.ts` | Modified | Mock data updates |
| `src/types/index.ts` | Modified | Type additions |
| `src/utils/axios.ts` | Modified | Axios config updates |
| `package.json` | Modified | Dependency changes |

### Files deleted (present in `main`, absent in `backup-fe`)
1182 files changed — most deletions are from the "Remove all files" commit. Key src/ components deleted include:
- Brand, Phase, CP, CP Type sections (entire `src/sections/brand/`, `src/sections/phase/`, `src/sections/channel-partner/`)
- Various components (empty-state, form-section, multi-select-chips, etc.)

### Files added
- `RBAC Documents/` — 25 reference documents (PDFs, SQL, markdown docs, XLSX)

## Key Observations

1. **Not merged because:** This branch was created as a parallel development effort on Jul 8-9. It started by cleansing the repo (removing all files except docs), then adding UI improvements. Main took a different path via merges from `fe-vercel-deployment` and `be-render-deployment`.

2. **Unique value not in main:**
   - User Management 3-step wizard revamp (PermissionTree component, zone chips, dependent role dropdowns, reporting hierarchy)
   - Role Master revamp (level dept dependency)
   - Department Master revamp (maxHierarchyLevels)
   - Global DataTable enhancements (toolbar, sticky actions, kebab menu)

3. **Risk:** The data-table changes (commits 12-16) were rewritten significantly. Merging would be complex due to divergent codebases.

4. **Already in main:**
   - `/api/v1/` endpoint paths (axios.ts)
   - Many UI patterns that exist in both branches

## Recommendations

| Change | Recommendation | Reason |
|--------|---------------|--------|
| User wizard revamp (cd5198c) | **Cherry-pick** after API wiring | PermissionTree component would be needed for Phase 6 features |
| Role/Department revamps (20bc417, 05f3086) | **Cherry-pick** after API wiring | Level/hierarchy changes align with backend entities |
| DataTable enhancements (8b57332) | **Review & merge** if DataTable hasn't diverged | Toolbar/filter improvements are valuable |
| Kebab menu (91f60dc) | **Review** — may conflict with current row actions | Styling change that touches 12 files |
| RBAC Documents | **Archive** to docs/archive/documents/ | Reference material, not code |
| Brand/Phase/CP deletions | **Discard** — these modules are needed | backup-fe removed them entirely |

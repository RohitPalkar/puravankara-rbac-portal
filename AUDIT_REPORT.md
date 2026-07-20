# Puravankara RBAC Portal — Full Audit Report

**Date:** 2026-07-20  
**Auditor:** AI-assisted analysis  
**Repository:** `RohitPalkar/puravankara-rbac-portal` (https://github.com/RohitPalkar/puravankara-rbac-portal.git)  
**Local Path:** `/Users/rohitvp/puravankara-rbac-portal`  
**Status:** Read-only audit completed. No changes made.

---

## Table of Contents

1. [Repository Analysis](#1-repository-analysis)
2. [Branch Analysis](#2-branch-analysis)
3. [Frontend Analysis](#3-frontend-analysis)
4. [Backend Analysis](#4-backend-analysis)
5. [Vercel Analysis](#5-vercel-analysis)
6. [Render Analysis](#6-render-analysis)
7. [Supabase Analysis](#7-supabase-analysis)
8. [Environment Variable Analysis](#8-environment-variable-analysis)
9. [Deployment Flow](#9-deployment-flow)
10. [Recommendations](#10-recommendations)

---

## 1. Repository Analysis

### General Info

| Property | Value |
|----------|-------|
| Remote | `https://github.com/RohitPalkar/puravankara-rbac-portal.git` |
| Default branch | `main` |
| Current local branch | `main` |
| Total commits (all branches) | ~85 |
| First commit | 2026-07-08 |
| Most recent commit | 2026-07-17 19:24 |
| Tags | None |
| Stashes | 4 (2 from be-render-deployment, 1 from fe-vercel-deployment, 1 from main) |

### Root Structure

```
puravankara-rbac-portal/
├── backend/           # NestJS API (19 modules, deployed to Render)
├── src/               # Frontend A (deployed to Vercel as puravankara-rbac-frontend)
├── fe/                # Frontend B (NOT deployed — duplicate of src/)
├── frontend/          # Frontend C (NOT deployed — different architecture)
├── docs/              # Documentation
├── scripts/           # Utility scripts
├── .vercel/           # Vercel project link (puravankara-rbac-frontend)
├── render.yaml        # Render service definition (in root, rootDir: backend)
├── vercel.json        # Vercel SPA rewrites
├── package.json       # Root (node engine 24.x, Vite commands)
├── vite.config.ts     # Vite config
└── 14 report .md files at root level
```

### Key Observations

- **14 report files** at root level (ARCHITECTURE_ALIGNMENT_REPORT.md, BACKEND_AUDIT_REPORT_V2.md, BRAND_MIGRATION_REPORT.md, etc.) — these are stale and should be archived
- Backend has its own `package.json`, `node_modules`, `dist/`, `Dockerfile` — it's fully self-contained
- `src/` and `fe/` share the **same** `package.json` structure (34 deps, identical scripts) — they are forks
- `frontend/` has a **different** `package.json` (25 deps, name is "frontend")
- `.gitignore` excludes all `.env*` files — but `.env.local` exists locally with a Vercel OIDC token

---

## 2. Branch Analysis

### Branch Inventory

| Branch | Remote Tracking | Ahead/Behind main | Purpose | Status |
|--------|----------------|-------------------|---------|--------|
| `main` | `origin/main` | 0/0 | Production — merged FE + BE | **Active, deployed** |
| `fe-vercel-deployment` | `origin/fe-vercel-deployment` | 0/0 | Frontend deployment branch | **Ahead of main by 2 commits** (diverged) |
| `be-render-deployment` | `origin/be-render-deployment` | 0/0 | Backend deployment branch | **Behind main** (ancestor) |
| `frontend-dev` | `origin/frontend-dev` | 0/0 | Legacy FE dev branch | **Stale** — last commit 2026-07-16 |
| `backend-cleanup` (remote only) | — | — | BE cleanup | **Stale** — last commit 2026-07-09 |
| `backup-fe` (remote only) | — | — | FE backup | **Stale** — last commit 2026-07-09 |

### Git Topology

```
main (HEAD, origin/main)
├─── 074d9d8 fix: update API endpoints (fe-vercel-deployment diverged)
│
└─── dbf9b2e fix: update API endpoints (main)
     └─── e5cd683 fix: engines.node 24.x
          └─── 32e3aaf fix: health check path
               └─── [merges from fe-vercel-deployment + be-render-deployment]
                    └─── [Project Master FE, Brand FE, User Wizard]
                         └─── [BE modules — Brand, Phase, CP, UserGroup, Project]
                              └─── [Authentication, Permissions, RBAC V0.3]
                                   └─── [Initial commits, documents]

be-render-deployment
└─── 5cb0736 fix: health check path ✓ (behind main, same changes merged)

fe-vercel-deployment
└─── 074d9d8 fix: API endpoints (diverged — identical content to main's head)
└─── 843dbd1 fix: engines.node 24.x

frontend-dev (stale)
└─── Merged from frontend-dev into main — now behind
```

### Key Finding: Branch Divergence

**main** and **fe-vercel-deployment** have diverged with **different commit hashes** but **identical tree content** at HEAD. Both have the same changes (API endpoints fix + engines.node 24.x) committed separately on each branch. This is a cosmetic divergence only — no content difference.

**be-render-deployment** is 2 commits behind `main` but those commits are frontend-only changes (engines.node, API endpoints). The BE code is identical.

### Recommendations

| # | Recommendation | Priority |
|---|---------------|----------|
| R1 | Consider `main` as the single development and deployment branch. `fe-vercel-deployment` and `be-render-deployment` have served their purpose and can be considered archived. | Medium |
| R2 | `frontend-dev` and remote-only branches (`backend-cleanup`, `backup-fe`) can be archived or deleted. | Low |

---

## 3. Frontend Analysis

### Frontend Inventory

Three frontend applications exist in the repository:

| # | Directory | Deployed? | Vercel Project | Structure | Status |
|---|-----------|-----------|----------------|-----------|--------|
| A | `src/` | **YES** | `puravankara-rbac-frontend` | Sections-based (13 section dirs) | **Active production** |
| B | `fe/` | **NO** | — | Sections-based (mirrors src/) | **Duplicate/legacy** |
| C | `frontend/` | **NO** | — | Features-based (different architecture) | **Alternate implementation** |

### Frontend A: `src/` (Deployed — The One That Matters)

| Property | Value |
|----------|-------|
| Package name | `puravankara-rbac-portal` |
| Dependencies | 34 |
| Build | `tsc && vite build` |
| Output | `dist/` |
| Sections | 13: access, brand, channel-partner, error, geography, organization, permissions, phase, product-config, projects, system, users, workflow |
| API calls | **ZERO** outside auth |
| Mock data | 100% — imports from `src/services/mock-data.ts` |
| Auth | Real API calls for login/session only |
| Axios usage in sections | **0 files** |
| Mock-data imports in sections | **28 files** |
| API service layer | **Does not exist** — no `src/api/` directory |
| Endpoints defined | Only auth + unrelated (chat, kanban, mail, post, product) |
| VITE_SERVER_URL usage | Reads `import.meta.env.VITE_SERVER_URL` for axios baseURL |
| VITE_DATA_SOURCE usage | **Not used** — only in `fe/` |
| VITE_API_URL usage | **Not used** — only in `frontend/` |

**Section-by-Section API Status:**

| Section | Pages | API Wired? | Mock Used? |
|---------|-------|-----------|------------|
| Auth (login/signup) | `jwt-sign-in-view.tsx`, `jwt-sign-up-view.tsx` | ✅ Real API | No |
| Auth (session/me) | `auth-provider.tsx` | ✅ Real API | No |
| Auth (mocked user) | `use-mocked-user.ts` | ❌ Mock | Yes |
| Geography | `zone-list`, `zone-form`, `city-list` | ❌ Mock | Yes |
| Brand | `brand-list`, `brand-form` | ❌ Mock | Yes |
| Phase | `phase-list`, `phase-form` | ❌ Mock | Yes |
| Channel Partner | `cp-list`, `cp-form` | ❌ Mock | Yes |
| CP Type | `cp-type-list` | ❌ Mock | Yes |
| Organization | `department-list`, `role-list` | ❌ Mock | Yes |
| Product Config | `module-list`, `sub-module-list`, `action-list` | ❌ Mock | Yes |
| Projects | `project-list`, `project-form` | ❌ Mock | Yes |
| Users | `user-list`, `user-detail`, `user-new` | ❌ Mock | Yes |
| Access | `project-assignment`, `user-role-mapping`, `permission-matrix` | ❌ Mock | Yes |
| Workflow | `approval-inbox`, `approval-config`, `delegations` | ❌ Mock | Yes |
| System | `audit-logs`, `notifications` | ❌ Mock | Yes |

### Frontend B: `fe/` (Not Deployed — Duplicate of src/)

| Property | Value |
|----------|-------|
| Package name | `puravankara-rbac-portal` (same as src/) |
| Dependencies | 34 (same as src/) |
| Structure | **Nearly identical** to `src/` — same sections, same components |
| Key difference | Has `src/services/data-source.ts` (API/mock mode toggle via `VITE_DATA_SOURCE`) + `src/services/api/auth-api.ts` (correctly unwraps response) |
| Has sections? | Yes — **different from src/**: renamed `brands/` (plural), missing some directories |
| Deployed? | **No** — not linked to any Vercel project |
| Purpose | Appears to be a parallel attempt at API wiring using a mode-switching pattern |

**Notable differences from src/:**
- `fe/src/sections/brands/` vs `src/sections/brand/` (plural)
- `fe/src/services/api/auth-api.ts` — has auth API with correct response unwrapping
- `fe/src/services/api-client.ts` — axios client with refresh interceptor
- `fe/src/services/data-source.ts` — env-based API/mock mode toggle

### Frontend C: `frontend/` (Not Deployed — Different Architecture)

| Property | Value |
|----------|-------|
| Package name | `frontend` |
| Dependencies | 25 (fewer than src/) |
| Structure | **Features-based** — `src/features/{auth,geography,organization,permissions,product-config,projects,users,workflows}/` |
| Has real API services? | **Yes** — `src/features/*/services/` files exist |
| API unwrapping | Correct — uses `.then(r => r.data.data)` pattern |
| Has stores | Zustand stores for auth |
| Deployed? | **No** — not linked to any Vercel project |
| Purpose | Appears to be a separate/earlier implementation with real API wiring for some features |

### Frontend Recommendations

| # | Recommendation | Priority |
|---|---------------|----------|
| R3 | **Adopt `src/` as the single source of truth** — it is deployed, has all section pages, and is actively running on Vercel. | **Critical** |
| R4 | **Archive `fe/`** — it's a duplicate of `src/` with minor differences. If any valuable code exists here (data-source mode toggle, auth-api.ts), cherry-pick it to `src/`. | High |
| R5 | **Archive `frontend/`** — it's a different architecture. If any valuable API service code exists, cherry-pick to `src/`. | High |
| R6 | **Delete 14 stale report .md files** from root — they are documentation artifacts that add confusion. Move to `docs/` if needed. | Low |
| R7 | **Create API service layer** in `src/api/` or `src/services/api/` — currently none exists. This is the single biggest gap. | **Critical** |
| R8 | **Add VITE_SERVER_URL to `.env.local`** for local development — currently missing (only Vercel OIDC token present). | High |

---

## 4. Backend Analysis

### General Info

| Property | Value |
|----------|-------|
| Directory | `backend/` |
| Framework | NestJS 11 |
| ORM | TypeORM 1.x |
| Database | PostgreSQL (via Supabase) |
| Build | `npm run build` → `dist/` |
| Start | `node dist/main` |
| Modules | 19 (auth, brands, phases, channel-partner-types, channel-partners, user-groups, geography, projects, organization, users, product-catalog, permissions, project-access, workflows, delegation, notifications, audit, health, setup) |
| Total endpoints | 117 |
| Public endpoints | 5 (login, refresh, health, setup/status, setup/reset) |
| JWT-guarded | ~96 |
| Permission-guarded | 9 |

### Deployments

| Platform | Status | Branch | URL |
|----------|--------|--------|-----|
| Render | ✅ **Live** | `main` (render.yaml deploys from main) | `https://puravankara-rbac-portal.onrender.com` |
| Render (old) | ❌ Not Found | — | `https://puravankara-rbac-backend.onrender.com` |

### Build Status

| Artifact | Exists? |
|----------|---------|
| `backend/dist/main.js` | ✅ Yes |
| `backend/dist/config/data-source.js` | ✅ Yes |
| `backend/dist/config/migrations/*.js` | ✅ Yes (3 files) |

### Duplicate Backend? **No**

There is only one backend directory (`backend/`). There are no duplicate backend implementations.

### Backend-Branch Synchronization

- `main` contains the latest backend code
- `be-render-deployment` is behind `main` by 2 frontend-only commits — BE code is identical
- render.yaml deploys from `main` — this is correct
- However, render.yaml has `rootDir: backend` — this is also correct

### Migration Drift (Critical Issue)

| Aspect | Local | Database |
|--------|-------|----------|
| Source files | `backend/src/config/migrations/` | — |
| Local migration files | **3** (1783077482111-InitialSchema.ts, 1783077482112-SyncSchemaWithEntities.ts, 1783077482113-CreateBrandsTable.ts) | — |
| Database migrations table records | — | **12** (20260716155525 through 20260717134946) |
| Match? | **NO** — files don't correspond to DB records | |

The local TypeORM migration source files (3) do **not** match the migrations recorded in the database (12). This means:
- Either the migrations were generated and run from a different environment
- Or the local migration files were regenerated/replaced after being run
- Or migration files exist elsewhere that weren't found

The 3 local migration files start with `1783077482...` timestamps, while the 12 DB migrations use `20260716...` / `20260717...` format. The DB migrations were clearly generated and run after the local files were created.

### Key Finding: Data Source Discrepancy

The `data-source.ts` config points to `__dirname + '/migrations/*{.ts,.js}'` which resolves to `backend/src/config/migrations/`. But the migration files in that directory (3) don't match the DB records (12). This means `npm run migration:run` would try to run these 3 fresh migrations on top of the 12 already-applied ones, causing conflicts.

### Backend Recommendations

| # | Recommendation | Priority |
|---|---------------|----------|
| R9 | **Resolve migration drift** — generate fresh migration files from the current entity state that match what's in the DB. Run `migration:generate` to create a snapshot file. | **Critical** |
| R10 | **Do NOT run `migration:run`** in its current state — it will attempt to apply 3 conflicting migrations. | **Critical** |

---

## 5. Vercel Analysis

### Vercel Projects

Two Vercel projects exist that are related to this repository:

| Project | Production URL | Deployed From | Status |
|---------|---------------|---------------|--------|
| `puravankara-rbac-frontend` | `https://puravankara-rbac-frontend.vercel.app` | `main` branch, `src/` directory | ✅ **Correct — this is the production frontend** |
| `puravankara-rbac-portal` | `https://puravankara-rbac-portal-rohitvp-iprogrammers-projects.vercel.app` | Unknown | ❌ **Redirects only — stale/wrong project** |

### Current Vercel Project Link (local)

The local `.vercel/repo.json` is correctly linked to:
```
project: puravankara-rbac-frontend
directory: .
org: team_OmbqBaWgjY7DkpIm0QJOKrOG
```

### Vercel Environment Variables

**Project: `puravankara-rbac-frontend`**

| Variable | Environment | Value | Used by `src/`? | Notes |
|----------|-------------|-------|----------------|-------|
| `VITE_SERVER_URL` | Production | `https://puravankara-rbac-portal.onrender.com` | ✅ Yes — axios baseURL | Correct |
| `VITE_DATA_SOURCE` | Production | Encrypted | ❌ No — only `fe/` uses it | **Unused by deployed code** |
| `VITE_API_URL` | Production | Encrypted | ❌ No — only `frontend/` uses it | **Unused by deployed code** |

### Vercel Configuration

| Setting | Value | Notes |
|----------|-------|-------|
| Production Branch | `main` | Correct |
| Framework | Vite | Correct |
| Root Directory | `.` (from vercel.json link) | Matches directory structure (index.html in root) |
| Output Directory | `dist` | Vite default |
| Node.js Version | 24.x | Set via package.json engines |

### Vercel Recommendations

| # | Recommendation | Priority |
|---|---------------|----------|
| R11 | **Remove `VITE_DATA_SOURCE` and `VITE_API_URL` from Vercel** — they are not used by the deployed `src/` frontend and cause confusion. | High |
| R12 | **Archive/delete `puravankara-rbac-portal` Vercel project** — it's unused and redirects only. | Low |
| R13 | **Verify build settings** in Vercel dashboard match: Framework=Vite, Output=dist, Root=. | Medium |

---

## 6. Render Analysis

### Service Info

| Property | Value |
|----------|-------|
| Service Name | `puravankara-rbac-api` |
| URL | `https://puravankara-rbac-portal.onrender.com` |
| Health Endpoint | `/api/v1/health` |
| Health Status | ✅ **UP** — returns `{"status":"ok","database":{"status":"up"}}` |
| Deployed Branch | `main` |
| Root Directory | `backend` |
| Region | Oregon (US) |
| Plan | Free |

### Build & Start Commands (from render.yaml)

```yaml
buildCommand: npm install --include=dev && npm run build
startCommand: npm run migration:run:prod && npm run seed:prod && npm run start:prod
```

### Environment Variables (render.yaml)

| Variable | Sync | Value | Status |
|----------|------|-------|--------|
| `NODE_ENV` | ✅ Sync | `production` | Set in render.yaml |
| `PORT` | ✅ Sync | `3000` | Set in render.yaml |
| `DATABASE_URL` | ❌ **sync: false** | Must be set manually | **Not in Git** |
| `JWT_SECRET` | ✅ Auto-generate | Random | Auto-generated |
| `JWT_REFRESH_SECRET` | ✅ Auto-generate | Random | Auto-generated |
| `CORS_ORIGINS` | ❌ **sync: false** | Must be set manually | **Not in Git** |
| `FRONTEND_URL` | ❌ **sync: false** | Must be set manually | **Not in Git** |
| `REDIS_ENABLED` | ✅ Sync | `false` | Set in render.yaml |
| `DEFAULT_ADMIN_EMAIL` | ✅ Sync | `admin@system.local` | Set in render.yaml |
| `DEFAULT_ADMIN_PASSWORD` | ❌ **sync: false** | Must be set manually | **Not in Git** |
| `DB_LOGGING` | ✅ Sync | `false` | Set in render.yaml |
| `LOG_LEVEL` | ✅ Sync | `info` | Set in render.yaml |
| `LOG_FORMAT` | ✅ Sync | `json` | Set in render.yaml |

### Key Inconsistencies

1. **`DEFAULT_ADMIN_EMAIL` in render.yaml is `admin@system.local`** — but the local backend `.env` has `DEFAULT_ADMIN_EMAIL=admin@puravankara.com`, and the database has an admin with email `admin@puravankara.com`
2. **`DEFAULT_ADMIN_PASSWORD` has `sync: false`** — the actual password must be set manually in the Render dashboard. It was set to a non-default value, which caused login failures until we reset it via SQL
3. **render.yaml has `DEFAULT_ADMIN_EMAIL: admin@system.local`** but the working admin in the DB is `admin@puravankara.com` — the seed used the env var from the Render dashboard, not the render.yaml default

### Render Recommendations

| # | Recommendation | Priority |
|---|---------------|----------|
| R14 | **Update `DEFAULT_ADMIN_EMAIL` in render.yaml** to `admin@puravankara.com` to match the actual admin user in the database. | High |
| R15 | **Set `DEFAULT_ADMIN_PASSWORD` in Render dashboard** to `Admin@123456` (or your desired password) — currently unset, which means password resets via `/api/v1/setup/reset` won't work correctly. | **Critical** |
| R16 | **Set `DATABASE_URL` in Render dashboard** — verify the current connection string is still valid. | High |
| R17 | **The old Render URL** `https://puravankara-rbac-backend.onrender.com` is dead — ensure no references remain. | Medium |

---

## 7. Supabase Analysis

### Project Info

| Property | Value |
|----------|-------|
| Project ID | `vsxnevbhidivdzdpfojb` |
| Region | Tokyo (`ap-northeast-1`) |
| Pooler URL | `aws-0-ap-northeast-1.pooler.supabase.com:5432` |
| Connection String | `postgresql://postgres.vsxnevbhidivdzdpfojb:<password>@aws-0-ap-northeast-1.pooler.supabase.com:5432/postgres` |
| Connection Status | ✅ **Healthy** (confirmed by Render health check) |

### Database Tables (52 total)

```
actions, action_permission_scopes, approval_requests, approval_request_steps,
approval_steps, approval_workflows, audit_logs, brands, channel_partner_types,
channel_partners, cities, city_zone_mappings, department_hierarchy_levels,
department_roles, departments, migrations, module_actions, modules,
notification_preferences, notifications, permission_scopes,
permission_snapshot_history, permission_templates, phases, project_groups,
project_group_projects, project_incentive_rules, project_locations,
project_payment_gateways, projects, role_project_permissions, roles, sub_modules,
system_settings, template_permissions, user_auth, user_delegations,
user_group_mappings, user_groups, user_module_access, user_module_projects,
user_permission_overrides, user_permission_templates, user_project_access,
user_project_feature_matrix, user_project_groups, user_reporting_lines,
user_roles, user_sessions, user_zones, users, zones
```

### Migrations (12 applied)

| # | Version | Name |
|---|---------|------|
| 1 | 20260716155525 | add_salary_capping_to_zones |
| 2 | 20260716155719 | create_department_hierarchy_levels |
| 3 | 20260716160111 | add_city_state_country_to_brands |
| 4 | 20260716160711 | create_phases_table |
| 5 | 20260716161323 | create_channel_partner_types_table |
| 6 | 20260716161330 | create_channel_partners_table |
| 7 | 20260716161722 | create_user_groups_table |
| 8 | 20260716161743 | create_user_module_access_tables |
| 9 | 20260716161749 | create_user_group_mapping |
| 10 | 20260716164641 | project_master_extended |
| 11 | 20260717134916 | enable_rls_on_all_tables |
| 12 | 20260717134946 | create_default_rls_policies |

### Seed Data

| Entity | Records |
|--------|---------|
| `users` | 1 (`admin@puravankara.com`, emp_id: `ADMIN001`) |
| `user_auth` | 1 (bcrypt-hashed password, LOCAL provider) |
| `zones` | 4 (North, South, East, West) |
| `cities` | 20 (5 per zone) |
| `actions` | 8 (VIEW, CREATE, UPDATE, DELETE, APPROVE, REJECT, EXPORT, IMPORT) |

### Migration Drift (Critical)

| Local Migration Files | DB Applied Migrations | Match? |
|-----------------------|----------------------|--------|
| `1783077482111-InitialSchema.ts` | 12 records (20260716155525–20260717134946) | ❌ **NO** |
| `1783077482112-SyncSchemaWithEntities.ts` | | |
| `1783077482113-CreateBrandsTable.ts` | | |

The local `backend/src/config/migrations/` directory contains **3 files** with timestamps in the `1783077482xxx` format. These do not correspond to any of the **12 applied migrations** (which use `20260716xxxxx` / `20260717xxxxx` format). The migrations table shows the TypeORM `timestamp` column format (not the filename format).

### Table Duplication Check

All 52 tables appear to be unique. No obvious duplicate or orphaned tables were found.

### Supabase Recommendations

| # | Recommendation | Priority |
|---|---------------|----------|
| R18 | **Generate a single "current state" migration** from entities to align local migration files with the database state. | **Critical** |
| R19 | **Do NOT run `npm run migration:run`** locally or on Render — it will attempt to apply 3 conflicting migrations on top of the 12 already-applied ones. | **Critical** |

---

## 8. Environment Variable Analysis

### Variable Inventory by Platform

| Variable | Local `.env` | Local `.env.local` | Git (render.yaml) | Vercel | Render Dashboard | Supabase | Match? |
|----------|-------------|-------------------|-------------------|--------|-----------------|----------|--------|
| `VITE_SERVER_URL` | ❌ Missing | ❌ Missing | — | ✅ `https://puravankara-rbac-portal.onrender.com` | — | — | ✅ Set in Vercel only |
| `VITE_DATA_SOURCE` | ❌ Missing | ❌ Missing | — | ✅ Encrypted | — | — | ⚠️ Unused by deployed src/ |
| `VITE_API_URL` | ❌ Missing | ❌ Missing | — | ✅ Encrypted | — | — | ⚠️ Unused by deployed src/ |
| `DATABASE_URL` | ❌ Placeholder `postgresql://user:password@localhost...` | ❌ Missing | ❌ sync:false | — | ✅ Must be set manually | ✅ Used for connection | ⚠️ Placeholder in .env |
| `JWT_SECRET` | ❌ `change-me-to-a-random-secret` | ❌ Missing | ✅ Auto-generated | — | ✅ Auto-generated | — | ✅ Auto-generated per env |
| `JWT_REFRESH_SECRET` | ❌ `change-me-to-another-random-secret` | ❌ Missing | ✅ Auto-generated | — | ✅ Auto-generated | — | ✅ Auto-generated per env |
| `DEFAULT_ADMIN_EMAIL` | ✅ `admin@puravankara.com` | ❌ Missing | ✅ `admin@system.local` | — | ✅ Overridden in dashboard | — | ❌ **Conflict**: .env says `admin@puravankara.com`, render.yaml says `admin@system.local` |
| `DEFAULT_ADMIN_PASSWORD` | ✅ `Admin@12345` | ❌ Missing | ❌ sync:false | — | ✅ Must be set manually | — | ⚠️ .env has `Admin@12345` (note: 5 not 6!), sync:false in Render |
| `NODE_ENV` | ✅ `development` | ❌ Missing | ✅ `production` | — | ✅ `production` | — | ✅ |
| `PORT` | ✅ `3000` | ❌ Missing | ✅ `3000` | — | ✅ `3000` | — | ✅ |
| `DB_LOGGING` | ❌ Missing | ❌ Missing | ✅ `false` | — | ✅ `false` | — | ✅ |
| `REDIS_ENABLED` | ❌ Missing | ❌ Missing | ✅ `false` | — | ✅ `false` | — | ✅ |
| `VERCEL_OIDC_TOKEN` | ❌ Missing | ✅ Present | — | — | — | — | ⚠️ Local-only, not committed |
| `FRONTEND_URL` | ❌ Missing | ❌ Missing | ❌ sync:false | — | Must be set manually | — | ⚠️ Could be set for CORS |
| `CORS_ORIGINS` | ❌ Missing | ❌ Missing | ❌ sync:false | — | Must be set manually | — | ⚠️ Could be set for CORS |

### Inconsistencies Found

1. **`DEFAULT_ADMIN_EMAIL` mismatch**: `.env` = `admin@puravankara.com` (correct), `render.yaml` = `admin@system.local` (wrong). If a new Render deployment happens, it would seed with the wrong email.
2. **`DEFAULT_ADMIN_PASSWORD` mismatch**: `.env` = `Admin@12345` (5 chars — typos?), actual working password = `Admin@123456` (6 chars). The Render dashboard has `sync: false`, so whatever was manually entered there is the real value.
3. **`DATABASE_URL` in `.env`** is a placeholder — local development can't connect to the real database.
4. **VITE_DATA_SOURCE** and **VITE_API_URL** in Vercel are **unused** by the deployed `src/` frontend.
5. **Local `.env.local`** only contains VERCEL_OIDC_TOKEN — no actual app configuration for local development.

### Environment Variable Recommendations

| # | Recommendation | Priority |
|---|---------------|----------|
| R20 | **Update `DEFAULT_ADMIN_EMAIL` in render.yaml** from `admin@system.local` to `admin@puravankara.com` | High |
| R21 | **Fix `DEFAULT_ADMIN_PASSWORD` in `.env`** — currently `Admin@12345` (5 characters after @). The working password is `Admin@123456` | Medium |
| R22 | **Remove VITE_DATA_SOURCE and VITE_API_URL from Vercel** — not used by deployed code | High |
| R23 | **Add `VITE_SERVER_URL` to local `.env`** for local development | Medium |
| R24 | **Ensure `DATABASE_URL` is correctly set in Render dashboard** | High |

---

## 9. Deployment Flow

### Current Deployment Architecture

```
                    GitHub (RohitPalkar/puravankara-rbac-portal)
                     main branch
                    /           \
                   /             \
            Vercel Auto           Render Auto
         (puravankara-rbac-     (puravankara-rbac-api)
          frontend)
               |                       |
               v                       v
    https://puravankara-rbac-   https://puravankara-rbac-
     frontend.vercel.app         portal.onrender.com
               |                       |
          axios calls             NestJS API
               |                       |
               +------- Supabase -------+
                       (pooler)
                          |
                    PostgreSQL
                   (ap-northeast-1)
```

### Deployment Flow

```
Developer pushes to main
        │
        ├──→ Vercel detects push to main
        │      ├── Runs `npm install`
        │      ├── Runs `npm run build` (tsc && vite build)
        │      ├── Output: dist/
        │      └── Deploys to https://puravankara-rbac-frontend.vercel.app
        │
        └──→ Render detects push to main
               ├── Reads render.yaml (rootDir: backend)
               ├── Runs `npm install --include=dev && npm run build`
               ├── Runs `npm run migration:run:prod` ⚠️ (risks migration conflicts)
               ├── Runs `npm run seed:prod`
               ├── Runs `npm run start:prod`
               └── Health check at /api/v1/health
```

### What Happens on Each Render Deploy

1. Migration check: `node dist/config/data-source.js migration:run`
   - Checks `migrations` table in DB
   - Runs any unapplied migrations from `dist/config/migrations/`
   - **Currently 3 local migrations not in DB** — would try to run them
2. Seed: `node dist/database/seed-prod.js`
   - Creates zones, actions, SUPER_ADMIN role
   - Creates admin user if not exists (using env vars)
   - Creates user_auth if not exists
3. Start: `node dist/main`
   - Boots NestJS app on PORT 3000
   - Health check at `/api/v1/health`

---

## 10. Recommendations

### Critical (Must Fix Before Any New Features)

| # | Area | Recommendation | Why |
|---|------|---------------|-----|
| R7 | Frontend | **Create API service layer for `src/`** — no section has real API calls. Auth is the only exception. | The entire frontend is a mock prototype. Without this, nothing works with real data. |
| R9 | Backend | **Resolve migration drift** — 3 local migration files don't match 12 DB migrations. Generate a new snapshot migration. | Running `migration:run` will fail or corrupt the schema. |
| R10 | Backend | **Do NOT run `migration:run`** in current state | Will attempt to apply 3 conflicting migrations |
| R15 | Render | **Set `DEFAULT_ADMIN_PASSWORD` in Render dashboard** | Password resets via `/api/v1/setup/reset` depend on this env var |
| R18 | Backend | **Generate a single "current state" migration** to align files with DB | Same as R9 — resolves the drift |

### High (Should Fix Before Feature Work Continues)

| # | Area | Recommendation | Why |
|---|------|---------------|-----|
| R3 | Frontend | **Adopt `src/` as single source of truth** — archive `fe/` and `frontend/` | 3 frontends cause confusion and duplicated effort |
| R4 | Frontend | **Archive `fe/`** — cherry-pick any valuable code (data-source toggle, auth-api.ts) | Reduces confusion |
| R5 | Frontend | **Archive `frontend/`** — cherry-pick any valuable API service code | Reduces confusion |
| R8 | Frontend | **Add `VITE_SERVER_URL` to local `.env.local`** | Enables local frontend development against real backend |
| R14 | Render | **Update `DEFAULT_ADMIN_EMAIL` in render.yaml** to `admin@puravankara.com` | Prevents seed creating wrong admin on redeploy |
| R11 | Vercel | **Remove unused `VITE_DATA_SOURCE` and `VITE_API_URL`** | Not used by deployed code, causes confusion |
| R16 | Render | **Verify `DATABASE_URL` in Render dashboard** | If it expires or changes, backend goes down |
| R20 | Env | **Update `DEFAULT_ADMIN_EMAIL` in render.yaml** | Same as R14 — critical for seed consistency |
| R22 | Env | **Remove `VITE_DATA_SOURCE` and `VITE_API_URL` from Vercel** | Same as R11 |
| R24 | Env | **Verify `DATABASE_URL` in Render dashboard** | Same as R16 |

### Medium (Post-Audit Cleanup)

| # | Area | Recommendation | Why |
|---|------|---------------|-----|
| R1 | Git | **Consolidate on `main`** — deployment branches have served their purpose | Simplifies branch management |
| R13 | Vercel | **Verify Vercel build settings** (Framework=Vite, Output=dist) | Prevents deployment failures |
| R17 | Render | **Remove references to old Render URL** (`puravankara-rbac-backend.onrender.com`) | Dead URL causes confusion |
| R21 | Env | **Fix local `.env` password** — `Admin@12345` vs `Admin@123456` | Prevents local dev auth issues |
| R23 | Env | **Add `VITE_SERVER_URL` to local `.env`** | Enables local frontend development |

### Low (Nice-to-Have)

| # | Area | Recommendation | Why |
|---|------|---------------|-----|
| R2 | Git | **Archive `frontend-dev`, `backend-cleanup`, `backup-fe` branches** | Clean up stale branches |
| R6 | Repo | **Delete 14 stale report .md files from root** (move to `docs/` if needed) | Reduces root clutter |
| R12 | Vercel | **Delete `puravankara-rbac-portal` Vercel project** | Unused project, redirects only |

---

## Summary of Findings

### What's Working
- ✅ Backend live on Render with 117 endpoints, 19 modules
- ✅ Frontend live on Vercel with all section pages rendered
- ✅ Auth flow working end-to-end (login, JWT, session)
- ✅ Database healthy with 52 tables, 12 migrations applied
- ✅ CORS configured correctly
- ✅ GitHub → Vercel/Render auto-deploy pipeline

### What's Broken
- ❌ **100% of section pages use mock data** — no CRUD API calls from the frontend
- ❌ **Migration drift** — 3 local files vs 12 DB records (potential schema corruption on deploy)
- ❌ **Admin password sync** — `DEFAULT_ADMIN_PASSWORD` is not set in Render dashboard
- ❌ **Admin email mismatch** — render.yaml says `admin@system.local`, DB has `admin@puravankara.com`

### What's Confusing
- ⚠️ **3 frontend codebases** (`src/`, `fe/`, `frontend/`) — only `src/` is deployed
- ⚠️ **14 stale report files** at repo root
- ⚠️ **2 Vercel projects** — only `puravankara-rbac-frontend` is active
- ⚠️ **2 Render URLs** — only `puravankara-rbac-portal.onrender.com` is live
- ⚠️ **Unused env vars in Vercel** — `VITE_DATA_SOURCE` and `VITE_API_URL` have no consumers in deployed code

---

*End of Audit Report*

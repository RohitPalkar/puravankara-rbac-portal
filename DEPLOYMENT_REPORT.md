# Puravankara RBAC Portal — Complete Report

**Generated:** 2026-07-17  
**Repository:** `RohitPalkar/puravankara-rbac-portal`  
**Branch:** `main` (production)  
**Local path:** `/Users/rohitvp/puravankara-rbac-portal`

---

## Table of Contents

1. [Architecture Overview](#1-architecture-overview)
2. [Repository Structure](#2-repository-structure)
3. [Branch Strategy & Git History](#3-branch-strategy--git-history)
4. [Backend Architecture](#4-backend-architecture)
5. [Frontend Architecture](#5-frontend-architecture)
6. [Database Schema & Migrations](#6-database-schema--migrations)
7. [Deployment Configuration](#7-deployment-configuration)
8. [Authentication Flow](#8-authentication-flow)
9. [Issues Encountered & Resolutions](#9-issues-encountered--resolutions)
10. [Files Changed This Session](#10-files-changed-this-session)
11. [Current State](#11-current-state)
12. [Next Steps](#12-next-steps)

---

## 1. Architecture Overview

```
Browser ─── HTTPS ─── Vercel (Frontend)
                         │
                     axios calls
                         │
                         ▼
                    Render (Backend API)
                         │
                   TypeORM + pg driver
                         │
                         ▼
               Supabase Connection Pooler
                    aws-0-ap-northeast-1.pooler.supabase.com
                         │
                         ▼
              Supabase PostgreSQL (IPv6 only)
                    ap-northeast-1 (Tokyo)
```

### Service URLs

| Service | URL | Status |
|---------|-----|--------|
| Frontend (Vercel) | https://puravankara-rbac-frontend.vercel.app | ✅ Live |
| Backend API (Render) | https://puravankara-rbac-portal.onrender.com | ✅ Live |
| Health Check | https://puravankara-rbac-portal.onrender.com/api/v1/health | ✅ Returns `{"status":"ok","database":{"status":"up"}}` |
| Swagger Docs | https://puravankara-rbac-portal.onrender.com/api/v1/docs | ✅ Available |
| Supabase Project | `vsxnevbhidivdzdpfojb` | ✅ Connected |
| Database Pooler | `postgresql://postgres.vsxnevbhidivdzdpfojb:...@aws-0-ap-northeast-1.pooler.supabase.com:5432/postgres` | ✅ |

### Technology Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Frontend Framework | React 18 + TypeScript | ^18.0.0 |
| Build Tool | Vite | ^5.4.2 |
| UI Library | MUI (Material-UI) | ^6.x |
| Form Validation | React Hook Form + Zod | Latest |
| Backend Framework | NestJS | ^11.0.1 |
| ORM | TypeORM | ^1.0.0 |
| Database | PostgreSQL (via Supabase) | 15.x |
| Auth | JWT + Passport (bcrypt) | Latest |
| Runtime | Node.js | 24.x |
| Deployment (FE) | Vercel | - |
| Deployment (BE) | Render | Free plan, Oregon |

---

## 2. Repository Structure

```
puravankara-rbac-portal/
├── backend/                          # NestJS Backend
│   ├── src/
│   │   ├── main.ts                   # Bootstrap: CORS, Swagger, global prefix, pipes
│   │   ├── app.module.ts             # Root module — 20+ feature modules registered
│   │   ├── config/
│   │   │   ├── database.config.ts    # TypeORM config with Supabase/pooler SSL support
│   │   │   ├── data-source.ts        # CLI data source for migrations
│   │   │   └── env.validation.ts     # Joi env validation schema
│   │   ├── common/
│   │   │   ├── interceptors/
│   │   │   │   └── transform.interceptor.ts  # Global {statusCode,message,data} wrapper
│   │   │   ├── filters/
│   │   │   │   └── http-exception.filter.ts  # Global exception formatting
│   │   │   └── logger/
│   │   │       └── app-logger.ts             # Winston-based structured logging
│   │   ├── modules/
│   │   │   ├── auth/                 # JWT login, refresh, session management, guards
│   │   │   ├── brands/               # Brand master CRUD
│   │   │   ├── phases/               # Phase master CRUD with launch dates
│   │   │   ├── channel-partner-types/ # CP Type lookup master
│   │   │   ├── channel-partners/     # Channel Partner CRUD
│   │   │   ├── user-groups/          # User Group CRUD + module access mappings
│   │   │   ├── geography/            # Zone + City management
│   │   │   ├── projects/             # Project master with extended spec
│   │   │   ├── organization/         # Department, Role, Employee hierarchy
│   │   │   ├── users/                # User CRUD, profile, employment
│   │   │   ├── product-catalog/      # Module, SubModule, Action management
│   │   │   ├── permissions/          # RBAC/ABAC engine: templates, overrides, matrix
│   │   │   ├── project-access/       # User-Project-Group access mappings
│   │   │   ├── workflows/            # Approval workflows, steps, submissions
│   │   │   ├── delegation/           # Approval delegation management
│   │   │   ├── notifications/        # Real-time notifications (WebSocket)
│   │   │   ├── audit/                # Audit logging module
│   │   │   ├── health/               # Health check (Terminus)
│   │   │   └── setup/                # System setup status + reset endpoint
│   │   └── database/
│   │       ├── migrations/           # TypeORM migration files (12 applied)
│   │       ├── seeders/
│   │       │   ├── bootstrap.seeder.ts  # Admin user, zones, actions, SUPER_ADMIN role
│   │       │   ├── main.seeder.ts       # Seeder wrapper
│   │       │   └── seed.service.ts      # Nest injectable seed service
│   │       ├── seed-prod.ts             # Standalone seed script for Render
│   │       └── seed-prod.module.ts      # Module for standalone seed
│   ├── render.yaml                  # Render service definition
│   ├── package.json                 # BE dependencies (NestJS 11, TypeORM, bcrypt, etc.)
│   └── tsconfig.json
│
├── src/                              # Frontend (production — deployed to Vercel)
│   ├── auth/                         # Auth context, JWT provider, sign-in/sign-up views
│   │   ├── context/jwt/
│   │   │   ├── action.ts             # signInWithPassword, signUp, signOut
│   │   │   ├── auth-provider.tsx     # React context for auth state
│   │   │   ├── utils.ts              # Token decode, session management
│   │   │   └── constant.ts           # Storage keys
│   │   ├── hooks/                    # useAuthContext hook
│   │   ├── view/jwt/
│   │   │   └── jwt-sign-in-view.tsx  # Login form page
│   │   └── ...
│   ├── sections/                     # Feature pages by domain
│   │   ├── access/                   # User-role mapping
│   │   ├── brand/                    # Brand master CRUD pages
│   │   ├── channel-partner/          # CP + CP Type pages
│   │   ├── geography/                # Zone + City management
│   │   ├── organization/             # Department + Role pages
│   │   ├── permissions/              # Permission matrix
│   │   ├── phase/                    # Phase master pages
│   │   ├── product-config/           # Module, SubModule, Action pages
│   │   ├── projects/                 # Project master pages
│   │   ├── users/                    # User list, detail, new/create wizard
│   │   ├── workflow/                 # Approval config, inbox, delegations
│   │   └── system/                   # Audit logs, notifications
│   ├── services/
│   │   └── mock-data.ts              # Mock data for development/testing
│   ├── utils/
│   │   └── axios.ts                  # Axios instance with baseURL from env
│   ├── config-global.ts              # Env var mappings (VITE_SERVER_URL, etc.)
│   └── routes/
│       └── paths.ts                  # Route path definitions
│
├── fe/                               # Alternate frontend (legacy/parallel)
│   ├── src/
│   │   ├── auth/context/jwt/
│   │   │   └── action.ts             # Same sign-in flow (has API mode + mock mode)
│   │   ├── services/
│   │   │   ├── api/auth-api.ts       # API-mode login (correctly unwraps response)
│   │   │   └── api-client.ts         # Axios client with refresh interceptor
│   │   └── ...
│   └── ...
│
├── frontend/                         # Another alternate frontend (correct implementation)
│   └── src/
│       ├── features/auth/pages/
│       │   └── LoginPage.tsx         # Login page (uses endpoints with .data.data)
│       ├── services/api/
│       │   ├── endpoints.ts          # Correctly unwraps via .then(r => r.data.data)
│       │   └── axios.ts              # Axios instance with correct refresh handling
│       └── types/
│           └── api.types.ts          # ApiResponse<T> and LoginPayload types
│
├── package.json                      # Root package.json (Node engine 24.x pinned)
├── vite.config.ts                    # Vite configuration
├── vercel.json                       # Vercel deployment config (if present)
└── render.yaml                       # Render deployment config
```

---

## 3. Branch Strategy & Git History

### Branches

| Branch | Purpose | Status | Latest Commit |
|--------|---------|--------|---------------|
| `main` | Production — merged FE + BE | Active | `dbf9b2e` fix: update API endpoints to match NestJS backend routes |
| `be-render-deployment` | Backend deployment branch | Merged to main | `5cb0736` fix: correct Render health check path |
| `fe-vercel-deployment` | Frontend deployment branch | Merged to main | `074d9d8` fix: update API endpoints to match NestJS backend routes |
| `frontend-dev` | Legacy frontend dev branch | Stale | `94dc982` Merge remote-tracking branch 'origin/main' |
| `backend-cleanup` | BE cleanup | Stale | `44587e9` feat(backend): BE-2 contract adapters |
| `backup-fe` | FE backup | Stale | `1790114` user list changes |

### Key Merge Points

```
main
├── Merge fe-vercel-deployment (Brand/Phase/CP FE + 4-step User Wizard)
├── Merge fe-vercel-deployment (Project Master FE)
├── Merge be-render-deployment (Brand, Phase, CP, UserGroup, Project BE)
├── fix: correct Render health check path to /api/v1/health
├── fix: engines.node → 24.x for Vercel
└── fix: API endpoints to /api/v1/ routes
```

### Commit History Timeline

| Date | Commit | Description |
|------|--------|-------------|
| 2026-07-08 | `100c53e` | Initial commit |
| 2026-07-08 | `477ed6b` | Remove all files except RBAC Documents |
| 2026-07-09 | `079714f`–`94b6e7e` | 16 FE commits: DataTable enhancements, Zone flow, User wizard, Role/Dept masters, Action menus |
| 2026-07-10 | `fd420f6` | Production readiness: JWT env fix, role-mapping CRUD, seed data, secrets cleanup |
| 2026-07-15 | `a0d1cbc` | Fix: engines.node to 24.x for Vercel |
| 2026-07-15 | `f74a45e` | Fix: remove npx from build, postbuild verification, render.yaml healthCheckPath |
| 2026-07-16 | `22e3630`–`3ff9744` | Color scheme (#2E3192), Brand module with grouped-header table, Phase A cleanup |
| 2026-07-16 | `2b93224` | Add Brand module with full CRUD backend |
| 2026-07-16 | `8832f99`–`6d94394` | Permissions/me response, CORS fix, login enable, API wiring |
| 2026-07-16 | `aa5c5aa`–`700b2c8` | Phase, CP Type, CP, UserGroup, Project — BE modules |
| 2026-07-16 | `6eaa60b` | Fix: build errors — ProjectService signatures, controllers, TypeORM |
| 2026-07-16 | `3411e26`, `78da1c7` | Merge FE + BE to main |
| 2026-07-17 | `32e3aaf` | Fix: health check path to /api/v1/health |
| 2026-07-17 | `843dbd1` | Fix: engines.node to 24.x (cherry-pick to fe-vercel-deployment) |
| 2026-07-17 | `074d9d8` | Fix: API endpoints to /api/v1/ (cherry-pick to fe-vercel-deployment) |

---

## 4. Backend Architecture

### NestJS Module Structure (20 modules)

```
AppModule
├── AuthModule           — JWT login, refresh, register, logout, session
├── BrandsModule         — Brand CRUD
├── PhasesModule         — Phase CRUD
├── ChannelPartnerTypesModule — CP Type lookup
├── ChannelPartnersModule     — Channel Partner CRUD
├── UserGroupsModule     — User Group CRUD + module access
├── GeographyModule      — Zone + City management
├── ProjectsModule       — Project master (extended spec)
├── OrganizationModule   — Department, Role, Employee
├── UsersModule          — User CRUD
├── ProductCatalogModule — Module, SubModule, Action
├── PermissionsModule    — RBAC: templates, overrides, matrix, permission controller
├── ProjectAccessModule  — User-Project-Group access
├── WorkflowsModule      — Approval workflows, submissions
├── DelegationModule     — Approval delegation
├── NotificationsModule  — Real-time notifications
├── AuditModule          — Audit logging
├── HealthModule         — Health check (database)
├── SetupModule          — System setup status + reset
└── CommonModule         — Shared interceptors, filters, logger
```

### Global Guards (Applied Order)

1. **ThrottlerGuard** — Rate limiting (100 req/60s by default)
2. **JwtAuthGuard** — JWT authentication (can be bypassed with `@Public()` decorator)
3. **PermissionGuard** — ABAC permission enforcement (checks user role + resource action)

### Global Interceptors

- **TransformInterceptor** — Wraps all responses in `{ statusCode, message, data, meta }`
  - This is the root cause of the "Access token not found" error described below

### Bootstrap Configuration (`main.ts`)

| Feature | Setting |
|---------|---------|
| Global prefix | `api/v1` |
| CORS | `origin: true`, credentials enabled |
| Swagger | `/api/v1/docs` — Bearer JWT auth |
| Validation | Whitelist + forbidNonWhitelisted + auto-transform |
| Helmet | Enabled (security headers) |
| Compression | Enabled (gzip) |
| Port | `process.env.PORT` or 3000 |

### Database Configuration (`database.config.ts`)

| Setting | Value |
|---------|-------|
| Type | PostgreSQL |
| Connection | URL-based (reads `DATABASE_URL`) |
| SSL | `{ rejectUnauthorized: false }` for Supabase/pooler URLs |
| Synchronize | `false` in production (opt-in via `TYPEORM_SYNC=true`) |
| Pool size | 10 (configurable via `DB_POOL_MAX`) |

### Startup Sequence (Render)

```bash
npm install --include=dev     # Install deps (incl. devDependencies for build)
npm run build                 # nest build → dist/
npm run migration:run:prod    # node dist/config/data-source.js migration:run
npm run seed:prod             # node dist/database/seed-prod.js
npm run start:prod            # node dist/main
```

### Seed Data (`bootstrap.seeder.ts`)

| Entity | Data |
|--------|------|
| Zones | North, South, East, West |
| Actions | VIEW, CREATE, UPDATE, DELETE, APPROVE, REJECT, EXPORT, IMPORT |
| Role | SUPER_ADMIN (system role, hierarchy level 1) |
| Admin User | Email from `DEFAULT_ADMIN_EMAIL` env (default: `admin@system.local`), Password from `DEFAULT_ADMIN_PASSWORD` env (default: `Admin@123456`) |
| Auth Record | bcrypt hash (12 rounds) + LOCAL provider |

### Setup Endpoint (`POST /api/v1/setup/reset`)

What it does:
1. Resets admin password hash to `bcrypt(DEFAULT_ADMIN_PASSWORD || 'Admin@123456', 10)`
2. Unlocks admin account (`is_locked = false, failed_attempts = 0`)
3. Deletes ALL non-admin users (CASCADE through all related tables)
4. Clears and re-seeds zones (4) and cities (20)

What it does NOT do:
- Does NOT create `user_auth` row if missing
- Does NOT re-seed SUPER_ADMIN role, system actions, or any other seed data
- Does NOT run `bootstrapSeeder`
- Reads env vars directly — if `DEFAULT_ADMIN_EMAIL` changed after initial seed, the UPDATE won't find the original admin

---

## 5. Frontend Architecture

### Frontend (`src/` — deployed to Vercel)

**Framework:** React 18 + TypeScript + Vite + MUI

**Key Files:**
- `src/config-global.ts` — Reads `VITE_SERVER_URL` from `import.meta.env`
- `src/utils/axios.ts` — Axios instance with `baseURL: CONFIG.serverUrl`
- `src/utils/axios.ts` — Defines `endpoints.auth.signIn = '/api/v1/auth/login'`
- `src/auth/context/jwt/action.ts` — `signInWithPassword` function
- `src/auth/view/jwt/jwt-sign-in-view.tsx` — Login form UI

**Feature Pages (in `src/sections/`):**

| Section | Pages |
|---------|-------|
| `access/` | User-Role Mapping |
| `brand/` | Brand list + form |
| `channel-partner/` | CP list/form + CP Type list/form |
| `geography/` | Zone list/form + City list |
| `organization/` | Department list/form + Role list/form |
| `permissions/` | Permission Matrix |
| `phase/` | Phase list + form |
| `product-config/` | Module, SubModule, Action lists |
| `projects/` | Project list + form |
| `users/` | User list, detail, new (3-step wizard) |
| `workflow/` | Approval config, inbox, delegations |
| `system/` | Audit logs, notifications |

### Three Frontend Codebases (Inventory)

| Directory | Auth Extraction | Status |
|-----------|----------------|--------|
| `src/` | `res.data.data` (was `res.data` — **FIXED**) | ✅ Used in production |
| `fe/` | API mode: correct (`res.data?.data \|\| res.data`); Mock mode: `res.data.data` (was `res.data` — **FIXED**) | ✅ Fixed |
| `frontend/` | `r.data.data` via `.then()` chain | ✅ Always correct |

---

## 6. Database Schema & Migrations

### Migration History (12 applied)

| # | Version | Name | Description |
|---|---------|------|-------------|
| 1 | `20260716155525` | `add_salary_capping_to_zones` | Salary cap fields on zones |
| 2 | `20260716155719` | `create_department_hierarchy_levels` | Department max hierarchy levels |
| 3 | `20260716160111` | `add_city_state_country_to_brands` | City/state/country on brands |
| 4 | `20260716160711` | `create_phases_table` | Phase master table |
| 5 | `20260716161323` | `create_channel_partner_types_table` | CP Type lookup |
| 6 | `20260716161330` | `create_channel_partners_table` | Channel Partner full table |
| 7 | `20260716161722` | `create_user_groups_table` | User Group master |
| 8 | `20260716161743` | `create_user_module_access_tables` | Module access mappings |
| 9 | `20260716161749` | `create_user_group_mapping` | User ←→ Group mapping |
| 10 | `20260716164641` | `project_master_extended` | Extended project spec |
| 11 | `20260717134916` | `enable_rls_on_all_tables` | Row-Level Security (Supabase) |
| 12 | `20260717134946` | `create_default_rls_policies` | Default RLS policies |

### Key Database Tables

| Table | Purpose |
|-------|---------|
| `users` | User profiles (emp_id, name, email, department, employment_status) |
| `user_auth` | Auth credentials (user_id, password_hash, auth_provider, failed_attempts, is_locked) |
| `user_sessions` | JWT refresh token sessions |
| `roles` | Role definitions (name, hierarchy_level_rank, is_system_role) |
| `user_roles` | User ←→ Role assignments |
| `departments` | Department master with max_hierarchy_levels |
| `zones` | Geographic zones |
| `cities` | City master |
| `city_zone_mappings` | City ←→ Zone associations |
| `brands` | Brand master (with city/state/country) |
| `phases` | Phase master |
| `channel_partner_types` | CP Type lookup |
| `channel_partners` | Channel Partner master |
| `user_groups` | User Groups |
| `user_group_module_access` | Group ←→ Module access |
| `user_group_mappings` | User ←→ Group membership |
| `projects` | Project master (extended) |
| `project_payment_gateways` | Project payment gateway config |
| `project_incentive_rules` | Project incentive/salary capping rules |
| `modules` / `sub_modules` / `actions` | Product catalog hierarchy |
| `permission_templates` | Role-based permission templates |
| `user_permission_overrides` | Per-user permission overrides |
| `workflows` / `workflow_steps` | Approval workflow definitions |
| `approval_requests` | Submitted approval requests |
| `approval_actions` | Approval/rejection records |
| `delegations` | Approval delegation rules |
| `audit_logs` | Audit trail |
| `notifications` | Notification records |

---

## 7. Deployment Configuration

### Render (`render.yaml`)

```yaml
service: web
name: puravankara-rbac-api
runtime: node
region: oregon
plan: free
rootDir: backend
buildCommand: npm install --include=dev && npm run build
startCommand: npm run migration:run:prod && npm run seed:prod && npm run start:prod
healthCheckPath: /api/v1/health
```

**Sync: false env vars** (must be set in Render dashboard):
- `DATABASE_URL` — Supabase pooler connection string
- `DEFAULT_ADMIN_PASSWORD` — Admin login password
- `CORS_ORIGINS` — Custom CORS origins override
- `FRONTEND_URL` — Frontend URL override

**Auto-generated env vars:**
- `JWT_SECRET` — Randomly generated on first deploy
- `JWT_REFRESH_SECRET` — Randomly generated on first deploy

### Vercel (Project: `puravankara-rbac-frontend`)

| Setting | Value |
|---------|-------|
| Production Branch | `main` |
| Framework | Vite |
| Root Directory | `/` |
| Output Directory | `dist` |
| Node.js Version | 24.x |

**Environment Variables:**
- `VITE_SERVER_URL` = `https://puravankara-rbac-portal.onrender.com`
- `VITE_ASSETS_DIR` = (empty)

### Vercel Project Linking

The local `.vercel/project.json` was initially linked to `puravankara-rbac-portal` (wrong project). Fixed by re-linking to `puravankara-rbac-frontend`:

```bash
vercel link --project puravankara-rbac-frontend --yes
```

---

## 8. Authentication Flow

### Login Sequence

```
POST /api/v1/auth/login { email, password }
  │
  ├─ 1. users.findOne({ where: { email } })
  │     → 401 if not found
  │
  ├─ 2. Check user.deletedAt → 401 if deactivated
  ├─ 3. Check user.isActive → 403 if inactive
  │
  ├─ 4. user_auth.findOne({ where: { userId: user.empId } })
  │     → 401 "Account not configured" if no auth record
  │
  ├─ 5. Check auth.isLocked → 403 if locked
  ├─ 6. Check auth.authProvider === 'LOCAL' → 401 if not
  │
  ├─ 7. bcrypt.compare(password, auth.passwordHash)
  │     → Increment failedAttempts, lock at 5 → 401
  │
  ├─ 8. Success: reset failedAttempts, update lastLogin
  ├─ 9. Create JWT access token (15min expiry)
  ├─ 10. Create JWT refresh token (7 day expiry)
  ├─ 11. Store bcrypt(refreshToken) in user_sessions
  ├─ 12. Fetch roles + permissions
  └─ 13. Return { accessToken, refreshToken, expiresIn, user, permissions }
```

### Response Wrapper

All API responses are wrapped by `TransformInterceptor`:

```json
{
  "statusCode": 200,
  "message": "Success",
  "data": {
    "accessToken": "eyJ...",
    "refreshToken": "eyJ...",
    "expiresIn": 900,
    "user": {
      "empId": "ADMIN001",
      "name": "System Administrator",
      "email": "admin@puravankara.com",
      "role": "SUPER_ADMIN",
      "roles": ["SUPER_ADMIN"]
    }
  }
}
```

### Frontend Sign-In Handler (Post-Fix)

```typescript
const res = await axios.post(endpoints.auth.signIn, params);
const { accessToken } = res.data.data;  // ✅ was res.data (wrong)
```

### Token Management

| Token | Location | Expiry | Storage |
|-------|----------|--------|---------|
| Access Token | JWT payload | 15 minutes | `sessionStorage` |
| Refresh Token | JWT payload | 7 days | `sessionStorage` + bcrypt hash in `user_sessions` |
| Session | `user_sessions` table | 7 days | Database |

---

## 9. Issues Encountered & Resolutions

### A. Database Connection — IPv6 / Pooler

**Problem:** Render couldn't connect to Supabase PostgreSQL directly because the database is IPv6-only and Render's Oregon region doesn't support IPv6.

**Solution:** Use Supabase Connection Pooler (`aws-0-ap-northeast-1.pooler.supabase.com:5432`)

**Sub-issues:**
1. **Wrong pooler region** — Initially used `ap-southeast-1` (Singapore), but database is in `ap-northeast-1` (Tokyo). Result: DNS `ENOTFOUND`
2. **Wrong username format** — Supabase pooler requires `postgres.<project-ref>` format, not just `postgres`
3. **Final working URL:**
   ```
   postgresql://postgres.vsxnevbhidivdzdpfojb:O9iKpa4pvcwSJMgj@aws-0-ap-northeast-1.pooler.supabase.com:5432/postgres
   ```

**SSL setting:** `ssl: { rejectUnauthorized: false }` required for Supabase/pooler connections.

### B. Backend Build Errors

**Problem:** NestJS build failed with TypeScript errors:
1. `ProjectService` method signatures mismatched between interface and implementation
2. Controllers used `private readonly service` instead of `protected readonly service` (prevented NestJS proxying)
3. TypeORM 0.3+ relations used string syntax instead of object notation

**Fix:** Corrected all signatures, changed `private` → `protected`, updated relation syntax.

### C. Vercel Deployment — Wrong Project

**Problem:** Frontend env var `VITE_SERVER_URL` was being set on `puravankara-rbac-portal` Vercel project (a different project), not `puravankara-rbac-frontend` where the actual frontend lives.

**Fix:** Re-linked local directory to correct project:
```bash
vercel link --project puravankara-rbac-frontend --yes
vercel env rm VITE_SERVER_URL production
echo "https://puravankara-rbac-portal.onrender.com" | vercel env add VITE_SERVER_URL production
```

### D. Vercel Build — Framework Set to "Services"

**Problem:** One deployment attempt failed because the Vercel project framework was incorrectly set to "services" instead of "vite".

**Fix:** The correct project (`puravankara-rbac-frontend`) already had the right framework setting. The issue only affected `puravankara-rbac-portal` project (deployed from wrong link).

### E. Global Response Wrapper — "Access token not found"

**Root Cause:** NestJS `TransformInterceptor` wraps all responses in `{ statusCode, message, data: {...} }`, but the frontend's `signInWithPassword` function read `res.data` (the wrapper object) instead of `res.data.data` (the inner payload).

**Error in Console:**
```
Error: Access token not found in response
    at Yg (index-CZsWLosT.js:10:322824)
```

**Files Fixed:**
| File | Change |
|------|--------|
| `src/auth/context/jwt/action.ts` | `res.data` → `res.data.data` |
| `fe/src/auth/context/jwt/action.ts` | `res.data` → `res.data.data` |

The NestJS response flow:
```
AuthService.login() returns { accessToken, ... }
    ↓
TransformInterceptor wraps it: { statusCode: 200, message: "Success", data: { accessToken, ... } }
    ↓
axios.post() → response.data = { statusCode, message, data: { accessToken, ... } }
    ↓
Old code: const { accessToken } = res.data  →  accessToken = undefined  ✗
    ↓
Fixed code: const { accessToken } = res.data.data  →  accessToken = "eyJ..."  ✓
```

### F. Security — Credential Leakage in Console

**Problem:** Multiple `console.error('Error during sign in:', error)` calls in auth actions. The axios error object contains `error.config` which includes the full request body (email + password in plaintext). This exposed credentials in the browser console.

**Fix:**
```diff
- console.error('Error during sign in:', error);
+ // Removed — axios error objects contain request payload (credentials)
```

Applied to:
- `src/auth/context/jwt/action.ts` — 3 console.errors removed
- `fe/src/auth/context/jwt/action.ts` — 3 console.errors removed
- `src/auth/view/jwt/jwt-sign-in-view.tsx` — `console.error(error)` removed

### G. ESLint — `no-useless-catch`

**Problem:** After removing `console.error`, the try/catch blocks only re-threw the error, which ESLint flags as `no-useless-catch`.

**Fix:** Removed all unnecessary try/catch wrappers entirely:
```diff
- try {
    const res = await axios.post(endpoints.auth.signIn, params);
    const { accessToken } = res.data.data;
    ...
- } catch (error) {
-   throw error;
- }
```

Applied to both `src/` and `fe/` action files.

### H. Admin Password Not Working

**Problem:** Login returned 401 "Invalid email or password" for `admin@puravankara.com` / `Admin@123456`.

**Root Cause:** The `POST /api/v1/setup/reset` endpoint reads `DEFAULT_ADMIN_PASSWORD` env var. This var has `sync: false` in `render.yaml`, meaning the user must set it manually in the Render dashboard. If the env var differed from `Admin@123456` (or was missing), the reset wouldn't fix the password to the expected value.

**Fix:** Direct SQL update via Supabase:
```sql
UPDATE user_auth
SET password_hash = '$2b$10$0JGRHVJKU/yDHcg5UWsnMex6we8gKQ1JhNXXCb47EK6WDI0BdQRje',
    is_locked = false,
    failed_attempts = 0
WHERE user_id = 'ADMIN001';
```

**Lesson:** To properly manage admin password:
- Set `DEFAULT_ADMIN_PASSWORD` in Render dashboard to the desired password
- Then hit `POST /api/v1/setup/reset` to sync it

### I. `setup/reset` Limitation

The setup/reset endpoint does `UPDATE user_auth SET password_hash = $1 WHERE user_id IN (SELECT emp_id FROM users WHERE email = $2)`. If no matching user email is found (e.g., if `DEFAULT_ADMIN_EMAIL` env differs from what was used during initial seed), the UPDATE affects 0 rows silently. The endpoint does NOT fall back to the existing admin user OR insert a missing `user_auth` row.

### J. CORS

**Problem:** Login initially failed with CORS errors (though this was actually a side-effect of the backend not responding at all).

**Status:** CORS is configured as `origin: true` in NestJS, which allows all origins. Also, `helmet()` is applied before CORS in `main.ts` — this ordering is correct (helmet sets security headers, CORS adds cross-origin headers).

---

## 10. Files Changed This Session

### Session: 2026-07-17 (Deployment & Login Fix)

#### Modified Files (uncommitted):

| File | Change |
|------|--------|
| `src/auth/context/jwt/action.ts` | `res.data` → `res.data.data`; removed console.error; removed useless try/catch |
| `fe/src/auth/context/jwt/action.ts` | Same changes as above (alternate frontend) |
| `src/auth/view/jwt/jwt-sign-in-view.tsx` | Removed `console.error(error)`; updated hint to show real credentials |

#### Environment Changes:

| Platform | Change |
|----------|--------|
| Vercel (puravankara-rbac-portal) | `VITE_SERVER_URL` set to `https://puravankara-rbac-portal.onrender.com` (wrong project) |
| Vercel (puravankara-rbac-frontend) | `VITE_SERVER_URL` set to `https://puravankara-rbac-portal.onrender.com` (correct project) |
| Vercel (puravankara-rbac-portal) | `VITE_SERVER_URL` removed (cleanup) |
| Vercel project link | Changed from `puravankara-rbac-portal` → `puravankara-rbac-frontend` |

#### Database Changes:

```sql
UPDATE user_auth SET password_hash = '$2b$10$0JGRHVJKU/yDHcg5UWsnMex6we8gKQ1JhNXXCb47EK6WDI0BdQRje',
    is_locked = false, failed_attempts = 0 WHERE user_id = 'ADMIN001';
```

#### Deployments Triggered:

| # | Platform | Commit/Directory | Result |
|---|----------|-----------------|--------|
| 1 | Vercel (puravankara-rbac-portal) | Local deploy | ❌ Framework set to "services" |
| 2 | Vercel (puravankara-rbac-frontend) | Local deploy (env fix only) | ✅ Built + live (old code) |
| 3 | Vercel (puravankara-rbac-frontend) | Local deploy (action.ts fix) | ✅ 0 errors, 450 warnings, live |

---

## 11. Current State

### ✅ Working

- **Backend:** NestJS application starts, all 20+ modules loaded, health check returns `{"status":"ok","database":{"status":"up"}}`
- **Database:** 12 migrations applied, seed data loaded (admin user, zones, actions, SUPER_ADMIN role)
- **Authentication:** Login works at `/api/v1/auth/login` with `admin@puravankara.com` / `Admin@123456`
- **Frontend:** Hosted on Vercel, points to correct backend URL via `VITE_SERVER_URL`
- **CORS:** Properly configured for cross-origin requests
- **API Response Format:** Consistent `{ statusCode, message, data }` wrapper across all endpoints

### ⚠️ Known Issues

1. **450 ESLint warnings** (pre-existing) — mostly `perfectionist/sort-imports` and unused variables
2. **`DEFAULT_ADMIN_PASSWORD` not set in Render dashboard** — password was reset via SQL, not through normal mechanism
3. **Setup/reset can't fix missing `user_auth` rows** — requires manual SQL or running the seeder
4. **Three frontend codebases** (`src/`, `fe/`, `frontend/`) — confusing, only `src/` is deployed
5. **No automated tests configured** — Jest setup exists but no test runners integrated
6. **Database migration scripts hardcoded** — `migration:run:prod` expects dist path that may not match build output

### 🚫 What's Not Yet Working

- **Post-login dashboard** — not yet tested after login fix
- **All API endpoints** — only `/api/v1/auth/login` and `/api/v1/health` confirmed working
- **Swagger docs** — available at `/api/v1/docs` but not tested for all endpoints
- **Zone City Mapping** FE page — not yet built
- **Role Mapping Wizard** — not yet built
- **Real-time notifications** — WebSocket module exists but not configured for Render

---

## 12. Next Steps

### Phase 1: Immediate (Post-Login Validation)

- [ ] **Verify dashboard loads correctly** — check `/api/v1/auth/me` and permissions endpoints
- [ ] **Test each section page** — User list, Brand master, Geography, etc.
- [ ] **Fix any remaining API endpoint mismatches** — if sections return 404/500

### Phase 2: Feature Completion

- [ ] **Zone City Mapping** — finish the geography UI (city-to-zone assignment)
- [ ] **Role Mapping Wizard** — implement user → projects/groups/roles assignment UI
- [ ] **Permission Matrix UI** — complete the permission configuration page
- [ ] **Approval Workflow UI** — test approval inbox and delegation features

### Phase 3: Security & Quality

- [ ] **Set `DEFAULT_ADMIN_PASSWORD` in Render dashboard** — enable proper password management
- [ ] **Set `DEFAULT_ADMIN_EMAIL` in Render dashboard** — to `admin@puravankara.com`
- [ ] **Add axios response interceptor** — auto-unwrap `res.data.data` in one place instead of per-endpoint
- [ ] **Fix 450 ESLint warnings** — run `npm run lint -- --fix` for auto-fixable (424) + manual fix for rest (26)
- [ ] **Verify Helmet order** — ensure CORS works correctly with Helmet
- [ ] **Add `no-console` rule** — prevent accidental credential logging

### Phase 4: Infrastructure

- [ ] **Custom domain** — point a subdomain to Vercel
- [ ] **Preview deployments** — enable Vercel preview for PR branches
- [ ] **Redis for Render** — enable Redis for caching if needed (currently disabled)
- [ ] **Log aggregation** — use Render logs + Supabase advisors
- [ ] **CI/CD pipeline** — GitHub Actions for lint + test + deploy
- [ ] **SSR/SEO** — if needed, migrate to Next.js

### Phase 5: Production Readiness

- [ ] **Rate limiting** — tune ThrottlerGuard limits (currently 100/60s)
- [ ] **Error monitoring** — integrate Sentry or similar
- [ ] **Database backups** — configure Supabase Point-in-Time Recovery
- [ ] **Load testing** — verify Render free plan handles expected traffic
- [ ] **Documentation** — generate API docs for all endpoints

---

## Appendix A: Key Commands

```bash
# Backend
npm run build                       # Build NestJS
npm run migration:run               # Run migrations (dev)
npm run migration:run:prod          # Run migrations (prod)
npm run seed                        # Seed data (dev)
npm run seed:prod                   # Seed data (prod)
npm run start:prod                  # Start production

# Frontend
npm run build                       # Vite build
npm run dev                         # Dev server
npm run lint                        # ESLint
npm run lint:fix                    # Auto-fix ESLint

# Vercel
vercel deploy --prod                # Deploy frontend
vercel env add <key> <env>          # Add env var
vercel env rm <key> <env>           # Remove env var
vercel env ls <env>                 # List env vars
vercel list --prod                  # List production deployments
vercel inspect <url>                # Inspect deployment
vercel link --project <name>        # Link directory to project

# Supabase Pooler Connection
# Username format: postgres.<project-ref>
# Region: must match database region (ap-northeast-1 for Tokyo)
```

## Appendix B: Environment Variables

### Backend (Render)

| Variable | Source | Required | Notes |
|----------|--------|----------|-------|
| `DATABASE_URL` | Render dashboard (sync: false) | ✅ | Supabase pooler URL |
| `JWT_SECRET` | Auto-generated | ✅ | JWT signing key |
| `JWT_REFRESH_SECRET` | Auto-generated | ✅ | Refresh token key |
| `DEFAULT_ADMIN_EMAIL` | render.yaml | ✅ | Admin login email |
| `DEFAULT_ADMIN_PASSWORD` | Render dashboard (sync: false) | ✅ | Admin login password |
| `NODE_ENV` | render.yaml | ✅ | Set to "production" |
| `PORT` | render.yaml | ✅ | Set to "3000" |
| `CORS_ORIGINS` | Render dashboard | Optional | Override CORS origins |
| `FRONTEND_URL` | Render dashboard | Optional | Frontend URL override |
| `REDIS_ENABLED` | render.yaml | ✅ | Currently "false" |
| `DB_LOGGING` | render.yaml | ✅ | "false" for production |
| `LOG_LEVEL` | render.yaml | ✅ | "info" |
| `LOG_FORMAT` | render.yaml | ✅ | "json" |

### Frontend (Vercel)

| Variable | Value | Required | Notes |
|----------|-------|----------|-------|
| `VITE_SERVER_URL` | `https://puravankara-rbac-portal.onrender.com` | ✅ | Backend API base URL |

## Appendix C: Credentials

| Role | Email | Password |
|------|-------|----------|
| Super Admin | `admin@puravankara.com` | `Admin@123456` |

## Appendix D: Git — Uncommitted Changes

```
fe/src/auth/context/jwt/action.ts      | 7 ++-----
 src/auth/context/jwt/action.ts         | 7 ++-----
 src/auth/view/jwt/jwt-sign-in-view.tsx | 5 ++---
 3 files changed, 6 insertions(+), 13 deletions(-)
```

To commit:
```bash
git add -A && git commit -m "fix: unwrap NestJS response wrapper in auth action; remove credential-leaking console.error"
```

---

*End of Report*

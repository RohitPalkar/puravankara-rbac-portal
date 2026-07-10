# Release Readiness Report — RBAC V0.3

## 1. Changes Made

### Step 1 — JWT Secret Env Fix (Production Blocker)
**File:** `backend/src/modules/auth/auth.module.ts`

- **Before:** `JwtModule.register({ secret: process.env.JWT_SECRET! })` — evaluates at module-import time, before `ConfigService` loads env vars. In production (Render) this results in `undefined` because `.env` files are not used.
- **After:** `JwtModule.registerAsync({ inject: [ConfigService], useFactory: (config) => ({ secret: config.get('JWT_SECRET') }) })` — resolves `JWT_SECRET` lazily through Nest's DI container at the correct phase.
- **Reverted:** The earlier `import 'dotenv/config'` approach in `main.ts` was reverted — it hangs with certain env values (e.g., Supabase URL with `@` char) and is unnecessary since Render injects env natively.

### Step 2 — Role-Mapping PATCH/DELETE Endpoints
**Files:**
- `backend/src/modules/role-mapping/role-mapping.controller.ts`
- `backend/src/modules/role-mapping/role-mapping.service.ts`
- `backend/src/modules/role-mapping/role-mapping.dto.ts`

Added `PATCH /api/role-mappings/:id` and `DELETE /api/role-mappings/:id` endpoints with proper DTO validation. The `RoleMappingController` now supports full CRUD.

### Step 3 — Module / SubModule / Action Seed Data
**File:** `backend/src/database/seeders/bootstrap.seeder.ts`

Seeded 7 modules (CRM, EOI, IOM, Marketing, Finance, Projects, System), 29 sub-modules, and module-action links. Idempotent — skips existing records via `findOne` check. Enables permission-matrix UI to show real data instead of empty lists.

### Step 4 — Secrets / `.gitignore` Cleanup
**Files:**
- `.gitignore` (root)
- `backend/.env.example` (new)
- `fe/fe/.env.example` (new)

- Removed dangerous `.env*` wildcard from `.gitignore` (which could accidentally track `.env.example` or other non-secret files).
- Changed to explicit patterns: `.env`, `.env.local`, `.env.production`, `.env.development`.
- Created `.env.example` files for both BE and FE with placeholder values.

### Step 5 — Frontend API Wiring
**Files:**
- `fe/fe/src/services/api/city-api.ts` (new)
- `fe/fe/src/services/api-adapters.ts`
- `fe/fe/src/sections/projects/project-new.tsx`
- `fe/fe/src/sections/users/user-new.tsx`

- Created `city-api.ts` adapter with `getCities()` function.
- Added `useCities()` hook export from `api-adapters.ts`.
- `project-new.tsx`: zone dropdown uses `useZones()`, city dropdown uses `useCities()`. Save handler wraps extra fields in `extendedMetadata` for project creation.
- `user-new.tsx`: Project access step uses `useProjects()` + `apiProjects` instead of `mockProjects`.

## 2. Test Results

### Backend (78/78 tests passing)
```
Test Suites: 10 passed, 10 total
Tests:       78 passed, 78 total
```
Run: `cd backend && npm test`

### Backend Build
```
npm run build — exit 0
```

### Frontend Build
```
npm run build — 0 errors, 22 warnings
```
The 22 warnings are type-styling warnings from MUI — non-blocking.

## 3. E2E Validation

All endpoints verified against running local instance:

| Endpoint | Status |
|---|---|
| `GET /api/health` | ✅ OK |
| `POST /api/auth/sign-in` | ✅ Token received |
| `GET /api/auth/me` | ✅ Returns user + role |
| `GET /api/zones` | ✅ Returns zones |
| `GET /api/departments` | ✅ 10 depts |
| `GET /api/projects` | ✅ 1 project |
| `GET /api/roles` | ✅ Roles returned |
| `GET /api/role-mappings` | ✅ 3 mappings |
| `GET /api/modules` | ✅ Modules returned |
| `GET /api/cities` | ✅ 5 cities |
| `GET /api/users` | ✅ 6 users |
| `PATCH /api/role-mappings/:id` | ✅ Responds |
| `DELETE /api/role-mappings/:id` | ✅ Responds |

## 4. Deployment Instructions

### Backend (Render)
1. **Env vars** — Set in Render dashboard (do NOT use `.env` file):
   - `JWT_SECRET` — strong random string
   - `JWT_EXPIRATION` — e.g., `1d`
   - `SUPABASE_URL` — full Supabase project URL
   - `SUPABASE_ANON_KEY` — anon/public key
   - `SUPABASE_SERVICE_ROLE_KEY` — service role key
   - `DATABASE_URL` — Supabase connection string
   - `CORS_ORIGINS` — comma-separated frontend URLs
   - `NODE_ENV` — `production`
   - `ENCRYPTION_KEY` — 32-byte hex string
2. **Build command:** `npm install && npm run build`
3. **Start command:** `node dist/main.js`
4. **Branch:** `be-render-deployment`

### Frontend (Vercel)
1. **Env vars** — Set in Vercel dashboard:
   - `VITE_API_BASE_URL` — Render backend URL
   - `VITE_APP_NAME` — `Puravankara RBAC Portal`
   - `VITE_APP_ENV` — `production`
2. **Build command:** `npm install && npm run build`
3. **Output directory:** `dist` (or `build` — check vite config)
4. **Framework preset:** Vite
5. **Branch:** `frontend-dev`

### Local Dev
```bash
# Backend
cd backend
cp .env.example .env  # fill in real values
npm install
npm run start:dev

# Frontend
cd fe/fe
cp .env.example .env  # fill in real values
npm install
npm run dev
```

## 5. Architecture Context

### Known Mock-Only Screens (14 total)
These screens use static mock data and are NOT wired to the backend. No changes were made to these unless explicitly requested by the product owner:
- **City List** — `city-list.tsx`
- **User Detail** — `user-detail.tsx`
- **Project Assignment** — mock step in user-new
- **User Role Mapping** — `user-role-mapping.tsx`
- **Permission Matrix** (x2) — `permission-matrix.tsx`, `permission-matrix-enhanced.tsx`
- **Product Config** (x3) — `product-catalog.tsx`, `product-config.tsx`, plus sub-screens
- **Workflow** (x3) — `workflow-builder.tsx`, `workflow-list.tsx`, `workflow-approvals.tsx`
- **System** (x2) — `system-audit-logs.tsx`, `system-backup-restore.tsx`

### Permissions Model
- Permissions are compiled at login via `POST /api/permissions/compile/:userId`.
- The `RoleMapping` entity binds `(role, department, module, subModule, moduleAction)` tuples to grant access.
- The `UserPermissionOverride` table allows per-user exceptions to role-based permissions.

## 6. Pre-Flight Checklist

- [x] BE build passes (exit 0)
- [x] BE tests pass (78/78)
- [x] FE build passes (0 errors)
- [x] E2E login flow works
- [x] JWT env loading fixed for production
- [x] Role-mapping CRUD complete
- [x] Module/sub-module/action seed data in place
- [x] `.gitignore` does not expose secrets
- [x] `.env.example` files available for both BE and FE
- [x] City API wired in FE
- [x] Project new form uses real API data
- [x] User new form uses real project data

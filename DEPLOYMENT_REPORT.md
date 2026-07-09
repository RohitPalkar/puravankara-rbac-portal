# Deployment Report

## Status: READY ✅

---

## Backend

| Property | Value |
|----------|-------|
| **Platform** | Render |
| **Service Name** | `puravankara-rbac-api` |
| **Runtime** | Node (Node 18+) |
| **Plan** | Free |
| **Region** | Oregon |
| **Build Command** | `npm install && npm run build` |
| **Start Command** | `npm run migration:run && npm run seed:prod && npm run start:prod` |
| **Health Check** | `/api/v1/health` |
| **Port** | 3000 |

### Required Environment Variables

| Variable | Source | Notes |
|----------|--------|-------|
| `NODE_ENV` | `production` | Disables `synchronize` |
| `DATABASE_URL` | Supabase via Render | Connection string |
| `JWT_SECRET` | Auto-generate | Min 16 chars |
| `JWT_REFRESH_SECRET` | Auto-generate | Optional, falls back to JWT_SECRET |
| `CORS_ORIGINS` | Set manually | e.g. `https://your-app.vercel.app` |
| `FRONTEND_URL` | Set manually | Single origin fallback |
| `DEFAULT_ADMIN_EMAIL` | `admin@system.local` | Bootstrap admin |
| `DEFAULT_ADMIN_PASSWORD` | Set manually | Bootstrap admin password |
| `REDIS_ENABLED` | `false` | Memory cache fallback |

### Database Configuration

- `synchronize: false` in production (migrations required)
- Supports `DATABASE_URL` connection string (Supabase)
- SSL enabled with `rejectUnauthorized: false` for production
- Connection pool: default 10

### Migration Flow

```
npm run migration:generate  → creates migration file
npm run migration:run       → applies pending migrations (runs on deploy)
```

### Seed Flow

```
npm run seed:prod  → inserts SUPER_ADMIN role, 8 system actions, admin user
```

---

## Frontend

| Property | Value |
|----------|-------|
| **Platform** | Vercel |
| **Framework** | React 19 + Vite |
| **Build Output** | `dist/` |
| **Base URL** | `VITE_API_URL` from env |

### Environment Variables (Vercel)

| Variable | Value |
|----------|-------|
| `VITE_API_URL` | `https://puravankara-rbac-api.onrender.com/api/v1` |

### API Client Features

- Dynamic `VITE_API_URL` via `import.meta.env`
- Bearer token auto-injection
- 401 response → auto-refresh token → retry
- Refresh failure → auto-logout

---

## Deployment Steps

### 1. Supabase (Database)

1. Create new Supabase project (free tier)
2. Copy `DATABASE_URL` (Project Settings → Database → Connection string)
3. Enable SSL/TLS

### 2. Render (Backend)

1. Create new Web Service
2. Connect GitHub repo
3. Select `render.yaml` (Blueprint) or manual:
   - Runtime: Node
   - Build Command: `npm install && npm run build`
   - Start Command: `npm run migration:run && npm run seed:prod && npm run start:prod`
   - Health Check: `/api/v1/health`
4. Set environment variables (see table above)
5. Deploy
6. Verify: `https://api-url.onrender.com/api/v1/health`

### 3. Vercel (Frontend)

1. Import frontend directory as new project
2. Set `VITE_API_URL` to the Render backend URL
3. Deploy
4. Verify: login page loads

---

## Post-Deployment Validation

| # | Test | Expected |
|---|------|----------|
| 1 | Open FE URL | Login page renders |
| 2 | Login as admin@system.local | Dashboard loads |
| 3 | Create Zone | Zone appears in list |
| 4 | Create City | City appears in list |
| 5 | Create Department | Department appears in list |
| 6 | Create Role | Role appears with correct hierarchy level |
| 7 | Create Project | Project appears in list |
| 8 | Create User with zones/roles | User created + relations saved |
| 9 | Assign permissions to user | User can access assigned modules |
| 10 | Login as created user | Sidebar shows only permitted modules |

---

## Architecture Summary

```
Vercel (FE) ──HTTPS──> Render (API) ──SSL──> Supabase (DB)
```

- **No Redis** required (memory cache fallback)
- **No Docker** required
- All free tier compatible
- Zero configuration changes to existing business logic
